import React, { useState } from 'react';
import './EmergencyPage.css';
import DisasterList from './DisasterList';
import { useLocation } from '../App'; // Import the location context

const EmergencyPage = () => {
  // Use the location context instead of props
  const { location } = useLocation();
  
  // Use memoized state for static data to avoid unnecessary re-renders
  const emergencyContacts = React.useMemo(() => [
    { id: 1, name: 'Emergency Services', number: '911', icon: 'ambulance' },
    { id: 2, name: 'Police Department', number: '555-123-4567', icon: 'shield-alt' },
    { id: 3, name: 'Fire Department', number: '555-765-4321', icon: 'fire' },
    { id: 4, name: 'Poison Control', number: '800-222-1222', icon: 'skull-crossbones' },
    { id: 5, name: 'Disaster Hotline', number: '800-985-5990', icon: 'phone-alt' }
  ], []);
  
  const emergencyTips = React.useMemo(() => [
    {
      id: 1,
      title: 'Earthquake Safety',
      content: 'Drop, cover, and hold on. Move away from windows and exterior walls. If outdoors, find an open area away from buildings.',
      icon: 'house-damage'
    },
    {
      id: 2,
      title: 'Flood Response',
      content: 'Move to higher ground immediately. Never walk or drive through floodwaters. Six inches of water can knock you down.',
      icon: 'water'
    },
    {
      id: 3,
      title: 'Fire Evacuation',
      content: 'Get out and stay out. Crawl low under smoke. Feel doors before opening them. Have a meeting place outside.',
      icon: 'fire-alt'
    },
    {
      id: 4,
      title: 'Hurricane Preparation',
      content: 'Board up windows and secure outdoor items. Prepare an emergency kit. Follow evacuation orders immediately.',
      icon: 'wind'
    }
  ], []);
  
  const [activeTab, setActiveTab] = useState('disasters');
  const [alertVisible, setAlertVisible] = useState(true);
  
  // Improved chatbot opener with fallback mechanism
  const openChatbot = () => {
    try {
      // Try to find the chatbot toggle button
      const chatbotToggle = document.querySelector('.chatbot-toggle');
      if (chatbotToggle) {
        chatbotToggle.click();
      } else {
        // Dispatch a custom event as a fallback if button not found
        const event = new CustomEvent('open-chatbot');
        document.dispatchEvent(event);
        console.log('Dispatched open-chatbot event');
      }
    } catch (error) {
      console.error('Error opening chatbot:', error);
      // Alert the user to try manually if both methods fail
      alert('Please click the chat icon in the bottom right corner to speak with an assistant.');
    }
  };
  
  return (
    <div className="emergency-page">
      <div className="emergency-header">
        <h1>Emergency Response Center</h1>
        <p>Quick access to critical information during emergencies</p>
        
        <div className="emergency-stats">
          <div className="stat-item">
            <i className="fas fa-exclamation-circle"></i>
            <div>
              <h3>Active Disasters</h3>
              <p>5 in your area</p>
            </div>
          </div>
          
          <div className="stat-item">
            <i className="fas fa-user-shield"></i>
            <div>
              <h3>Response Teams</h3>
              <p>3 deployed</p>
            </div>
          </div>
          
          <div className="stat-item">
            <i className="fas fa-hands-helping"></i>
            <div>
              <h3>Evacuation Centers</h3>
              <p>2 open nearby</p>
            </div>
          </div>
        </div>
      </div>
      
      {alertVisible && (
        <div className="emergency-alert">
          <i className="fas fa-bell"></i>
          <p><strong>Alert:</strong> Flash flood warning in effect until 8:00 PM. Avoid low-lying areas.</p>
          <button 
            className="dismiss-btn"
            onClick={() => setAlertVisible(false)}
            aria-label="Dismiss alert"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
      
      <div className="emergency-tabs">
        <button 
          className={`tab-btn ${activeTab === 'disasters' ? 'active' : ''}`}
          onClick={() => setActiveTab('disasters')}
          aria-label="View active disasters"
        >
          <i className="fas fa-exclamation-triangle"></i>
          <span>Active Disasters</span>
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contacts')}
          aria-label="View emergency contacts"
        >
          <i className="fas fa-phone"></i>
          <span>Emergency Contacts</span>
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'tips' ? 'active' : ''}`}
          onClick={() => setActiveTab('tips')}
          aria-label="View safety tips"
        >
          <i className="fas fa-lightbulb"></i>
          <span>Safety Tips</span>
        </button>
      </div>
      
      <div className="emergency-content">
        {activeTab === 'disasters' && (
          <div className="disasters-tab">
            <DisasterList location={location} />
          </div>
        )}
        
        {activeTab === 'contacts' && (
          <div className="contacts-tab">
            <div className="emergency-contacts">
              {emergencyContacts.map(contact => (
                <div key={contact.id} className="contact-card">
                  <div className="contact-icon">
                    <i className={`fas fa-${contact.icon}`}></i>
                  </div>
                  <div className="contact-info">
                    <h3>{contact.name}</h3>
                    <p>{contact.number}</p>
                  </div>
                  <a 
                    href={`tel:${contact.number.replace(/-/g, '')}`} 
                    className="call-btn"
                    aria-label={`Call ${contact.name}`}
                  >
                    <i className="fas fa-phone-alt"></i>
                    <span>Call</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'tips' && (
          <div className="tips-tab">
            <div className="emergency-tips">
              {emergencyTips.map(tip => (
                <div key={tip.id} className="tip-card">
                  <div className="tip-header">
                    <i className={`fas fa-${tip.icon}`}></i>
                    <h3>{tip.title}</h3>
                  </div>
                  <p>{tip.content}</p>
                </div>
              ))}
            </div>
            
            <div className="emergency-kit">
              <h3>Emergency Kit Checklist</h3>
              <ul className="kit-checklist">
                <li><i className="fas fa-check-circle"></i> Water (1 gallon per person per day)</li>
                <li><i className="fas fa-check-circle"></i> Non-perishable food (3-day supply)</li>
                <li><i className="fas fa-check-circle"></i> Battery-powered radio</li>
                <li><i className="fas fa-check-circle"></i> Flashlight and extra batteries</li>
                <li><i className="fas fa-check-circle"></i> First aid kit</li>
                <li><i className="fas fa-check-circle"></i> Whistle to signal for help</li>
                <li><i className="fas fa-check-circle"></i> Dust mask, plastic sheeting, and duct tape</li>
                <li><i className="fas fa-check-circle"></i> Moist towelettes, garbage bags, and plastic ties</li>
                <li><i className="fas fa-check-circle"></i> Wrench or pliers to turn off utilities</li>
                <li><i className="fas fa-check-circle"></i> Manual can opener for food</li>
                <li><i className="fas fa-check-circle"></i> Local maps</li>
                <li><i className="fas fa-check-circle"></i> Cell phone with chargers and backup battery</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      <div className="help-contact">
        <h2>Need immediate assistance?</h2>
        <div className="help-options">
          <a 
            href="tel:911" 
            className="help-option call"
            aria-label="Call 911 emergency services"
          >
            <i className="fas fa-phone-alt"></i>
            <span>Call 911</span>
          </a>
          
          <button 
            className="help-option chat" 
            onClick={openChatbot}
            aria-label="Open chat assistant"
          >
            <i className="fas fa-comment-dots"></i>
            <span>Chat with Assistant</span>
          </button>
          
          <a 
            href="/report" 
            className="help-option report"
            aria-label="Report an incident"
          >
            <i className="fas fa-exclamation-circle"></i>
            <span>Report Incident</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default EmergencyPage; 