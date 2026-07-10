import express from 'express';
import * as appointmentController from '../controllers/appointment.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/rbac.middleware.js';
import validate from '../middlewares/validator.middleware.js';
import {
  createAppointmentSchema,
  updateAppointmentSchema
} from '../validators/appointment.validator.js';

const router = express.Router();

// All appointment routes require authentication
router.use(protect);

// Retrieve appointment list (Doctors filtered to own, Receptionists & Admins get full access)
router.get('/', appointmentController.getAppointments);

// Patient Search & Registration (Receptionist & Super Admin only)
router.get('/patients/search', restrictTo('receptionist', 'super_admin'), appointmentController.searchPatients);
router.post('/patients', restrictTo('receptionist', 'super_admin'), appointmentController.createPatient);

// Create new appointment (Receptionist & Super Admin only)
router.post(
  '/',
  restrictTo('receptionist', 'super_admin'),
  validate(createAppointmentSchema),
  appointmentController.createAppointment
);

// Update appointment notes / status (Super Admin, Receptionist, Doctor)
router.put(
  '/:id',
  restrictTo('super_admin', 'receptionist', 'doctor'),
  validate(updateAppointmentSchema),
  appointmentController.updateAppointment
);

// Mark Patient as Arrived (Receptionist & Super Admin only)
router.post(
  '/:id/arrive',
  restrictTo('receptionist', 'super_admin'),
  appointmentController.markArrived
);

// Cancel Appointment (Receptionist & Super Admin only)
router.delete(
  '/:id',
  restrictTo('receptionist', 'super_admin'),
  appointmentController.cancelAppointment
);

export default router;
