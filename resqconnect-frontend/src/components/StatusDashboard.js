import React, { useState, useEffect } from 'react';
import './StatusDashboard.css';
import { getReports, updateReportStatus, addReportAction, assignReport } from '../api';
import { useLocation } from '../App';

const StatusDashboard = () => {
  // Get location from context
  const { location } = useLocation();
  
  // Main state for reports
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [showRefreshMsg, setShowRefreshMsg] = useState(false);
  const [refreshTimer, setRefreshTimer] = useState(null);

  // Open chatbot when help button is clicked
  const openChatbot = () => {
    try {
      const chatbotToggle = document.querySelector('.chatbot-toggle');
      if (chatbotToggle) {
        chatbotToggle.click();
      } else {
        const event = new CustomEvent('open-chatbot');
        document.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error opening chatbot:', error);
    }
  };

  // Initial data fetch and setup refresh interval
  useEffect(() => {
    fetchReports();
    
    // Set up refresh interval - refresh data every 2 minutes
    const intervalId = setInterval(() => {
      fetchReports();
      setShowRefreshMsg(true);
      
      // Hide the refresh message after 3 seconds
      const timerId = setTimeout(() => {
        setShowRefreshMsg(false);
      }, 3000);
      
      setRefreshTimer(timerId);
    }, 120000);
    
    // Clean up on unmount
    return () => {
      clearInterval(intervalId);
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    };
  }, []);

  // Fetch reports from API
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare filter parameters
      const params = {};
      if (location) {
        params.location = location;
      }
      
      const data = await getReports(params);
      
      if (Array.isArray(data)) {
        setReports(data);
        applyFilters(data, activeFilter, searchTerm, sortOrder);
      } else {
        console.error('Invalid response format:', data);
        setError('Received invalid data format from server');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports. Please try again later.');
      
      // Set empty array to avoid undefined errors
      setReports([]);
      setFilteredReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply all filters to the reports
  const applyFilters = (reportsArray, statusFilter, search, ordering) => {
    let result = [...reportsArray];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(report => report.status.toLowerCase() === statusFilter);
    }
    
    // Apply search term filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(report => 
        report.type.toLowerCase().includes(searchLower) ||
        report.location.toLowerCase().includes(searchLower) ||
        report.description.toLowerCase().includes(searchLower) ||
        (report.reportedBy && report.reportedBy.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply sort order
    if (ordering === 'newest') {
      result.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
    } else if (ordering === 'oldest') {
      result.sort((a, b) => new Date(a.reportedAt) - new Date(b.reportedAt));
    } else if (ordering === 'severity') {
      // Map severity to numeric value for sorting
      const severityMap = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
      result.sort((a, b) => severityMap[b.severity] - severityMap[a.severity]);
    }
    
    setFilteredReports(result);
  };

  // When filter state changes, reapply filters
  useEffect(() => {
    applyFilters(reports, activeFilter, searchTerm, sortOrder);
  }, [activeFilter, searchTerm, sortOrder]);

  // Handle filter button clicks
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already applied through the useEffect when searchTerm changes
  };

  // Handle manual refresh button click
  const handleRefresh = () => {
    fetchReports();
    setShowRefreshMsg(true);
    
    setTimeout(() => {
      setShowRefreshMsg(false);
    }, 3000);
  };

  // Handle sort order change
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  // Handle status update for a report
  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      // Optimistic update
      const updatedReports = reports.map(report => 
        report.id === reportId 
          ? { ...report, status: newStatus, lastUpdated: new Date().toISOString() } 
          : report
      );
      
      setReports(updatedReports);
      applyFilters(updatedReports, activeFilter, searchTerm, sortOrder);
      
      // Send update to API
      await updateReportStatus(reportId, newStatus);
      
      // Refresh data to get accurate server state
      fetchReports();
    } catch (err) {
      console.error(`Error updating status for report ${reportId}:`, err);
      // Roll back optimistic update on error
      fetchReports();
    }
  };

  // Handle adding a new action to a report
  const handleAddAction = async (reportId, actionText) => {
    if (!actionText.trim()) return;
    
    try {
      const timestamp = new Date().toISOString();
      const newAction = {
        text: actionText,
        timestamp,
        by: 'Responder'
      };
      
      // Optimistic update
      const updatedReports = reports.map(report => {
        if (report.id === reportId) {
          const updatedActions = [...(report.actions || []), newAction];
          return { 
            ...report, 
            actions: updatedActions,
            lastUpdated: timestamp
          };
        }
        return report;
      });
      
      setReports(updatedReports);
      applyFilters(updatedReports, activeFilter, searchTerm, sortOrder);
      
      // Send update to API
      await addReportAction(reportId, newAction);
      
      // Refresh data to get accurate server state
      fetchReports();
    } catch (err) {
      console.error(`Error adding action to report ${reportId}:`, err);
      // Roll back optimistic update on error
      fetchReports();
    }
  };

  // Handle assigning a report to someone
  const handleAssign = async (reportId, assignee) => {
    if (!assignee.trim()) return;
    
    try {
      // Optimistic update
      const updatedReports = reports.map(report => 
        report.id === reportId 
          ? { ...report, assignedTo: assignee, lastUpdated: new Date().toISOString() } 
          : report
      );
      
      setReports(updatedReports);
      applyFilters(updatedReports, activeFilter, searchTerm, sortOrder);
      
      // Send update to API
      await assignReport(reportId, assignee);
      
      // Refresh data to get accurate server state
      fetchReports();
    } catch (err) {
      console.error(`Error assigning report ${reportId}:`, err);
      // Roll back optimistic update on error
      fetchReports();
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get class for status badge
  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'new': return 'status-new';
      case 'in progress': return 'status-progress';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      default: return '';
    }
  };

  // Get class for severity badge
  const getSeverityClass = (severity) => {
    switch(severity.toLowerCase()) {
      case 'low': return 'severity-low';
      case 'medium': return 'severity-medium';
      case 'high': return 'severity-high';
      case 'critical': return 'severity-critical';
      default: return '';
    }
  };

  // Calculate report statistics
  const reportStats = {
    total: reports.length,
    new: reports.filter(r => r.status.toLowerCase() === 'new').length,
    inProgress: reports.filter(r => r.status.toLowerCase() === 'in progress').length,
    resolved: reports.filter(r => r.status.toLowerCase() === 'resolved').length,
    closed: reports.filter(r => r.status.toLowerCase() === 'closed').length
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Disaster Response Dashboard</h1>
        <p>Track and manage disaster reports and response efforts</p>
        <div className="dashboard-actions">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dashboard-search"
          />
          <button 
            className="help-button"
            onClick={openChatbot}
            title="Get help with the dashboard"
          >
            <i className="fas fa-question-circle"></i>
            <span>Help</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={handleRefresh}>Try Again</button>
        </div>
      )}

      {showRefreshMsg && (
        <div className="refresh-message">
          <i className="fas fa-sync-alt"></i>
          <p>Dashboard refreshed with latest data</p>
        </div>
      )}

      <div className="dashboard-stats">
        <div className="stat-card total">
          <h3>Total Reports</h3>
          <p>{reportStats.total}</p>
          <i className="fas fa-clipboard-list"></i>
        </div>
        
        <div className="stat-card new">
          <h3>New</h3>
          <p>{reportStats.new}</p>
          <i className="fas fa-bell"></i>
        </div>
        
        <div className="stat-card in-progress">
          <h3>In Progress</h3>
          <p>{reportStats.inProgress}</p>
          <i className="fas fa-spinner"></i>
        </div>
        
        <div className="stat-card resolved">
          <h3>Resolved</h3>
          <p>{reportStats.resolved}</p>
          <i className="fas fa-check-circle"></i>
        </div>
        
        <div className="stat-card closed">
          <h3>Closed</h3>
          <p>{reportStats.closed}</p>
          <i className="fas fa-archive"></i>
        </div>
      </div>

      <div className="dashboard-controls">
        <div className="filter-buttons">
          <button 
            className={activeFilter === 'all' ? 'active' : ''} 
            onClick={() => handleFilterChange('all')}
          >
            All Reports
          </button>
          <button 
            className={activeFilter === 'new' ? 'active' : ''} 
            onClick={() => handleFilterChange('new')}
          >
            New
          </button>
          <button 
            className={activeFilter === 'in progress' ? 'active' : ''} 
            onClick={() => handleFilterChange('in progress')}
          >
            In Progress
          </button>
          <button 
            className={activeFilter === 'resolved' ? 'active' : ''} 
            onClick={() => handleFilterChange('resolved')}
          >
            Resolved
          </button>
          <button 
            className={activeFilter === 'closed' ? 'active' : ''} 
            onClick={() => handleFilterChange('closed')}
          >
            Closed
          </button>
        </div>

        <div className="dashboard-tools">
          <form className="search-form" onSubmit={handleSearch}>
            <button type="submit">
              <i className="fas fa-search"></i>
            </button>
          </form>

          <div className="sort-control">
            <label htmlFor="sort-order">Sort by:</label>
            <select 
              id="sort-order" 
              value={sortOrder}
              onChange={handleSortChange}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="severity">Severity</option>
            </select>
          </div>

          <button className="refresh-btn" onClick={handleRefresh}>
            <i className="fas fa-sync-alt"></i>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading reports...</p>
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="reports-list">
          {filteredReports.map(report => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <div className="report-type-info">
                  <h3>{report.type}</h3>
                  <p className="report-location">
                    <i className="fas fa-map-marker-alt"></i>
                    {report.location}
                  </p>
                </div>
                <div className="report-badges">
                  <span className={`status-badge ${getStatusClass(report.status)}`}>
                    {report.status}
                  </span>
                  <span className={`severity-badge ${getSeverityClass(report.severity)}`}>
                    {report.severity}
                  </span>
                </div>
              </div>
              
              <p className="report-description">{report.description}</p>
              
              <div className="report-meta">
                <div className="report-meta-item">
                  <i className="fas fa-clock"></i>
                  <span>Reported: {formatDate(report.reportedAt)}</span>
                </div>
                <div className="report-meta-item">
                  <i className="fas fa-user"></i>
                  <span>By: {report.reportedBy || 'Anonymous'}</span>
                </div>
                {report.assignedTo && (
                  <div className="report-meta-item">
                    <i className="fas fa-user-shield"></i>
                    <span>Assigned to: {report.assignedTo}</span>
                  </div>
                )}
                {report.lastUpdated && (
                  <div className="report-meta-item">
                    <i className="fas fa-history"></i>
                    <span>Last updated: {formatDate(report.lastUpdated)}</span>
                  </div>
                )}
              </div>
              
              {report.actions && report.actions.length > 0 && (
                <div className="report-actions-list">
                  <h4>Response Actions:</h4>
                  <ul>
                    {report.actions.map((action, index) => (
                      <li key={index} className="action-item">
                        <div className="action-meta">
                          <span className="action-time">{formatDate(action.timestamp)}</span>
                          <span className="action-by">{action.by}</span>
                        </div>
                        <p className="action-text">{action.text}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="report-controls">
                <div className="status-control">
                  <label>Update Status:</label>
                  <div className="status-buttons">
                    <button 
                      className={`status-btn ${report.status.toLowerCase() === 'new' ? 'active' : ''}`}
                      onClick={() => handleStatusUpdate(report.id, 'New')}
                    >
                      New
                    </button>
                    <button 
                      className={`status-btn ${report.status.toLowerCase() === 'in progress' ? 'active' : ''}`}
                      onClick={() => handleStatusUpdate(report.id, 'In Progress')}
                    >
                      In Progress
                    </button>
                    <button 
                      className={`status-btn ${report.status.toLowerCase() === 'resolved' ? 'active' : ''}`}
                      onClick={() => handleStatusUpdate(report.id, 'Resolved')}
                    >
                      Resolved
                    </button>
                    <button 
                      className={`status-btn ${report.status.toLowerCase() === 'closed' ? 'active' : ''}`}
                      onClick={() => handleStatusUpdate(report.id, 'Closed')}
                    >
                      Closed
                    </button>
                  </div>
                </div>
                
                <div className="action-form">
                  <input 
                    type="text" 
                    placeholder="Add response action..." 
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddAction(report.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button onClick={(e) => {
                    const input = e.target.previousSibling;
                    handleAddAction(report.id, input.value);
                    input.value = '';
                  }}>
                    Add
                  </button>
                </div>
                
                <div className="assign-form">
                  <input 
                    type="text" 
                    placeholder="Assign to..." 
                    defaultValue={report.assignedTo || ''}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAssign(report.id, e.target.value);
                      }
                    }}
                  />
                  <button onClick={(e) => {
                    const input = e.target.previousSibling;
                    handleAssign(report.id, input.value);
                  }}>
                    Assign
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-reports">
          <i className="fas fa-search"></i>
          <h3>No reports found</h3>
          <p>No reports match your current filters.</p>
          <button onClick={() => {
            setActiveFilter('all');
            setSearchTerm('');
          }}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default StatusDashboard; 