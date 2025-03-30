import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import DisasterList from './components/DisasterList';
import ReportForm from './components/ReportForm';
import WeatherWidget from './components/WeatherWidget';
import Chatbot from './components/Chatbot';
import Navbar from './components/Navbar';
import EmergencyPage from './components/EmergencyPage';
import ResourcesPage from './components/ResourcesPage';
import StatusDashboard from './components/StatusDashboard';
import ContactUs from './components/ContactUs';

// Create a context for sharing location data
export const LocationContext = createContext();

function App() {
  // Create shared location state with error handling
  const [locationData, setLocationData] = useState({
    location: '',
    error: null,
    lastUpdated: null
  });

  // Enhanced location change handler with validation
  const handleLocationChange = (newLocation) => {
    try {
      if (!newLocation || typeof newLocation !== 'string') {
        throw new Error('Invalid location format');
      }
      
      setLocationData({
        location: newLocation.trim(),
        error: null,
        lastUpdated: new Date().toISOString()
      });
      
      // Optionally store in localStorage for persistence
      localStorage.setItem('lastLocation', newLocation.trim());
      
    } catch (err) {
      console.error('Error updating location:', err);
      setLocationData(prev => ({
        ...prev,
        error: 'Failed to update location. Please try again.'
      }));
    }
  };

  // Load location from localStorage on initial render
  React.useEffect(() => {
    const savedLocation = localStorage.getItem('lastLocation');
    if (savedLocation) {
      setLocationData(prev => ({
        ...prev,
        location: savedLocation
      }));
    }
  }, []);

  return (
    <LocationContext.Provider value={{ 
      location: locationData.location, 
      error: locationData.error,
      onLocationChange: handleLocationChange 
    }}>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={
              <div className="App-main">
                <header className="App-header">
                  <h1>ResQconnect</h1>
                  <p>Your emergency response and disaster management companion</p>
                </header>
                <div className="App-sections">
                  <section className="App-section">
                    <WeatherWidget />
                  </section>
                  <section className="App-section">
                    <ReportForm />
                  </section>
                </div>
                <section className="App-section full-width">
                  <DisasterList />
                </section>
                <footer className="App-footer">
                  <p>&copy; {new Date().getFullYear()} ResQconnect. All rights reserved.</p>
                </footer>
              </div>
            } />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route path="/weather" element={<WeatherWidget fullPage />} />
            <Route path="/report" element={<ReportForm fullPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/status" element={<StatusDashboard />} />
            <Route path="/contact" element={<ContactUs />} />
          </Routes>
          {/* Global chatbot that appears on all pages */}
          <Chatbot />
        </div>
      </Router>
    </LocationContext.Provider>
  );
}

// Custom hook to access location context
export const useLocation = () => useContext(LocationContext);

export default App;
