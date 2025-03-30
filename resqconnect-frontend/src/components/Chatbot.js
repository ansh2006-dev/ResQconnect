import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';
import axios from 'axios';

const Chatbot = ({ alwaysOpen = false, embedded = false }) => {
  const [isOpen, setIsOpen] = useState(alwaysOpen);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hi there! I'm your ResQConnect assistant powered by DeepSeek AI. How can I help you today?", 
      sender: 'bot' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    "How to prepare for a flood?",
    "What should be in my emergency kit?",
    "Nearest evacuation center?",
    "How to stay safe during an earthquake?"
  ]);
  
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);
  
  // API configuration with memoization
  const API_URL = React.useMemo(() => 
    process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  []);
  
  // Set to false to use actual DeepSeek API
  const DEMO_MODE = false; 

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // If alwaysOpen prop changes, update isOpen state
  useEffect(() => {
    setIsOpen(alwaysOpen);
  }, [alwaysOpen]);
  
  // Focus input field when chat opens
  useEffect(() => {
    if (isOpen && chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, [isOpen]);
  
  // Listen for custom event to open the chatbot from other components
  useEffect(() => {
    const handleOpenChatbot = () => {
      setIsOpen(true);
    };
    
    document.addEventListener('open-chatbot', handleOpenChatbot);
    
    return () => {
      document.removeEventListener('open-chatbot', handleOpenChatbot);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChatbot = () => {
    if (!alwaysOpen) {
      setIsOpen(!isOpen);
      // Focus input when opening
      if (!isOpen && chatInputRef.current) {
        setTimeout(() => chatInputRef.current.focus(), 100);
      }
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setTimeout(() => sendMessage(), 100);
  };

  // Pre-defined responses for demonstration purposes - memoized to avoid recreating on each render
  const getLocalResponse = React.useCallback((message) => {
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
    
    // Evacuation
    if (lowerMessage.includes('evacuat')) {
      return "For evacuation: Follow instructions from local authorities. Prepare an emergency kit with essentials like water, non-perishable food, medications, important documents, cash, and clothing. Take only essential items. Turn off utilities if instructed to do so. Use designated evacuation routes. If possible, let someone know where you're going. Keep your gas tank at least half full at all times in case of emergency evacuations.";
    }
    
    // Weather alerts
    if (lowerMessage.includes('weather') || lowerMessage.includes('alert')) {
      return "You can check current weather alerts on our Weather tab. Sign up for push notifications to receive real-time updates about emergencies in your area. Have a battery-powered or hand-crank radio for emergency information if power is out. The National Weather Service issues watches (conditions favorable for severe weather) and warnings (severe weather is occurring or imminent).";
    }
    
    // Report a disaster
    if (lowerMessage.includes('report')) {
      return "You can report a disaster using our Report Form. This helps authorities and other users stay informed about developing situations. Include as much detail as possible, including location, type of emergency, estimated number of people affected, and any immediate dangers. Photos can be helpful if it's safe to take them.";
    }
    
    // Hurricane
    if (lowerMessage.includes('hurricane') || lowerMessage.includes('cyclone')) {
      return "For hurricane preparedness: Create an emergency plan and supply kit before hurricane season. When a hurricane warning is issued, secure outside furniture, close storm shutters, and follow evacuation orders immediately if given. During a hurricane, stay indoors away from windows, monitor emergency broadcasts, and be aware of the 'eye' of the hurricane which may create a temporary lull before winds return from the opposite direction.";
    }
    
    // Tornado
    if (lowerMessage.includes('tornado')) {
      return "During a tornado: Seek shelter immediately in a basement or interior room on the lowest floor, like a bathroom or closet. Stay away from windows. Cover yourself with a mattress or blankets for protection from debris. If you're in a mobile home, find a sturdy building. If caught outside, lie flat in a ditch or low-lying area, covering your head and neck.";
    }
    
    // First aid
    if (lowerMessage.includes('first aid') || lowerMessage.includes('injury') || lowerMessage.includes('medical')) {
      return "Basic first aid: For minor cuts, clean with soap and water, apply pressure to stop bleeding, and cover with a clean bandage. For burns, cool with running water and cover with a clean cloth. For broken bones, immobilize the area and seek medical help. For heart attacks, call 911 and have the person chew aspirin if not allergic. For choking, perform the Heimlich maneuver. Always seek professional medical help for serious injuries.";
    }
    
    // Emergency kit
    if (lowerMessage.includes('kit') || lowerMessage.includes('supplies') || lowerMessage.includes('prepare')) {
      return "Essential emergency kit items: 1) Water (one gallon per person per day for at least 3 days) 2) Non-perishable food (3-day supply) 3) Battery-powered radio 4) Flashlight and extra batteries 5) First aid kit 6) Whistle to signal for help 7) Dust mask 8) Moist towelettes and garbage bags 9) Wrench or pliers for utilities 10) Manual can opener 11) Local maps 12) Cell phone with chargers and backup battery 13) Prescription medications 14) Cash 15) Important family documents in waterproof container.";
    }
    
    // Default response
    return "I'm your ResQConnect assistant powered by DeepSeek AI. I can provide information about various emergency procedures, disaster preparedness, evacuation guidelines, and safety tips. Please ask about specific disasters like earthquakes, floods, fires, or hurricanes, or inquire about reporting incidents, emergency contacts, or first aid.";
  }, []);

  const sendMessage = async () => {
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage = { id: messages.length + 1, text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      let botResponse;
      
      if (DEMO_MODE) {
        // Use local responses in demo mode
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        botResponse = { 
          id: messages.length + 2, 
          text: getLocalResponse(input), 
          sender: 'bot' 
        };
      } else {
        // Use actual DeepSeek API via backend
        console.log('Sending request to DeepSeek API via backend');
        const conversationHistory = messages.map(msg => ({
          text: msg.text,
          sender: msg.sender
        }));
        
        try {
          const response = await axios.post(`${API_URL}/chatbot/message`, {
            message: input,
            conversationHistory: conversationHistory
          }, {
            timeout: 10000 // Set timeout to 10 seconds
          });
          
          console.log('DeepSeek API response:', response.data);
          
          if (response.data && response.data.success && response.data.response) {
            botResponse = { 
              id: messages.length + 2, 
              text: response.data.response, 
              sender: 'bot' 
            };
          } else {
            throw new Error('Invalid API response format');
          }
        } catch (apiError) {
          console.error('DeepSeek API request failed:', apiError);
          // Fallback to local response if API call fails
          botResponse = { 
            id: messages.length + 2, 
            text: getLocalResponse(input),
            sender: 'bot' 
          };
        }
      }
      
      setMessages(prev => [...prev, botResponse]);
      
      // Generate new suggestions based on context
      setSuggestions(generateSuggestions(input, botResponse.text));
      
    } catch (error) {
      console.error('Error with chatbot response:', error);
      
      // Use local fallback response if API fails
      const fallbackResponse = { 
        id: messages.length + 2, 
        text: "I'm having trouble connecting to my knowledge base right now. For emergency assistance, please call 911 immediately.", 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setLoading(false);
    }
  };
  
  // Dynamically generate contextual suggestions based on conversation
  const generateSuggestions = (userInput, botResponse) => {
    const lowerUserInput = userInput.toLowerCase();
    const lowerBotResponse = botResponse.toLowerCase();
    
    if (lowerUserInput.includes('flood') || lowerBotResponse.includes('flood')) {
      return [
        "How do I prepare for a flood?",
        "What to do after a flood?",
        "Are flood waters dangerous?",
        "Flood evacuation routes near me"
      ];
    }
    
    if (lowerUserInput.includes('fire') || lowerBotResponse.includes('fire')) {
      return [
        "How to use a fire extinguisher?",
        "Escape plan for house fire",
        "What to do after a fire?",
        "Wildfire evacuation tips"
      ];
    }
    
    if (lowerUserInput.includes('earthquake') || lowerBotResponse.includes('earthquake')) {
      return [
        "Earthquake safety for kids",
        "How to secure furniture for earthquakes",
        "What to do after an earthquake",
        "Earthquake emergency kit"
      ];
    }
    
    if (lowerUserInput.includes('kit') || lowerBotResponse.includes('kit') || 
        lowerUserInput.includes('prepare') || lowerBotResponse.includes('prepare')) {
      return [
        "Essential medications for emergency kit",
        "How to store emergency water",
        "Documents to keep in emergency kit",
        "Car emergency kit items"
      ];
    }
    
    // Default suggestions
    return [
      "How to prepare for a disaster?",
      "Emergency contacts nearby",
      "What should be in my emergency kit?",
      "How to help my community during a disaster?"
    ];
  };

  const chatbotContainerClassName = `chatbot-container ${embedded ? 'embedded' : ''}`;

  return (
    <div className={chatbotContainerClassName}>
      {!embedded && (
        <button 
          className={`chatbot-toggle ${isOpen ? 'open' : ''}`} 
          onClick={toggleChatbot}
          aria-label={isOpen ? "Close assistance chat" : "Open assistance chat"}
        >
          {isOpen ? (
            <i className="fas fa-times"></i>
          ) : (
            <>
              <i className="fas fa-comment-dots"></i>
              <span>Assistance</span>
            </>
          )}
        </button>
      )}
      
      {(isOpen || embedded) && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>ResQConnect Assistant</h3>
            <p>Ask about disaster assistance and safety</p>
            {!alwaysOpen && !embedded && (
              <button 
                className="chatbot-close" 
                onClick={toggleChatbot}
                aria-label="Close chat"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          
          <div className="chatbot-messages">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`message ${message.sender}`}
              >
                {message.sender === 'bot' && (
                  <div className="avatar">
                    <i className="fas fa-robot"></i>
                  </div>
                )}
                <div className="message-bubble">{message.text}</div>
              </div>
            ))}
            
            {loading && (
              <div className="message bot">
                <div className="avatar">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="message-bubble typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Type your question here..."
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              ref={chatInputRef}
              aria-label="Chat message input"
            />
            <button 
              onClick={sendMessage} 
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
          
          <div className="chatbot-suggestions">
            {suggestions.map((suggestion, index) => (
              <button 
                key={index} 
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={loading}
                aria-label={`Suggestion: ${suggestion}`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 