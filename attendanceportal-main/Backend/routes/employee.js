const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Settings = require('../models/Settings');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Helper function to check database connection
const checkDatabaseConnection = () => {
  const connectionState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  console.log(`📊 Database connection state: ${states[connectionState]} (${connectionState})`);
  return connectionState === 1; // 1 = connected
};

// Helper function to check if today is a holiday
const isTodayHoliday = async () => {
  try {
    const settings = await Settings.findOne();
    if (!settings || !settings.companyHolidays) {
      return null;
    }
    
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD format
    const holiday = settings.companyHolidays.find(h => h.date === today);
    
    return holiday || null;
  } catch (error) {
    console.error('Error checking holiday status:', error);
    return null;
  }
};

// GET /api/employee - Get all employees (root route)
router.get('/', async (req, res) => {
  try {
    if (!checkDatabaseConnection()) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Database connection not available'
      });
    }

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

    res.status(200).json(employeeList);
  } catch (error) {
    console.error('Error fetching all employees:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch employees' 
    });
  }
});

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
      attendance: {
        status: emp.attendance?.today?.status || 'Absent',
        checkIn: emp.attendance?.today?.checkIn || null,
        checkOut: emp.attendance?.today?.checkOut || null
      }
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
    // Check database connection
    if (!checkDatabaseConnection()) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Database connection not available'
      });
    }
    
    const employee = await Employee.findOne({ email: req.params.email }).select('-password');
    
    if (!employee) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Employee not found' 
      });
    }

    console.log(`✅ Employee found by email: ${employee.name} (ID: ${employee._id})`);
    res.status(200).json(employee);
  } catch (error) {
    console.error('Error fetching employee by email:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch employee data' 
    });
  }
});

// GET /api/employee/database-status - Check database health and employee count
router.get('/database-status', async (req, res) => {
  try {
    const connectionState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    const employeeCount = await Employee.countDocuments();
    const recentEmployees = await Employee.find({}).select('name email attendance.today').limit(5);
    
    res.status(200).json({
      databaseStatus: states[connectionState],
      connectionState: connectionState,
      totalEmployees: employeeCount,
      recentEmployees: recentEmployees.map(emp => ({
        name: emp.name,
        email: emp.email,
        todayCheckIn: emp.attendance.today.checkIn,
        todayCheckOut: emp.attendance.today.checkOut,
        todayStatus: emp.attendance.today.status
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking database status:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to check database status'
    });
  }
});

// GET /api/employee/admin/total - Get all employees for admin portal
router.get('/admin/total', async (req, res) => {
  try {
    console.log('Admin total endpoint called - fetching all employees...');
    
    const employees = await Employee.find({}).select('-password');
    console.log(`Found ${employees.length} employees in database`);
    
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
      address: emp.address,
      salary: emp.salary,
      manager: emp.manager,
      emergencyContact: emp.emergencyContact,
      attendance: emp.attendance,
      leaveBalance: emp.leaveBalance
    }));

    console.log(`Admin dashboard data retrieved from MongoDB: ${employeeList.length} employees`);
    console.log('Sample employee data:', employeeList[0] || 'No employees found');

    res.status(200).json({ employees: employeeList });
  } catch (error) {
    console.error('Error fetching admin employee data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch employee data' 
    });
  }
});

// GET /api/employee/admin/comprehensive - Get comprehensive employee data for admin portal
router.get('/admin/comprehensive', async (req, res) => {
  try {
    const employees = await Employee.find({}).select('-password');
    
    const comprehensiveData = employees.map(emp => {
      // Calculate attendance statistics
      const totalRecords = emp.attendance.records.length;
      const presentDays = emp.attendance.records.filter(record => record.status === 'Present').length;
      const lateDays = emp.attendance.records.filter(record => record.status === 'Late').length;
      const absentDays = emp.attendance.records.filter(record => record.status === 'Absent').length;
      const totalHours = emp.attendance.records.reduce((sum, record) => sum + (record.hours || 0), 0);
      
      // Calculate leave statistics
      const totalLeaveBalance = emp.leaveBalance.annual.total + emp.leaveBalance.sick.total + emp.leaveBalance.personal.total;
      const totalLeaveUsed = emp.leaveBalance.annual.used + emp.leaveBalance.sick.used + emp.leaveBalance.personal.used;
      const totalLeaveRemaining = emp.leaveBalance.annual.remaining + emp.leaveBalance.sick.remaining + emp.leaveBalance.personal.remaining;
      
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
        address: emp.address,
        salary: emp.salary,
        manager: emp.manager,
        emergencyContact: emp.emergencyContact,
        attendance: {
          today: emp.attendance.today,
          statistics: {
            totalRecords,
            presentDays,
            lateDays,
            absentDays,
            totalHours: Math.round(totalHours * 100) / 100
          },
          records: emp.attendance.records.slice(-30), // Last 30 days
          weeklySummaries: emp.attendance.weeklySummaries.slice(-4), // Last 4 weeks
          monthlySummaries: emp.attendance.monthlySummaries.slice(-3) // Last 3 months
        },
        leaveBalance: {
          ...emp.leaveBalance,
          summary: {
            total: totalLeaveBalance,
            used: totalLeaveUsed,
            remaining: totalLeaveRemaining
          }
        }
      };
    });

    console.log(`Comprehensive admin data retrieved from MongoDB: ${comprehensiveData.length} employees with detailed statistics`);

    res.status(200).json({ employees: comprehensiveData });
  } catch (error) {
    console.error('Error fetching comprehensive employee data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch comprehensive employee data' 
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

// GET /api/employee/details/:employeeId - Get individual employee details by ID
router.get('/details/:employeeId', async (req, res) => {
  try {
    console.log('=== EMPLOYEE DETAILS ROUTE CALLED ===');
    console.log('Request params:', req.params);
    console.log('Employee ID requested:', req.params.employeeId);
    console.log('Request URL:', req.originalUrl);
    
    const employee = await Employee.findById(req.params.employeeId).select('-password');
    
    if (!employee) {
      console.log('❌ Employee not found for ID:', req.params.employeeId);
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Employee not found' 
      });
    }

    console.log('✅ Employee found:', employee.name);
    console.log('Employee ID:', employee._id);
    console.log('Raw attendance data:', employee.attendance);
    console.log('Raw leave balance data:', employee.leaveBalance);

    // Get the latest leave balance data
    let latestLeaveBalance = employee.leaveBalance;
    try {
      const LeaveRequest = require('../models/LeaveRequest');
      const Settings = require('../models/Settings');
      
      // Get configured leave types from settings
      const settings = await Settings.getSettings();
      const configuredLeaveTypes = settings.leaveTypes || [];
      
      console.log('📋 Configured leave types for details:', configuredLeaveTypes);
      
      const approvedRequests = await LeaveRequest.find({
        employeeId: employee.employeeId || employee._id.toString(),
        status: 'Approved'
      });
      
      console.log('📊 Found approved leave requests for details:', approvedRequests.length);
      
      // Create leave balance structure based on configured types
      const recalculatedBalance = {};
      
      // Initialize balance for each configured leave type
      configuredLeaveTypes.forEach(leaveType => {
        const typeKey = leaveType.name.toLowerCase().replace(/\s+/g, '');
        recalculatedBalance[typeKey] = {
          total: leaveType.days || 0,
          used: 0,
          remaining: leaveType.days || 0
        };
      });
      
      // If no configured types, use defaults
      if (configuredLeaveTypes.length === 0) {
        recalculatedBalance.annual = { total: 20, used: 0, remaining: 20 };
        recalculatedBalance.sick = { total: 10, used: 0, remaining: 10 };
        recalculatedBalance.personal = { total: 5, used: 0, remaining: 5 };
        console.log('⚠️ No configured leave types found for details, using defaults');
      }
      
      console.log('🔄 Initial leave balance structure for details:', recalculatedBalance);
      
      // Calculate used days from approved requests
      approvedRequests.forEach(request => {
        const leaveType = request.leaveType.toLowerCase().trim();
        const daysUsed = request.totalDays || request.days || 0;
        
        console.log(`📋 Processing leave request for details:`, {
          leaveType: request.leaveType,
          normalizedType: leaveType,
          daysUsed: daysUsed,
          requestId: request._id
        });
        
        // Find matching configured leave type
        let matchedTypeKey = null;
        for (const [key, balance] of Object.entries(recalculatedBalance)) {
          if (leaveType.includes(key) || key.includes(leaveType)) {
            matchedTypeKey = key;
            break;
          }
        }
        
        if (matchedTypeKey && recalculatedBalance[matchedTypeKey]) {
          recalculatedBalance[matchedTypeKey].used += daysUsed;
          recalculatedBalance[matchedTypeKey].remaining = 
            recalculatedBalance[matchedTypeKey].total - recalculatedBalance[matchedTypeKey].used;
          console.log(`✅ Updated ${matchedTypeKey} leave for details: used=${recalculatedBalance[matchedTypeKey].used}, remaining=${recalculatedBalance[matchedTypeKey].remaining}`);
        } else {
          console.log(`⚠️ No matching leave type found for details: "${leaveType}"`);
        }
      });
      
      latestLeaveBalance = recalculatedBalance;
      console.log('🔄 Using recalculated leave balance for details:', latestLeaveBalance);
    } catch (recalcError) {
      console.error('⚠️ Error recalculating leave balance for details, using stored data:', recalcError);
    }

    // Format the attendance data properly
    const formattedEmployee = {
      ...employee.toObject(),
      attendance: {
        today: {
          status: employee.attendance?.today?.status || 'Unknown',
          checkIn: employee.attendance?.today?.checkIn || null,
          checkOut: employee.attendance?.today?.checkOut || null,
          isLate: employee.attendance?.today?.isLate || false
        }
      },
      leaveBalance: {
        annual: {
          total: latestLeaveBalance?.annual?.total || 20,
          used: latestLeaveBalance?.annual?.used || 0,
          remaining: latestLeaveBalance?.annual?.remaining || 20
        },
        sick: {
          total: latestLeaveBalance?.sick?.total || 10,
          used: latestLeaveBalance?.sick?.used || 0,
          remaining: latestLeaveBalance?.sick?.remaining || 10
        },
        personal: {
          total: latestLeaveBalance?.personal?.total || 5,
          used: latestLeaveBalance?.personal?.used || 0,
          remaining: latestLeaveBalance?.personal?.remaining || 5
        }
      }
    };

    console.log('Formatted attendance data:', formattedEmployee.attendance);
    console.log('=== SENDING RESPONSE ===');
    console.log('Response status: 200');
    console.log('Response data keys:', Object.keys(formattedEmployee));

    res.status(200).json(formattedEmployee);
  } catch (error) {
    console.error('❌ Error fetching employee details:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch employee details' 
    });
  }
});

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

    const savedEmployee = await newEmployee.save();
    console.log('Saved to MongoDB:', savedEmployee);

    res.status(201).json({
      message: 'Employee added successfully',
      employee: {
        id: savedEmployee._id,
        name: savedEmployee.name,
        email: savedEmployee.email,
        department: savedEmployee.department,
        position: savedEmployee.position,
        status: savedEmployee.status,
        phone: savedEmployee.phone,
        employeeId: savedEmployee.employeeId,
        domain: savedEmployee.domain,
        joinDate: savedEmployee.joinDate,
        address: savedEmployee.address,
        salary: savedEmployee.salary,
        manager: savedEmployee.manager,
        emergencyContact: savedEmployee.emergencyContact,
        attendance: savedEmployee.attendance,
        leaveBalance: savedEmployee.leaveBalance
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

    // Get admin-configured leave types from Settings
    const settings = await Settings.getSettings();
    const configuredLeaveTypes = settings.leaveTypes || [];
    
    console.log('📋 Admin configured leave types:', configuredLeaveTypes);

    // Calculate weekly and monthly summaries
    const today = new Date();
    const currentWeek = getWeekStart(today);
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    // Get recent attendance records (last 30 days)
    const recentRecords = employee.attendance.records
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 30);

    // Helper function to calculate weekly summary from records
    const calculateWeeklySummary = (weekStart) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekRecords = employee.attendance.records.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= new Date(weekStart) && recordDate <= weekEnd;
      });

      let present = 0, absent = 0, late = 0, totalHours = 0;
      
      weekRecords.forEach(record => {
        if (record.status === 'Present') present++;
        else if (record.status === 'Late') late++;
        else if (record.status === 'Absent') absent++;
        totalHours += record.hours || 0;
      });

      return { present, absent, late, totalHours };
    };

    // Helper function to calculate monthly summary from records
    const calculateMonthlySummary = (monthKey) => {
      const [year, month] = monthKey.split('-');
      const monthStart = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthEnd = new Date(parseInt(year), parseInt(month), 0);
      
      const monthRecords = employee.attendance.records.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= monthStart && recordDate <= monthEnd;
      });

      let present = 0, absent = 0, late = 0, totalHours = 0;
      
      monthRecords.forEach(record => {
        if (record.status === 'Present') present++;
        else if (record.status === 'Late') late++;
        else if (record.status === 'Absent') absent++;
        totalHours += record.hours || 0;
      });

      return { present, absent, late, totalHours };
    };

    // Get weekly summary - calculate if not exists
    let weeklySummary = employee.attendance.weeklySummaries
      .find(summary => summary.weekStart === currentWeek);
    
    if (!weeklySummary) {
      weeklySummary = calculateWeeklySummary(currentWeek);
      // Add to weekly summaries array
      employee.attendance.weeklySummaries.push(weeklySummary);
    } else {
      // Update existing summary with recalculated data
      const recalculated = calculateWeeklySummary(currentWeek);
      weeklySummary.present = recalculated.present;
      weeklySummary.absent = recalculated.absent;
      weeklySummary.late = recalculated.late;
      weeklySummary.totalHours = recalculated.totalHours;
    }

    // Get monthly summary - calculate if not exists
    let monthlySummary = employee.attendance.monthlySummaries
      .find(summary => summary.month === currentMonth);
    
    if (!monthlySummary) {
      monthlySummary = calculateMonthlySummary(currentMonth);
      // Add to monthly summaries array
      employee.attendance.monthlySummaries.push(monthlySummary);
    } else {
      // Update existing summary with recalculated data
      const recalculated = calculateMonthlySummary(currentMonth);
      monthlySummary.present = recalculated.present;
      monthlySummary.absent = recalculated.absent;
      monthlySummary.late = recalculated.late;
      monthlySummary.totalHours = recalculated.totalHours;
    }

    // Save the updated summaries to database
    await employee.save();

    // Dynamically calculate leave balance based on admin-configured leave types
    let dynamicLeaveBalance = {};
    
    if (configuredLeaveTypes.length > 0) {
      // Use admin-configured leave types
      configuredLeaveTypes.forEach(leaveType => {
        const typeKey = leaveType.name.toLowerCase().replace(/\s+/g, '');
        const totalDays = leaveType.days || 0;
        
        // Get used days from existing employee leave balance if available
        const existingBalance = employee.leaveBalance[typeKey];
        const usedDays = existingBalance ? existingBalance.used || 0 : 0;
        
        dynamicLeaveBalance[typeKey] = {
          total: totalDays,
          used: usedDays,
          remaining: Math.max(0, totalDays - usedDays)
        };
      });
      
      console.log('✅ Dynamic leave balance calculated:', dynamicLeaveBalance);
    } else {
      // Fallback to existing employee leave balance if no admin configuration
      dynamicLeaveBalance = employee.leaveBalance;
      console.log('⚠️ No admin leave types configured, using existing balance');
    }

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
      leaveBalance: dynamicLeaveBalance
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

// POST /api/employee/manual-daily-reset - Manual daily reset for testing
router.post('/manual-daily-reset', async (req, res) => {
  try {
    console.log('🔄 Manual daily reset requested...');
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
    
    // Get all employees
    const employees = await Employee.find({});
    let resetCount = 0;
    let errorCount = 0;
    
    console.log(`📊 Processing ${employees.length} employees...`);
    
    for (const employee of employees) {
      try {
        // Reset today's attendance status
        employee.attendance.today = {
          checkIn: null,
          checkOut: null,
          status: 'Absent',
          isLate: false
        };
        
        // Save the updated employee
        await employee.save();
        resetCount++;
        
        console.log(`✅ Manual reset for employee: ${employee.name}`);
      } catch (empError) {
        console.error(`❌ Failed to reset employee ${employee.name}:`, empError.message);
        errorCount++;
      }
    }
    
    console.log(`🎉 Manual daily reset completed! ${resetCount} employees reset, ${errorCount} errors`);
    
    res.status(200).json({
      message: 'Manual daily reset completed successfully',
      employeesReset: resetCount,
      errors: errorCount,
      totalEmployees: employees.length,
      resetTime: new Date().toISOString(),
      date: today
    });
    
  } catch (error) {
    console.error('❌ Error during manual daily reset:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to perform manual daily reset' 
    });
  }
});

// POST /api/employee/force-reset - Force reset all attendance (emergency use)
router.post('/force-reset', async (req, res) => {
  try {
    console.log('🚨 FORCE RESET REQUESTED...');
    const today = new Date().toLocaleDateString('en-CA');
    
    // Get all employees
    const employees = await Employee.find({});
    let resetCount = 0;
    let errorCount = 0;
    
    console.log(`📊 Force reset processing ${employees.length} employees...`);
    
    for (const employee of employees) {
      try {
        // Reset today's attendance status
        employee.attendance.today = {
          checkIn: null,
          checkOut: null,
          status: 'Absent',
          isLate: false
        };
        
        // Also clear any existing records for today
        const todayRecords = employee.attendance.records.filter(record => record.date !== today);
        employee.attendance.records = todayRecords;
        
        // Save the updated employee
        await employee.save();
        resetCount++;
        
        console.log(`✅ Force reset for employee: ${employee.name}`);
      } catch (empError) {
        console.error(`❌ Failed to force reset employee ${employee.name}:`, empError.message);
        errorCount++;
      }
    }
    
    console.log(`🎉 FORCE RESET COMPLETED! ${resetCount} employees reset, ${errorCount} errors`);
    
    res.status(200).json({
      message: 'Force reset completed successfully',
      employeesReset: resetCount,
      errors: errorCount,
      totalEmployees: employees.length,
      resetTime: new Date().toISOString(),
      date: today,
      type: 'force'
    });
    
  } catch (error) {
    console.error('❌ Error during force reset:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to perform force reset' 
    });
  }
});

// GET /api/employee/reset-status - Check reset status
router.get('/reset-status', async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-CA');
    const employees = await Employee.find({});
    
    // Count employees with different statuses
    const checkedIn = employees.filter(emp => emp.attendance.today.checkIn).length;
    const checkedOut = employees.filter(emp => emp.attendance.today.checkOut).length;
    const absent = employees.filter(emp => !emp.attendance.today.checkIn && !emp.attendance.today.checkOut).length;
    
    res.status(200).json({
      date: today,
      totalEmployees: employees.length,
      checkedIn: checkedIn,
      checkedOut: checkedOut,
      absent: absent,
      lastReset: process.env.LAST_RESET_DATE || 'unknown',
      nextReset: '12:00 AM tomorrow'
    });
    
  } catch (error) {
    console.error('Error getting reset status:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to get reset status' 
    });
  }
});

// POST /api/employee/:id/check-in - Employee check-in (Improved)
router.post('/:id/check-in', async (req, res) => {
  try {
    console.log('Check-in request for employee ID:', req.params.id);
    
    // Check database connection before proceeding
    if (!checkDatabaseConnection()) {
      console.error('❌ Database not connected during check-in request');
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Database connection not available'
      });
    }
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      console.log('Employee not found for ID:', req.params.id);
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Employee not found' 
      });
    }
    
    console.log('Employee found:', employee.name);

    // Check if today is a holiday
    const todayHoliday = await isTodayHoliday();
    if (todayHoliday) {
      return res.status(400).json({
        error: 'Holiday today',
        message: `Today is ${todayHoliday.name} - No check-in required`,
        holiday: todayHoliday
      });
    }

    // Use server local time to match frontend display
    const now = new Date();
    
    // Format time consistently using 12-hour format (server local time)
    const checkInTime = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
    
    console.log('Current server time:', now.toISOString());
    console.log('Formatted check-in time:', checkInTime);
    console.log('Server timezone offset:', now.getTimezoneOffset());
    
    // Check if already checked in today
    if (employee.attendance.today.checkIn) {
      return res.status(400).json({
        error: 'Already checked in',
        message: 'You have already checked in today',
        checkInTime: employee.attendance.today.checkIn
      });
    }
    
    // Check if late (after 9:15 AM) using server local time
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15);
    const status = isLate ? 'Late' : 'Present';
    
    // Use server local date
    const today = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD format

    console.log('Today\'s date (server local):', today);
    console.log('Is late:', isLate);
    console.log('Status:', status);

    // Update today's attendance
    employee.attendance.today = {
      checkIn: checkInTime,
      checkOut: null,
      status: status,
      isLate: isLate,
      date: today, // Store the date for reference
      timestamp: now.toISOString() // Store full timestamp for debugging
    };

    // Add to attendance records
    const existingRecordIndex = employee.attendance.records.findIndex(record => record.date === today);
    
    if (existingRecordIndex >= 0) {
      employee.attendance.records[existingRecordIndex].checkIn = checkInTime;
      employee.attendance.records[existingRecordIndex].status = status;
      employee.attendance.records[existingRecordIndex].isLate = isLate;
      employee.attendance.records[existingRecordIndex].timestamp = now.toISOString();
    } else {
      employee.attendance.records.push({
        date: today,
        checkIn: checkInTime,
        checkOut: null,
        status: status,
        hours: 0,
        isLate: isLate,
        timestamp: now.toISOString()
      });
    }

    // Update weekly summary
    const weekStart = getWeekStart(now);
    let weeklySummary = employee.attendance.weeklySummaries.find(summary => summary.weekStart === weekStart);
    
    if (!weeklySummary) {
      weeklySummary = {
        weekStart: weekStart,
        present: 0,
        absent: 0,
        late: 0,
        totalHours: 0
      };
      employee.attendance.weeklySummaries.push(weeklySummary);
    }

    // Update weekly summary counts
    if (status === 'Present') {
      weeklySummary.present++;
    } else if (status === 'Late') {
      weeklySummary.late++;
    }

    // Update monthly summary
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    let monthlySummary = employee.attendance.monthlySummaries.find(summary => summary.month === monthKey);
    
    if (!monthlySummary) {
      monthlySummary = {
        month: monthKey,
        present: 0,
        absent: 0,
        late: 0,
        totalHours: 0
      };
      employee.attendance.monthlySummaries.push(monthlySummary);
    }

    // Update monthly summary counts
    if (status === 'Present') {
      monthlySummary.present++;
    } else if (status === 'Late') {
      monthlySummary.late++;
    }

    // Save the updated employee data with enhanced error handling
    try {
      await employee.save();
      console.log('✅ Employee data saved to MongoDB successfully');
      
      // Verify the data was actually saved by fetching it back
      const savedEmployee = await Employee.findById(employee._id);
      if (savedEmployee && savedEmployee.attendance.today.checkIn === checkInTime) {
        console.log('✅ Data verification successful - check-in time confirmed in database');
      } else {
        console.warn('⚠️ Data verification failed - check-in time not found in database');
      }
    } catch (saveError) {
      console.error('❌ Failed to save employee data to MongoDB:', saveError);
      throw new Error('Database save operation failed');
    }
    
    // Log comprehensive data for verification
    console.log('=== CHECK-IN DATA SAVED SUCCESSFULLY ===');
    console.log('Employee:', employee.name);
    console.log('Employee ID:', employee._id);
    console.log('Date:', today);
    console.log('Check-in Time:', checkInTime);
    console.log('Server Timestamp:', now.toISOString());
    console.log('Status:', status);
    console.log('Is Late:', isLate);
    console.log('Total Records:', employee.attendance.records.length);
    console.log('Weekly Summaries:', employee.attendance.weeklySummaries.length);
    console.log('Monthly Summaries:', employee.attendance.monthlySummaries.length);
    console.log('MongoDB Document ID:', employee._id);
    console.log('========================================');

    res.status(200).json({
      message: 'Check-in successful',
      checkInTime: checkInTime,
      status: status,
      isLate: isLate,
      employeeName: employee.name,
      timestamp: now.toISOString()
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
    console.log('Check-out request for employee ID:', req.params.id);
    
    // Check database connection before proceeding
    if (!checkDatabaseConnection()) {
      console.error('❌ Database not connected during check-out request');
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Database connection not available'
      });
    }
    
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Employee not found' 
      });
    }

    // Use server local time to match frontend display
    const now = new Date();
    
    // Format time consistently using 12-hour format (server local time)
    const checkOutTime = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });

    console.log('Current server time:', now.toISOString());
    console.log('Formatted check-out time:', checkOutTime);

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
    employee.attendance.today.timestamp = now.toISOString();

    // Update attendance record
    const today = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD format
    const existingRecordIndex = employee.attendance.records.findIndex(record => record.date === today);
    
    if (existingRecordIndex >= 0) {
      employee.attendance.records[existingRecordIndex].checkOut = checkOutTime;
      employee.attendance.records[existingRecordIndex].hours = hoursWorked;
      employee.attendance.records[existingRecordIndex].timestamp = now.toISOString();
    } else {
      employee.attendance.records.push({
        date: today,
        checkIn: null,
        checkOut: checkOutTime,
        status: 'Absent',
        hours: hoursWorked,
        isLate: false,
        timestamp: now.toISOString()
      });
    }

    // Update weekly summary
    const weekStart = getWeekStart(now);
    let weeklySummary = employee.attendance.weeklySummaries.find(summary => summary.weekStart === weekStart);
    
    if (weeklySummary) {
      // Update total hours
      weeklySummary.totalHours += hoursWorked;
    } else {
      // Create new weekly summary if it doesn't exist
      weeklySummary = {
        weekStart: weekStart,
        present: 0,
        absent: 0,
        late: 0,
        totalHours: hoursWorked
      };
      employee.attendance.weeklySummaries.push(weeklySummary);
    }

    // Update monthly summary
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    let monthlySummary = employee.attendance.monthlySummaries.find(summary => summary.month === monthKey);
    
    if (monthlySummary) {
      // Update total hours
      monthlySummary.totalHours += hoursWorked;
    } else {
      // Create new monthly summary if it doesn't exist
      monthlySummary = {
        month: monthKey,
        present: 0,
        absent: 0,
        late: 0,
        totalHours: hoursWorked
      };
      employee.attendance.monthlySummaries.push(monthlySummary);
    }

    // Save the updated employee data with enhanced error handling
    try {
      await employee.save();
      console.log('✅ Employee data saved to MongoDB successfully');
      
      // Verify the data was actually saved by fetching it back
      const savedEmployee = await Employee.findById(employee._id);
      if (savedEmployee && savedEmployee.attendance.today.checkOut === checkOutTime) {
        console.log('✅ Data verification successful - check-out time confirmed in database');
      } else {
        console.warn('⚠️ Data verification failed - check-out time not found in database');
      }
    } catch (saveError) {
      console.error('❌ Failed to save employee data to MongoDB:', saveError);
      throw new Error('Database save operation failed');
    }
    
    // Log comprehensive data for verification
    console.log('=== CHECK-OUT DATA SAVED SUCCESSFULLY ===');
    console.log('Employee:', employee.name);
    console.log('Employee ID:', employee._id);
    console.log('Date:', today);
    console.log('Check-in Time:', employee.attendance.today.checkIn);
    console.log('Check-out Time:', checkOutTime);
    console.log('Hours Worked:', hoursWorked);
    console.log('Status:', employee.attendance.today.status);
    console.log('Is Late:', employee.attendance.today.isLate);
    console.log('Total Records:', employee.attendance.records.length);
    console.log('Weekly Summaries:', employee.attendance.weeklySummaries.length);
    console.log('Monthly Summaries:', employee.attendance.monthlySummaries.length);
    console.log('MongoDB Document ID:', employee._id);
    console.log('==========================================');

    res.status(200).json({
      message: 'Check-out successful',
      checkOutTime: checkOutTime,
      hoursWorked: hoursWorked,
      totalHoursToday: hoursWorked,
      date: today
    });
  } catch (error) {
    console.error('Error during check-out:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process check-out' 
    });
  }
});

// POST /api/employee/daily-status-update - Update daily attendance status for all employees
router.post('/daily-status-update', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    // Get all employees
    const employees = await Employee.find({});
    let updatedCount = 0;
    
    for (const employee of employees) {
      let needsUpdate = false;
      
      // Check if employee has today's record
      const todayRecord = employee.attendance.records.find(record => record.date === today);
      
      if (!todayRecord) {
        // Create today's record if it doesn't exist
        employee.attendance.records.push({
          date: today,
          checkIn: null,
          checkOut: null,
          status: 'Absent',
          hours: 0,
          isLate: false
        });
        needsUpdate = true;
      }
      
      // Update today's status if no check-in
      if (!employee.attendance.today.checkIn && !employee.attendance.today.checkOut) {
        employee.attendance.today.status = 'Absent';
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await employee.save();
        updatedCount++;
        console.log('Daily status updated for employee:', employee.name);
      }
    }
    
    console.log(`Daily status update completed. ${updatedCount} employees updated.`);
    
    res.status(200).json({
      message: 'Daily status update completed',
      employeesUpdated: updatedCount,
      totalEmployees: employees.length
    });
    
  } catch (error) {
    console.error('Error during daily status update:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update daily status' 
    });
  }
});

// GET /api/employee/:id - Get specific employee details
router.get('/:id/leave-balance', async (req, res) => {
  try {
    console.log('=== LEAVE BALANCE ROUTE CALLED ===');
    console.log('Employee ID requested:', req.params.id);
    
    const employee = await Employee.findById(req.params.id).select('leaveBalance');
    
    if (!employee) {
      console.log('❌ Employee not found for ID:', req.params.id);
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Employee not found' 
      });
    }

    console.log('✅ Employee found for leave balance:', employee.name);
    console.log('Raw leave balance data:', employee.leaveBalance);
    
    // Recalculate leave balance based on approved leave requests
    try {
      const LeaveRequest = require('../models/LeaveRequest');
      const Settings = require('../models/Settings');
      
      // Get configured leave types from settings
      const settings = await Settings.getSettings();
      const configuredLeaveTypes = settings.leaveTypes || [];
      
      console.log('📋 Configured leave types from settings:', configuredLeaveTypes);
      
      const approvedRequests = await LeaveRequest.find({
        employeeId: employee.employeeId || employee._id.toString(),
        status: 'Approved'
      });
      
      console.log('📊 Found approved leave requests:', approvedRequests.length);
      
      // Create leave balance structure based on configured types
      const recalculatedBalance = {};
      
      // Initialize balance for each configured leave type
      configuredLeaveTypes.forEach(leaveType => {
        const typeKey = leaveType.name.toLowerCase().replace(/\s+/g, '');
        recalculatedBalance[typeKey] = {
          total: leaveType.days || 0,
          used: 0,
          remaining: leaveType.days || 0
        };
      });
      
      // If no configured types, use defaults
      if (configuredLeaveTypes.length === 0) {
        recalculatedBalance.annual = { total: 20, used: 0, remaining: 20 };
        recalculatedBalance.sick = { total: 10, used: 0, remaining: 10 };
        recalculatedBalance.personal = { total: 5, used: 0, remaining: 5 };
        console.log('⚠️ No configured leave types found, using defaults');
      }
      
      console.log('🔄 Initial leave balance structure:', recalculatedBalance);
      
      // Calculate used days from approved requests
      approvedRequests.forEach(request => {
        const leaveType = request.leaveType.toLowerCase().trim();
        const daysUsed = request.totalDays || request.days || 0;
        
        console.log(`📋 Processing leave request:`, {
          leaveType: request.leaveType,
          normalizedType: leaveType,
          daysUsed: daysUsed,
          requestId: request._id
        });
        
        // Find matching configured leave type
        let matchedTypeKey = null;
        for (const [key, balance] of Object.entries(recalculatedBalance)) {
          if (leaveType.includes(key) || key.includes(leaveType)) {
            matchedTypeKey = key;
            break;
          }
        }
        
        if (matchedTypeKey && recalculatedBalance[matchedTypeKey]) {
          recalculatedBalance[matchedTypeKey].used += daysUsed;
          recalculatedBalance[matchedTypeKey].remaining = 
            recalculatedBalance[matchedTypeKey].total - recalculatedBalance[matchedTypeKey].used;
          console.log(`✅ Updated ${matchedTypeKey} leave: used=${recalculatedBalance[matchedTypeKey].used}, remaining=${recalculatedBalance[matchedTypeKey].remaining}`);
        } else {
          console.log(`⚠️ No matching leave type found for: "${leaveType}"`);
        }
      });
      
      console.log('🔄 Recalculated leave balance:', recalculatedBalance);
      
      // Update the employee's leave balance in the database
      employee.leaveBalance = recalculatedBalance;
      await employee.save();
      
      console.log('✅ Updated employee leave balance in database');
      
      res.status(200).json(recalculatedBalance);
    } catch (recalcError) {
      console.error('⚠️ Error recalculating leave balance, using stored data:', recalcError);
      res.status(200).json(employee.leaveBalance);
    }
  } catch (error) {
    console.error('❌ Error fetching leave balance:', error);
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

    // Update fields if provided
    if (name) employee.name = name;
    if (email) employee.email = email;
    if (department) employee.department = department;
    if (position) employee.position = position;
    if (phone) employee.phone = phone;
    if (joinDate) employee.joinDate = joinDate;
    if (address) employee.address = address;
    if (salary) employee.salary = salary;
    if (manager) employee.manager = manager;
    if (employeeId) employee.employeeId = employeeId;
    if (domain) employee.domain = domain;
    
    // Update password if provided
    if (password) {
      const saltRounds = 10;
      employee.password = await bcrypt.hash(password, saltRounds);
    }
    
    // Update emergency contact if provided
    if (emergencyContact) {
      if (emergencyContact.name) employee.emergencyContact.name = emergencyContact.name;
      if (emergencyContact.relationship) employee.emergencyContact.relationship = emergencyContact.relationship;
      if (emergencyContact.phone) employee.emergencyContact.phone = emergencyContact.phone;
      if (emergencyContact.address) employee.emergencyContact.address = emergencyContact.address;
    }

    // Save updated employee
    const updatedEmployee = await employee.save();
    console.log('Employee profile updated in MongoDB:', {
      id: updatedEmployee._id,
      name: updatedEmployee.name,
      email: updatedEmployee.email,
      updateTime: new Date().toISOString()
    });

    res.status(200).json({
      message: 'Employee updated successfully',
      employee: {
        id: updatedEmployee._id,
        name: updatedEmployee.name,
        email: updatedEmployee.email,
        department: updatedEmployee.department,
        position: updatedEmployee.position,
        status: updatedEmployee.status,
        phone: updatedEmployee.phone,
        employeeId: updatedEmployee.employeeId,
        domain: updatedEmployee.domain,
        joinDate: updatedEmployee.joinDate,
        address: updatedEmployee.address,
        salary: updatedEmployee.salary,
        manager: updatedEmployee.manager,
        emergencyContact: updatedEmployee.emergencyContact
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

// PATCH /api/employee/:id/status - Update employee status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Employee not found' 
      });
    }

    // Validate status
    if (!['Active', 'Inactive', 'On Leave'].includes(status)) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'Invalid status. Must be Active, Inactive, or On Leave' 
      });
    }

    // Update status
    employee.status = status;
    
    // If status is 'On Leave', update today's attendance
    if (status === 'On Leave') {
      const today = new Date().toISOString().split('T')[0];
      employee.attendance.today.status = 'On Leave';
      
      // Update or create today's attendance record
      const existingRecordIndex = employee.attendance.records.findIndex(record => record.date === today);
      if (existingRecordIndex >= 0) {
        employee.attendance.records[existingRecordIndex].status = 'On Leave';
      } else {
        employee.attendance.records.push({
          date: today,
          checkIn: null,
          checkOut: null,
          status: 'On Leave',
          hours: 0,
          isLate: false
        });
      }
    }

    // Save updated employee
    const updatedEmployee = await employee.save();
    console.log('Employee status updated in MongoDB:', {
      id: updatedEmployee._id,
      name: updatedEmployee.name,
      status: updatedEmployee.status,
      updateTime: new Date().toISOString()
    });

    res.status(200).json({
      message: 'Employee status updated successfully',
      employee: {
        id: updatedEmployee._id,
        name: updatedEmployee.name,
        status: updatedEmployee.status
      }
    });
  } catch (error) {
    console.error('Error updating employee status:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update employee status' 
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

// POST /api/employee/bulk-operations - Bulk employee operations
router.post('/bulk-operations', async (req, res) => {
  try {
    const { operation, employeeIds, data } = req.body;
    
    if (!operation || !employeeIds || !Array.isArray(employeeIds)) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Operation, employeeIds array, and data are required'
      });
    }

    let results = [];
    
    switch (operation) {
      case 'updateStatus':
        for (const employeeId of employeeIds) {
          const employee = await Employee.findById(employeeId);
          if (employee) {
            employee.status = data.status;
            await employee.save();
            results.push({ id: employeeId, success: true, message: 'Status updated' });
            console.log(`Bulk status update in MongoDB for employee: ${employee.name}`);
          } else {
            results.push({ id: employeeId, success: false, message: 'Employee not found' });
          }
        }
        break;
        
      case 'updateDepartment':
        for (const employeeId of employeeIds) {
          const employee = await Employee.findById(employeeId);
          if (employee) {
            employee.department = data.department;
            await employee.save();
            results.push({ id: employeeId, success: true, message: 'Department updated' });
            console.log(`Bulk department update in MongoDB for employee: ${employee.name}`);
          } else {
            results.push({ id: employeeId, success: false, message: 'Employee not found' });
          }
        }
        break;
        
      default:
        return res.status(400).json({
          error: 'Bad request',
          message: 'Invalid operation. Supported operations: updateStatus, updateDepartment'
        });
    }

    console.log(`Bulk operation completed: ${operation} for ${employeeIds.length} employees`);
    
    res.status(200).json({
      message: 'Bulk operation completed',
      operation: operation,
      totalEmployees: employeeIds.length,
      results: results
    });
    
  } catch (error) {
    console.error('Error during bulk operation:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to perform bulk operation' 
    });
  }
});

// GET /api/employee/admin/export - Export comprehensive employee data for admin
router.get('/admin/export', async (req, res) => {
  try {
    const { format = 'json', department, status, startDate, endDate } = req.query;
    
    // Build query filters
    let query = {};
    if (department) query.department = department;
    if (status) query.status = status;
    
    const employees = await Employee.find(query).select('-password');
    
    // Filter by date range if provided
    let filteredEmployees = employees;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      filteredEmployees = employees.filter(emp => {
        const joinDate = new Date(emp.joinDate);
        return joinDate >= start && joinDate <= end;
      });
    }
    
    // Prepare export data
    const exportData = filteredEmployees.map(emp => {
      // Calculate comprehensive statistics
      const totalRecords = emp.attendance.records.length;
      const presentDays = emp.attendance.records.filter(record => record.status === 'Present').length;
      const lateDays = emp.attendance.records.filter(record => record.status === 'Late').length;
      const absentDays = emp.attendance.records.filter(record => record.status === 'Absent').length;
      const onLeaveDays = emp.attendance.records.filter(record => record.status === 'On Leave').length;
      const totalHours = emp.attendance.records.reduce((sum, record) => sum + (record.hours || 0), 0);
      
      const totalLeaveBalance = emp.leaveBalance.annual.total + emp.leaveBalance.sick.total + emp.leaveBalance.personal.total;
      const totalLeaveUsed = emp.leaveBalance.annual.used + emp.leaveBalance.sick.used + emp.leaveBalance.personal.used;
      const totalLeaveRemaining = emp.leaveBalance.annual.remaining + emp.leaveBalance.sick.remaining + emp.leaveBalance.personal.remaining;
      
      return {
        employeeId: emp.employeeId,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        position: emp.position,
        status: emp.status,
        phone: emp.phone,
        domain: emp.domain,
        joinDate: emp.joinDate,
        address: emp.address,
        salary: emp.salary,
        manager: emp.manager,
        emergencyContact: emp.emergencyContact,
        attendance: {
          totalRecords,
          presentDays,
          lateDays,
          absentDays,
          onLeaveDays,
          totalHours: Math.round(totalHours * 100) / 100,
          today: emp.attendance.today,
          recentRecords: emp.attendance.records.slice(-30)
        },
        leaveBalance: {
          annual: emp.leaveBalance.annual,
          sick: emp.leaveBalance.sick,
          personal: emp.leaveBalance.personal,
          summary: {
            total: totalLeaveBalance,
            used: totalLeaveUsed,
            remaining: totalLeaveRemaining
          }
        },
        weeklySummaries: emp.attendance.weeklySummaries.slice(-8), // Last 8 weeks
        monthlySummaries: emp.attendance.monthlySummaries.slice(-6) // Last 6 months
      };
    });
    
    console.log(`Data export completed from MongoDB: ${exportData.length} employees exported in ${format} format`);
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'Employee ID', 'Name', 'Email', 'Department', 'Position', 'Status',
        'Present Days', 'Late Days', 'Absent Days', 'On Leave Days', 'Total Hours',
        'Annual Leave Used', 'Sick Leave Used', 'Personal Leave Used'
      ].join(',');
      
      const csvRows = exportData.map(emp => [
        emp.employeeId,
        emp.name,
        emp.email,
        emp.department,
        emp.position,
        emp.status,
        emp.attendance.presentDays,
        emp.attendance.lateDays,
        emp.attendance.absentDays,
        emp.attendance.onLeaveDays,
        emp.attendance.totalHours,
        emp.leaveBalance.annual.used,
        emp.leaveBalance.sick.used,
        emp.leaveBalance.personal.used
      ].join(','));
      
      const csvContent = [csvHeaders, ...csvRows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=employee_data.csv');
      res.send(csvContent);
    } else {
      // Return JSON format
      res.status(200).json({
        message: 'Data export completed',
        format: format,
        totalEmployees: exportData.length,
        exportDate: new Date().toISOString(),
        data: exportData
      });
    }
    
  } catch (error) {
    console.error('Error during data export:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to export employee data' 
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
      isLate: checkIn && new Date(`2000-01-01 ${checkIn}`) > new Date('2000-01-01 09:15:00')
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

// GET /api/employee/payroll/calculate - Calculate payroll for all employees
router.get('/payroll/calculate', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Determine payroll date range: 23rd of last month to 23rd of current month
    let payrollStartDate, payrollEndDate;
    
    if (startDate && endDate) {
      // Use provided dates if specified
      payrollStartDate = new Date(startDate);
      payrollEndDate = new Date(endDate);
    } else {
      // Calculate default payroll period
      const now = new Date();
      if (now.getDate() >= 23) {
        payrollStartDate = new Date(now.getFullYear(), now.getMonth(), 23);
        payrollEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 23);
      } else {
        payrollStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 23);
        payrollEndDate = new Date(now.getFullYear(), now.getMonth(), 23);
      }
    }

    console.log('Calculating payroll for period:', payrollStartDate.toISOString(), 'to', payrollEndDate.toISOString());

    // Get all employees with their salary information
    const employees = await Employee.find({}).select('name email department salary monthlySalary attendance leaveBalance');
    
    // Get approved leave requests for the payroll period
    const LeaveRequest = require('../models/LeaveRequest');
    const leaveData = await LeaveRequest.find({
      startDate: { $lte: payrollEndDate },
      endDate: { $gte: payrollStartDate },
      status: 'Approved'
    });

    const payrollStats = {};
    const fixedLatePenalty = 200; // ₹200 per late day
    const totalWorkingDays = 22; // Adjust per company policy

    // Initialize payroll stats for each employee
    employees.forEach(emp => {
      const empId = emp._id.toString();
      const monthlySalary = emp.monthlySalary || parseFloat(emp.salary) || 0;
      
      payrollStats[empId] = {
        employeeId: emp.employeeId || empId,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        monthlySalary: monthlySalary,
        fullDays: 0,
        lateDays: 0,
        absents: 0,
        leaveDays: 0,
        lopAmount: 0,
        finalPay: 0
      };
    });

    // Process attendance records for the payroll period
    employees.forEach(emp => {
      const empId = emp._id.toString();
      const attendanceRecords = emp.attendance.records || [];
      
      // Filter records for the payroll period
      const periodRecords = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= payrollStartDate && recordDate < payrollEndDate;
      });

      // Count attendance days
      periodRecords.forEach(record => {
        if (record.status === 'Present' && !record.isLate) {
          payrollStats[empId].fullDays++;
        } else if (record.isLate) {
          payrollStats[empId].lateDays++;
        }
      });
    });

    // Process leave data for the payroll period
    leaveData.forEach(leave => {
      const empId = leave.employeeId;
      const emp = employees.find(e => e.employeeId === empId || e._id.toString() === empId);
      
      if (emp) {
        const empIdKey = emp._id.toString();
        if (payrollStats[empIdKey]) {
          // Calculate leave days within the payroll period
          const leaveStart = new Date(Math.max(new Date(leave.startDate), payrollStartDate));
          const leaveEnd = new Date(Math.min(new Date(leave.endDate), payrollEndDate));
          const leaveDaysCount = Math.ceil((leaveEnd - leaveStart) / (1000 * 60 * 60 * 24)) + 1;
          
          if (leaveDaysCount > 0) {
            payrollStats[empIdKey].leaveDays += leaveDaysCount;
          }
        }
      }
    });

    // Calculate absents and LOP for each employee
    Object.keys(payrollStats).forEach(empId => {
      const stats = payrollStats[empId];
      const perDaySalary = stats.monthlySalary / totalWorkingDays;
      const attendedDays = stats.fullDays + stats.lateDays + stats.leaveDays;
      
      // Calculate absent days
      stats.absents = Math.max(0, totalWorkingDays - attendedDays);
      
      // Calculate Loss of Pay (LOP)
      const latePenalty = stats.lateDays * fixedLatePenalty;
      const absentPenalty = stats.absents * perDaySalary;
      stats.lopAmount = latePenalty + absentPenalty;
      
      // Calculate final pay
      stats.finalPay = Math.max(0, stats.monthlySalary - stats.lopAmount);
      
      // Round amounts to 2 decimal places
      stats.lopAmount = Math.round(stats.lopAmount * 100) / 100;
      stats.finalPay = Math.round(stats.finalPay * 100) / 100;
    });

    console.log('Payroll calculation completed for', Object.keys(payrollStats).length, 'employees');

    res.status(200).json({
      success: true,
      payrollPeriod: {
        startDate: payrollStartDate.toISOString(),
        endDate: payrollEndDate.toISOString()
      },
      totalWorkingDays: totalWorkingDays,
      fixedLatePenalty: fixedLatePenalty,
      payrollData: Object.values(payrollStats)
    });

  } catch (error) {
    console.error('Error calculating payroll:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to calculate payroll',
      details: error.message
    });
  }
});

// GET /api/employee/payroll/export - Export payroll data to CSV
router.get('/payroll/export', async (req, res) => {
  try {
    const { startDate, endDate, format = 'csv' } = req.query;
    
    // Calculate payroll data directly instead of making HTTP request
    let payrollStartDate, payrollEndDate;
    
    if (startDate && endDate) {
      payrollStartDate = new Date(startDate);
      payrollEndDate = new Date(endDate);
    } else {
      const now = new Date();
      if (now.getDate() >= 23) {
        payrollStartDate = new Date(now.getFullYear(), now.getMonth(), 23);
        payrollEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 23);
      } else {
        payrollStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 23);
        payrollEndDate = new Date(now.getFullYear(), now.getMonth(), 23);
      }
    }

    // Get all employees with their salary information
    const employees = await Employee.find({}).select('name email department salary monthlySalary attendance leaveBalance');
    
    // Get approved leave requests for the payroll period
    const LeaveRequest = require('../models/LeaveRequest');
    const leaveData = await LeaveRequest.find({
      startDate: { $lte: payrollEndDate },
      endDate: { $gte: payrollStartDate },
      status: 'Approved'
    });

    const payrollStats = {};
    const fixedLatePenalty = 200; // ₹200 per late day
    const totalWorkingDays = 22; // Adjust per company policy

    // Initialize payroll stats for each employee
    employees.forEach(emp => {
      const empId = emp._id.toString();
      const monthlySalary = emp.monthlySalary || parseFloat(emp.salary) || 0;
      
      payrollStats[empId] = {
        employeeId: emp.employeeId || empId,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        monthlySalary: monthlySalary,
        fullDays: 0,
        lateDays: 0,
        absents: 0,
        leaveDays: 0,
        lopAmount: 0,
        finalPay: 0
      };
    });

    // Process attendance records for the payroll period
    employees.forEach(emp => {
      const empId = emp._id.toString();
      const attendanceRecords = emp.attendance.records || [];
      
      // Filter records for the payroll period
      const periodRecords = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= payrollStartDate && recordDate < payrollEndDate;
      });

      // Count attendance days
      periodRecords.forEach(record => {
        if (record.status === 'Present' && !record.isLate) {
          payrollStats[empId].fullDays++;
        } else if (record.isLate) {
          payrollStats[empId].lateDays++;
        }
      });
    });

    // Process leave data for the payroll period
    leaveData.forEach(leave => {
      const empId = leave.employeeId;
      const emp = employees.find(e => e.employeeId === empId || e._id.toString() === empId);
      
      if (emp) {
        const empIdKey = emp._id.toString();
        if (payrollStats[empIdKey]) {
          // Calculate leave days within the payroll period
          const leaveStart = new Date(Math.max(new Date(leave.startDate), payrollStartDate));
          const leaveEnd = new Date(Math.min(new Date(leave.endDate), payrollEndDate));
          const leaveDaysCount = Math.ceil((leaveEnd - leaveStart) / (1000 * 60 * 60 * 24)) + 1;
          
          if (leaveDaysCount > 0) {
            payrollStats[empIdKey].leaveDays += leaveDaysCount;
          }
        }
      }
    });

    // Calculate absents and LOP for each employee
    Object.keys(payrollStats).forEach(empId => {
      const stats = payrollStats[empId];
      const perDaySalary = stats.monthlySalary / totalWorkingDays;
      const attendedDays = stats.fullDays + stats.lateDays + stats.leaveDays;
      
      // Calculate absent days
      stats.absents = Math.max(0, totalWorkingDays - attendedDays);
      
      // Calculate Loss of Pay (LOP)
      const latePenalty = stats.lateDays * fixedLatePenalty;
      const absentPenalty = stats.absents * perDaySalary;
      stats.lopAmount = latePenalty + absentPenalty;
      
      // Calculate final pay
      stats.finalPay = Math.max(0, stats.monthlySalary - stats.lopAmount);
      
      // Round amounts to 2 decimal places
      stats.lopAmount = Math.round(stats.lopAmount * 100) / 100;
      stats.finalPay = Math.round(stats.finalPay * 100) / 100;
    });

    if (format === 'csv') {
      // Generate CSV content
      const csvHeaders = 'Employee Name,Email,Department,Monthly Salary,Full Days,Late Days,Absents,Leave Days,LOP Amount,Final Pay\n';
      const csvRows = Object.values(payrollStats).map(emp => 
        `"${emp.name}","${emp.email}","${emp.department}",${emp.monthlySalary},${emp.fullDays},${emp.lateDays},${emp.absents},${emp.leaveDays},${emp.lopAmount},${emp.finalPay}`
      ).join('\n');
      
      const csvContent = csvHeaders + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="payroll_${startDate || 'default'}_${endDate || 'period'}.csv"`);
      res.status(200).send(csvContent);
    } else {
      // Return JSON format
      res.status(200).json({
        success: true,
        payrollPeriod: {
          startDate: payrollStartDate.toISOString(),
          endDate: payrollEndDate.toISOString()
        },
        totalWorkingDays: totalWorkingDays,
        fixedLatePenalty: fixedLatePenalty,
        payrollData: Object.values(payrollStats)
      });
    }

  } catch (error) {
    console.error('Error exporting payroll data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to export payroll data',
      details: error.message
    });
  }
});

// POST /api/employee/:id/recalculate-summaries - Recalculate weekly and monthly summaries
router.post('/:id/recalculate-summaries', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Employee not found' 
      });
    }

    // Clear existing summaries
    employee.attendance.weeklySummaries = [];
    employee.attendance.monthlySummaries = [];

    // Group attendance records by week and month
    const weeklyGroups = {};
    const monthlyGroups = {};

    employee.attendance.records.forEach(record => {
      if (record.date && record.status) {
        const recordDate = new Date(record.date);
        
        // Group by week
        const weekStart = getWeekStart(recordDate);
        if (!weeklyGroups[weekStart]) {
          weeklyGroups[weekStart] = { present: 0, absent: 0, late: 0, totalHours: 0 };
        }
        
        if (record.status === 'Present') weeklyGroups[weekStart].present++;
        else if (record.status === 'Late') weeklyGroups[weekStart].late++;
        else if (record.status === 'Absent') weeklyGroups[weekStart].absent++;
        weeklyGroups[weekStart].totalHours += record.hours || 0;

        // Group by month
        const monthKey = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyGroups[monthKey]) {
          monthlyGroups[monthKey] = { present: 0, absent: 0, late: 0, totalHours: 0 };
        }
        
        if (record.status === 'Present') monthlyGroups[monthKey].present++;
        else if (record.status === 'Late') monthlyGroups[monthKey].late++;
        else if (record.status === 'Absent') monthlyGroups[monthKey].absent++;
        monthlyGroups[monthKey].totalHours += record.hours || 0;
      }
    });

    // Convert groups to summary arrays
    Object.keys(weeklyGroups).forEach(weekStart => {
      employee.attendance.weeklySummaries.push({
        weekStart,
        ...weeklyGroups[weekStart]
      });
    });

    Object.keys(monthlyGroups).forEach(month => {
      employee.attendance.monthlySummaries.push({
        month,
        ...monthlyGroups[month]
      });
    });

    // Sort summaries by date
    employee.attendance.weeklySummaries.sort((a, b) => new Date(a.weekStart) - new Date(b.weekStart));
    employee.attendance.monthlySummaries.sort((a, b) => {
      const [yearA, monthA] = a.month.split('-');
      const [yearB, monthB] = b.month.split('-');
      return new Date(parseInt(yearA), parseInt(monthA) - 1) - new Date(parseInt(yearB), parseInt(monthB) - 1);
    });

    await employee.save();

    res.status(200).json({
      message: 'Weekly and monthly summaries recalculated successfully',
      weeklySummaries: employee.attendance.weeklySummaries.length,
      monthlySummaries: employee.attendance.monthlySummaries.length
    });

  } catch (error) {
    console.error('Error recalculating summaries:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to recalculate summaries' 
    });
  }
});

// GET /api/employee/:id/attendance-details - Get detailed attendance data for calendar view
router.get('/:id/attendance-details', async (req, res) => {
  try {
    const { month, year } = req.query;
    const employee = await Employee.findById(req.params.id).select('-password');
    
    if (!employee) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Employee not found' 
      });
    }
    
    console.log('👤 Employee data for attendance details:', {
      id: employee._id,
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email
    });

    // Safely access attendance structures even if missing
    const attendanceRecords = Array.isArray(employee.attendance?.records)
      ? employee.attendance.records
      : [];
    const todayAttendance = employee.attendance?.today || null;

    // Default to current month and year if not specified
    const currentDate = new Date();
    // Use consistent timezone handling
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    
    console.log('📅 Calendar request details:', {
      requestedMonth: month,
      requestedYear: year,
      targetMonth: targetMonth,
      targetYear: targetYear,
      currentMonth: currentDate.getMonth(),
      currentYear: currentDate.getFullYear()
    });
    
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(targetYear, targetMonth, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    
    // Get approved leave requests for this month
    const LeaveRequest = require('../models/LeaveRequest');
    
    // Try to find leave requests by both employeeId (string) and _id (ObjectId)
    let approvedLeaveRequests = [];
    
    try {
      // First try with employeeId (string)
      if (employee.employeeId) {
        approvedLeaveRequests = await LeaveRequest.find({
          employeeId: employee.employeeId,
          status: 'Approved'
        });
        console.log(`🔍 Searching leave requests with employeeId: ${employee.employeeId}`);
      }
      
      // If no results, try with _id (ObjectId)
      if (approvedLeaveRequests.length === 0 && employee._id) {
        approvedLeaveRequests = await LeaveRequest.find({
          employeeId: employee._id,
          status: 'Approved'
        });
        console.log(`🔍 Searching leave requests with _id: ${employee._id}`);
      }
      
      // If still no results, try with _id as string
      if (approvedLeaveRequests.length === 0 && employee._id) {
        approvedLeaveRequests = await LeaveRequest.find({
          employeeId: employee._id.toString(),
          status: 'Approved'
        });
        console.log(`🔍 Searching leave requests with _id as string: ${employee._id.toString()}`);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      approvedLeaveRequests = [];
    }
    
    console.log('📋 Found approved leave requests for calendar:', approvedLeaveRequests.length);
    console.log('📋 Leave request details:', approvedLeaveRequests.map(req => ({
      id: req._id,
      startDate: req.startDate,
      endDate: req.endDate,
      leaveType: req.leaveType,
      status: req.status
    })));
    
    const calendarData = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarData.push({
        date: null,
        day: '',
        dayName: '',
        status: 'empty',
        checkIn: null,
        checkOut: null,
        hours: 0,
        isToday: false,
        isLeave: false,
        leaveType: null
      });
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      // Create date with consistent timezone handling
      const date = new Date(targetYear, targetMonth, day, 12, 0, 0);
      const dateString = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // Use consistent timezone
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isToday = date.toDateString() === currentDate.toDateString();
      
      // Check if this day has approved leave
      const leaveRequest = approvedLeaveRequests.find(request => {
        // Convert leave request dates to Date objects and normalize to start of day
        let startDate, endDate;
        
        if (request.startDate instanceof Date) {
          startDate = new Date(request.startDate);
        } else {
          startDate = new Date(request.startDate + 'T00:00:00');
        }
        
        if (request.endDate instanceof Date) {
          endDate = new Date(request.endDate);
        } else {
          endDate = new Date(request.endDate + 'T23:59:59');
        }
        
        // Create a date object for the current day being processed
        const currentDayDate = new Date(targetYear, targetMonth, day);
        
        // Check if current day falls within leave period
        const isLeaveDay = currentDayDate >= startDate && currentDayDate <= endDate;
        
        if (isLeaveDay) {
          console.log(`📅 Day ${day}: Found leave request - ${request.leaveType} (${request.startDate} to ${request.endDate})`);
        }
        
        return isLeaveDay;
      });
      
      // Find attendance record for this date
      const attendanceRecord = attendanceRecords.find(record => record.date === dateString);
      
      let status, checkIn, checkOut, hours, isLeave, leaveType;
      
      if (leaveRequest) {
        // This day has approved leave
        status = 'Leave';
        checkIn = null;
        checkOut = null;
        hours = 0;
        isLeave = true;
        leaveType = leaveRequest.leaveType;
        console.log(`📅 Day ${day}: Approved leave - ${leaveRequest.leaveType}`);
      } else if (isWeekend) {
        status = 'Weekend';
        checkIn = null;
        checkOut = null;
        hours = 0;
        isLeave = false;
        leaveType = null;
      } else if (isToday && todayAttendance && todayAttendance.checkIn) {
        // Today's current attendance from the 'today' field
        status = todayAttendance.status;
        checkIn = todayAttendance.checkIn;
        checkOut = todayAttendance.checkOut;
        hours = todayAttendance.hours || 0;
        isLeave = false;
        leaveType = null;
      } else if (attendanceRecord) {
        status = attendanceRecord.status;
        checkIn = attendanceRecord.checkIn;
        checkOut = attendanceRecord.checkOut;
        hours = attendanceRecord.hours || 0;
        isLeave = false;
        leaveType = null;
      } else {
        status = 'Absent';
        checkIn = null;
        checkOut = null;
        hours = 0;
        isLeave = false;
        leaveType = null;
      }

      calendarData.push({
        date: date,
        day: day,
        dayName: date.toLocaleDateString('en-US', { 
          weekday: 'short',
          timeZone: 'Asia/Kolkata'
        }),
        status,
        checkIn,
        checkOut,
        hours,
        isToday,
        isLeave,
        leaveType
      });
    }

    // Get month statistics
    const monthRecords = attendanceRecords.filter(record => {
      if (!record.date) return false;
      // Parse the date string and convert to local time
      const [year, month, day] = record.date.split('-').map(Number);
      const recordDate = new Date(year, month - 1, day); // month is 0-based in Date constructor
      return recordDate.getMonth() === targetMonth && recordDate.getFullYear() === targetYear;
    });

    // Count leave days for this month from calendar data
    const monthLeaveDays = calendarData.filter(day => day.isLeave).length;
    
    // Count other statuses from calendar data to ensure accuracy
    const monthPresentDays = calendarData.filter(day => day.status === 'Present').length;
    const monthLateDays = calendarData.filter(day => day.status === 'Late').length;
    const monthAbsentDays = calendarData.filter(day => day.status === 'Absent').length;

    // Include today's attendance if it's the current month
    let monthStats = {
      present: monthPresentDays,
      late: monthLateDays,
      absent: monthAbsentDays,
      leave: monthLeaveDays,
      totalHours: monthRecords.reduce((sum, r) => sum + (r.hours || 0), 0)
    };

    // Add today's attendance to stats if it's the current month
    if (targetMonth === currentDate.getMonth() && targetYear === currentDate.getFullYear() && 
        todayAttendance && todayAttendance.checkIn) {
      if (todayAttendance.status === 'Present') {
        monthStats.present++;
      } else if (todayAttendance.status === 'Late') {
        monthStats.late++;
      }
      monthStats.totalHours += todayAttendance.hours || 0;
    }

    // Get holidays for this month
    let monthHolidays = [];
    try {
      const settings = await Settings.findOne();
      if (settings && settings.companyHolidays) {
        monthHolidays = settings.companyHolidays.filter(holiday => {
          const holidayDate = new Date(holiday.date);
          return holidayDate.getMonth() === targetMonth && holidayDate.getFullYear() === targetYear;
        });
      }
    } catch (holidayError) {
      console.error('Error fetching holidays:', holidayError);
    }

    res.status(200).json({
      calendarData,
      monthStats,
      monthHolidays,
      month: targetMonth + 1,
      year: targetYear
    });

  } catch (error) {
    console.error('Error fetching attendance details:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch attendance details' 
    });
  }
});

// POST /api/employee/admin/recalculate-all-summaries - Recalculate summaries for all employees
router.post('/admin/recalculate-all-summaries', async (req, res) => {
  try {
    const employees = await Employee.find({});
    let updatedCount = 0;
    let errorCount = 0;

    for (const employee of employees) {
      try {
        // Clear existing summaries
        employee.attendance.weeklySummaries = [];
        employee.attendance.monthlySummaries = [];

        // Group attendance records by week and month
        const weeklyGroups = {};
        const monthlyGroups = {};

        employee.attendance.records.forEach(record => {
          if (record.date && record.status) {
            const recordDate = new Date(record.date);
            
            // Group by week
            const weekStart = getWeekStart(recordDate);
            if (!weeklyGroups[weekStart]) {
              weeklyGroups[weekStart] = { present: 0, absent: 0, late: 0, totalHours: 0 };
            }
            
            if (record.status === 'Present') weeklyGroups[weekStart].present++;
            else if (record.status === 'Late') weeklyGroups[weekStart].late++;
            else if (record.status === 'Absent') weeklyGroups[weekStart].absent++;
            weeklyGroups[weekStart].totalHours += record.hours || 0;

            // Group by month
            const monthKey = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyGroups[monthKey]) {
              monthlyGroups[monthKey] = { present: 0, absent: 0, late: 0, totalHours: 0 };
            }
            
            if (record.status === 'Present') monthlyGroups[monthKey].present++;
            else if (record.status === 'Late') monthlyGroups[monthKey].late++;
            else if (record.status === 'Absent') monthlyGroups[monthKey].absent++;
            monthlyGroups[monthKey].totalHours += record.hours || 0;
          }
        });

        // Convert groups to summary arrays
        Object.keys(weeklyGroups).forEach(weekStart => {
          employee.attendance.weeklySummaries.push({
            weekStart,
            ...weeklyGroups[weekStart]
          });
        });

        Object.keys(monthlyGroups).forEach(month => {
          employee.attendance.monthlySummaries.push({
            month,
            ...monthlyGroups[month]
          });
        });

        // Sort summaries by date
        employee.attendance.weeklySummaries.sort((a, b) => new Date(a.weekStart) - new Date(b.weekStart));
        employee.attendance.monthlySummaries.sort((a, b) => {
          const [yearA, monthA] = a.month.split('-');
          const [yearB, monthB] = b.month.split('-');
          return new Date(parseInt(yearA), parseInt(monthA) - 1) - new Date(parseInt(yearB), parseInt(monthB) - 1);
        });

        await employee.save();
        updatedCount++;
        console.log(`Summaries recalculated for employee: ${employee.name}`);
      } catch (error) {
        console.error(`Error recalculating summaries for employee ${employee.name}:`, error);
        errorCount++;
      }
    }

    res.status(200).json({
      message: 'Weekly and monthly summaries recalculated for all employees',
      totalEmployees: employees.length,
      updatedCount,
      errorCount
    });

  } catch (error) {
    console.error('Error recalculating all summaries:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to recalculate all summaries' 
    });
  }
});

// GET /api/employee/admin/recent-activities - Get recent employee activities for admin dashboard
router.get('/admin/recent-activities', async (req, res) => {
  try {
    const { limit = 10 } = req.query; // Default to 10 recent activities
    
    // Get all employees with their recent attendance data
    const employees = await Employee.find({}).select('name email attendance.today attendance.records');
    
    const recentActivities = [];
    
    // Process each employee's recent activity
    employees.forEach(employee => {
      // Check today's attendance
      if (employee.attendance.today && employee.attendance.today.checkIn) {
        const activity = {
          employeeName: employee.name,
          employeeEmail: employee.email,
          timestamp: employee.attendance.today.checkIn,
          status: employee.attendance.today.status,
          type: 'check-in',
          isToday: true
        };
        
        // Determine activity description based on status
        if (activity.status === 'Present') {
          activity.description = 'On Time';
          activity.icon = 'check';
          activity.color = 'success';
        } else if (activity.status === 'Late') {
          activity.description = 'Late';
          activity.icon = 'clock';
          activity.color = 'warning';
        }
        
        recentActivities.push(activity);
      }
      
      // Check recent check-outs from today
      if (employee.attendance.today && employee.attendance.today.checkOut) {
        const activity = {
          employeeName: employee.name,
          employeeEmail: employee.email,
          timestamp: employee.attendance.today.checkOut,
          status: 'Checked Out',
          type: 'check-out',
          description: 'Regular',
          icon: 'door-exit',
          color: 'info',
          isToday: true
        };
        recentActivities.push(activity);
      }
      
      // Get recent attendance records (last 7 days)
      const recentRecords = employee.attendance.records
        .filter(record => {
          if (!record.date) return false;
          const recordDate = new Date(record.date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return recordDate >= weekAgo;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3); // Get up to 3 recent records per employee
      
      recentRecords.forEach(record => {
        if (record.date && record.status) {
          const activity = {
            employeeName: employee.name,
            employeeEmail: employee.email,
            timestamp: record.checkIn || 'N/A',
            status: record.status,
            type: 'attendance',
            date: record.date,
            isToday: false
          };
          
          // Determine activity description and icon
          if (record.status === 'Present') {
            activity.description = 'On Time';
            activity.icon = 'check';
            activity.color = 'success';
          } else if (record.status === 'Late') {
            activity.description = 'Late';
            activity.icon = 'clock';
            activity.color = 'warning';
          } else if (record.status === 'Absent') {
            activity.description = 'Absent';
            activity.icon = 'x';
            activity.color = 'danger';
          }
          
          recentActivities.push(activity);
        }
      });
    });
    
    // Sort all activities by timestamp (most recent first)
    recentActivities.sort((a, b) => {
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      
      if (a.isToday && b.isToday) {
        // For today's activities, sort by time
        const timeA = a.timestamp;
        const timeB = b.timestamp;
        return timeB.localeCompare(timeA);
      }
      
      // For historical activities, sort by date
      if (a.date && b.date) {
        return new Date(b.date) - new Date(a.date);
      }
      
      return 0;
    });
    
    // Limit the results
    const limitedActivities = recentActivities.slice(0, parseInt(limit));
    
    res.status(200).json({
      recentActivities: limitedActivities,
      totalActivities: recentActivities.length,
      limit: parseInt(limit)
    });
    
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch recent activities' 
    });
  }
});

// GET /api/employee/admin/verify-data-integrity - Verify all employee data is properly stored
router.get('/admin/verify-data-integrity', async (req, res) => {
  try {
    const employees = await Employee.find({}).select('name email attendance');
    
    const verificationResults = [];
    
    for (const employee of employees) {
      const employeeData = {
        employeeId: employee._id,
        name: employee.name,
        email: employee.email,
        dataIntegrity: {
          todayAttendance: !!employee.attendance.today,
          hasRecords: employee.attendance.records.length > 0,
          hasWeeklySummaries: employee.attendance.weeklySummaries.length > 0,
          hasMonthlySummaries: employee.attendance.monthlySummaries.length > 0,
          totalRecords: employee.attendance.records.length,
          totalWeeklySummaries: employee.attendance.weeklySummaries.length,
          totalMonthlySummaries: employee.attendance.monthlySummaries.length
        },
        todayData: employee.attendance.today || null,
        recentRecords: employee.attendance.records.slice(-5) // Last 5 records
      };
      
      verificationResults.push(employeeData);
    }
    
    const summary = {
      totalEmployees: employees.length,
      employeesWithTodayData: verificationResults.filter(e => e.dataIntegrity.todayAttendance).length,
      employeesWithRecords: verificationResults.filter(e => e.dataIntegrity.hasRecords).length,
      employeesWithWeeklySummaries: verificationResults.filter(e => e.dataIntegrity.hasWeeklySummaries).length,
      employeesWithMonthlySummaries: verificationResults.filter(e => e.dataIntegrity.hasMonthlySummaries).length,
      totalRecords: verificationResults.reduce((sum, e) => sum + e.dataIntegrity.totalRecords, 0),
      totalWeeklySummaries: verificationResults.reduce((sum, e) => sum + e.dataIntegrity.totalWeeklySummaries, 0),
      totalMonthlySummaries: verificationResults.reduce((sum, e) => sum + e.dataIntegrity.totalMonthlySummaries, 0)
    };
    
    res.status(200).json({
      message: 'Data integrity verification completed',
      summary,
      employeeDetails: verificationResults
    });
    
  } catch (error) {
    console.error('Error verifying data integrity:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to verify data integrity' 
    });
  }
});

// POST /api/employee/upload-image - Upload employee profile image
router.post('/upload-image', async (req, res) => {
  try {
    console.log('=== IMAGE UPLOAD ROUTE CALLED ===');
    
    // Note: This is a basic implementation
    // In production, you'd want to use multer for file handling
    // and store images in cloud storage (AWS S3, etc.)
    
    const { employeeId } = req.body;
    console.log('Employee ID for image upload:', employeeId);
    
    if (!employeeId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Employee ID is required'
      });
    }

    // For now, return a placeholder image URL
    // In production, you'd process the actual file upload
    const imageUrl = `https://via.placeholder.com/150x150/6366f1/ffffff?text=${encodeURIComponent('Profile')}`;
    
    // Update employee with new image URL
    await Employee.findByIdAndUpdate(employeeId, {
      profileImage: imageUrl
    });

    console.log('✅ Image URL updated for employee:', employeeId);
    
    res.status(200).json({
      message: 'Profile image updated successfully',
      imageUrl: imageUrl
    });
    
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to upload image' 
    });
  }
});

// PUT /api/employee/:employeeId - Update employee information
router.put('/:employeeId', async (req, res) => {
  try {
    console.log('=== UPDATE EMPLOYEE ROUTE CALLED ===');
    console.log('Employee ID:', req.params.employeeId);
    console.log('Update data:', req.body);
    
    const { name, email, department, position, phone, joinDate, employeeId: empId, domain, address, salary, manager, emergencyContact, generalSettings } = req.body;
    
    // Validate required fields
    if (!name || !email || !department || !position || !phone) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Name, email, department, position, and phone are required'
      });
    }

    // Check if email already exists for another employee
    const existingEmployee = await Employee.findOne({ 
      email, 
      _id: { $ne: req.params.employeeId } 
    });
    
    if (existingEmployee) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Email already exists for another employee'
      });
    }

    // Prepare update data
    const updateData = {
      name,
      email,
      department,
      position,
      phone,
      joinDate,
      employeeId: empId,
      domain,
      address,
      salary,
      manager
    };

    // Add emergency contact if provided
    if (emergencyContact) {
      updateData.emergencyContact = emergencyContact;
    }

    // Add general settings if provided
    if (generalSettings) {
      updateData.generalSettings = generalSettings;
    }

    // Update employee
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.employeeId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedEmployee) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Employee not found'
      });
    }

    console.log('✅ Employee updated successfully:', updatedEmployee.name);
    
    res.status(200).json({
      message: 'Employee updated successfully',
      employee: updatedEmployee
    });
    
  } catch (error) {
    console.error('❌ Error updating employee:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update employee' 
    });
  }
});

// GET /api/employee/today-holiday - Check if today is a holiday
router.get('/today-holiday', async (req, res) => {
  try {
    const holiday = await isTodayHoliday();
    
    if (holiday) {
      res.status(200).json({
        isHoliday: true,
        holiday: holiday
      });
    } else {
      res.status(200).json({
        isHoliday: false,
        holiday: null
      });
    }
  } catch (error) {
    console.error('Error checking holiday status:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to check holiday status'
    });
  }
});

// DELETE /api/employee/:id - Delete employee
router.delete('/:id', async (req, res) => {
  try {
    if (!checkDatabaseConnection()) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Database connection not available'
      });
    }

    const employeeId = req.params.id;
    
    // Validate employee ID
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Invalid employee ID format'
      });
    }

    // Find and delete employee
    const deletedEmployee = await Employee.findByIdAndDelete(employeeId);
    
    if (!deletedEmployee) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Employee not found'
      });
    }

    console.log('✅ Employee deleted successfully:', deletedEmployee.name);
    
    res.status(200).json({
      message: 'Employee deleted successfully',
      deletedEmployee: {
        id: deletedEmployee._id,
        name: deletedEmployee.name,
        email: deletedEmployee.email
      }
    });
    
  } catch (error) {
    console.error('❌ Error deleting employee:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to delete employee' 
    });
  }
});

// POST /api/employee/admin/recalculate-all-leave-balances - Recalculate leave balance for all employees
router.post('/admin/recalculate-all-leave-balances', async (req, res) => {
  try {
    const employees = await Employee.find({});
    let updatedCount = 0;
    let errorCount = 0;

    for (const employee of employees) {
      try {
        // Recalculate leave balance based on approved leave requests
        const LeaveRequest = require('../models/LeaveRequest');
        const Settings = require('../models/Settings');
        
        // Get configured leave types from settings
        const settings = await Settings.getSettings();
        const configuredLeaveTypes = settings.leaveTypes || [];
        
        console.log(`📋 Configured leave types for ${employee.name}:`, configuredLeaveTypes);
        
        const approvedRequests = await LeaveRequest.find({
          employeeId: employee.employeeId || employee._id.toString(),
          status: 'Approved'
        });
        
        // Create leave balance structure based on configured types
        const recalculatedBalance = {};
        
        // Initialize balance for each configured leave type
        configuredLeaveTypes.forEach(leaveType => {
          const typeKey = leaveType.name.toLowerCase().replace(/\s+/g, '');
          recalculatedBalance[typeKey] = {
            total: leaveType.days || 0,
            used: 0,
            remaining: leaveType.days || 0
          };
        });
        
        // If no configured types, use defaults
        if (configuredLeaveTypes.length === 0) {
          recalculatedBalance.annual = { total: 20, used: 0, remaining: 20 };
          recalculatedBalance.sick = { total: 10, used: 0, remaining: 10 };
          recalculatedBalance.personal = { total: 5, used: 0, remaining: 5 };
          console.log(`⚠️ No configured leave types found for ${employee.name}, using defaults`);
        }
        
        // Calculate used days from approved requests
        approvedRequests.forEach(request => {
          const leaveType = request.leaveType.toLowerCase().trim();
          const daysUsed = request.totalDays || request.days || 0;
          
          // Find matching configured leave type
          let matchedTypeKey = null;
          for (const [key, balance] of Object.entries(recalculatedBalance)) {
            if (leaveType.includes(key) || key.includes(leaveType)) {
              matchedTypeKey = key;
              break;
            }
          }
          
          if (matchedTypeKey && recalculatedBalance[matchedTypeKey]) {
            recalculatedBalance[matchedTypeKey].used += daysUsed;
            recalculatedBalance[matchedTypeKey].remaining = 
              recalculatedBalance[matchedTypeKey].total - recalculatedBalance[matchedTypeKey].used;
            console.log(`✅ Updated ${matchedTypeKey} leave: used=${recalculatedBalance[matchedTypeKey].used}, remaining=${recalculatedBalance[matchedTypeKey].remaining}`);
          } else {
            console.log(`⚠️ No matching leave type found for: "${leaveType}"`);
          }
        });
        
        // Update employee's leave balance
        employee.leaveBalance = recalculatedBalance;
        await employee.save();
        
        updatedCount++;
        console.log(`Leave balance recalculated for employee: ${employee.name}`, recalculatedBalance);
      } catch (error) {
        console.error(`Error recalculating leave balance for employee ${employee.name}:`, error);
        errorCount++;
      }
    }

    res.status(200).json({
      message: 'Leave balance recalculated for all employees',
      totalEmployees: employees.length,
      updatedCount,
      errorCount
    });

  } catch (error) {
    console.error('Error recalculating all leave balances:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to recalculate all leave balances' 
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

// POST /api/employee/:id/recalculate-leave-balance - Manually recalculate leave balance for specific employee
router.post('/:id/recalculate-leave-balance', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Employee not found' 
      });
    }

    console.log(`🔄 Manually recalculating leave balance for employee: ${employee.name}`);

    // Recalculate leave balance based on approved leave requests
    const LeaveRequest = require('../models/LeaveRequest');
    const Settings = require('../models/Settings');
    
    // Get configured leave types from settings
    const settings = await Settings.getSettings();
    const configuredLeaveTypes = settings.leaveTypes || [];
    
    console.log('📋 Admin configured leave types for recalculation:', configuredLeaveTypes);
    
    const approvedRequests = await LeaveRequest.find({
      employeeId: employee.employeeId || employee._id.toString(),
      status: 'Approved'
    });
    
    console.log(`📊 Found ${approvedRequests.length} approved leave requests for ${employee.name}`);
    
    // Create leave balance structure based on configured types
    const recalculatedBalance = {};
    
    if (configuredLeaveTypes.length > 0) {
      // Use admin-configured leave types
      configuredLeaveTypes.forEach(leaveType => {
        const typeKey = leaveType.name.toLowerCase().replace(/\s+/g, '');
        recalculatedBalance[typeKey] = {
          total: leaveType.days || 0,
          used: 0,
          remaining: leaveType.days || 0
        };
      });
    } else {
      // Fallback to existing structure if no admin configuration
      recalculatedBalance.annual = { ...employee.leaveBalance.annual, used: 0, remaining: employee.leaveBalance.annual.total };
      recalculatedBalance.sick = { ...employee.leaveBalance.sick, used: 0, remaining: employee.leaveBalance.sick.total };
      recalculatedBalance.personal = { ...employee.leaveBalance.personal, used: 0, remaining: employee.leaveBalance.personal.total };
    }
    
    // Calculate used days from approved requests
    approvedRequests.forEach(request => {
      const leaveType = request.leaveType.toLowerCase().trim();
      const daysUsed = request.totalDays || request.days || 0;
      
      console.log(`📋 Processing leave request:`, {
        leaveType: request.leaveType,
        normalizedType: leaveType,
        daysUsed: daysUsed,
        requestId: request._id
      });
      
      // Find matching configured leave type
      let matchedTypeKey = null;
      for (const [key, balance] of Object.entries(recalculatedBalance)) {
        if (leaveType.includes(key) || key.includes(leaveType)) {
          matchedTypeKey = key;
          break;
        }
      }
      
      if (matchedTypeKey && recalculatedBalance[matchedTypeKey]) {
        recalculatedBalance[matchedTypeKey].used += daysUsed;
        recalculatedBalance[matchedTypeKey].remaining = 
          recalculatedBalance[matchedTypeKey].total - recalculatedBalance[matchedTypeKey].used;
        console.log(`✅ Updated ${matchedTypeKey} leave: used=${recalculatedBalance[matchedTypeKey].used}, remaining=${recalculatedBalance[matchedTypeKey].remaining}`);
      } else {
        console.log(`⚠️ Unknown leave type: "${leaveType}" for request:`, request._id);
      }
    });
    
    console.log('🔄 Recalculated leave balance:', recalculatedBalance);
    
    // Update the employee's leave balance in the database
    employee.leaveBalance = recalculatedBalance;
    await employee.save();
    
    console.log('✅ Updated employee leave balance in database');
    
    res.status(200).json({
      message: 'Leave balance recalculated successfully',
      previousBalance: employee.leaveBalance,
      newBalance: recalculatedBalance,
      approvedRequests: approvedRequests.length
    });
  } catch (error) {
    console.error('❌ Error recalculating leave balance:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to recalculate leave balance' 
    });
  }
});

// POST /api/employee/admin/sync-leave-balance-structure - Sync all employees' leave balance structure with current settings
router.post('/admin/sync-leave-balance-structure', async (req, res) => {
  try {
    const Settings = require('../models/Settings');
    
    // Get configured leave types from settings
    const settings = await Settings.getSettings();
    const configuredLeaveTypes = settings.leaveTypes || [];
    
    if (configuredLeaveTypes.length === 0) {
      return res.status(400).json({
        error: 'No leave types configured',
        message: 'Please configure leave types in admin settings first'
      });
    }
    
    console.log('🔄 Syncing leave balance structure for all employees with:', configuredLeaveTypes);
    
    const employees = await Employee.find({});
    let updatedCount = 0;
    let errorCount = 0;

    for (const employee of employees) {
      try {
        // Create new leave balance structure based on configured types
        const newLeaveBalance = {};
        
        configuredLeaveTypes.forEach(leaveType => {
          const typeKey = leaveType.name.toLowerCase().replace(/\s+/g, '');
          newLeaveBalance[typeKey] = {
            total: leaveType.days || 0,
            used: 0,
            remaining: leaveType.days || 0
          };
        });
        
        // Preserve existing used days if possible
        if (employee.leaveBalance) {
          Object.keys(newLeaveBalance).forEach(typeKey => {
            if (employee.leaveBalance[typeKey]) {
              newLeaveBalance[typeKey].used = employee.leaveBalance[typeKey].used || 0;
              newLeaveBalance[typeKey].remaining = newLeaveBalance[typeKey].total - newLeaveBalance[typeKey].used;
            }
          });
        }
        
        // Update employee's leave balance structure
        employee.leaveBalance = newLeaveBalance;
        await employee.save();
        
        updatedCount++;
        console.log(`✅ Leave balance structure synced for employee: ${employee.name}`, newLeaveBalance);
      } catch (error) {
        console.error(`❌ Error syncing leave balance structure for employee ${employee.name}:`, error);
        errorCount++;
      }
    }

    res.status(200).json({
      message: 'Leave balance structure synced for all employees',
      configuredLeaveTypes,
      totalEmployees: employees.length,
      updatedCount,
      errorCount
    });

  } catch (error) {
    console.error('❌ Error syncing leave balance structure:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to sync leave balance structure' 
    });
  }
});

module.exports = router;