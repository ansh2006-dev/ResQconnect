import React, { useState, useEffect } from 'react';
import { getWeatherByLocation } from '../api';
import './WeatherWidget.css';

const WeatherWidget = ({ location, onLocationChange }) => {
  console.log('Weather Widget rendering');

  const [weatherData, setWeatherData] = useState(null);
  const [localLocation, setLocalLocation] = useState(location || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update local state when prop changes
  useEffect(() => {
    if (location !== localLocation) {
      setLocalLocation(location);
    }
  }, [location]);

  // Try to get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        error => {
          console.error('Geolocation error:', error);
          setError('Please enter a location to check weather.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  const fetchWeatherByCoords = async (latitude, longitude) => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert coordinates to location name for API call
      const locationString = `${latitude},${longitude}`;
      const data = await getWeatherByLocation(locationString);
      
      setWeatherData(data);
      // Update location in parent component if we have a city name
      if (data?.name) {
        onLocationChange?.(data.name);
      }
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByLocation = async (e) => {
    e.preventDefault();
    
    if (!localLocation.trim()) {
      setError('Please enter a location.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log("Attempting to fetch weather for:", localLocation);
      const data = await getWeatherByLocation(localLocation);
      console.log("Weather API response:", data);
      
      setWeatherData(data);
      
      // Update location in parent component
      onLocationChange?.(localLocation);
    } catch (err) {
      console.error('Error details:', err);
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    // Map weather condition to appropriate icon
    // This is a simple implementation that could be expanded
    if (!condition) return 'fa-question';
    
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) {
      return 'fa-sun';
    } else if (lowerCondition.includes('cloud')) {
      return 'fa-cloud';
    } else if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
      return 'fa-cloud-rain';
    } else if (lowerCondition.includes('thunder') || lowerCondition.includes('storm')) {
      return 'fa-bolt';
    } else if (lowerCondition.includes('snow')) {
      return 'fa-snowflake';
    } else if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) {
      return 'fa-smog';
    } else {
      return 'fa-cloud';
    }
  };

  return (
    <div className="weather-widget">
      {weatherData && console.log('Weather data available:', weatherData)}
      
      <div className="weather-header">
        <h2>Current Weather</h2>
        <p>Stay updated on weather conditions</p>
      </div>
      
      <form onSubmit={fetchWeatherByLocation} className="weather-search">
        <input
          type="text"
          placeholder="Enter city or location"
          value={localLocation}
          onChange={(e) => setLocalLocation(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          <i className="fas fa-search"></i>
        </button>
      </form>
      
      {error && <div className="weather-error">{error}</div>}
      
      {loading ? (
        <div className="weather-loading">
          <div className="spinner"></div>
          <p>Loading weather data...</p>
        </div>
      ) : weatherData ? (
        <div className="weather-content">
          <div className="weather-location">
            <h3>{weatherData.name}</h3>
            <p>{weatherData.sys?.country || ''}</p>
          </div>
          
          <div className="weather-info">
            <div className="weather-icon">
              <i className={`fas fa-cloud`}></i>
              <span>{weatherData.weather && weatherData.weather[0] ? weatherData.weather[0].description : 'Unknown'}</span>
            </div>
            
            <div className="weather-temp">
              <span className="temp">{weatherData.main?.temp ? Math.round(weatherData.main.temp) : '?'}°C</span>
            </div>
          </div>
          
          <div className="weather-details">
            <div className="detail">
              <i className="fas fa-wind"></i>
              <div>
                <span>Wind</span>
                <p>{weatherData.wind?.speed || '?'} m/s</p>
              </div>
            </div>
            
            <div className="detail">
              <i className="fas fa-tint"></i>
              <div>
                <span>Humidity</span>
                <p>{weatherData.main?.humidity || '?'}%</p>
              </div>
            </div>
          </div>
          
          {/* Alert display section */}
          {weatherData.alerts && weatherData.alerts.alert.length > 0 && (
            <div className="weather-alerts">
              <h4>Weather Alerts</h4>
              <ul>
                {weatherData.alerts.alert.map((alert, index) => (
                  <li key={index} className="alert-item">
                    <i className="fas fa-exclamation-triangle"></i>
                    <div className="alert-content">
                      <p className="alert-title">{alert.headline}</p>
                      <p className="alert-desc">{alert.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="weather-placeholder">
          <i className="fas fa-cloud-sun"></i>
          <p>Enter a location to see weather information</p>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget; 