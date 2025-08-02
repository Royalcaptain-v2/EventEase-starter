#  EventEase - Event Booking Platform

#  Project Overview

EventEase is a full-stack web application that allows users to browse, filter, and book seats for events like webinars, conferences, and workshops. Admins can create, edit, delete events, and view attendee details. Each user can book up to 2 seats per event.

---

#  Features Implemented

-  JWT-based user authentication and role-based access (admin/user)
-  Event creation, editing, and deletion by admin
-  Seat booking with 2-seat limit per user per event
-  Real-time event status: Upcoming, Ongoing, Completed
-  Filters by category, location, and date
-  View all your bookings (My Bookings page)
-  Admin can view attendees for each event
-  Auto-generated event code (EVT-MMMYYYY-XYZ)
-  Middleware to log every booking with user ID and timestamp
-  Clean UI with login/logout and protected routes

---

# Tech Stack Used

# Frontend:
- React.js
- React Router DOM
- CSS (inline + optional frameworks)

# Backend:
- Node.js
- Express.js
- MySQL (with mysql2 package)
- JWT for authentication
- dotenv for environment configuration

---

# Setup Instructions

1. Clone the repository
```
git clone https://github.com/your-username/eventease.git
cd EventEase-starter
```
2. Backend Setup
bash
```
cd eventease-backend
npm install
```
2.1 Create a .env file 
env
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=eventease
JWT_SECRET=your_jwt_secret
```
2.2 Start the server
```
node server.js
```

3. Frontend Setup
bash
```
cd ../eventease-frontend
npm install
npm run dev
```
## API Documentation
- [Postman Collection](./EventEase_API_Collection.json) 


