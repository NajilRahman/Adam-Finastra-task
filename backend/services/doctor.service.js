import User from '../models/user.model.js';
import Doctor from '../models/doctor.model.js';
import Schedule from '../models/schedule.model.js';
import { ConflictError, NotFoundError } from '../utils/appError.js';
import logger from '../utils/logger.js';

export const createDoctor = async (doctorData) => {
  const { name, email, password, department, specialization, contactNumber } = doctorData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError('A user with this email already exists');
  }

  const user = new User({
    name,
    email,
    password,
    role: 'doctor'
  });

  await user.save();

  try {
    const doctor = new Doctor({
      user: user._id,
      name,
      department,
      specialization,
      contactNumber
    });

    await doctor.save();
    return doctor;
  } catch (error) {
    logger.error('Doctor profile creation failed. Rolling back user creation:', error);
    await User.findByIdAndDelete(user._id);
    throw error;
  }
};

export const createReceptionist = async (receptionistData) => {
  const { name, email, password } = receptionistData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError('A user with this email already exists');
  }

  const user = new User({
    name,
    email,
    password,
    role: 'receptionist'
  });

  await user.save();
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};

export const getDoctors = async (filter = {}) => {
  return await Doctor.find(filter).populate('user', 'email isActive');
};

export const getDoctorById = async (id) => {
  const doctor = await Doctor.findById(id).populate('user', 'email isActive');
  if (!doctor) {
    throw new NotFoundError('Doctor not found');
  }
  return doctor;
};

export const getDoctorByUserId = async (userId) => {
  const doctor = await Doctor.findOne({ user: userId });
  if (!doctor) {
    throw new NotFoundError('Doctor profile not found');
  }
  return doctor;
};

export const configureSchedule = async (doctorId, scheduleData) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new NotFoundError('Doctor not found');
  }

  const { workingDays, slotDuration, sessions, breakTimings } = scheduleData;

  let schedule = await Schedule.findOne({ doctor: doctorId });

  if (schedule) {
    schedule.workingDays = workingDays;
    schedule.slotDuration = slotDuration;
    schedule.sessions = sessions;
    schedule.breakTimings = breakTimings;
  } else {
    schedule = new Schedule({
      doctor: doctorId,
      workingDays,
      slotDuration,
      sessions,
      breakTimings
    });
  }

  await schedule.save();
  return schedule;
};

export const getScheduleByDoctorId = async (doctorId) => {
  const schedule = await Schedule.findOne({ doctor: doctorId });
  if (!schedule) {
    throw new NotFoundError('No schedule configured for this doctor');
  }
  return schedule;
};
