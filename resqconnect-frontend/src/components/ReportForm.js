import React, { useState } from 'react';
import { reportDisaster, geocodeAddress } from '../api';
import './ReportForm.css';

const ReportForm = () => {
  const [formData, setFormData] = useState({
    type: '',
    location: '',
    severity: 'medium',
    phoneNumber: '',
  });
  
  const [notificationToken, setNotificationToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Request notification permission and get token
  const enableNotifications = async () => {
    try {
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        setError('This browser does not support desktop notifications');
        return;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        setError('Notification permission denied');
        return;
      }

      // In a real app, you would get the token from Firebase Messaging
      // This is a simplified approach for demo purposes
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          // Register service worker
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          
          // You would get your token here using Firebase in a real implementation
          // For demo purposes, we'll mock a token
          setNotificationToken('demo-notification-token-123456');
          setNotificationsEnabled(true);
          
          // Create a welcome notification
          const notification = new Notification('Notifications Enabled', {
            body: 'You will receive alerts for new disasters in your area',
            icon: '/logo192.png'
          });

        } catch (err) {
          console.error('Error registering service worker:', err);
          setError('Failed to enable notifications');
        }
      } else {
        setError('Push messaging is not supported in your browser');
      }
    } catch (err) {
      console.error('Error enabling notifications:', err);
      setError('Failed to enable notifications');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.type) return 'Disaster type is required';
    if (!formData.location) return 'Location is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Optional: Geocode the location if it's a text address
      // let coordinates = null;
      // if (formData.location) {
      //   const geocodeResponse = await geocodeAddress(formData.location);
      //   if (geocodeResponse.results && geocodeResponse.results.length > 0) {
      //     const location = geocodeResponse.results[0].geometry.location;
      //     coordinates = {
      //       lat: location.lat,
      //       lng: location.lng
      //     };
      //   }
      // }
      
      // Create disaster data with notification token if available
      const disasterData = {
        ...formData,
        // coordinates, 
      };
      
      if (notificationsEnabled && notificationToken) {
        disasterData.notificationToken = notificationToken;
      }
      
      await reportDisaster(disasterData);
      
      // Reset form and show success message
      setFormData({
        type: '',
        location: '',
        severity: 'medium',
        phoneNumber: '',
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
      
    } catch (err) {
      console.error('Error submitting report:', err);
      setError('Failed to submit disaster report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-form-container">
      <h2>Report a Disaster</h2>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <p>Disaster report submitted successfully!</p>
          <button onClick={() => setSuccess(false)}>✕</button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="report-form">
        <div className="form-group">
          <label htmlFor="type">Disaster Type</label>
          <input
            type="text"
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            placeholder="Earthquake, Flood, Fire, etc."
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City, Address, or Coordinates"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="severity">Severity</label>
          <select
            id="severity"
            name="severity"
            value={formData.severity}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number (for SMS alerts)</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+1 123-456-7890"
          />
          <small>Optional: Receive SMS updates about this disaster</small>
        </div>
        
        {!notificationsEnabled && (
          <button 
            type="button" 
            className="enable-notifications-button"
            onClick={enableNotifications}
          >
            Enable Push Notifications
          </button>
        )}
        
        {notificationsEnabled && (
          <div className="notifications-enabled">
            <i className="fas fa-bell"></i> Push notifications enabled
          </div>
        )}
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default ReportForm; 