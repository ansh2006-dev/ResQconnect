const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
    try {
        const { lat, lon } = req.query;
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Weather data fetch failed", error });
    }
});

module.exports = router; 