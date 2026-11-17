require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('node:path');
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = Number(process.env.PORT) || 5000;
const uploadDirectory = path.resolve(__dirname, '../uploads');
const allowedOrigins = new Set((process.env.CLIENT_ORIGIN || '').split(',').map((origin) => origin.trim()).filter(Boolean));

app.use(cors({
  origin: (origin, callback) => {
    const isLocalDevelopmentOrigin = process.env.NODE_ENV !== 'production'
      && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '');
    if (!origin || isLocalDevelopmentOrigin || allowedOrigins.size === 0 || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by CORS.'));
  },
}));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadDirectory));

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use((request, response) => response.status(404).json({ message: 'Route not found.' }));
app.use(errorHandler);

async function start() {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    throw new Error('Set MONGODB_URI and JWT_SECRET in backend/.env before starting the API.');
  }
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, '0.0.0.0', () => console.log(`Clinic API listening on port ${port}`));
}

start().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});