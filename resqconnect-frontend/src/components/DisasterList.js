import React, { useState, useEffect } from 'react';
import { getDisasters } from '../api';
import './DisasterList.css';

const DisasterList = ({ location }) => {
  const [disasters, setDisasters] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState("Loading...");
  const [debugInfo, setDebugInfo] = useState(null);

  // Debug function to check API connectivity
  const testApiConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo('Testing API connection...');
      
      // First try the test endpoint
      const testResponse = await fetch('http://localhost:5001/api/test');
      const testData = await testResponse.json();
      
      setDebugInfo(`Test API connection successful: ${JSON.stringify(testData)}`);
      
      // Now try the real disasters endpoint
      const response = await fetch('http://localhost:5001/api/disasters');
      const data = await response.json();
      
      setDebugInfo(prev => `${prev}\n\nDisaster API connection successful. Data: ${JSON.stringify(data).slice(0, 200)}...`);
      
    } catch (err) {
      setDebugInfo(`API connection test failed: ${err.message}`);
      setError('Connection test failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch disasters when location changes
  useEffect(() => {
    if (location) {
      console.log("Location changed in DisasterList:", location);
      fetchDisasters(true, location);
    }
  }, [location]);

  const fetchDisasters = async (initialFetch = false, locationFilter = null) => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // If initialFetch is true, reset the list and cursor
      if (initialFetch) {
        setCursor(null);
        setDisasters([]);
      }
      
      // Pass location to API if provided
      const filterParams = locationFilter ? { location: locationFilter } : {};
      console.log("Fetching disasters with params:", filterParams);
      
      const response = await getDisasters(initialFetch ? null : cursor, 5, filterParams);
      console.log("Disaster API response:", response);
      
      // Check if response has the expected structure
      if (!response || !response.data) {
        console.error("Invalid disaster data format:", response);
        setError("Invalid data format received from server");
        return;
      }
      
      // Set the data source if available
      if (response.source) {
        setDataSource(response.source);
      }
      
      // Set error if one was returned with mock data
      if (response.error) {
        setError(response.error);
      }
      
      if (!Array.isArray(response.data)) {
        console.error("Expected data array but got:", typeof response.data);
        setError("Invalid data format: disaster data is not an array");
        return;
      }
      
      console.log(`Processing ${response.data.length} disaster entries`);
      
      setDisasters(prev => 
        initialFetch ? response.data : [...prev, ...response.data]
      );
      
      setCursor(response.nextCursor);
      setHasMore(!!response.nextCursor);
      
    } catch (err) {
      console.error('Error fetching disasters:', err);
      setError('Failed to load disasters. Please try again later. Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisasters(true);
  }, []);

  const getSeverityClass = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'severity-high';
      case 'medium':
        return 'severity-medium';
      case 'low':
        return 'severity-low';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    // Get time difference in months
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      return 'Today';
    } else if (diffDays < 2) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
  };
  
  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filterDisastersByLocation = (disasters, location) => {
    if (!location) return disasters;
    
    const locationLower = location.toLowerCase();
    return disasters.filter(disaster => {
      return disaster.location.toLowerCase().includes(locationLower);
    });
  };

  return (
    <div className="disaster-list-container">
      <h2>Recent Disaster Reports</h2>
      <p className="disaster-filter-info">
        Showing reports from the last 12 months 
        <span className="data-source-badge">{dataSource}</span>
      </p>
      {location && <p className="filtered-location">Location filter: {location}</p>}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button className="retry-button" onClick={() => fetchDisasters(true, location)}>
            Retry
          </button>
          <button className="test-button" onClick={testApiConnection}>
            Test Connection
          </button>
        </div>
      )}
      
      {debugInfo && (
        <div className="debug-info">
          <details>
            <summary>Debug Information</summary>
            <pre>{debugInfo}</pre>
          </details>
        </div>
      )}
      
      {disasters && disasters.length === 0 && !loading ? (
        <div className="no-disasters">
          No disasters reported in the last 12 months{location ? ` near ${location}` : ''}.
          <button className="retry-button" onClick={() => fetchDisasters(true, location)}>
            Refresh Data
          </button>
        </div>
      ) : (
        <ul className="disaster-list">
          {disasters && disasters.length > 0 && filterDisastersByLocation(disasters, location).map((disaster) => (
            <li key={disaster._id || `disaster-${Math.random()}`} className="disaster-item">
              <div className={`disaster-type ${getSeverityClass(disaster.severity)}`}>
                {disaster.type || "Unknown Type"}
              </div>
              <div className="disaster-details">
                <div className="disaster-location">
                  <i className="fas fa-map-marker-alt"></i> {disaster.location || "Unknown Location"}
                </div>
                <div className="disaster-time">
                  <i className="far fa-clock"></i> {formatDate(disaster.reportedAt)}
                  <span className="full-date" title={formatFullDate(disaster.reportedAt)}>
                    {formatFullDate(disaster.reportedAt)}
                  </span>
                </div>
                <div className="disaster-severity">
                  Severity: {disaster.severity || "unknown"}
                </div>
                {disaster.description && (
                  <div className="disaster-description">
                    {disaster.description}
                  </div>
                )}
                {disaster.sources && disaster.sources.length > 0 && (
                  <div className="disaster-sources">
                    <details>
                      <summary>Sources</summary>
                      <ul>
                        {disaster.sources.map((source, idx) => (
                          <li key={idx}>
                            <a href={source.url} target="_blank" rel="noopener noreferrer">
                              {source.id}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {loading && <div className="loading-spinner">Loading disaster data...</div>}
      
      {hasMore && !loading && disasters && disasters.length > 0 && (
        <button 
          className="load-more-button"
          onClick={() => fetchDisasters(false, location)}
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default DisasterList;
