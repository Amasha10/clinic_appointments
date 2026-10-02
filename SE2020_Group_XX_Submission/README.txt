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
Backend URL: https://clinicappointments-production.up.railway.app
Backend Health Check: https://clinicappointments-production.up.railway.app/api/health (currently returns HTTP 502; redeploy after configuring Railway variables)
Frontend URL: https://clinicappointments-mobile.vercel.app

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
	- Set EXPO_PUBLIC_API_URL=https://clinicappointments-production.up.railway.app/api in mobile/.env
	- Set the same EXPO_PUBLIC_API_URL in Vercel Project Settings > Environment Variables, then redeploy
	- Start in a browser: npm run web
	- Start Expo Go: npm start, then scan the QR code

3. HOSTING CONFIGURATION
	- Railway Root Directory: /backend; set MONGODB_URI, JWT_SECRET, NODE_ENV=production, and CLIENT_ORIGIN=https://clinicappointments-mobile.vercel.app
	- Vercel Root Directory: /mobile; set EXPO_PUBLIC_API_URL=https://clinicappointments-production.up.railway.app/api
	- Redeploy the Railway service and verify /api/health returns HTTP 200 with the database connected before testing frontend API features

=================================
APPLICATION SUMMARY
=================================

Primary entity: Doctor
Related entity: Appointment
Authentication entity: User (not counted as one of the two required domain entities)

The API provides registration and login, doctor CRUD with image upload, and appointment CRUD with status cancellation. Appointment requests are rejected when their time overlaps a non-cancelled appointment for the same doctor.

