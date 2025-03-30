const express = require("express");
const router = express.Router();
const axios = require("axios");
require('dotenv').config();

// Weather mock data for fallback
const getWeatherMockData = (location = "Default City") => {
    return {
        name: location,
        main: {
            temp: Math.floor(Math.random() * 30) + 5,
            feels_like: Math.floor(Math.random() * 30) + 5,
            humidity: 65
        },
        weather: [
            {
                description: 'Partly cloudy',
                icon: '04d'
            }
        ],
        wind: {
            speed: 4.5
        },
        sys: {
            country: 'US'
        },
        // Add forecast data
        forecast: {
            list: [
                {
                    dt: Date.now() / 1000 + 86400, // tomorrow
                    main: {
                        temp_max: Math.floor(Math.random() * 30) + 10,
                        temp_min: Math.floor(Math.random() * 20)
                    },
                    weather: [{ description: 'Clear sky', icon: '01d' }]
                },
                {
                    dt: Date.now() / 1000 + 86400 * 2, // day after tomorrow
                    main: {
                        temp_max: Math.floor(Math.random() * 30) + 10,
                        temp_min: Math.floor(Math.random() * 20)
                    },
                    weather: [{ description: 'Few clouds', icon: '02d' }]
                },
                {
                    dt: Date.now() / 1000 + 86400 * 3, // 3 days from now
                    main: {
                        temp_max: Math.floor(Math.random() * 30) + 10,
                        temp_min: Math.floor(Math.random() * 20)
                    },
                    weather: [{ description: 'Rain', icon: '10d' }]
                },
                {
                    dt: Date.now() / 1000 + 86400 * 4, // 4 days from now
                    main: {
                        temp_max: Math.floor(Math.random() * 30) + 10,
                        temp_min: Math.floor(Math.random() * 20)
                    },
                    weather: [{ description: 'Thunderstorm', icon: '11d' }]
                }
            ]
        }
    };
};

router.get("/", async (req, res) => {
    try {
        const { location, city } = req.query;
        const useMockData = process.env.USE_MOCK_DATA === 'true';
        const searchParam = location || city || 'London';
        
        if (useMockData) {
            console.log("Using mock weather data for:", searchParam);
            return res.json({ 
                success: true, 
                data: getWeatherMockData(searchParam),
                source: "Mock Data"
            });
        }
        
        try {
            // Get the API key from env
            const apiKey = process.env.OPENWEATHER_API_KEY;
            
            if (!apiKey) {
                throw new Error("OpenWeather API key not configured");
            }
            
            console.log(`Fetching weather data for: ${searchParam}`);
            
            // Get current weather
            const currentWeatherResponse = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(searchParam)}&units=metric&appid=${apiKey}`,
                { timeout: 5000 }
            );
            
            // Get forecast
            const forecastResponse = await axios.get(
                `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(searchParam)}&units=metric&appid=${apiKey}`,
                { timeout: 5000 }
            );
            
            // Process forecast data to get one entry per day
            const dailyForecasts = [];
            const processedDates = new Set();
            
            if (forecastResponse.data && forecastResponse.data.list) {
                for (const item of forecastResponse.data.list) {
                    const date = new Date(item.dt * 1000).toLocaleDateString();
                    
                    if (!processedDates.has(date)) {
                        processedDates.add(date);
                        dailyForecasts.push(item);
                        
                        // Get 4 days of forecast
                        if (dailyForecasts.length >= 4) break;
                    }
                }
            }
            
            // Combine the data
            const combinedData = {
                ...currentWeatherResponse.data,
                forecast: {
                    list: dailyForecasts
                }
            };
            
            return res.json({ 
                success: true, 
                data: combinedData,
                source: "OpenWeatherMap API"
            });
        } catch (apiError) {
            console.error("OpenWeatherMap API error:", apiError.message);
            console.log("Falling back to mock data due to API error");
            
            return res.json({ 
                success: true, 
                data: getWeatherMockData(searchParam),
                source: "Mock Data (API Error)",
                error: apiError.message
            });
        }
    } catch (error) {
        console.error("Weather route error:", error.message);
        res.status(500).json({ 
            success: false,
            message: "Weather data fetch failed", 
            error: error.message 
        });
    }
});

module.exports = router; 