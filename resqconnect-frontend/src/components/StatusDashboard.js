import React, { useState, useEffect } from 'react';
import { getReports, updateReportStatus, addReportAction } from '../api';
import './StatusDashboard.css';

const StatusDashboard = () => {
  const [reports, setReports] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingReport, setEditingReport] = useState(null);
  const [newAction, setNewAction] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    // The search will be handled by the useEffect that watches searchTerm
    console.log('Searching for:', searchTerm);
  };

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching reports with filter:', activeFilter, 'and search:', searchTerm);
        
        // Build filter object
        const params = {};
        if (activeFilter && activeFilter !== 'all') {
          params.status = activeFilter;
        }
        
        // Use the general search parameter for better API filtering
        if (searchTerm && searchTerm.trim()) {
          params.search = searchTerm.trim();
        }
        
        console.log('Request params:', params);
        
        try {
          // Try to fetch from API first
          const response = await getReports(params);
          console.log('API response:', response);
          
          // Handle different response formats
          if (response && response.success && Array.isArray(response.data)) {
            console.log(`Using API data (${response.data.length} reports)`);
            setReports(response.data);
          } else if (response && Array.isArray(response)) {
            console.log(`Response is an array (${response.length} reports)`);
            setReports(response);
          } else if (response && response.data && Array.isArray(response.data)) {
            console.log(`Using response.data (${response.data.length} reports)`);
            setReports(response.data);
          } else {
            console.log('Unexpected API response format:', response);
            setError('Unexpected response format from server');
            setReports([]);
          }
        } catch (apiError) {
          console.error('API error:', apiError);
          setError(`API error: ${apiError.message || 'Unknown error'}`);
          setReports([]);
        }
      } catch (err) {
        console.error('General error in fetchReports:', err);
        setError('Failed to load reports. Please try again later.');
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API calls to avoid too many requests
    const timeoutId = setTimeout(() => {
      fetchReports();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [activeFilter, searchTerm]); // Will refresh when filter or search changes

  // Use already filtered reports from the API response
  const filteredReports = reports;

  // Update report status
  const updateStatus = async (id, newStatus) => {
    try {
      setError(null);
      
      try {
        const response = await updateReportStatus(id, newStatus);
        
        if (response && response.success && response.data) {
          // Update local state
          setReports(prevReports => 
            prevReports.map(report => 
              report.id === id ? response.data : report
            )
          );
        } else {
          // Fallback to local update
          setReports(prevReports => 
            prevReports.map(report => 
              report.id === id ? { ...report, status: newStatus } : report
            )
          );
        }
      } catch (apiError) {
        console.error('API error in updateStatus:', apiError);
        // Fallback to local update
        setReports(prevReports => 
          prevReports.map(report => 
            report.id === id ? { ...report, status: newStatus } : report
          )
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError(`Failed to update status: ${err.message}`);
    }
  };

  // Add action to report
  const addAction = async (id) => {
    if (!newAction.trim()) return;
    
    try {
      setError(null);
      
      try {
        const response = await addReportAction(id, newAction);
        
        if (response && response.success && response.data) {
          // Update local state
          setReports(prevReports => 
            prevReports.map(report => 
              report.id === id ? response.data : report
            )
          );
        } else {
          // Fallback to local update
          setReports(prevReports => 
            prevReports.map(report => 
              report.id === id ? { 
                ...report, 
                actions: [...(report.actions || []), newAction] 
              } : report
            )
          );
        }
        
        setNewAction('');
        setEditingReport(null);
      } catch (apiError) {
        console.error('API error in addAction:', apiError);
        // Fallback to local update
        setReports(prevReports => 
          prevReports.map(report => 
            report.id === id ? { 
              ...report, 
              actions: [...(report.actions || []), newAction] 
            } : report
          )
        );
        
        setNewAction('');
        setEditingReport(null);
      }
    } catch (err) {
      console.error('Error adding action:', err);
      setError(`Failed to add action: ${err.message}`);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'pending': return 'status-badge pending';
      case 'in-progress': return 'status-badge in-progress';
      case 'completed': return 'status-badge completed';
      default: return 'status-badge';
    }
  };

  // Get severity class
  const getSeverityClass = (severity) => {
    switch(severity) {
      case 'high': return 'severity-badge high';
      case 'medium': return 'severity-badge medium';
      case 'low': return 'severity-badge low';
      default: return 'severity-badge';
    }
  };

  return (
    <div className="status-dashboard">
      <div className="dashboard-header">
        <h1>Disaster Response Dashboard</h1>
        <p>Track and manage disaster reports and response efforts</p>
      </div>

      <div className="dashboard-controls">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Reports
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'in-progress' ? 'active' : ''}`}
            onClick={() => setActiveFilter('in-progress')}
          >
            In Progress
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveFilter('completed')}
          >
            Completed
          </button>
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">
            <i className="fas fa-search"></i>
          </button>
        </form>
      </div>

      {/* Error message */}
      {error && (
        <div className="dashboard-error">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
        </div>
      )}

      <div className="dashboard-summary">
        <div className="summary-card">
          <div className="summary-icon pending">
            <i className="fas fa-hourglass-half"></i>
          </div>
          <div className="summary-content">
            <h3>Pending</h3>
            <p>{reports.filter(r => r.status === 'pending').length}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon in-progress">
            <i className="fas fa-spinner"></i>
          </div>
          <div className="summary-content">
            <h3>In Progress</h3>
            <p>{reports.filter(r => r.status === 'in-progress').length}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon completed">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="summary-content">
            <h3>Completed</h3>
            <p>{reports.filter(r => r.status === 'completed').length}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon total">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <div className="summary-content">
            <h3>Total</h3>
            <p>{reports.length}</p>
          </div>
        </div>
      </div>

      <div className="reports-container">
        {loading ? (
          <div className="loading-indicator">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="no-reports">
            <i className="fas fa-folder-open"></i>
            <h3>No reports found</h3>
            <p>Try changing your search or filter criteria</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <div className="report-type">
                  <h3>{report.type}</h3>
                  <span className={getSeverityClass(report.severity)}>
                    {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                  </span>
                </div>
                <span className={getStatusBadgeClass(report.status)}>
                  {report.status === 'in-progress' ? 'In Progress' : 
                    report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </span>
              </div>
              
              <div className="report-location">
                <i className="fas fa-map-marker-alt"></i>
                <span>{report.location}</span>
              </div>
              
              <p className="report-description">{report.description}</p>
              
              <div className="report-meta">
                <div className="meta-item">
                  <i className="fas fa-calendar-alt"></i>
                  <span>Reported: {formatDate(report.reportedAt)}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-user"></i>
                  <span>By: {report.reportedBy}</span>
                </div>
                {report.assignedTo && (
                  <div className="meta-item">
                    <i className="fas fa-users"></i>
                    <span>Assigned: {report.assignedTo}</span>
                  </div>
                )}
              </div>
              
              <div className="report-actions">
                <h4>Response Actions:</h4>
                {report.actions && report.actions.length > 0 ? (
                  <ul className="action-list">
                    {report.actions.map((action, index) => (
                      <li key={index}>
                        <i className="fas fa-check-square"></i>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-actions">No actions recorded yet</p>
                )}
                
                {editingReport === report.id ? (
                  <div className="add-action-form">
                    <input
                      type="text"
                      placeholder="Enter new action..."
                      value={newAction}
                      onChange={(e) => setNewAction(e.target.value)}
                    />
                    <button 
                      className="add-btn"
                      onClick={() => addAction(report.id)}
                    >
                      Add
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={() => {
                        setEditingReport(null);
                        setNewAction('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    className="add-action-btn"
                    onClick={() => setEditingReport(report.id)}
                  >
                    <i className="fas fa-plus"></i> Add Action
                  </button>
                )}
              </div>
              
              <div className="status-controls">
                <button 
                  className={`status-btn pending ${report.status === 'pending' ? 'active' : ''}`}
                  onClick={() => updateStatus(report.id, 'pending')}
                  disabled={report.status === 'pending'}
                >
                  <i className="fas fa-hourglass-half"></i> Pending
                </button>
                <button 
                  className={`status-btn in-progress ${report.status === 'in-progress' ? 'active' : ''}`}
                  onClick={() => updateStatus(report.id, 'in-progress')}
                  disabled={report.status === 'in-progress'}
                >
                  <i className="fas fa-spinner"></i> In Progress
                </button>
                <button 
                  className={`status-btn completed ${report.status === 'completed' ? 'active' : ''}`}
                  onClick={() => updateStatus(report.id, 'completed')}
                  disabled={report.status === 'completed'}
                >
                  <i className="fas fa-check-circle"></i> Completed
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StatusDashboard; 