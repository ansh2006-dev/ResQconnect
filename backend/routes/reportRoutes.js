const express = require('express');
const router = express.Router();

// In a real application, these would be stored in a database
let reports = [
  {
    id: 'r-1648394023-123',
    type: 'Earthquake',
    location: 'San Francisco, CA',
    description: 'Moderate shaking felt throughout the city, some structural damage reported.',
    severity: 'high',
    reportedAt: '2023-03-27T14:27:03Z',
    reportedBy: 'John Smith',
    contact: 'john.smith@example.com',
    status: 'pending',
    assignedTo: 'Emergency Response Team A',
    actions: ['Deployed rescue teams', 'Set up evacuation centers']
  },
  {
    id: 'r-1646235623-456',
    type: 'Flood',
    location: 'New Orleans, LA',
    description: 'Rising water levels in residential areas, some roads impassable.',
    severity: 'medium',
    reportedAt: '2023-03-02T09:47:03Z',
    reportedBy: 'Sarah Johnson',
    contact: '555-123-4567',
    status: 'in-progress',
    assignedTo: 'Flood Response Unit',
    actions: ['Sandbag distribution', 'Pumping operations active']
  },
  {
    id: 'r-1643297223-789',
    type: 'Wildfire',
    location: 'Los Angeles, CA',
    description: 'Brush fire spreading rapidly due to high winds, threatening suburban areas.',
    severity: 'high',
    reportedAt: '2023-01-27T11:27:03Z',
    reportedBy: 'Fire Watch Volunteer',
    contact: 'firewatch@lafd.org',
    status: 'completed',
    assignedTo: 'Wildfire Taskforce',
    actions: ['Aerial firefighting', 'Mandatory evacuation', 'Firebreak creation']
  },
  {
    id: 'r-1641396423-012',
    type: 'Hurricane',
    location: 'Miami, FL',
    description: 'Category 3 hurricane approaching coastline, heavy rainfall and storm surge expected.',
    severity: 'high',
    reportedAt: '2023-01-05T18:07:03Z',
    reportedBy: 'Weather Service',
    contact: 'alerts@weather.gov',
    status: 'completed',
    assignedTo: 'Hurricane Response Team',
    actions: ['Evacuation completed', 'Shelters established', 'Emergency supplies distributed']
  },
  {
    id: 'r-1638631623-345',
    type: 'Tornado',
    location: 'Oklahoma City, OK',
    description: 'F3 tornado touched down west of the city, moving northeast.',
    severity: 'medium',
    reportedAt: '2022-12-04T09:27:03Z',
    reportedBy: 'Storm Spotter',
    contact: 'spotter@noaa.gov',
    status: 'pending',
    assignedTo: 'Unassigned',
    actions: []
  }
];

// GET all reports with optional filters
router.get('/', (req, res) => {
  try {
    const { status, location, type, search, reportedBy, assignedTo } = req.query;
    let filteredReports = [...reports];
    
    console.log('Query filters:', req.query);
    
    // Apply filters if provided
    if (status) {
      filteredReports = filteredReports.filter(report => 
        report.status && report.status.toLowerCase() === status.toLowerCase());
    }
    
    if (location) {
      filteredReports = filteredReports.filter(report => 
        report.location && report.location.toLowerCase().includes(location.toLowerCase()));
    }
    
    if (type) {
      filteredReports = filteredReports.filter(report => 
        report.type && report.type.toLowerCase().includes(type.toLowerCase()));
    }
    
    if (reportedBy) {
      filteredReports = filteredReports.filter(report => 
        report.reportedBy && report.reportedBy.toLowerCase().includes(reportedBy.toLowerCase()));
    }
    
    if (assignedTo) {
      filteredReports = filteredReports.filter(report => 
        report.assignedTo && report.assignedTo.toLowerCase().includes(assignedTo.toLowerCase()));
    }
    
    // General search term that looks across multiple fields
    if (search) {
      const searchLower = search.toLowerCase();
      filteredReports = filteredReports.filter(report => 
        (report.type && report.type.toLowerCase().includes(searchLower)) ||
        (report.location && report.location.toLowerCase().includes(searchLower)) ||
        (report.description && report.description.toLowerCase().includes(searchLower)) ||
        (report.reportedBy && report.reportedBy.toLowerCase().includes(searchLower)) ||
        (report.assignedTo && report.assignedTo.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort by date - most recent first
    filteredReports.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
    
    console.log(`Returning ${filteredReports.length} filtered reports`);
    
    // Return response with count information
    res.json({ 
      success: true, 
      count: filteredReports.length,
      totalCount: reports.length,
      data: filteredReports 
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch reports', 
      error: error.message 
    });
  }
});

// GET a single report by ID
router.get('/:id', (req, res) => {
  try {
    const report = reports.find(r => r.id === req.params.id);
    
    if (!report) {
      return res.status(404).json({ 
        success: false, 
        message: 'Report not found' 
      });
    }
    
    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch report', 
      error: error.message 
    });
  }
});

// POST - Create a new report
router.post('/', (req, res) => {
  try {
    const { 
      type, location, description, severity, 
      reportedBy, contact, status = 'pending' 
    } = req.body;
    
    // Validate required fields
    if (!type || !location || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: type, location, and description are required' 
      });
    }
    
    // Create a new report
    const newReport = {
      id: `r-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      location,
      description,
      severity: severity || 'medium',
      reportedAt: new Date().toISOString(),
      reportedBy: reportedBy || 'Anonymous',
      contact: contact || '',
      status,
      assignedTo: 'Unassigned',
      actions: []
    };
    
    // Add to reports array
    reports.push(newReport);
    
    res.status(201).json({ 
      success: true, 
      message: 'Report created successfully', 
      data: newReport 
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create report', 
      error: error.message 
    });
  }
});

// PATCH - Update a report status or add actions
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, action, assignedTo } = req.body;
    
    // Find the report
    const reportIndex = reports.findIndex(r => r.id === id);
    
    if (reportIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Report not found' 
      });
    }
    
    const updatedReport = { ...reports[reportIndex] };
    
    // Update status if provided
    if (status) {
      updatedReport.status = status;
    }
    
    // Update assignedTo if provided
    if (assignedTo) {
      updatedReport.assignedTo = assignedTo;
    }
    
    // Add action if provided
    if (action && action.trim()) {
      updatedReport.actions = [...updatedReport.actions, action];
    }
    
    // Update the report in the array
    reports[reportIndex] = updatedReport;
    
    res.json({ 
      success: true, 
      message: 'Report updated successfully', 
      data: updatedReport 
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update report', 
      error: error.message 
    });
  }
});

// DELETE - Remove a report
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const initialLength = reports.length;
    
    // Filter out the report with the specified ID
    reports = reports.filter(report => report.id !== id);
    
    if (reports.length === initialLength) {
      return res.status(404).json({ 
        success: false, 
        message: 'Report not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Report deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete report', 
      error: error.message 
    });
  }
});

module.exports = router; 