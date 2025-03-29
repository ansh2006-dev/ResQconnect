const express = require("express");
const router = express.Router();
const axios = require("axios");

// Read NASA EONET API endpoint from environment variables
const NASA_EONET_API = process.env.NASA_EONET_API || "https://eonet.gsfc.nasa.gov/api/v3/events";
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';

console.log(`NASA EONET API URL: ${NASA_EONET_API}`);
console.log(`Using mock data: ${USE_MOCK_DATA}`);

// Helper function to map NASA event types to our severity levels
const mapEventTypeToSeverity = (eventCategory) => {
    const severityMap = {
        "drought": "medium",
        "dustHaze": "low",
        "earthquakes": "high",
        "floods": "high",
        "landslides": "high",
        "manmade": "medium",
        "seaLakeIce": "low",
        "severeStorms": "high",
        "snow": "medium",
        "tempExtremes": "medium",
        "volcanoes": "high",
        "waterColor": "low",
        "wildfires": "high"
    };
    
    return severityMap[eventCategory] || "medium";
};

// Function to generate mock data
const generateMockData = (locationQuery = null) => {
    // Generate dates spanning the last 12 months
    const generatePastDate = (monthsAgo) => {
        const date = new Date();
        date.setMonth(date.getMonth() - monthsAgo);
        date.setDate(Math.floor(Math.random() * 28) + 1);
        return date.toISOString();
    };
    
    // Base mock data
    const mockData = [
        {
            _id: "1",
            type: "Earthquake",
            location: "San Francisco, CA",
            severity: "high",
            reportedAt: generatePastDate(1)
        },
        {
            _id: "2",
            type: "Flood",
            location: "New Orleans, LA",
            severity: "medium",
            reportedAt: generatePastDate(3)
        },
        {
            _id: "3",
            type: "Wildfire",
            location: "Los Angeles, CA",
            severity: "high",
            reportedAt: generatePastDate(5)
        },
        {
            _id: "4",
            type: "Hurricane",
            location: "Miami, FL",
            severity: "high",
            reportedAt: generatePastDate(7)
        },
        {
            _id: "5",
            type: "Tornado",
            location: "Oklahoma City, OK",
            severity: "medium",
            reportedAt: generatePastDate(9)
        }
    ];
    
    // If a location is provided but doesn't match any existing locations,
    // create a custom disaster for that location to ensure we return data
    if (locationQuery && locationQuery.trim() !== '') {
        const locationLower = locationQuery.toLowerCase();
        
        // Check if any existing mock data matches the location
        const hasMatch = mockData.some(disaster => 
            disaster.location.toLowerCase().includes(locationLower)
        );
        
        // If no match, add a custom disaster for this location
        if (!hasMatch) {
            const disasterTypes = ["Earthquake", "Flood", "Wildfire", "Storm", "Landslide"];
            const randomType = disasterTypes[Math.floor(Math.random() * disasterTypes.length)];
            const severity = ["low", "medium", "high"][Math.floor(Math.random() * 3)];
            
            mockData.push({
                _id: `custom-${Date.now()}`,
                type: randomType,
                location: locationQuery, // Use the exact location query
                severity: severity,
                reportedAt: generatePastDate(Math.floor(Math.random() * 12)),
                description: `This is a simulated disaster near ${locationQuery} for testing purposes.`
            });
        }
    }
    
    return mockData;
};

// GET endpoint for disasters
router.get("/", async (req, res) => {
    try {
        // If USE_MOCK_DATA is true, return mock data without making API call
        if (USE_MOCK_DATA) {
            console.log("Using mock disaster data (as configured in .env)");
            const { location } = req.query;
            console.log("Location query:", location || "none");
            
            // Generate mock data with potential custom location entry
            const mockData = generateMockData(location);
            
            // Filter by location if provided
            let filteredMockData = mockData;
            
            if (location) {
                const locationLower = location.toLowerCase();
                filteredMockData = mockData.filter(disaster => 
                    disaster.location.toLowerCase().includes(locationLower)
                );
                console.log(`Found ${filteredMockData.length} mock disasters matching location "${location}"`);
            }
            
            // Sort by date, most recent first
            filteredMockData.sort((a, b) => 
                new Date(b.reportedAt) - new Date(a.reportedAt)
            );
            
            return res.json({ 
                data: filteredMockData, 
                nextCursor: null,
                source: "Mock Data (configured)"
            });
        }
        
        console.log("Fetching disaster data from NASA EONET API");
        console.log("Query params:", req.query);
        
        // Calculate date 12 months ago
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        
        // Format date for NASA API (YYYY-MM-DD)
        const formattedDate = twelveMonthsAgo.toISOString().split('T')[0];
        
        // Make API request to NASA EONET
        const response = await axios.get(NASA_EONET_API, {
            params: {
                status: "open",
                start: formattedDate
            },
            timeout: 10000 // 10 second timeout
        });
        
        const now = new Date();
        
        console.log(`Received ${response.data.events?.length || 0} events from NASA EONET`);
        
        // Check if response has expected format
        if (!response.data || !response.data.events || !Array.isArray(response.data.events)) {
            console.error("Invalid response format from NASA EONET API:", response.data);
            throw new Error("Invalid response format from NASA EONET API");
        }
        
        // Transform NASA data to our format and filter out future dates
        const transformedData = response.data.events
            .filter(event => {
                // Skip events with no geometry or date
                if (!event.geometry || !event.geometry.length || !event.geometry[0].date) {
                    console.log(`Skipping event ${event.id} due to missing geometry/date`);
                    return false;
                }
                
                // Skip events with future dates
                const eventDate = new Date(event.geometry[0].date);
                if (eventDate > now) {
                    console.log(`Skipping event ${event.id} due to future date: ${event.geometry[0].date}`);
                    return false;
                }
                
                return true;
            })
            .map(event => {
                // Get the location from geometry if available
                let location = "Unknown Location";
                if (event.geometry && event.geometry.length > 0) {
                    const coordinates = event.geometry[0].coordinates;
                    location = `${coordinates[1].toFixed(2)}, ${coordinates[0].toFixed(2)}`;
                    
                    // Use title if available for more readable location
                    if (event.title) {
                        location = event.title;
                    }
                }
                
                // Get the category if available
                let type = "Natural Disaster";
                let severity = "medium";
                if (event.categories && event.categories.length > 0) {
                    type = event.categories[0].title;
                    severity = mapEventTypeToSeverity(event.categories[0].id);
                }
                
                // Get the date
                let reportedAt = new Date().toISOString();
                if (event.geometry && event.geometry.length > 0 && event.geometry[0].date) {
                    reportedAt = new Date(event.geometry[0].date).toISOString();
                }
                
                return {
                    _id: event.id,
                    type: type,
                    location: location,
                    severity: severity,
                    reportedAt: reportedAt,
                    sources: event.sources,
                    description: event.description || ""
                };
            });
        
        console.log(`Filtered to ${transformedData.length} valid events`);
        
        // Filter by location if provided
        const { location } = req.query;
        let filteredData = transformedData;
        
        if (location) {
            console.log("Filtering by location:", location);
            const locationLower = location.toLowerCase();
            filteredData = transformedData.filter(disaster => 
                disaster.location.toLowerCase().includes(locationLower)
            );
            console.log(`Found ${filteredData.length} disasters matching location "${location}"`);
        }
        
        // Sort by date, most recent first
        filteredData.sort((a, b) => 
            new Date(b.reportedAt) - new Date(a.reportedAt)
        );
        
        console.log("Sending response with", filteredData.length, "disasters");
        
        // Return the properly formatted response
        return res.json({ 
            data: filteredData, 
            nextCursor: null,
            source: "NASA EONET"
        });
    } catch (error) {
        console.error("Error fetching from NASA EONET:", error.message);
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", error.response.data);
        }
        
        // Provide fallback mock data in case of API failure
        console.log("Using fallback mock data due to API error");
        
        // Get location from query params
        const { location } = req.query;
        console.log("Location query for fallback:", location || "none");
        
        // Generate mock data with potential custom location entry
        const mockData = generateMockData(location);
        
        // Filter by location if provided
        let filteredMockData = mockData;
        if (location) {
            const locationLower = location.toLowerCase();
            filteredMockData = mockData.filter(disaster => 
                disaster.location.toLowerCase().includes(locationLower)
            );
            console.log(`Found ${filteredMockData.length} fallback disasters matching location "${location}"`);
        }
        
        // Sort by date, most recent first
        filteredMockData.sort((a, b) => 
            new Date(b.reportedAt) - new Date(a.reportedAt)
        );
        
        console.log("Sending mock data response with", filteredMockData.length, "disasters");
        return res.json({ 
            data: filteredMockData, 
            nextCursor: null,
            source: "Mock Data (fallback)",
            error: "Using fallback data due to API error: " + (error.message || "Unknown error")
        });
    }
});

// POST endpoint - just return success without saving to DB
router.post("/", async (req, res) => {
    try {
        const { type, location, severity } = req.body;
        
        // Log the submission
        console.log("Disaster report received:", { type, location, severity });
        
        // Return a mock response
        res.status(201).json({
            _id: "mock-" + Date.now(),
            type,
            location,
            severity,
            reportedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ 
            message: "Error creating disaster report", 
            error: error.message || "Unknown error" 
        });
    }
});

// Google Maps API for Geolocation
router.get("/geocode", async (req, res) => {
    try {
        const { address } = req.query;
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Geolocation failed", error: error.message });
    }
});

module.exports = router; 