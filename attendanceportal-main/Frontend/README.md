# Attendance Portal

A modern, responsive attendance management system built with React and CSS. This application provides comprehensive employee attendance tracking, leave management, and administrative features.

## Features

### 🏠 Dashboard
- Real-time attendance statistics
- Live clock display
- Attendance rate visualization
- Recent activity feed
- Interactive charts and graphs

### 👥 Employee Management
- Add, edit, and delete employees
- Search and filter functionality
- Employee profile management
- Department and position tracking
- Status management (Active, On Leave)

### 📅 Leave Management
- Submit leave requests
- Approve/reject leave applications
- Multiple leave types (Annual, Sick, Personal, etc.)
- Leave duration tracking
- Status filtering and search

### ⚙️ Settings
- Company configuration
- Working hours setup
- Attendance rules (late threshold, overtime)
- Leave type customization
- Notification preferences
- Theme settings

### 🔐 Authentication
- Secure login system
- User session management
- Logout functionality

### 👤 Employee Portal
- Personal attendance tracking
- Check-in/Check-out functionality
- Leave balance display
- Submit leave requests
- View personal attendance history
- Real-time attendance status

## Demo Credentials

### 👨‍💼 Admin Access
**Email:** admin@company.com  
**Password:** admin123

### 👩‍💻 Employee Access
**Email:** employee@company.com  
**Password:** employee123

### 👨‍💼 Another Employee
**Email:** mike@company.com  
**Password:** mike123

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Open Application**
   - Navigate to `http://localhost:3000`
   - Use the demo credentials to log in
   - **Admin users** get access to full management dashboard
   - **Employee users** get access to personal employee portal

## Project Structure

```
src/
├── components/
│   ├── Dashboard.js          # Main dashboard with statistics
│   ├── EmployeeManagement.js # Employee CRUD operations
│   ├── LeaveManagement.js    # Leave request handling
│   ├── EmployeePortal.js     # Employee self-service portal
│   ├── Login.js             # Authentication component
│   ├── Settings.js          # System configuration
│   ├── Sidebar.js           # Navigation component
│   └── *.css               # Component-specific styles
├── App.js                   # Main application component
├── App.css                  # Global styles
├── index.js                 # Application entry point
└── index.css               # Base styles
```

## Key Features

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interface

### Modern UI/UX
- Clean, professional design
- Smooth animations and transitions
- Intuitive navigation
- Color-coded status indicators

### Dynamic Functionality
- Real-time data updates
- Interactive forms and modals
- Search and filter capabilities
- Status management

### Data Management
- Local state management with React hooks
- Form validation
- CRUD operations
- Data persistence (local storage simulation)

## Technology Stack

- **Frontend:** React 18
- **Routing:** React Router DOM
- **Styling:** CSS3 with Flexbox/Grid
- **Icons:** Emoji icons for simplicity
- **Build Tool:** Create React App

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Future Enhancements

- Backend integration with Node.js/Express
- Database integration (MongoDB/PostgreSQL)
- Real-time notifications
- Advanced reporting and analytics
- Multi-language support
- Dark mode implementation
- Export functionality (PDF/Excel)
- Email notifications
- Mobile app development

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

---

**Note:** This is a demo application with mock data. In a production environment, you would integrate with a backend API and database for persistent data storage. 