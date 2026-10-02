# Clinic Connect

React Native (Expo) client and Express/MongoDB API for a clinic appointment app.

## Run locally

1. Copy `backend/.env.example` to `backend/.env`, then set a MongoDB Atlas connection string and a long random `JWT_SECRET`.
2. Start the API from `backend/` with `npm run dev`. It listens on port 5000.
3. Copy `mobile/.env.example` to `mobile/.env` and set `EXPO_PUBLIC_API_URL` to the API base URL. Use `http://localhost:5000/api` for web on the same computer, `http://10.0.2.2:5000/api` for the standard Android emulator, or your computer's LAN IP for a physical phone on the same network.
4. Start the client from `mobile/` with `npm start`.

The API health check is `GET /api/health`. The backend will not start until `MONGODB_URI` and `JWT_SECRET` are configured.

## API overview

Auth routes are public: `POST /api/auth/register` and `POST /api/auth/login`.

All doctor and appointment routes require `Authorization: Bearer <token>`.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/doctors?search=` | List/search doctors |
| GET | `/api/doctors/:id` | Read one doctor |
| POST | `/api/doctors` | Create doctor; optional multipart image field |
| PUT | `/api/doctors/:id` | Update doctor; optional multipart image field |
| DELETE | `/api/doctors/:id` | Delete doctor without active appointments |
| GET | `/api/appointments` | List signed-in user's appointments |
| GET | `/api/appointments/:id` | Read an owned appointment |
| POST | `/api/appointments` | Request appointment |
| PUT | `/api/appointments/:id` | Update an owned appointment |
| PATCH | `/api/appointments/:id/status` | Cancel an owned appointment |
| DELETE | `/api/appointments/:id` | Delete an owned appointment |

Appointment times are ISO date-time values. The API rejects past or invalid times and overlapping non-cancelled appointments for the same doctor. Doctor photos are limited to JPG, PNG, and WebP, up to 3 MB, and are served from `/uploads`.

For production, set the backend environment variables in the hosting provider and use a persistent or cloud-backed upload store because a host's local filesystem may be temporary. Configure the mobile API URL to the deployed HTTPS endpoint before releasing the app.