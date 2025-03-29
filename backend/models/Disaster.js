const mongoose = require("mongoose");

const DisasterSchema = new mongoose.Schema({
    type: String,
    location: String,
    severity: String,
    reportedAt: { type: Date, default: Date.now },
    phoneNumber: String,
    notificationToken: String,
    coordinates: {
        lat: Number,
        lng: Number
    }
});

module.exports = mongoose.model("Disaster", DisasterSchema); 