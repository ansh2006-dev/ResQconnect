const express = require('express');
const router = express.Router();
const deepseekService = require('../services/deepseekService');

/**
 * @route   POST /api/chatbot/message
 * @desc    Get a response from the DeepSeek AI chatbot
 * @access  Public
 */
router.post('/message', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    
    // Validate input
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      });
    }
    
    console.log(`Received chatbot message: "${message}"`);
    console.log(`Conversation history length: ${conversationHistory ? conversationHistory.length : 0}`);
    
    // Get response from DeepSeek service
    const response = await deepseekService.getChatbotResponse(message, conversationHistory || []);
    
    return res.status(200).json({
      success: true,
      response
    });
  } catch (error) {
    console.error('Error in chatbot route:', error.message);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to get chatbot response',
      error: error.message
    });
  }
});

module.exports = router; 