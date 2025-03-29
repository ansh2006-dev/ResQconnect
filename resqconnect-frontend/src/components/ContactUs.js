import React from 'react';
import Chatbot from './Chatbot';
import './ContactUs.css';

const ContactUs = () => {
  return (
    <div className="contact-us-container">
      <div className="contact-info">
        <h2>Contact Us</h2>
        <p>Need assistance? You can reach out to us through any of the following channels:</p>
        
        <div className="contact-methods">
          <div className="contact-method">
            <i className="fas fa-phone-alt"></i>
            <div>
              <h3>Emergency Hotline</h3>
              <p>24/7 Support: <a href="tel:911">911</a></p>
              <p>General Inquiries: <a href="tel:+1800-RESQ-HELP">1-800-RESQ-HELP</a></p>
            </div>
          </div>
          
          <div className="contact-method">
            <i className="fas fa-envelope"></i>
            <div>
              <h3>Email</h3>
              <p>Support: <a href="mailto:support@resqconnect.org">support@resqconnect.org</a></p>
              <p>Reporting: <a href="mailto:reports@resqconnect.org">reports@resqconnect.org</a></p>
            </div>
          </div>
          
          <div className="contact-method">
            <i className="fas fa-map-marker-alt"></i>
            <div>
              <h3>Headquarters</h3>
              <p>ResQconnect Emergency Center</p>
              <p>123 Safety Avenue, Resilience City, EM 54321</p>
            </div>
          </div>
          
          <div className="contact-method">
            <i className="fas fa-users"></i>
            <div>
              <h3>Social Media</h3>
              <div className="social-links">
                <a href="#" className="social-link"><i className="fab fa-facebook"></i></a>
                <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
                <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
                <a href="#" className="social-link"><i className="fab fa-linkedin"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="chat-section">
        <div className="chat-intro">
          <h2>Chat with Us</h2>
          <p>Our virtual assistant is available 24/7 to answer your questions about disaster preparedness, emergency protocols, and more.</p>
          <p>Simply type your question in the chat window below to get started.</p>
        </div>
        
        {/* Embed the Chatbot component with the always-open prop */}
        <div className="embedded-chatbot">
          <Chatbot alwaysOpen={true} embedded={true} />
        </div>
      </div>
    </div>
  );
};

export default ContactUs; 