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
    console.log('=== EMPLOYEE LEAVE REQUESTS ROUTE CALLED ===');
    console.log('Employee ID requested:', req.params.employeeId);
    
    const leaveRequests = await LeaveRequest.find({ employeeId: req.params.employeeId })
      .sort({ submittedDate: -1 });
    
    console.log('Found leave requests:', leaveRequests.length);
    console.log('Leave requests data:', leaveRequests);
    
    res.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching employee leave requests:', error);
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

    // Validate leave balance before creating request
    const employee = await Employee.findOne({ employeeId });
    if (employee) {
      const leaveTypeKey = leaveType.toLowerCase().replace(' ', '');
      if (employee.leaveBalance[leaveTypeKey] && employee.leaveBalance[leaveTypeKey].remaining < days) {
        return res.status(400).json({ 
          message: 'Insufficient leave balance', 
          available: employee.leaveBalance[leaveTypeKey].remaining,
          requested: days
        });
      }
    }

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
    console.log('Leave request saved to MongoDB:', savedRequest);
    
    res.status(201).json(savedRequest);
  } catch (error) {
    console.error('Error creating leave request:', error);
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
    console.log('Admin leave request saved to MongoDB:', savedRequest);

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
          console.log('Employee leave balance updated in MongoDB for:', employee.name);
        }
      }
    }

    res.status(201).json(savedRequest);
  } catch (error) {
    console.error('Error creating admin leave request:', error);
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
    console.log('=== UPDATE LEAVE REQUEST STATUS ===');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    
    const { status, adminNotes } = req.body;
    
    if (!status || !['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Pending, Approved, or Rejected' });
    }

    // Find the leave request first to get the previous status
    const existingLeaveRequest = await LeaveRequest.findById(req.params.id);
    if (!existingLeaveRequest) {
      console.log('❌ Leave request not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Leave request not found' });
    }

    const previousStatus = existingLeaveRequest.status;
    console.log('Previous status:', previousStatus, 'New status:', status);
    
    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes },
      { new: true }
    );
    
    if (!leaveRequest) {
      console.log('❌ Leave request not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Leave request not found' });
    }

    console.log('✅ Leave request status updated in MongoDB:', {
      id: leaveRequest._id,
      employeeId: leaveRequest.employeeId,
      status: status,
      previousStatus: leaveRequest.status
    });

    // Update employee's leave balance if status changed to approved
    if (status === 'Approved') {
      const employee = await Employee.findOne({ employeeId: leaveRequest.employeeId });
      if (employee) {
        const leaveTypeKey = leaveRequest.leaveType.toLowerCase().replace(' ', '');
        if (employee.leaveBalance[leaveTypeKey]) {
          // Check if this request was previously approved to avoid double counting
          if (previousStatus !== 'Approved') {
            const daysToDeduct = leaveRequest.totalDays || leaveRequest.days || 0;
            employee.leaveBalance[leaveTypeKey].used += daysToDeduct;
            employee.leaveBalance[leaveTypeKey].remaining = 
              employee.leaveBalance[leaveTypeKey].total - employee.leaveBalance[leaveTypeKey].used;
            await employee.save();
            console.log('✅ Employee leave balance updated in MongoDB for:', employee.name, {
              leaveType: leaveRequest.leaveType,
              daysUsed: daysToDeduct,
              newBalance: employee.leaveBalance[leaveTypeKey]
            });
          } else {
            console.log('⚠️ Leave request was already approved, skipping balance update');
          }
        }
      }
    }

    // If status changed from approved to rejected/pending, restore leave balance
    if (previousStatus === 'Approved' && status !== 'Approved') {
      const employee = await Employee.findOne({ employeeId: leaveRequest.employeeId });
      if (employee) {
        const leaveTypeKey = leaveRequest.leaveType.toLowerCase().replace(' ', '');
        if (employee.leaveBalance[leaveTypeKey]) {
          const daysToRestore = leaveRequest.totalDays || leaveRequest.days || 0;
          employee.leaveBalance[leaveTypeKey].used -= daysToRestore;
          employee.leaveBalance[leaveTypeKey].remaining = 
            employee.leaveBalance[leaveTypeKey].total - employee.leaveBalance[leaveTypeKey].used;
          await employee.save();
          console.log('✅ Employee leave balance restored in MongoDB for:', employee.name, {
            leaveType: leaveRequest.leaveType,
            daysRestored: daysToRestore,
            newBalance: employee.leaveBalance[leaveTypeKey]
          });
        }
      }
    }
    
    console.log('✅ Sending response with updated leave request:', {
      id: leaveRequest._id,
      status: leaveRequest.status,
      employeeName: leaveRequest.employeeName
    });
    
    res.json(leaveRequest);
  } catch (error) {
    console.error('❌ Error updating leave request status:', error);
    console.error('Error stack:', error.stack);
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

// Test route for PATCH method
router.patch('/test', (req, res) => {
  console.log('=== PATCH TEST ROUTE CALLED ===');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  res.json({ message: 'PATCH method is working', receivedData: req.body });
});

module.exports = router; 