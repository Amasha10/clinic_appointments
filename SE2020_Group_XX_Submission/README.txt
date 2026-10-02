Clinic Appointment Application
===============================================

01). GitHub Repository Link
GitHub Repository: https://github.com/Amasha10/clinic_appointments

02). Student Details
Assignment Type: Clinic Appointments
Student ID: IT22349156
Student Name: Wijesinghe K A A N
Group Number: (individual assignment) - IT22349156

03). Deployment Details
Backend URL: TBD
Frontend URL: React Native / Expo mobile application (no public frontend URL)

=================================
FILE STRUCTURE
=================================

ClinicAppointmentApp/
├── backend/                         <- Node.js + Express API
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── appointmentController.js
│   │   │   ├── authController.js
│   │   │   └── doctorController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── upload.js
│   │   ├── models/
│   │   │   ├── Appointment.js
│   │   │   ├── Doctor.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── appointmentRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   └── doctorRoutes.js
│   │   └── server.js
│   ├── uploads/                      <- Doctor photos stored by the API
│   ├── .env.example
│   └── package.json
│
└── mobile/                           <- React Native / Expo application
	 ├── src/
	 │   ├── app/                      <- Expo Router screens
	 │   ├── components/
	 │   ├── context/
	 │   └── lib/                      <- API client and theme
	 ├── .env.example
	 └── package.json

=================================
LOCAL SETUP & INSTALLATION
=================================

1. BACKEND SETUP
	- Navigate to the backend directory: cd backend
	- Install dependencies: npm install
	- Copy .env.example to .env
	- Configure MONGODB_URI with your MongoDB Atlas connection string
	- Set JWT_SECRET to a long random value; never commit .env
	- Start the API: npm run dev
	- Verify the API: http://localhost:5000/api/health

2. MOBILE APP SETUP
	- Navigate to the mobile directory: cd mobile
	- Install dependencies: npm install
	- Copy .env.example to .env
	- Set EXPO_PUBLIC_API_URL to the API URL, e.g. http://localhost:5000/api for web
	- Start in a browser: npm run web
	- Start Expo Go: npm start, then scan the QR code

=================================
APPLICATION SUMMARY
=================================

Primary entity: Doctor
Related entity: Appointment
Authentication entity: User (not counted as one of the two required domain entities)

The API provides registration and login, doctor CRUD with image upload, and appointment CRUD with status cancellation. Appointment requests are rejected when their time overlaps a non-cancelled appointment for the same doctor.

