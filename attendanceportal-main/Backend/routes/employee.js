const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');

// GET /api/employee/stats - Employee statistics for admin dashboard
router.get('/stats', async (req, res) => {
  try {
    const employees = await Employee.find({});
    
    const presentToday = employees.filter(emp => emp.attendance.today.status === 'Present').length;
    const lateArrivals = employees.filter(emp => emp.attendance.today.isLate).length;
    const absentToday = employees.filter(emp => emp.attendance.today.status === 'Absent').length;
    const onLeave = employees.filter(emp => emp.attendance.today.status === 'On Leave').length;
    const totalEmployees = employees.length;
    const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

    const employeeStats = {
      totalEmployees,
      presentToday,
      lateArrivals,
      absentToday,
      attendanceRate,
      onLeave
    };

    res.status(200).json(employeeStats);
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch employee statistics' 
    });
  }
});

// GET /api/employee/attendance - Get all employees with attendance status
router.get('/attendance', async (req, res) => {
  try {
    const employees = await Employee.find({}).select('-password');
    
    const attendanceData = employees.map(emp => ({
      id: emp._id,
      name: emp.name,
      email: emp.email,
      department: emp.department,
      position: emp.position,
      status: emp.status,
      phone: emp.phone,
      employeeId: emp.employeeId,
      domain: emp.domain,
      joinDate: emp.joinDate,
      attendance: emp.attendance.today
    }));

    res.status(200).json(attendanceData);
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch attendance data' 
    });
  }
});

// GET /api/employee/find-by-email/:email - Find employee by email
router.get('/find-by-email/:email', async (req, res) => {
  try {
    const employee = await Employee.findOne({ email: req.params.email }).select('-password');
    
    if (!employee) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Employee not found' 
      });
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error('Error fetching employee by email:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch employee data' 
    });
  }
});

// GET /api/employee/admin/total - Get all employees for admin portal
router.get('/admin/total', async (req, res) => {
  try {
    const employees = await Employee.find({}).select('-password');
    
    const employeeList = employees.map(emp => ({
      id: emp._id,
      name: emp.name,
      email: emp.email,
      department: emp.department,
      position: emp.position,
      status: emp.status,
      phone: emp.phone,
      employeeId: emp.employeeId,
      domain: emp.domain,
      joinDate: emp.joinDate,
      attendance: emp.attendance.today
    }));

    res.status(200).json({
      count: employeeList.length,
      employees: employeeList
    });
  } catch (error) {
    console.error('Error fetching all employees:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch employees' 
    });
  }
});

// GET /api/employee/admin/present - Get present employees only
router.get('/admin/present', async (req, res) => {
  try {
    const employees = await Employee.find({
      'attendance.today.status': { $in: ['Present', 'Late'] }
    }).select('-password');
    
    const presentEmployees = employees.map(emp => ({
      id: emp._id,
      name: emp.name,
      email: emp.email,
      department: emp.department,
      position: emp.position,
      status: emp.status,
      phone: emp.phone,
      employeeId: emp.employeeId,
      domain: emp.domain,
      joinDate: emp.joinDate,
      attendance: emp.attendance.today
    }));

    res.status(200).json({
      count: presentEmployees.length,
      employees: presentEmployees
    });
  } catch (error) {
    console.error('Error fetching present employees:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch present employees' 
    });
  }
});

// GET /api/employee/admin/late - Get late arrival employees only
router.get('/admin/late', async (req, res) => {
  try {
    const employees = await Employee.find({
      'attendance.today.isLate': true
    }).select('-password');
    
    const lateEmployees = employees.map(emp => ({
      id: emp._id,
      name: emp.name,
      email: emp.email,
      department: emp.department,
      position: emp.position,
      status: emp.status,
      phone: emp.phone,
      employeeId: emp.employeeId,
      domain: emp.domain,
      joinDate: emp.joinDate,
      attendance: emp.attendance.today
    }));

    res.status(200).json({
      count: lateEmployees.length,
      employees: lateEmployees
    });
  } catch (error) {
    console.error('Error fetching late employees:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch late employees' 
    });
  }
});

// GET /api/employee/admin/absent - Get absent employees only
router.get('/admin/absent', async (req, res) => {
  try {
    const employees = await Employee.find({
      'attendance.today.status': 'Absent'
    }).select('-password');
    
    const absentEmployees = employees.map(emp => ({
      id: emp._id,
      name: emp.name,
      email: emp.email,
      department: emp.department,
      position: emp.position,
      status: emp.status,
      phone: emp.phone,
      employeeId: emp.employeeId,
      domain: emp.domain,
      joinDate: emp.joinDate,
      attendance: emp.attendance.today
    }));

    res.status(200).json({
      count: absentEmployees.length,
      employees: absentEmployees
    });
  } catch (error) {
    console.error('Error fetching absent employees:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch absent employees' 
    });
  }
});

// GET /api/employee/admin/leave - Get employees on leave only
router.get('/admin/leave', async (req, res) => {
  try {
    const employees = await Employee.find({
      'attendance.today.status': 'On Leave'
    }).select('-password');
    
    const leaveEmployees = employees.map(emp => ({
      id: emp._id,
      name: emp.name,
      email: emp.email,
      department: emp.department,
      position: emp.position,
      status: emp.status,
      phone: emp.phone,
      employeeId: emp.employeeId,
      domain: emp.domain,
      joinDate: emp.joinDate,
      attendance: emp.attendance.today
    }));

    res.status(200).json({
      count: leaveEmployees.length,
      employees: leaveEmployees
    });
  } catch (error) {
    console.error('Error fetching employees on leave:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch employees on leave' 
    });
  }
});

// GET /api/employee/admin/high-attendance - Get employees with above 90% attendance rate
router.get('/admin/high-attendance', async (req, res) => {
  try {
    const employees = await Employee.find({}).select('-password');
    
    // Calculate attendance rate for each employee based on their records
    const employeesWithAttendance = employees.map(emp => {
      const totalDays = emp.attendance.records.length;
      const presentDays = emp.attendance.records.filter(record => 
        record.status === 'Present' || record.status === 'Late'
      ).length;
      
      const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
      
      return {
        id: emp._id,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        position: emp.position,
        status: emp.status,
        phone: emp.phone,
        employeeId: emp.employeeId,
        domain: emp.domain,
        joinDate: emp.joinDate,
        attendance: emp.attendance.today,
        attendanceRate: attendanceRate
      };
    });
    
    // Filter employees with above 90% attendance rate
    const highAttendanceEmployees = employeesWithAttendance.filter(emp => emp.attendanceRate >= 90);
    
    res.status(200).json({
      count: highAttendanceEmployees.length,
      employees: highAttendanceEmployees
    });
  } catch (error) {
    console.error('Error fetching employees with high attendance:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch employees with high attendance' 
    });
  }
});

// GET /api/employee/:id - Get specific employee details
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    
    if (!employee) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Employee not found' 
      });
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch employee data' 
    });
  }
});

// GET /api/employee/:id/portal-data - Get employee portal data
router.get('/:id/portal-data', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    
    if (!employee) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Employee not found' 
      });
    }

    // Calculate weekly and monthly summaries
    const today = new Date();
    const currentWeek = getWeekStart(today);
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    // Get recent attendance records (last 30 days)
    const recentRecords = employee.attendance.records
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 30);

    // Get weekly summary
    const weeklySummary = employee.attendance.weeklySummaries
      .find(summary => summary.weekStart === currentWeek) || {
        present: 0,
        absent: 0,
        late: 0,
        totalHours: 0
      };

    // Get monthly summary
    const monthlySummary = employee.attendance.monthlySummaries
      .find(summary => summary.month === currentMonth) || {
        present: 0,
        absent: 0,
        late: 0,
        totalHours: 0
      };

    const portalData = {
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        employeeId: employee.employeeId,
        domain: employee.domain
      },
      attendance: {
        today: employee.attendance.today,
        thisWeek: weeklySummary,
        thisMonth: monthlySummary,
        recentRecords: recentRecords
      },
      leaveBalance: employee.leaveBalance
    };

    res.status(200).json(portalData);
  } catch (error) {
    console.error('Error fetching employee portal data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch employee portal data' 
    });
  }
});

// POST /api/employee/:id/check-in - Employee check-in
router.post('/:id/check-in', async (req, res) => {
  try {
    console.log('Check-in request for employee ID:', req.params.id);
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      console.log('Employee not found for ID:', req.params.id);
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Employee not found' 
      });
    }
    
    console.log('Employee found:', employee.name);

    const now = new Date();
    const checkInTime = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);
    const status = isLate ? 'Late' : 'Present';

    // Update today's attendance
    employee.attendance.today = {
      checkIn: checkInTime,
      checkOut: null,
      status: status,
      isLate: isLate
    };

    // Add to attendance records
    const today = now.toISOString().split('T')[0];
    const existingRecordIndex = employee.attendance.records.findIndex(record => record.date === today);
    
    if (existingRecordIndex >= 0) {
      employee.attendance.records[existingRecordIndex].checkIn = checkInTime;
      employee.attendance.records[existingRecordIndex].status = status;
      employee.attendance.records[existingRecordIndex].isLate = isLate;
    } else {
      employee.attendance.records.push({
        date: today,
        checkIn: checkInTime,
        checkOut: null,
        status: status,
        hours: 0,
        isLate: isLate
      });
    }

    await employee.save();

    res.status(200).json({
      message: 'Check-in successful',
      checkInTime: checkInTime,
      status: status,
      isLate: isLate
    });
  } catch (error) {
    console.error('Error during check-in:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process check-in' 
    });
  }
});

// POST /api/employee/:id/check-out - Employee check-out
router.post('/:id/check-out', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Employee not found' 
      });
    }

    const now = new Date();
    const checkOutTime = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    // Calculate hours worked
    let hoursWorked = 0;
    if (employee.attendance.today.checkIn) {
      const checkInTime = new Date(`2000-01-01 ${employee.attendance.today.checkIn}`);
      const checkOutTimeObj = new Date(`2000-01-01 ${checkOutTime}`);
      hoursWorked = (checkOutTimeObj - checkInTime) / (1000 * 60 * 60);
    }

    // Update today's attendance
    employee.attendance.today.checkOut = checkOutTime;
    employee.attendance.today.hours = hoursWorked;

    // Update attendance record
    const today = now.toISOString().split('T')[0];
    const existingRecordIndex = employee.attendance.records.findIndex(record => record.date === today);
    
    if (existingRecordIndex >= 0) {
      employee.attendance.records[existingRecordIndex].checkOut = checkOutTime;
      employee.attendance.records[existingRecordIndex].hours = hoursWorked;
    } else {
      employee.attendance.records.push({
        date: today,
        checkIn: employee.attendance.today.checkIn,
        checkOut: checkOutTime,
        status: employee.attendance.today.status,
        hours: hoursWorked,
        isLate: employee.attendance.today.isLate
      });
    }

    await employee.save();

    res.status(200).json({
      message: 'Check-out successful',
      checkOutTime: checkOutTime,
      hoursWorked: hoursWorked
    });
  } catch (error) {
    console.error('Error during check-out:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process check-out' 
    });
  }
});

// GET /api/employee/:id/leave-balance - Get employee leave balance
router.get('/:id/leave-balance', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('leaveBalance');
    
    if (!employee) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Employee not found' 
      });
    }

    res.status(200).json(employee.leaveBalance);
  } catch (error) {
    console.error('Error fetching leave balance:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch leave balance' 
    });
  }
});

// POST /api/employee/:id/leave-balance - Update employee leave balance
router.post('/:id/leave-balance', async (req, res) => {
  try {
    const { leaveType, daysUsed } = req.body;
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Employee not found' 
      });
    }

    if (employee.leaveBalance[leaveType]) {
      employee.leaveBalance[leaveType].used += daysUsed;
      employee.leaveBalance[leaveType].remaining = 
        employee.leaveBalance[leaveType].total - employee.leaveBalance[leaveType].used;
    }

    await employee.save();

    res.status(200).json({
      message: 'Leave balance updated successfully',
      leaveBalance: employee.leaveBalance
    });
  } catch (error) {
    console.error('Error updating leave balance:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update leave balance' 
    });
  }
});

// Helper function to get week start date
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(d.setDate(diff));
  return weekStart.toISOString().split('T')[0];
}

// POST /api/employee - Add new employee
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/employee - Request body:', req.body);
    const { name, email, department, position, phone, joinDate, password, employeeId, domain } = req.body;
    
    // Validate required fields
    if (!name || !email || !department || !position || !phone || !password) {
      console.log('Missing required fields:', { name, email, department, position, phone, joinDate, password: password ? 'provided' : 'missing' });
      return res.status(400).json({
        error: 'Bad request',
        message: 'Name, email, department, position, phone, and password are required'
      });
    }

    // Check if email already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Employee with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new employee
    const newEmployee = new Employee({
      name,
      email,
      department,
      position,
      status: 'Active',
      joinDate,
      phone,
      password: hashedPassword,
      employeeId: employeeId || `EMP${Date.now()}`, // Use provided or generate unique employee ID
      domain: domain || '',
      address: '',
      salary: '',
      manager: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
        address: ''
      },
      attendance: {
        today: {
          checkIn: null,
          checkOut: null,
          status: 'Absent',
          isLate: false
        },
        records: [],
        weeklySummaries: [],
        monthlySummaries: []
      },
      leaveBalance: {
        annual: { total: 20, used: 0, remaining: 20 },
        sick: { total: 10, used: 0, remaining: 10 },
        personal: { total: 5, used: 0, remaining: 5 }
      }
    });

    await newEmployee.save();
    console.log('Employee added successfully:', newEmployee._id);

    res.status(201).json({
      message: 'Employee added successfully',
      employee: {
        id: newEmployee._id,
        name: newEmployee.name,
        email: newEmployee.email,
        department: newEmployee.department,
        position: newEmployee.position,
        status: newEmployee.status,
        phone: newEmployee.phone,
        employeeId: newEmployee.employeeId,
        domain: newEmployee.domain,
        joinDate: newEmployee.joinDate,
        address: newEmployee.address,
        salary: newEmployee.salary,
        manager: newEmployee.manager,
        emergencyContact: newEmployee.emergencyContact,
        attendance: newEmployee.attendance,
        leaveBalance: newEmployee.leaveBalance
      }
    });
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to add employee' 
    });
  }
});

// PUT /api/employee/:id - Update existing employee
router.put('/:id', async (req, res) => {
  try {
    const { name, email, department, position, phone, joinDate, password, address, salary, manager, emergencyContact, employeeId, domain } = req.body;
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Employee not found' 
      });
    }

    // Update employee data
    employee.name = name || employee.name;
    employee.email = email || employee.email;
    employee.department = department || employee.department;
    employee.position = position || employee.position;
    employee.phone = phone || employee.phone;
    // Update joinDate if provided
    if (joinDate && joinDate.trim() !== '') {
      employee.joinDate = joinDate;
    }
    employee.employeeId = employeeId || employee.employeeId;
    employee.domain = domain || employee.domain;
    employee.address = address || employee.address;
    employee.salary = salary || employee.salary;
    employee.manager = manager || employee.manager;
    employee.emergencyContact = emergencyContact || employee.emergencyContact;
    
    // Hash password if provided
    if (password) {
      const saltRounds = 10;
      employee.password = await bcrypt.hash(password, saltRounds);
    }

    await employee.save();

    res.status(200).json({
      message: 'Employee updated successfully',
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        status: employee.status,
        phone: employee.phone,
        employeeId: employee.employeeId,
        domain: employee.domain,
        joinDate: employee.joinDate,
        address: employee.address,
        salary: employee.salary,
        manager: employee.manager,
        emergencyContact: employee.emergencyContact,
        attendance: employee.attendance,
        leaveBalance: employee.leaveBalance
      }
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update employee' 
    });
  }
});

// PUT /api/employee/:id/attendance - Update employee attendance
router.put('/:id/attendance', async (req, res) => {
  try {
    const { checkIn, checkOut, status } = req.body;
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Employee not found' 
      });
    }

    // Update attendance
    employee.attendance.today = {
      checkIn: checkIn || employee.attendance.today.checkIn,
      checkOut: checkOut || employee.attendance.today.checkOut,
      status: status || employee.attendance.today.status,
      isLate: checkIn && new Date(`2000-01-01 ${checkIn}`) > new Date('2000-01-01 09:30:00')
    };

    await employee.save();

    res.status(200).json({
      message: 'Attendance updated successfully',
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        status: employee.status,
        phone: employee.phone,
        attendance: employee.attendance
      }
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update attendance' 
    });
  }
});

// GET /api/employee/:id - Get individual employee details
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    
    if (!employee) {
      return res.status(404).json({ 
        error: 'Employee not found',
        message: 'Employee with the specified ID does not exist' 
      });
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error('Error fetching employee details:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch employee details' 
    });
  }
});

module.exports = router; 