import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = ({ alwaysOpen = false, embedded = false }) => {
  const [isOpen, setIsOpen] = useState(alwaysOpen);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hi there! I'm your ResQConnect assistant. How can I help you today?", 
      sender: 'bot' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

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

  // Pre-defined responses for common disaster-related queries
  const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Emergency contacts
    if (lowerMessage.includes('emergency') || lowerMessage.includes('help')) {
      return "For immediate assistance, call emergency services at 911. You can also contact the local disaster management office or use the Report Form on this website.";
    }
    
    // Earthquake
    if (lowerMessage.includes('earthquake')) {
      return "During an earthquake: DROP to the ground, COVER by getting under sturdy furniture, and HOLD ON until the shaking stops. Stay away from windows and exterior walls. If outdoors, move to an open area away from buildings and power lines.";
    }
    
    // Flood
    if (lowerMessage.includes('flood')) {
      return "For flood safety: Move to higher ground immediately. Avoid walking or driving through flood waters - just 6 inches of moving water can knock you down, and 1 foot of water can sweep your vehicle away. If evacuation is ordered, do so immediately.";
    }
    
    // Fire
    if (lowerMessage.includes('fire')) {
      return "In case of fire: Evacuate immediately. Crawl low under smoke. Use the back of your hand to check for heat before opening doors. If clothes catch fire - stop, drop, and roll. Call 911 once you're safely outside.";
    }
    
    // Evacuation
    if (lowerMessage.includes('evacuat')) {
      return "For evacuation: Follow instructions from local authorities. Take only essential items. Turn off utilities if instructed to do so. Take your emergency kit. Use designated evacuation routes. If possible, let someone know where you're going.";
    }
    
    // Weather alerts
    if (lowerMessage.includes('weather') || lowerMessage.includes('alert')) {
      return "You can check current weather alerts on our Weather tab. Sign up for push notifications to receive real-time updates about emergencies in your area.";
    }
    
    // Report a disaster
    if (lowerMessage.includes('report')) {
      return "You can report a disaster using our Report Form. This helps authorities and other users stay informed about developing situations.";
    }
    
    // Default response
    return "I'm not sure I understand. You can ask about emergency procedures for specific disasters like earthquakes, floods, or fires, or how to report an incident.";
  };

  const sendMessage = () => {
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage = { id: messages.length + 1, text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    // Simulate bot response delay
    setTimeout(() => {
      const botResponse = { 
        id: messages.length + 2, 
        text: getBotResponse(input), 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, botResponse]);
      setLoading(false);
    }, 1000);
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