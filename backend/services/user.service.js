import User from '../models/user.model.js';
import Doctor from '../models/doctor.model.js';
import { ConflictError, NotFoundError } from '../utils/appError.js';
import { logAction } from './audit.service.js';
import bcrypt from 'bcryptjs';

export const getUsers = async (filter = {}) => {
  const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).lean();
  const doctors = await Doctor.find().lean();

  const doctorMap = {};
  doctors.forEach(doc => {
    doctorMap[doc.user.toString()] = doc;
  });

  return users.map(user => {
    if (user.role === 'doctor') {
      user.doctorProfile = doctorMap[user._id.toString()] || null;
    }
    return user;
  });
};

export const getUserById = async (id) => {
  const user = await User.findById(id).select('-password').lean();
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: id }).lean();
    user.doctorProfile = doctor || null;
  }

  return user;
};

export const updateUser = async (id, updateData, adminUser) => {
  const { name, email, role, isActive, department, specialization, contactNumber } = updateData;

  const user = await User.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Check email conflict
  if (email && email.toLowerCase() !== user.email.toLowerCase()) {
    const existing = await User.findOne({ email });
    if (existing) {
      throw new ConflictError('Email is already in use by another user');
    }
    user.email = email;
  }

  const prevActive = user.isActive;
  
  user.name = name ?? user.name;
  user.role = role ?? user.role;
  user.isActive = isActive ?? user.isActive;

  // Deactivation logic: clear refresh token to force logout
  if (user.isActive === false && prevActive === true) {
    user.refreshToken = null;
  }

  await user.save();

  // Handle doctor profile updates if user role is doctor
  let doctorProfile = null;
  if (user.role === 'doctor') {
    let doctor = await Doctor.findOne({ user: user._id });
    if (doctor) {
      doctor.name = user.name;
      doctor.department = department ?? doctor.department;
      doctor.specialization = specialization ?? doctor.specialization;
      doctor.contactNumber = contactNumber ?? doctor.contactNumber;
      await doctor.save();
      doctorProfile = doctor;
    } else {
      // Create new doctor profile if it didn't exist
      doctor = new Doctor({
        user: user._id,
        name: user.name,
        department: department || 'General Medicine',
        specialization: specialization || 'General Practitioner',
        contactNumber: contactNumber || 'N/A'
      });
      await doctor.save();
      doctorProfile = doctor;
    }
  }

  // Log audit trail
  let action = 'USER_UPDATED';
  if (prevActive !== user.isActive) {
    action = user.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED';
  }

  await logAction(
    adminUser._id,
    adminUser.role,
    action,
    'User',
    user._id,
    { email: user.email, name: user.name, role: user.role }
  );

  const result = user.toObject();
  delete result.password;
  if (user.role === 'doctor') {
    result.doctorProfile = doctorProfile;
  }

  return result;
};

export const toggleUserStatus = async (id, isActive, adminUser) => {
  const user = await User.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const prevActive = user.isActive;
  user.isActive = isActive;

  if (isActive === false) {
    user.refreshToken = null;
  }

  await user.save();

  const action = isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED';
  await logAction(
    adminUser._id,
    adminUser.role,
    action,
    'User',
    user._id,
    { email: user.email, name: user.name }
  );

  const result = user.toObject();
  delete result.password;
  return result;
};

export const resetUserPassword = async (id, password, adminUser) => {
  const user = await User.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Set new password (pre-save hook will hash it)
  user.password = password;
  // Also clear current session token so they must log in with the new password
  user.refreshToken = null;
  await user.save();

  await logAction(
    adminUser._id,
    adminUser.role,
    'USER_PASSWORD_RESET',
    'User',
    user._id,
    { email: user.email }
  );

  return { id: user._id, email: user.email, message: 'Password reset successfully' };
};

export const deleteUser = async (id, adminUser) => {
  const user = await User.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // If doctor, delete profile
  if (user.role === 'doctor') {
    await Doctor.findOneAndDelete({ user: id });
  }

  await User.findByIdAndDelete(id);

  await logAction(
    adminUser._id,
    adminUser.role,
    'USER_DELETED',
    'User',
    id,
    { email: user.email, name: user.name, role: user.role }
  );

  return { id, message: 'User deleted successfully' };
};
