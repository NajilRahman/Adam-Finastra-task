import express from 'express';
import * as doctorController from '../controllers/doctor.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/rbac.middleware.js';
import validate from '../middlewares/validator.middleware.js';
import {
  createDoctorSchema,
  createReceptionistSchema,
  configureScheduleSchema
} from '../validators/doctor.validator.js';

const router = express.Router();

// All doctor routes are protected
router.use(protect);

// Retrieve all doctor profiles (Accessible to all authenticated staff)
router.get('/', doctorController.getDoctorsList);

// Retrieve doctor schedule (Accessible to all authenticated staff)
router.get('/:id/schedule', doctorController.getSchedule);

// Manage doctor account & receptionist account creation (Super Admin only)
router.post(
  '/',
  restrictTo('super_admin'),
  validate(createDoctorSchema),
  doctorController.createDoctor
);

router.post(
  '/receptionists',
  restrictTo('super_admin'),
  validate(createReceptionistSchema),
  doctorController.createReceptionist
);

// Manage schedules (Super Admin only)
router.post(
  '/:id/schedule',
  restrictTo('super_admin'),
  validate(configureScheduleSchema),
  doctorController.configureSchedule
);

export default router;
