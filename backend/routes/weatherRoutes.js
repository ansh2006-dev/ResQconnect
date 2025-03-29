const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
    try {
        const { location } = req.query;
        
        // If location is provided (city name or coordinates)
        if (location) {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
            );
            res.json(response.data);
        } 
        // If lat/lon coordinates are provided
        else if (req.query.lat && req.query.lon) {
            const { lat, lon } = req.query;
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
            );
            res.json(response.data);
        } 
        else {
            res.status(400).json({ message: "Location parameter is required" });
        }
    } catch (error) {
        console.error("Weather API error:", error.response?.data || error.message);
        res.status(500).json({ message: "Weather data fetch failed", error: error.message });
    }
});

module.exports = router; 