import * as doctorService from '../services/doctor.service.js';
import catchAsync from '../utils/catchAsync.js';

export const createDoctor = catchAsync(async (req, res) => {
  const doctor = await doctorService.createDoctor(req.body);
  res.status(201).json({
    success: true,
    message: 'Doctor account and profile created successfully',
    data: doctor
  });
});

export const createReceptionist = catchAsync(async (req, res) => {
  const receptionist = await doctorService.createReceptionist(req.body);
  res.status(201).json({
    success: true,
    message: 'Receptionist account created successfully',
    data: receptionist
  });
});

export const getDoctorsList = catchAsync(async (req, res) => {
  const doctors = await doctorService.getDoctors();
  res.status(200).json({
    success: true,
    message: 'Doctors list retrieved successfully',
    data: doctors
  });
});

export const configureSchedule = catchAsync(async (req, res) => {
  const { id: doctorId } = req.params;
  const schedule = await doctorService.configureSchedule(doctorId, req.body);
  res.status(200).json({
    success: true,
    message: 'Doctor schedule configured successfully',
    data: schedule
  });
});

export const getSchedule = catchAsync(async (req, res) => {
  const { id: doctorId } = req.params;
  const schedule = await doctorService.getScheduleByDoctorId(doctorId);
  res.status(200).json({
    success: true,
    message: 'Doctor schedule retrieved successfully',
    data: schedule
  });
});
