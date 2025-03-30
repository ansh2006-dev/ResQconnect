const axios = require('axios');
require('dotenv').config();

/**
 * Service for interacting with the DeepSeek AI API
 */
class DeepseekService {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.ai';
    
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
    
    // Check if we should use mock data instead of the API
    if (process.env.USE_MOCK_DATA === 'true') {
      console.log('Using mock data instead of DeepSeek API');
      return this.getLocalResponse(userInput);
    }
    
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
      console.log(JSON.stringify(messages.slice(0, 2), null, 2)); // Only log first two messages to avoid clutter

      // Define model name based on availability
      const model = 'deepseek-chat'; // DeepSeek's main chat model
      
      const requestPayload = {
        model: model,
        messages: messages,
        max_tokens: 800,
        temperature: 0.7
      };
      
      const endpoint = '/v1/chat/completions'; // Use v1 endpoint for OpenAI-compatible API
      console.log('Sending request to DeepSeek API endpoint:', `${this.apiUrl}${endpoint}`);
      
      // Make API request to DeepSeek
      const response = await this.client.post(endpoint, requestPayload);

      console.log('DeepSeek API response received');
      console.log('Response status:', response.status);
      
      // Check if response has the expected structure (OpenAI-compatible format)
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
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
      }
      
      console.error('------- End of DeepSeek API Error -------');
      
      return this.getFallbackResponse();
    }
  }
  
  /**
   * Get a local response for a specific question (for when API is unavailable)
   * @param {string} message - The user's message
   * @returns {string} A predefined response based on message content
   */
  getLocalResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Emergency contacts
    if (lowerMessage.includes('emergency') || lowerMessage.includes('help') || lowerMessage.includes('contact')) {
      return "For immediate assistance, call emergency services at 911. You can also contact the local disaster management office at 1-800-555-HELP or use the Report Form on this website to alert authorities to a situation.";
    }
    
    // Earthquake
    if (lowerMessage.includes('earthquake')) {
      return "During an earthquake: DROP to the ground, COVER by getting under sturdy furniture, and HOLD ON until the shaking stops. Stay away from windows and exterior walls. If outdoors, move to an open area away from buildings and power lines. After an earthquake, check for injuries and damage, be prepared for aftershocks, and listen to emergency broadcasts for instructions.";
    }
    
    // Flood
    if (lowerMessage.includes('flood')) {
      return "For flood safety: Move to higher ground immediately. Avoid walking or driving through flood waters - just 6 inches of moving water can knock you down, and 1 foot of water can sweep your vehicle away. If evacuation is ordered, do so immediately. Disconnect utilities if instructed and avoid electrical equipment if wet. After flooding, be aware of contaminated water and damaged roads or buildings.";
    }
    
    // Fire
    if (lowerMessage.includes('fire')) {
      return "In case of fire: Evacuate immediately. Crawl low under smoke. Use the back of your hand to check for heat before opening doors. If clothes catch fire - stop, drop, and roll. Call 911 once you're safely outside. If trapped, close doors between you and the fire, seal door cracks with wet towels if possible, and signal for help from a window. Have a household fire escape plan with two ways out of each room.";
    }
    
    // Hurricane
    if (lowerMessage.includes('hurricane') || lowerMessage.includes('cyclone')) {
      return "For hurricane preparedness: Create an emergency plan and supply kit before hurricane season. When a hurricane warning is issued, secure outside furniture, close storm shutters, and follow evacuation orders immediately if given. During a hurricane, stay indoors away from windows, monitor emergency broadcasts, and be aware of the 'eye' of the hurricane which may create a temporary lull before winds return from the opposite direction.";
    }
    
    // Default response
    return "I'm your ResQConnect assistant specializing in emergency response. I can provide information about disaster preparedness, evacuation procedures, and emergency resources. For specific guidance, please ask about earthquakes, floods, fires, hurricanes, or other emergency situations. Remember, in any immediate danger, always call 911 first.";
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