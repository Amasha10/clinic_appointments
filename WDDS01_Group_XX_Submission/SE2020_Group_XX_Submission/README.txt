CLINIC APPOINTMENT APPLICATION
SE2020 - Web and Mobile Technologies (Individual Assignment)

01). GitHub Repository Link
GitHub Repository: https://github.com/Amasha10/clinic_appointments

02). Student Details
Assignment type: Individual
Student ID: IT22349156
Student Name: Wijesinghe K A A N
Group Number: individual assignment - IT22349156@

03). Project Summary
This React Native and Expo application connects to a Node.js and Express API backed by MongoDB Atlas. Users can register and log in, browse and manage doctor profiles, upload doctor images, and create and manage their own appointments.

The two domain entities are Doctor (primary) and Appointment (related). User is used for authentication and is not counted as one of the two entities. The API rejects invalid or past appointment times and overlapping non-cancelled appointments for the same doctor. Cancelling an appointment frees that time slot.

04). Deployment Details
Backend URL: TBD (enter the deployed HTTPS API URL)
Mobile application: React Native / Expo; demonstrate using Expo Go or the configured app build.

05). Local Setup
Requirements: Node.js and npm.

Backend:
1. Copy backend/.env.example to backend/.env.
2. Set MONGODB_URI to the MongoDB Atlas connection string.
3. Set JWT_SECRET to a long random secret. Do not commit backend/.env.
4. From the backend directory, run: npm install
5. Start the API with: npm run dev
6. Check the API at: http://localhost:5000/api/health

Mobile app:
1. Copy mobile/.env.example to mobile/.env.
2. Set EXPO_PUBLIC_API_URL to the API base URL, for example http://localhost:5000/api for web on the same computer.
3. From the mobile directory, run: npm install
4. Start Expo with: npm run web (browser) or npm start (Expo Go).

06). Main API Routes
Authentication: POST /api/auth/register, POST /api/auth/login
Doctors: GET, POST /api/doctors; GET, PUT, DELETE /api/doctors/:id
Appointments: GET, POST /api/appointments; GET, PUT, DELETE /api/appointments/:id; PATCH /api/appointments/:id/status to cancel
Doctor and appointment routes require a JWT bearer token. Doctor image uploads use multipart field "image".

07). Submission Notes
Replace the student ID, student name, and backend URL placeholders before submission. Topic approval must be confirmed with the lecturer. This ZIP is a requested documentation package; confirm the required naming and submission format for the individual assignment with the lecturer.
