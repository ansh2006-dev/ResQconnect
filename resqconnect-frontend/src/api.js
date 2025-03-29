import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Disaster API functions
export const getDisasters = async (cursor = null, limit = 5, extraParams = {}) => {
  // Default to last 12 months if no specific date range is provided
  if (!extraParams.startDate) {
    const lastTwelveMonths = new Date();
    lastTwelveMonths.setMonth(lastTwelveMonths.getMonth() - 12);
    extraParams.startDate = lastTwelveMonths.toISOString();
  }
  
  const params = { limit, ...extraParams };
  if (cursor) params.after = cursor;
  
  try {
    console.log("Making request to /disasters with params:", params);
    
    // Use fetch directly instead of axios for more detailed error tracking
    const url = new URL(`${API_URL}/disasters`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    console.log("Full URL:", url.toString());
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error("API error:", response.status, response.statusText);
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Raw API response:", data);
    
    // Check if the response has the expected structure
    if (!data) {
      console.error("Empty response from API");
      throw new Error("Empty response from API");
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching disasters:', error);
    // Return a user-friendly error that we can display
    throw {
      message: `Failed to fetch disasters data: ${error.message}`,
      originalError: error,
      timestamp: new Date().toISOString()
    };
  }
};

export const reportDisaster = async (disasterData) => {
  try {
    const response = await api.post('/disasters', disasterData);
    return response.data;
  } catch (error) {
    console.error('Error reporting disaster:', error);
    throw error;
  }
};

// Weather API functions
export const getWeatherByLocation = async (location) => {
  try {
    const response = await api.get('/weather', { params: { location } });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

// Geocoding function
export const geocodeAddress = async (address) => {
  try {
    const response = await api.get('/disasters/geocode', { params: { address } });
    return response.data;
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw error;
  }
};

export default api;
