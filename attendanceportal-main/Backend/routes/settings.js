const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// GET /api/settings - Get all settings
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch settings' 
    });
  }
});

// PUT /api/settings - Update settings
router.put('/', async (req, res) => {
  try {
    const {
      companyName,
      workingHoursStart,
      workingHoursEnd,
      lateThreshold,
      overtimeThreshold,
      leaveTypes,
      companyHolidays,
      notifications,
      theme
    } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    // Update general settings
    if (companyName !== undefined) settings.companyName = companyName;
    if (workingHoursStart !== undefined) settings.workingHoursStart = workingHoursStart;
    if (workingHoursEnd !== undefined) settings.workingHoursEnd = workingHoursEnd;
    
    // Update attendance rules
    if (lateThreshold !== undefined) settings.lateThreshold = lateThreshold;
    if (overtimeThreshold !== undefined) settings.overtimeThreshold = overtimeThreshold;
    
    // Update leave types
    if (leaveTypes !== undefined) settings.leaveTypes = leaveTypes;
    
    // Update company holidays
    if (companyHolidays !== undefined) settings.companyHolidays = companyHolidays;
    
    // Update notifications
    if (notifications !== undefined) settings.notifications = notifications;
    
    // Update theme
    if (theme !== undefined) settings.theme = theme;

    await settings.save();

    console.log('✅ Settings updated successfully');
    
    res.status(200).json({
      message: 'Settings updated successfully',
      settings: settings
    });
    
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update settings' 
    });
  }
});

// GET /api/settings/general - Get general settings only
router.get('/general', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.status(200).json({
      companyName: settings.companyName,
      workingHoursStart: settings.workingHoursStart,
      workingHoursEnd: settings.workingHoursEnd
    });
  } catch (error) {
    console.error('Error fetching general settings:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch general settings' 
    });
  }
});

// PUT /api/settings/general - Update general settings only
router.put('/general', async (req, res) => {
  try {
    const { companyName, workingHoursStart, workingHoursEnd } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (companyName !== undefined) settings.companyName = companyName;
    if (workingHoursStart !== undefined) settings.workingHoursStart = workingHoursStart;
    if (workingHoursEnd !== undefined) settings.workingHoursEnd = workingHoursEnd;

    await settings.save();

    console.log('✅ General settings updated successfully');
    
    res.status(200).json({
      message: 'General settings updated successfully',
      settings: {
        companyName: settings.companyName,
        workingHoursStart: settings.workingHoursStart,
        workingHoursEnd: settings.workingHoursEnd
      }
    });
    
  } catch (error) {
    console.error('Error updating general settings:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update general settings' 
    });
  }
});

// GET /api/settings/leave-types - Get leave types only
router.get('/leave-types', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.status(200).json({
      leaveTypes: settings.leaveTypes || []
    });
  } catch (error) {
    console.error('Error fetching leave types:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch leave types' 
    });
  }
});

// PUT /api/settings/leave-types - Update leave types only
router.put('/leave-types', async (req, res) => {
  try {
    const { leaveTypes } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (leaveTypes !== undefined) settings.leaveTypes = leaveTypes;

    await settings.save();

    console.log('✅ Leave types updated successfully');
    
    res.status(200).json({
      message: 'Leave types updated successfully',
      leaveTypes: settings.leaveTypes
    });
    
  } catch (error) {
    console.error('Error updating leave types:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update leave types' 
    });
  }
});

module.exports = router;
