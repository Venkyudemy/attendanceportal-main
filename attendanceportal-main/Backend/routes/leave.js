const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');

// Get all leave requests (admin)
router.get('/admin', async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find().sort({ submittedDate: -1 });
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave requests', error: error.message });
  }
});

// Get leave requests for specific employee
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({ employeeId: req.params.employeeId })
      .sort({ submittedDate: -1 });
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee leave requests', error: error.message });
  }
});

// Create new leave request (employee)
router.post('/', async (req, res) => {
  try {
    const { employeeId, employeeName, leaveType, startDate, endDate, reason } = req.body;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const leaveRequest = new LeaveRequest({
      employeeId,
      employeeName,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      days
    });

    const savedRequest = await leaveRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(400).json({ message: 'Error creating leave request', error: error.message });
  }
});

// Admin creates leave request for employee
router.post('/admin/create', async (req, res) => {
  try {
    const { employeeId, employeeName, leaveType, startDate, endDate, reason, status = 'Approved' } = req.body;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Create leave request
    const leaveRequest = new LeaveRequest({
      employeeId,
      employeeName,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      days,
      status,
      adminNotes: 'Created by admin'
    });

    const savedRequest = await leaveRequest.save();

    // Update employee's leave balance if approved
    if (status === 'Approved') {
      const employee = await Employee.findOne({ employeeId });
      if (employee) {
        const leaveTypeKey = leaveType.toLowerCase().replace(' ', '');
        if (employee.leaveBalance[leaveTypeKey]) {
          employee.leaveBalance[leaveTypeKey].used += days;
          employee.leaveBalance[leaveTypeKey].remaining = 
            employee.leaveBalance[leaveTypeKey].total - employee.leaveBalance[leaveTypeKey].used;
          await employee.save();
        }
      }
    }

    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(400).json({ message: 'Error creating leave request', error: error.message });
  }
});

// Get all employees for leave management
router.get('/admin/employees', async (req, res) => {
  try {
    const employees = await Employee.find({}).select('name employeeId email department position leaveBalance');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees', error: error.message });
  }
});

// Get employee leave balance
router.get('/admin/employee/:employeeId/balance', async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.params.employeeId }).select('leaveBalance name');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({
      name: employee.name,
      leaveBalance: employee.leaveBalance
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave balance', error: error.message });
  }
});

// Update employee leave balance (admin)
router.patch('/admin/employee/:employeeId/balance', async (req, res) => {
  try {
    const { leaveType, total, used } = req.body;
    const employee = await Employee.findOne({ employeeId: req.params.employeeId });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const leaveTypeKey = leaveType.toLowerCase().replace(' ', '');
    if (employee.leaveBalance[leaveTypeKey]) {
      employee.leaveBalance[leaveTypeKey].total = total;
      employee.leaveBalance[leaveTypeKey].used = used;
      employee.leaveBalance[leaveTypeKey].remaining = total - used;
      await employee.save();
    }

    res.json(employee.leaveBalance);
  } catch (error) {
    res.status(400).json({ message: 'Error updating leave balance', error: error.message });
  }
});

// Get leave statistics for admin dashboard
router.get('/admin/stats', async (req, res) => {
  try {
    const totalRequests = await LeaveRequest.countDocuments();
    const pendingRequests = await LeaveRequest.countDocuments({ status: 'Pending' });
    const approvedRequests = await LeaveRequest.countDocuments({ status: 'Approved' });
    const rejectedRequests = await LeaveRequest.countDocuments({ status: 'Rejected' });

    res.json({
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave statistics', error: error.message });
  }
});

// Update leave request status (admin)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes },
      { new: true }
    );
    
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Update employee's leave balance if status changed to approved
    if (status === 'Approved') {
      const employee = await Employee.findOne({ employeeId: leaveRequest.employeeId });
      if (employee) {
        const leaveTypeKey = leaveRequest.leaveType.toLowerCase().replace(' ', '');
        if (employee.leaveBalance[leaveTypeKey]) {
          employee.leaveBalance[leaveTypeKey].used += leaveRequest.days;
          employee.leaveBalance[leaveTypeKey].remaining = 
            employee.leaveBalance[leaveTypeKey].total - employee.leaveBalance[leaveTypeKey].used;
          await employee.save();
        }
      }
    }
    
    res.json(leaveRequest);
  } catch (error) {
    res.status(400).json({ message: 'Error updating leave request', error: error.message });
  }
});

// Delete leave request (admin)
router.delete('/:id', async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findByIdAndDelete(req.params.id);
    
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    res.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting leave request', error: error.message });
  }
});

module.exports = router; 