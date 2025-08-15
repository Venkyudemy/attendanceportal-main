const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');
const Settings = require('../models/Settings');

// GET /api/leave-requests - Get all leave requests (admin)
router.get('/', async (req, res) => {
  try {
    const { status, employeeId } = req.query;
    let filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (employeeId) {
      filter.employeeId = employeeId;
    }
    
    const leaveRequests = await LeaveRequest.find(filter)
      .sort({ requestedAt: -1 })
      .populate('employeeId', 'name email department');
    
    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch leave requests' 
    });
  }
});

// GET /api/leave-requests/employee/:employeeId - Get leave requests for specific employee
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({ 
      employeeId: req.params.employeeId 
    }).sort({ requestedAt: -1 });
    
    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error('Error fetching employee leave requests:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch employee leave requests' 
    });
  }
});

// POST /api/leave-requests - Create new leave request
router.post('/', async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      employeeEmail,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason
    } = req.body;

    // Validate required fields
    if (!employeeId || !employeeName || !employeeEmail || !leaveType || !startDate || !endDate || !totalDays || !reason) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'All fields are required'
      });
    }

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Employee not found'
      });
    }

    // Create leave request
    const leaveRequest = new LeaveRequest({
      employeeId,
      employeeName,
      employeeEmail,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason
    });

    await leaveRequest.save();

    console.log('✅ Leave request created successfully:', leaveRequest._id);
    
    res.status(201).json({
      message: 'Leave request submitted successfully',
      leaveRequest: leaveRequest
    });
    
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create leave request' 
    });
  }
});

// PUT /api/leave-requests/:requestId/status - Update leave request status (admin)
router.put('/:requestId/status', async (req, res) => {
  try {
    const { status, adminResponse, adminId, adminName } = req.body;

    if (!status || !['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Valid status is required'
      });
    }

    const leaveRequest = await LeaveRequest.findById(req.params.requestId);
    if (!leaveRequest) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Leave request not found'
      });
    }

    // Update status
    leaveRequest.status = status;
    leaveRequest.adminResponse = adminResponse || '';
    leaveRequest.adminId = adminId || null;
    leaveRequest.adminName = adminName || '';
    leaveRequest.respondedAt = new Date();

    await leaveRequest.save();

    console.log('✅ Leave request status updated:', status);
    
    res.status(200).json({
      message: 'Leave request status updated successfully',
      leaveRequest: leaveRequest
    });
    
  } catch (error) {
    console.error('Error updating leave request status:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update leave request status' 
    });
  }
});

// GET /api/leave-requests/stats - Get leave request statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await LeaveRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statsObject = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0
    };

    stats.forEach(stat => {
      statsObject[stat._id.toLowerCase()] = stat.count;
      statsObject.total += stat.count;
    });

    res.status(200).json(statsObject);
  } catch (error) {
    console.error('Error fetching leave request stats:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch leave request statistics' 
    });
  }
});

module.exports = router;
