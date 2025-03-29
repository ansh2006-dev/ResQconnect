import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Weather API functions
export const getWeather = async (city) => {
  try {
    const response = await axios.get(`/weather?city=${encodeURIComponent(city)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};

// Add the missing function that WeatherWidget is looking for
export const getWeatherByLocation = async (location) => {
  try {
    const response = await axios.get(`/weather?city=${encodeURIComponent(location)}`);
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
    const response = await axios.get('/disasters', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching disasters:', error);
    throw error;
  }
};

// Report disaster function
export const reportDisaster = async (disasterData) => {
  try {
    const response = await axios.post('/disasters', disasterData);
    return response.data;
  } catch (error) {
    console.error('Error reporting disaster:', error);
    throw error;
  }
};

// Geocoding helper function
export const geocodeAddress = async (address) => {
  try {
    const response = await axios.get(`/disasters/geocode?address=${encodeURIComponent(address)}`);
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
    const response = await axios.get('/reports', { 
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
    const response = await axios.get(`/reports/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching report ${id}:`, error);
    throw error;
  }
};

export const updateReportStatus = async (id, status) => {
  try {
    const response = await axios.patch(`/reports/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating report ${id} status:`, error);
    throw error;
  }
};

export const addReportAction = async (id, action) => {
  try {
    const response = await axios.patch(`/reports/${id}`, { action });
    return response.data;
  } catch (error) {
    console.error(`Error adding action to report ${id}:`, error);
    throw error;
  }
};

export const assignReport = async (id, assignedTo) => {
  try {
    const response = await axios.patch(`/reports/${id}`, { assignedTo });
    return response.data;
  } catch (error) {
    console.error(`Error assigning report ${id}:`, error);
    throw error;
  }
};

export const deleteReport = async (id) => {
  try {
    const response = await axios.delete(`/reports/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting report ${id}:`, error);
    throw error;
  }
};
