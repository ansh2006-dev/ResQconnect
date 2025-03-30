import axios from 'axios';
import { formatLocation, isValidLocation, encodeLocationForUrl } from './utils/locationUtils';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Configure API base URL
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

// Weather API functions
export const getWeather = async (city) => {
  try {
    if (!isValidLocation(city)) {
      throw new Error('Valid city name is required');
    }
    
    const encodedCity = encodeLocationForUrl(city);
    const response = await api.get(`/weather?city=${encodedCity}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};

/**
 * Get weather data for a location
 */
export const getWeatherByLocation = async (location) => {
  try {
    if (!isValidLocation(location)) {
      throw new Error('Valid location is required for weather lookup');
    }
    
    const encodedLocation = encodeLocationForUrl(location);
    const response = await api.get(`/weather/location/${encodedLocation}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching weather by location:', error);
    throw error;
  }
};

// Disasters API functions
export const getDisasters = async (location) => {
  try {
    const params = location ? { location } : {};
    const response = await api.get('/disasters', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching disasters:', error);
    throw error;
  }
};

// Report disaster function
export const reportDisaster = async (disasterData) => {
  try {
    const response = await api.post('/disasters', disasterData);
    return response.data;
  } catch (error) {
    console.error('Error reporting disaster:', error);
    throw error;
  }
};

// Geocoding helper function
export const geocodeAddress = async (address) => {
  try {
    const response = await api.get(`/disasters/geocode?address=${encodeURIComponent(address)}`);
    return response.data.results[0];
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw error;
  }
};

// Report status management functions
export const getReports = async (filters = {}) => {
  try {
    // Ensure filters object is properly formatted
    const cleanedFilters = {};
    
    // Only add non-empty properties to the filter
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== '') {
          cleanedFilters[key] = filters[key];
        }
      });
    }
    
    console.log('Fetching reports with filters:', cleanedFilters);
    
    // Make API request with filters as query parameters
    const response = await api.get('/reports', { 
      params: cleanedFilters,
      // Add timeout to prevent hanging requests
      timeout: 5000
    });
    
    // Validate response structure
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

export const getReportById = async (id) => {
  try {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching report ${id}:`, error);
    throw error;
  }
};

export const updateReportStatus = async (id, status) => {
  try {
    const response = await api.patch(`/reports/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating report ${id} status:`, error);
    throw error;
  }
};

export const addReportAction = async (id, action) => {
  try {
    const response = await api.patch(`/reports/${id}`, { action });
    return response.data;
  } catch (error) {
    console.error(`Error adding action to report ${id}:`, error);
    throw error;
  }
};

export const assignReport = async (id, assignedTo) => {
  try {
    const response = await api.patch(`/reports/${id}`, { assignedTo });
    return response.data;
  } catch (error) {
    console.error(`Error assigning report ${id}:`, error);
    throw error;
  }
};

export const deleteReport = async (id) => {
  try {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};

// Export the api instance for direct use in components
export default api;
