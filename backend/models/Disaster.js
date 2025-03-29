const mongoose = require("mongoose");

const DisasterSchema = new mongoose.Schema({
    type: String,
    location: String,
    severity: String,
    reportedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Disaster", DisasterSchema); 