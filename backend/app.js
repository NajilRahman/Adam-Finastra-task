import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import errorHandler from './middlewares/error.middleware.js';
import { NotFoundError } from './utils/appError.js';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import slotRoutes from './routes/slot.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/slots', slotRoutes);
app.use('/api/v1/appointments', appointmentRoutes);

// Fallback for undefined routes
app.all('/*', (req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
});

// Centralized error middleware
app.use(errorHandler);

export default app;
