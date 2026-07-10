import * as appointmentService from '../services/appointment.service.js';
import catchAsync from '../utils/catchAsync.js';

export const createAppointment = catchAsync(async (req, res) => {
  // Pass req.user for logging user audit trails
  const appointment = await appointmentService.createAppointment(req.body, req.user);

  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully',
    data: appointment
  });
});

export const getAppointments = catchAsync(async (req, res) => {
  // If doctor, restrict filtering only to their own appointments
  // Unless receptionist or admin is requesting.
  const filters = { ...req.query };
  
  if (req.user.role === 'doctor') {
    // Look up the doctor profile associated with this user
    const doctorProfile = await appointmentService.getAppointments({ doctorSearch: req.user.name }); // Wait, we can get doctor profile in doctor service!
    // Actually, in the appointment service we check this during notes update. 
    // Let's pass the requester context to the appointment service so it can apply the doctor filter automatically if role is doctor!
    filters.requesterRole = req.user.role;
    filters.requesterUserId = req.user._id;
  }

  const result = await appointmentService.getAppointments(filters);

  res.status(200).json({
    success: true,
    message: 'Appointments list retrieved successfully',
    data: result.appointments,
    meta: result.meta
  });
});

export const updateAppointment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const appointment = await appointmentService.updateAppointment(id, req.body, req.user);

  res.status(200).json({
    success: true,
    message: 'Appointment updated successfully',
    data: appointment
  });
});

export const markArrived = catchAsync(async (req, res) => {
  const { id } = req.params;
  const appointment = await appointmentService.markPatientArrived(id, req.user);

  res.status(200).json({
    success: true,
    message: 'Patient marked as arrived',
    data: appointment
  });
});

export const cancelAppointment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const appointment = await appointmentService.cancelAppointment(id, req.user);

  res.status(200).json({
    success: true,
    message: 'Appointment cancelled successfully',
    data: appointment
  });
});
