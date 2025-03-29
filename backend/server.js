require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Load environment variables
const { MONGO_URI, PORT } = process.env;

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));

// Import routes
const disasterRoutes = require("./routes/disasterRoutes");
const weatherRoutes = require("./routes/weatherRoutes");

app.use("/api/disasters", disasterRoutes);
app.use("/api/weather", weatherRoutes);

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`)); 