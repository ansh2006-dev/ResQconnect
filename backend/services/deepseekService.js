const axios = require('axios');
require('dotenv').config();

/**
 * Service for interacting with the DeepSeek AI API
 */
class DeepseekService {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com';
    
    console.log('DeepSeek Service initialized');
    console.log(`Using API URL: ${this.apiUrl}`);
    console.log(`API Key exists: ${!!this.apiKey}`);
    console.log(`API Key first few chars: ${this.apiKey ? this.apiKey.substring(0, 5) + '...' : 'none'}`);
    
    // Configure axios for DeepSeek API
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      timeout: 30000 // 30 second timeout
    });
  }

  /**
   * Get a response from the DeepSeek AI based on user input
   * 
   * @param {string} userInput - The user's message
   * @param {Array} conversationHistory - Previous messages in the conversation
   * @returns {Promise<string>} - The AI response
   */
  async getChatbotResponse(userInput, conversationHistory = []) {
    console.log('------- DeepSeek API Request -------');
    console.log(`User input: "${userInput}"`);
    console.log(`Conversation history length: ${conversationHistory.length}`);
    
    try {
      // Format conversation history for the API
      const messages = [
        { role: 'system', content: 'You are ResQConnect assistant, specialized in providing disaster management and emergency response information. Your goal is to provide helpful, accurate, and concise information about emergency procedures, safety tips, and disaster response.' },
        ...conversationHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: userInput }
      ];

      console.log('Prepared messages for API:');
      console.log(JSON.stringify(messages, null, 2));

      const requestPayload = {
        model: 'deepseek-chat',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      };
      
      console.log('Sending request to DeepSeek API endpoint:', `${this.apiUrl}/chat/completions`);
      console.log('Request payload:', JSON.stringify(requestPayload, null, 2));
      
      // Make API request to DeepSeek
      const response = await this.client.post('/chat/completions', requestPayload);

      console.log('DeepSeek API response received');
      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      
      // Extract and return the AI's response text
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('------- DeepSeek API Error -------');
      console.error(`Error message: ${error.message}`);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response status:', error.response.status);
        console.error('Response headers:', JSON.stringify(error.response.headers, null, 2));
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received');
        console.error('Request:', error.request._header);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
      }
      
      console.error('------- End of DeepSeek API Error -------');
      
      // Fallback responses if the API fails
      const fallbackResponses = [
        "I'm having trouble connecting to my knowledge base right now. For emergency assistance, please call 911 immediately.",
        "I apologize, but I'm experiencing technical difficulties. For immediate help in emergencies, always call local emergency services.",
        "I'm unable to process your request at the moment. In case of emergency, please contact local authorities or call emergency services."
      ];
      
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
  }
}

module.exports = new DeepseekService(); 