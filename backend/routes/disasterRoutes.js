const express = require("express");
const router = express.Router();
const Disaster = require("../models/Disaster");
const axios = require("axios");

// Fetch disasters with cursor-based pagination
router.get("/", async (req, res) => {
    try {
        const { after, limit = 5 } = req.query;
        const query = after ? { _id: { $gt: after } } : {};
        const disasters = await Disaster.find(query).sort({ _id: 1 }).limit(Number(limit));
        const nextCursor = disasters.length ? disasters[disasters.length - 1]._id : null;

        res.json({ data: disasters, nextCursor });
    } catch (error) {
        res.status(500).json({ message: "Error fetching disasters", error });
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
        res.status(500).json({ message: "Geolocation failed", error });
    }
});

module.exports = router; 