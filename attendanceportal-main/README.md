# Attendance Portal

A comprehensive employee attendance and leave management system with separate portals for employees and administrators.

## Features

### Employee Portal
- **Attendance Tracking**: Check-in/check-out functionality
- **Leave Management**: Request leave with different types (Annual, Sick, Personal)
- **Leave Balance**: View remaining leave days for each type
- **Recent Attendance**: View attendance history
- **Navigation**: Easy access to admin portal for leave management

### Admin Portal
- **Dashboard**: Overview of attendance and leave statistics
- **Employee Management**: Manage employee information
- **Leave Management**: Approve/reject leave requests from employees
- **Settings**: System configuration

## Technology Stack

### Frontend
- React.js
- React Router for navigation
- CSS3 for styling

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose ODM

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the Backend directory (optional):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/attendance_portal
JWT_SECRET=your-secret-key
```

4. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Usage

### Employee Portal
1. Login as an employee
2. Use the "Check In" and "Check Out" buttons to track attendance
3. Click "Request Leave" to submit leave requests
4. View your leave balance and recent attendance
5. Use the "View Leave Management (Admin)" button to access the admin portal

### Admin Portal
1. Login as an administrator
2. Navigate to "Leave Management" to view all employee leave requests
3. Approve or reject pending requests
4. View employee attendance and manage the system

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Leave Management
- `GET /api/leave/admin` - Get all leave requests (admin)
- `GET /api/leave/employee/:employeeId` - Get employee's leave requests
- `POST /api/leave` - Create new leave request
- `PATCH /api/leave/:id/status` - Update leave request status
- `DELETE /api/leave/:id` - Delete leave request

## Database Schema

### LeaveRequest Model
```javascript
{
  employeeId: String,
  employeeName: String,
  leaveType: String, // 'Annual Leave', 'Sick Leave', 'Personal Leave'
  startDate: Date,
  endDate: Date,
  reason: String,
  status: String, // 'Pending', 'Approved', 'Rejected'
  submittedDate: Date,
  days: Number,
  adminNotes: String
}
```

## Key Features

### Real-time Connection
- Employee leave requests are immediately visible in the admin portal
- Status updates are reflected in real-time
- Proper error handling and user feedback

### Role-based Access
- Employees can only view their own leave requests
- Admins can view and manage all leave requests
- Secure routing based on user roles

### User Experience
- Clean, modern UI design
- Responsive layout for mobile devices
- Intuitive navigation between portals
- Form validation and error handling

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the MONGO_URI in your environment variables

2. **CORS Errors**
   - The backend is configured with CORS enabled
   - Ensure the frontend is running on the correct port

3. **API Connection Issues**
   - Verify the backend is running on port 5000
   - Check the API_BASE_URL in the frontend services

### Development Tips

- Use the browser's developer tools to monitor API calls
- Check the console for error messages
- Ensure all dependencies are properly installed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 