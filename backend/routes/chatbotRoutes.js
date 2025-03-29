const express = require('express');
const router = express.Router();
const deepseekService = require('../services/deepseekService');

/**
 * @route   POST /api/chatbot/message
 * @desc    Get response from DeepSeek AI chatbot
 * @access  Public
 */
router.post('/message', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message content is required' 
      });
    }

    // Get response from DeepSeek AI
    const response = await deepseekService.getChatbotResponse(message, conversationHistory);
    
    return res.status(200).json({
      success: true,
      response: response
    });
  } catch (error) {
    console.error('Chatbot API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get chatbot response',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
});

module.exports = router; 