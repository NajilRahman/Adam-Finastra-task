import mongoose from 'mongoose';
import Patient from '../models/patient.model.js';
import Doctor from '../models/doctor.model.js';
import Appointment from '../models/appointment.model.js';
import { getAvailableSlots } from './slot.service.js';
import { logAction } from './audit.service.js';
import { broadcast } from '../config/socket.js';
import { BadRequestError, ConflictError, NotFoundError } from '../utils/appError.js';
import { generatePatientId } from '../utils/idGenerator.js';

export const createAppointment = async (bookingData, userContext) => {
  const {
    isNewPatient,
    patientId,
    patientName,
    patientMobile,
    patientEmail,
    patientDob,
    patientGender,
    doctor: doctorId,
    department,
    date,
    slot,
    purpose
  } = bookingData;

  // 1. Verify doctor exists
  const doctorExists = await Doctor.findById(doctorId);
  if (!doctorExists) {
    throw new NotFoundError('Selected doctor does not exist');
  }

  // 2. Validate slot availability
  const availableSlots = await getAvailableSlots(doctorId, date);
  const matchedSlot = availableSlots.find((s) => s.startTime === slot.startTime);
  
  if (!matchedSlot) {
    throw new BadRequestError('The requested slot is not in the doctor schedule');
  }
  if (!matchedSlot.isAvailable) {
    throw new ConflictError('The requested slot is already booked or in the past');
  }

  // 3. Resolve Patient record
  let patient;
  if (isNewPatient) {
    // Verify uniqueness of mobile number
    const existingPatient = await Patient.findOne({ mobileNumber: patientMobile });
    if (existingPatient) {
      throw new ConflictError(`A patient with mobile number ${patientMobile} already exists. Patient ID is ${existingPatient.patientId}`);
    }

    patient = new Patient({
      patientId: generatePatientId(),
      name: patientName,
      mobileNumber: patientMobile,
      email: patientEmail || '',
      dateOfBirth: new Date(patientDob),
      gender: patientGender
    });
    await patient.save();
  } else {
    patient = await Patient.findOne({ patientId });
    if (!patient) {
      throw new NotFoundError(`Patient with ID ${patientId} not found`);
    }
  }

  // 4. Create the Appointment (Second Layer Defense - Unique Compound Index will block simultaneous race conditions)
  const appointment = new Appointment({
    patient: patient._id,
    doctor: doctorId,
    department,
    date: new Date(date),
    slot: {
      startTime: slot.startTime,
      endTime: slot.endTime
    },
    purpose,
    status: 'scheduled'
  });

  await appointment.save();

  // Populate data for response and socket broadcast
  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('patient')
    .populate('doctor');

  // 5. Audit Logging
  await logAction(
    userContext._id,
    userContext.role,
    'APPOINTMENT_CREATED',
    'Appointment',
    appointment._id,
    { patientId: patient.patientId, doctorId, date, slot: slot.startTime }
  );

  // 6. Broadcast Real-Time Socket Event
  broadcast('appointment:created', populatedAppointment);

  return populatedAppointment;
};

export const getAppointments = async (queryFilters) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status,
    department,
    doctor: doctorId,
    patientSearch,
    doctorSearch,
    mobileSearch,
    startDate,
    endDate
  } = queryFilters;

  const mongoFilter = {};

  // Secure RBAC: Force Doctor role to only query their own appointments
  if (queryFilters.requesterRole === 'doctor') {
    const doctorProfile = await Doctor.findOne({ user: queryFilters.requesterUserId });
    if (doctorProfile) {
      mongoFilter.doctor = doctorProfile._id;
    } else {
      mongoFilter.doctor = new mongoose.Types.ObjectId(); // Non-matching dummy ID
    }
  } else if (doctorId) {
    mongoFilter.doctor = doctorId;
  }

  // Exact Match Filters
  if (status) mongoFilter.status = status;
  if (department) mongoFilter.department = department;

  // Date Range Filter
  if (startDate || endDate) {
    mongoFilter.date = {};
    if (startDate) mongoFilter.date.$gte = new Date(startDate);
    if (endDate) mongoFilter.date.$lte = new Date(endDate);
  }

  // Patient Name/ID Search
  if (patientSearch) {
    const patients = await Patient.find({
      $or: [
        { name: { $regex: patientSearch, $options: 'i' } },
        { patientId: { $regex: patientSearch, $options: 'i' } }
      ]
    }).select('_id');
    const patientIds = patients.map((p) => p._id);
    mongoFilter.patient = { $in: patientIds };
  }

  // Mobile Search
  if (mobileSearch) {
    const patients = await Patient.find({
      mobileNumber: { $regex: mobileSearch }
    }).select('_id');
    const patientIds = patients.map((p) => p._id);
    mongoFilter.patient = { $in: patientIds };
  }

  // Doctor Name Search
  if (doctorSearch) {
    const doctors = await Doctor.find({
      name: { $regex: doctorSearch, $options: 'i' }
    }).select('_id');
    const doctorIds = doctors.map((d) => d._id);
    mongoFilter.doctor = { $in: doctorIds };
  }

  // Pagination calculation
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortDirection = sortOrder === 'desc' ? -1 : 1;

  // Execute queries
  const appointments = await Appointment.find(mongoFilter)
    .sort({ [sortBy]: sortDirection })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('patient')
    .populate('doctor');

  const total = await Appointment.countDocuments(mongoFilter);

  return {
    appointments,
    meta: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    }
  };
};

export const updateAppointment = async (id, updateData, userContext) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }

  // Handle notes update by Doctor role
  if (userContext.role === 'doctor') {
    // Verify the doctor is updating their own appointment
    const doctorProfile = await Doctor.findOne({ user: userContext._id });
    if (!doctorProfile || String(appointment.doctor) !== String(doctorProfile._id)) {
      throw new BadRequestError('Doctors can only view and update their own appointments');
    }
    
    if (updateData.notes !== undefined) appointment.notes = updateData.notes;
    // Complete appointment automatically if notes are updated or explicitly closed
    if (updateData.status === 'completed') {
      appointment.status = 'completed';
    }
  } else {
    // Super Admin or Receptionist edits
    if (updateData.purpose) appointment.purpose = updateData.purpose;
    if (updateData.status) {
      // Validate workflow transitions
      const current = appointment.status;
      const target = updateData.status;

      if (current === 'completed' || current === 'cancelled') {
        throw new BadRequestError(`Cannot change status of a ${current} appointment`);
      }

      if (target === 'completed' && current !== 'arrived') {
        throw new BadRequestError('Patient must arrive before consultation is completed');
      }

      appointment.status = target;
    }
  }

  await appointment.save();

  const populated = await Appointment.findById(id)
    .populate('patient')
    .populate('doctor');

  await logAction(
    userContext._id,
    userContext.role,
    'APPOINTMENT_UPDATED',
    'Appointment',
    appointment._id,
    { status: appointment.status, notesUpdated: updateData.notes !== undefined }
  );

  broadcast('appointment:updated', populated);

  return populated;
};

export const markPatientArrived = async (id, userContext) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }

  if (appointment.status !== 'scheduled') {
    throw new BadRequestError(`Only scheduled appointments can be marked as arrived. Current: ${appointment.status}`);
  }

  appointment.status = 'arrived';
  await appointment.save();

  const populated = await Appointment.findById(id)
    .populate('patient')
    .populate('doctor');

  await logAction(
    userContext._id,
    userContext.role,
    'APPOINTMENT_UPDATED',
    'Appointment',
    appointment._id,
    { action: 'ARRIVED', previousStatus: 'scheduled' }
  );

  broadcast('appointment:updated', populated);

  return populated;
};

export const cancelAppointment = async (id, userContext) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }

  if (appointment.status === 'completed' || appointment.status === 'cancelled') {
    throw new BadRequestError(`Cannot cancel a ${appointment.status} appointment`);
  }

  appointment.status = 'cancelled';
  await appointment.save();

  const populated = await Appointment.findById(id)
    .populate('patient')
    .populate('doctor');

  await logAction(
    userContext._id,
    userContext.role,
    'APPOINTMENT_CANCELLED',
    'Appointment',
    appointment._id
  );

  broadcast('appointment:cancelled', {
    _id: appointment._id,
    doctor: appointment.doctor,
    date: appointment.date,
    slot: appointment.slot,
    status: 'cancelled'
  });

  return populated;
};

export const searchPatients = async (q) => {
  if (!q) return [];
  return await Patient.find({
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { patientId: { $regex: q, $options: 'i' } },
      { mobileNumber: { $regex: q } }
    ]
  });
};

export const createPatient = async (patientData) => {
  const { name, mobileNumber, email, dateOfBirth, gender } = patientData;
  
  const existing = await Patient.findOne({ mobileNumber });
  if (existing) {
    throw new ConflictError(`Patient with mobile number ${mobileNumber} already exists`);
  }

  const patient = new Patient({
    patientId: generatePatientId(),
    name,
    mobileNumber,
    email: email || '',
    dateOfBirth: new Date(dateOfBirth),
    gender
  });
  
  return await patient.save();
};
