/**
 * Test utility for DeepSeek API connection
 * 
 * Run with: node test-deepseek-connection.js
 */

require('dotenv').config();
const axios = require('axios');

async function testDeepSeekConnection() {
  console.log('\n🔍 TESTING DEEPSEEK API CONNECTION\n');
  
  // Check environment variables
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.ai/v1';
  const useMockData = process.env.USE_MOCK_DATA === 'true';
  
  console.log('Environment Configuration:');
  console.log('------------------------');
  console.log(`API URL: ${apiUrl}`);
  console.log(`API Key configured: ${!!apiKey}`);
  if (apiKey) {
    console.log(`API Key first/last chars: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
  } else {
    console.log('⚠️ API Key is not set in .env file');
  }
  console.log(`Using mock data: ${useMockData}`);
  console.log('------------------------\n');
  
  // Ensure proper endpoint handling
  let baseUrl = apiUrl;
  let endpointPrefix = '';
  
  // Check if the API URL already contains /v1
  if (!apiUrl.includes('/v1')) {
    baseUrl = apiUrl;
    endpointPrefix = '/v1';
    console.log(`Adding /v1 prefix to endpoints since it's not in the base URL`);
  } else {
    console.log(`Using endpoints without /v1 prefix since it's already in the base URL`);
  }
  
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Endpoint prefix: ${endpointPrefix || '(none)'}`);
  console.log('------------------------\n');
  
  if (useMockData) {
    console.log('ℹ️ Mock data is enabled, skipping actual API connection test');
    console.log('To test the actual API connection, set USE_MOCK_DATA=false in .env\n');
    return;
  }
  
  if (!apiKey || apiKey === 'your_deepseek_api_key_here') {
    console.log('❌ No valid API key found. Please set DEEPSEEK_API_KEY in your .env file');
    return;
  }
  
  // Create axios client for DeepSeek
  const client = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    timeout: 15000 // 15 second timeout
  });
  
  // Test endpoint access
  console.log('Testing connection to DeepSeek API...');
  
  try {
    console.log(`GET ${baseUrl}/models`);
    const response = await client.get('/models');
    
    console.log('✅ Connection successful!');
    console.log('Status:', response.status);
    console.log('\nAvailable models:');
    
    if (response.data.data && Array.isArray(response.data.data)) {
      // OpenAI-compatible format
      response.data.data.forEach(model => {
        console.log(`- ${model.id}`);
      });
    } else {
      // Just display the raw data
      console.log(JSON.stringify(response.data, null, 2));
    }
    
    // Test a simple completion
    console.log('\nTesting a simple completion...');
    
    const completionResponse = await client.post('/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello!' }
      ],
      max_tokens: 100
    });
    
    console.log('\n✅ Chat completion successful!');
    console.log('Response:');
    if (completionResponse.data.choices && completionResponse.data.choices[0].message) {
      console.log(completionResponse.data.choices[0].message.content);
    } else {
      console.log(JSON.stringify(completionResponse.data, null, 2));
    }
    
  } catch (error) {
    console.log('❌ Connection failed');
    console.error('Error details:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.error('\n⚠️ Authentication error: Your API key appears to be invalid.');
        console.error('Please check your DEEPSEEK_API_KEY in the .env file.');
      } else if (error.response.status === 404) {
        console.error('\n⚠️ Endpoint not found: The API endpoint may have changed.');
        console.error('Please check your DEEPSEEK_API_URL in the .env file.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. The service may be down or network issues.');
      console.error('Request details:', error.request._currentUrl);
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }
    
    console.error('\nTroubleshooting tips:');
    console.error('1. Verify your API key is correct and active');
    console.error('2. Check if the DeepSeek API is experiencing outages');
    console.error('3. Ensure your network can reach the DeepSeek API');
    console.error('4. Check if you have proper firewall/proxy settings');
  }
}

// Run the test
testDeepSeekConnection()
  .then(() => {
    console.log('\nTest completed. Exit with Ctrl+C if the process doesn\'t terminate automatically.');
  })
  .catch(err => {
    console.error('Unhandled error during test:', err);
  }); 