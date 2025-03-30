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

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if (!location) {
          console.log('No location provided to WeatherWidget');
          return;
        }
        
        setLoading(true);
        setError(null);
        
        const locationStr = String(location).trim();
        if (!locationStr) {
          setError('Invalid location');
          setLoading(false);
          return;
        }
        
        const weatherData = await getWeatherByLocation(locationStr);
        setWeatherData(weatherData);
        setLoading(false);
      } catch (err) {
        console.error('Weather widget error:', err);
        setError(err.message || 'Failed to fetch weather data');
        setLoading(false);
      }
    };
    
    fetchWeather();
  }, [location]);

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

  const getWeatherIcon = (icon) => {
    if (!icon) return 'fa-cloud';
    
    // Map OpenWeatherMap icon codes to Font Awesome icons
    const iconMap = {
      '01d': 'fa-sun',            // clear sky day
      '01n': 'fa-moon',           // clear sky night
      '02d': 'fa-cloud-sun',      // few clouds day
      '02n': 'fa-cloud-moon',     // few clouds night
      '03d': 'fa-cloud',          // scattered clouds
      '03n': 'fa-cloud',
      '04d': 'fa-cloud',          // broken clouds
      '04n': 'fa-cloud',
      '09d': 'fa-cloud-showers-heavy', // shower rain
      '09n': 'fa-cloud-showers-heavy',
      '10d': 'fa-cloud-rain',     // rain day
      '10n': 'fa-cloud-rain',     // rain night
      '11d': 'fa-bolt',           // thunderstorm
      '11n': 'fa-bolt',
      '13d': 'fa-snowflake',      // snow
      '13n': 'fa-snowflake',
      '50d': 'fa-smog',           // mist
      '50n': 'fa-smog'
    };
    
    return iconMap[icon] || 'fa-cloud';
  };

  // Format date from Unix timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="weather-widget">
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
              {weatherData.weather && weatherData.weather[0] && (
                <>
                  <i className={`fas ${getWeatherIcon(weatherData.weather[0].icon)}`}></i>
                  <span>{weatherData.weather[0].description}</span>
                </>
              )}
            </div>
            
            <div className="weather-temp">
              <span className="temp">{weatherData.main?.temp ? Math.round(weatherData.main.temp) : '?'}°C</span>
              <span className="feels-like">Feels like: {weatherData.main?.feels_like ? Math.round(weatherData.main.feels_like) : '?'}°C</span>
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
          
          {/* Forecast display section */}
          {weatherData.forecast && weatherData.forecast.list && weatherData.forecast.list.length > 0 && (
            <div className="forecast-container">
              <h4>4-Day Forecast</h4>
              <div className="forecast-days">
                {weatherData.forecast.list.map((day, index) => (
                  <div key={index} className="forecast-day">
                    <div className="forecast-date">{formatDate(day.dt)}</div>
                    <div className="forecast-icon">
                      <i className={`fas ${getWeatherIcon(day.weather[0]?.icon)}`}></i>
                    </div>
                    <div className="forecast-temp">
                      <span className="high">{Math.round(day.main.temp_max)}°</span>
                      <span className="low">{Math.round(day.main.temp_min)}°</span>
                    </div>
                    <div className="forecast-desc">{day.weather[0]?.description}</div>
                  </div>
                ))}
              </div>
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