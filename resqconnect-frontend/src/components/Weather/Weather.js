const fetchWeatherByLocation = async (location) => {
  if (!location) {
    setError('Please enter a valid location');
    setLoading(false);
    return;
  }
  
  try {
    setLoading(true);
    setError(null);
    const data = await api.getWeatherByLocation(location);
    setWeatherData(data);
    setLoading(false);
  } catch (error) {
    console.error('Weather fetch error:', error);
    setError(error.message || 'Failed to fetch weather data. Please try again.');
    setLoading(false);
  }
}; 