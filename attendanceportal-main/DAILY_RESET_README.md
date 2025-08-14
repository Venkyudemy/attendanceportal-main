# Daily Reset Functionality

## Overview
The attendance portal now includes an automated daily reset system that runs at 12:00 AM every day to reset all employee check-in statuses for the new day.

## Features

### 🕛 Automatic Daily Reset
- **Time**: Runs automatically at 12:00 AM (midnight) every day
- **Action**: Resets all employee attendance statuses to 'Absent'
- **Scope**: Affects all employees in the system
- **Logging**: Comprehensive logging for monitoring and debugging

### 🔄 Manual Reset (Admin Only)
- **Endpoint**: `POST /api/employee/manual-daily-reset`
- **Access**: Admin users only
- **Purpose**: Testing and emergency resets
- **Response**: Confirmation with count of employees reset

### ✅ Improved Check-in System
- **Duplicate Prevention**: Prevents multiple check-ins on the same day
- **Better Error Handling**: Clear error messages for users
- **Loading States**: Visual feedback during processing
- **Status Messages**: User-friendly status updates

## How It Works

### Automatic Reset Process
1. **Scheduling**: When the server starts, it calculates the time until the next midnight
2. **Execution**: At midnight, all employee attendance records are reset
3. **Database Update**: Each employee's `attendance.today` field is updated
4. **Logging**: Comprehensive logs are generated for monitoring

### Reset Logic
```javascript
// Reset attendance for each employee
employee.attendance.today = {
  checkIn: null,
  checkOut: null,
  status: 'Absent',
  isLate: false
};
```

## API Endpoints

### Daily Reset
- **POST** `/api/employee/manual-daily-reset`
  - **Description**: Manually trigger daily reset
  - **Access**: Admin only
  - **Response**: 
    ```json
    {
      "message": "Manual daily reset completed successfully",
      "employeesReset": 25,
      "resetTime": "2024-01-15T00:00:00.000Z",
      "date": "2024-01-15"
    }
    ```

### Check-in (Enhanced)
- **POST** `/api/employee/:id/check-in`
  - **Description**: Employee check-in with duplicate prevention
  - **Response**: 
    ```json
    {
      "message": "Check-in successful",
      "checkInTime": "09:15 AM",
      "status": "Present",
      "isLate": false,
      "employeeName": "John Doe"
    }
    ```

## Frontend Changes

### Status Messages
- Success/error messages displayed prominently
- Auto-dismiss after 3-5 seconds
- Color-coded for different message types

### Loading States
- Buttons show "Processing..." during operations
- Disabled state prevents multiple submissions
- Visual feedback for better UX

### Admin Controls
- Manual reset button in admin view
- Real-time status updates
- Confirmation dialogs for important actions

## Configuration

### Environment Variables
```bash
# MongoDB connection
MONGODB_URI=mongodb://localhost:27017/attendance_portal

# Server port
PORT=5000
```

### Reset Timing
The reset runs at exactly 12:00 AM local server time. To change this:

1. Modify the `scheduleDailyReset()` function in `Backend/index.js`
2. Adjust the `tomorrow.setHours(0, 0, 0, 0)` line
3. Restart the server

## Monitoring

### Console Logs
The system provides detailed logging:

```
🔄 Starting daily attendance reset...
✅ Reset attendance for employee: John Doe
✅ Reset attendance for employee: Jane Smith
🎉 Daily reset completed! 25 employees reset at 1/15/2024, 12:00:00 AM
============================================================
🕛 DAILY ATTENDANCE RESET COMPLETED AT 1/15/2024, 12:00:00 AM
📊 Total employees reset: 25
📅 Date: 2024-01-15
============================================================
```

### Health Check
- **Endpoint**: `GET /api/health`
- **Purpose**: Verify server and database connectivity
- **Use**: Monitoring and debugging

## Testing

### Manual Testing
1. Start the backend server
2. Use the admin portal to trigger manual reset
3. Verify all employees show "Absent" status
4. Test check-in functionality

### Automated Testing
Run the test script:
```bash
node test-daily-reset.js
```

## Troubleshooting

### Common Issues

#### Reset Not Running
- Check server logs for scheduling messages
- Verify server timezone settings
- Ensure MongoDB connection is active

#### Check-in Fails
- Verify employee exists in database
- Check API endpoint connectivity
- Review error logs for specific issues

#### Frontend Issues
- Clear browser cache
- Check browser console for errors
- Verify API base URL configuration

### Debug Commands
```bash
# Check server status
curl http://localhost:5000/api/health

# Test manual reset
curl -X POST http://localhost:5000/api/employee/manual-daily-reset

# Check employee attendance
curl http://localhost:5000/api/employee/attendance
```

## Security Considerations

### Access Control
- Manual reset endpoint restricted to admin users
- Regular employees cannot trigger resets
- All actions logged for audit purposes

### Data Integrity
- Reset operations are atomic
- Database transactions ensure consistency
- Backup recommendations for production use

## Future Enhancements

### Planned Features
- **Configurable Reset Time**: Allow admins to set custom reset times
- **Selective Reset**: Reset specific departments or employee groups
- **Reset History**: Track when resets were performed
- **Email Notifications**: Alert admins when resets complete

### Performance Optimizations
- **Batch Processing**: Process employees in batches for large datasets
- **Async Operations**: Non-blocking reset operations
- **Caching**: Cache frequently accessed attendance data

## Support

For issues or questions:
1. Check the console logs for error details
2. Verify database connectivity
3. Test API endpoints manually
4. Review this documentation

---

**Note**: This functionality is designed to work with the existing attendance system. Ensure all dependencies are properly installed and configured before use.
