import React, { useState } from 'react';
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

function App() {
  // Create shared location state
  const [location, setLocation] = useState('');
  const [error, setError] = useState(null);

  const handleLocationChange = (newLocation) => {
    try {
      setLocation(newLocation);
      setError(null);
    } catch (err) {
      console.error('Error updating location:', err);
      setError('Failed to update location. Please try again.');
    }
  };

  return (
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
                  <WeatherWidget location={location} onLocationChange={handleLocationChange} />
                </section>
                <section className="App-section">
                  <ReportForm location={location} />
                </section>
              </div>
              <section className="App-section full-width">
                <DisasterList location={location} />
              </section>
              <footer className="App-footer">
                <p>&copy; 2023 ResQconnect. All rights reserved.</p>
              </footer>
              <Chatbot />
            </div>
          } />
          <Route path="/emergency" element={<EmergencyPage location={location} />} />
          <Route path="/weather" element={<WeatherWidget fullPage location={location} onLocationChange={handleLocationChange} />} />
          <Route path="/report" element={<ReportForm fullPage location={location} />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/status" element={<StatusDashboard />} />
          <Route path="/contact" element={<ContactUs />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
