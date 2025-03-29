const express = require('express');
const cors = require('cors');
const app = express();
const port = 3333; // Different port for testing

// Enable CORS for all routes
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Test route that always returns data
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working correctly',
    timestamp: new Date().toISOString(),
    testData: [
      { id: 1, name: 'Test Item 1' },
      { id: 2, name: 'Test Item 2' }
    ]
  });
});

// Start server
app.listen(port, () => {
  console.log(`Test API server running at http://localhost:${port}`);
  console.log(`Test endpoint: http://localhost:${port}/api/test`);
});

// Output instructions
console.log('\nTest Instructions:');
console.log('1. Keep this server running');
console.log('2. Open your browser and navigate to: http://localhost:3333/api/test');
console.log('3. You should see JSON data if the server is accessible');
console.log('4. In your frontend app, try to fetch from this test endpoint to verify connectivity');
console.log('\nExample fetch code:');
console.log(`
fetch('http://localhost:3333/api/test')
  .then(response => response.json())
  .then(data => console.log('Success:', data))
  .catch(error => console.error('Error:', error));
`); 