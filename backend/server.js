require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:3002'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve static files from public directory
app.use(express.static('public'));

// Load environment variables
const { PORT = 5000 } = process.env;

// Connect to MongoDB - TEMPORARILY DISABLED
console.log("⚠️ MongoDB connection temporarily disabled");

// Import routes
const disasterRoutes = require("./routes/disasterRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");

// Import the DeepSeek service for the enhanced test endpoint
const deepseekService = require("./services/deepseekService");

// Enhanced test endpoint with DeepSeek service status
app.get('/api/test', (req, res) => {
  const deepseekStatus = {
    apiKeyConfigured: !!deepseekService.apiKey && deepseekService.apiKey !== 'your_deepseek_api_key_here',
    apiUrl: deepseekService.apiUrl,
    useMockData: deepseekService.useMockData
  };

  res.json({
    success: true,
    message: 'API is working correctly',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      deepseek: deepseekStatus
    }
  });
});

// Dedicated endpoint to test DeepSeek API connection
app.get('/api/chatbot/test-connection', async (req, res) => {
  try {
    console.log('Testing DeepSeek API connection via endpoint...');
    
    // Skip if using mock data or no valid API key
    if (deepseekService.useMockData) {
      return res.json({
        success: true,
        status: 'skipped',
        message: 'DeepSeek API connection test skipped - mock data is enabled',
        mockDataEnabled: true
      });
    }
    
    if (!deepseekService.apiKey || deepseekService.apiKey === 'your_deepseek_api_key_here') {
      return res.json({
        success: false,
        status: 'no_api_key',
        message: 'DeepSeek API key not configured properly',
        apiKeyConfigured: false
      });
    }
    
    // Try to connect to the API
    const client = deepseekService.client;
    const modelsEndpoint = `${deepseekService.endpointPrefix}/models`;
    console.log(`Requesting: ${deepseekService.baseUrl}${modelsEndpoint}`);
    const response = await client.get(modelsEndpoint);
    
    return res.json({
      success: true,
      status: 'connected',
      message: 'Successfully connected to DeepSeek API',
      models: response.data.data || response.data,
      apiKeyConfigured: true,
      apiUrl: deepseekService.apiUrl,
      baseUrl: deepseekService.baseUrl
    });
  } catch (error) {
    console.error('DeepSeek API connection test failed:', error.message);
    
    return res.status(500).json({
      success: false,
      status: 'error',
      message: 'Failed to connect to DeepSeek API',
      error: error.message,
      responseStatus: error.response?.status,
      responseData: error.response?.data,
      apiKeyConfigured: !!deepseekService.apiKey,
      apiUrl: deepseekService.apiUrl,
      baseUrl: deepseekService.baseUrl,
      endpointPrefix: deepseekService.endpointPrefix
    });
  }
});

// Endpoint to toggle mock data mode
app.post('/api/chatbot/toggle-mock-mode', (req, res) => {
  // Toggle the mock data flag in the service
  deepseekService.useMockData = !deepseekService.useMockData;
  
  console.log(`Mock data mode ${deepseekService.useMockData ? 'enabled' : 'disabled'}`);
  
  return res.json({
    success: true,
    mockDataEnabled: deepseekService.useMockData,
    message: `Mock data mode ${deepseekService.useMockData ? 'enabled' : 'disabled'}`
  });
});

app.use("/api/disasters", disasterRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/chatbot", chatbotRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});