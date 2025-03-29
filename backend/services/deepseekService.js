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
    
    if (this.apiKey) {
      console.log(`API Key first few chars: ${this.apiKey.substring(0, 5)}...`);
    } else {
      console.warn('WARNING: DeepSeek API key is not set');
    }
    
    // Configure axios for DeepSeek API
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      timeout: 60000 // 60 second timeout for LLM response
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
    
    // Check for API key before making request
    if (!this.apiKey || this.apiKey === 'your_deepseek_api_key_here') {
      console.warn('No valid DeepSeek API key found, returning fallback response');
      return this.getFallbackResponse();
    }
    
    try {
      // Format conversation history for the API
      const messages = [
        { 
          role: 'system', 
          content: `You are ResQConnect assistant, specialized in providing disaster management and emergency response information.
Your goal is to provide helpful, accurate, and concise information about emergency procedures, safety tips, and disaster response.
Focus on being factual, direct, and providing life-saving information.

For emergency situations, always remind the user to call emergency services (911) first.

You have specific knowledge about:
- Natural disasters (earthquakes, hurricanes, floods, wildfires, etc.)
- Emergency procedures and evacuation protocols
- First aid and medical emergency information
- Disaster preparedness and recovery
- Emergency contact information and resources

Keep responses under 150 words unless detailed safety instructions are needed.
Always prioritize safety and official guidance from emergency management authorities.`
        },
        ...conversationHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: userInput }
      ];

      console.log('Prepared messages for API:');
      console.log(JSON.stringify(messages, null, 2));

      // Define model name based on availability
      // Options could be 'deepseek-chat', 'deepseek-coder', etc.
      const model = 'deepseek-chat';
      
      const requestPayload = {
        model: model,
        messages: messages,
        max_tokens: 800,
        temperature: 0.7,
        stream: false
      };
      
      console.log('Sending request to DeepSeek API endpoint:', `${this.apiUrl}/chat/completions`);
      
      // Make API request to DeepSeek
      const response = await this.client.post('/chat/completions', requestPayload);

      console.log('DeepSeek API response received');
      console.log('Response status:', response.status);
      
      // Check if response has the expected structure
      if (response.data && 
          response.data.choices && 
          response.data.choices.length > 0 && 
          response.data.choices[0].message &&
          response.data.choices[0].message.content) {
        
        // Extract and return the AI's response text
        return response.data.choices[0].message.content;
      } else {
        console.error('Unexpected response format from DeepSeek API:', JSON.stringify(response.data, null, 2));
        return this.getFallbackResponse();
      }
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
      
      return this.getFallbackResponse();
    }
  }
  
  /**
   * Provide a fallback response when the API fails
   * @returns {string} A fallback response message
   */
  getFallbackResponse() {
    // Fallback responses if the API fails
    const fallbackResponses = [
      "I'm having trouble connecting to my knowledge base right now. For emergency assistance, please call 911 immediately.",
      "I apologize, but I'm experiencing technical difficulties. For immediate help in emergencies, always call local emergency services.",
      "I'm unable to process your request at the moment. In case of emergency, please contact local authorities or call emergency services.",
      "My AI service is currently unavailable. For emergency situations, please call 911 or your local emergency number immediately.",
      "Sorry, I can't access my full capabilities right now. Please remember that in any emergency, your first action should be to call emergency services."
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
}

module.exports = new DeepseekService(); 