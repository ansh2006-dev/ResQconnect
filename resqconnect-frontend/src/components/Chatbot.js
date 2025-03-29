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
  const messagesEndRef = useRef(null);
  
  // API configuration
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
  
  // DEMO MODE - For demonstration purposes when API key is not available
  const DEMO_MODE = true; // Set to false to use actual DeepSeek API

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChatbot = () => {
    if (!alwaysOpen) {
      setIsOpen(!isOpen);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      sendMessage();
    }
  };

  // Pre-defined responses for demonstration purposes
  const getLocalResponse = (message) => {
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
    
    // Default response
    return "I'm your ResQConnect assistant powered by DeepSeek AI. I can provide information about various emergency procedures, disaster preparedness, evacuation guidelines, and safety tips. Please ask about specific disasters like earthquakes, floods, fires, or hurricanes, or inquire about reporting incidents, emergency contacts, or first aid.";
  };

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
        const conversationHistory = messages.map(msg => ({
          text: msg.text,
          sender: msg.sender
        }));
        
        const response = await axios.post(`${API_URL}/chatbot/message`, {
          message: input,
          conversationHistory: conversationHistory
        });
        
        botResponse = { 
          id: messages.length + 2, 
          text: response.data.response, 
          sender: 'bot' 
        };
      }
      
      setMessages(prev => [...prev, botResponse]);
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

  const chatbotContainerClassName = `chatbot-container ${embedded ? 'embedded' : ''}`;

  return (
    <div className={chatbotContainerClassName}>
      {!embedded && (
        <button 
          className={`chatbot-toggle ${isOpen ? 'open' : ''}`} 
          onClick={toggleChatbot}
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
            />
            <button onClick={sendMessage} disabled={!input.trim()}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
          
          <div className="chatbot-suggestions">
            <button onClick={() => setInput("What should I do during an earthquake?")}>
              Earthquake Safety
            </button>
            <button onClick={() => setInput("How do I report a disaster?")}>
              Report Disaster
            </button>
            <button onClick={() => setInput("Emergency contact numbers")}>
              Emergency Contacts
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 