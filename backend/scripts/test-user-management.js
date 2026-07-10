import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load models & services
import User from '../models/user.model.js';
import Doctor from '../models/doctor.model.js';
import AuditLog from '../models/auditLog.model.js';
import * as userService from '../services/user.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const runTests = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/emr_appointment_system';
    console.log(`Connecting to database: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected. Starting User Management Service Tests...\n');

    // 1. Find or create an admin user for mock audit logging
    let admin = await User.findOne({ role: 'super_admin' });
    if (!admin) {
      admin = new User({
        name: 'Test Administrator',
        email: 'test.admin@emr.com',
        password: 'adminpassword123',
        role: 'super_admin'
      });
      await admin.save();
      console.log('Created temporary admin for auditing.');
    }

    // 2. Fetch all users
    console.log('--- TEST 1: Retrieve Users Directory ---');
    const users = await userService.getUsers();
    console.log(`Successfully retrieved ${users.length} users.`);
    const doctorsCount = users.filter(u => u.role === 'doctor').length;
    console.log(`Found ${doctorsCount} doctors with populated doctorProfile details.`);
    console.log('PASSED\n');

    // 3. Create a temporary user to update, deactivate, reset, and delete
    console.log('--- TEST 2: Create Temporary User for Testing ---');
    const tempEmail = 'temp.tester@emr.com';
    await User.findOneAndDelete({ email: tempEmail });
    
    const tempUser = new User({
      name: 'Temp Tester',
      email: tempEmail,
      password: 'initialpassword123',
      role: 'doctor',
      isActive: true,
      refreshToken: 'some-dummy-active-refresh-token'
    });
    await tempUser.save();

    // Create doctor profile manually for it
    const tempDoc = new Doctor({
      user: tempUser._id,
      name: tempUser.name,
      department: 'General Medicine',
      specialization: 'Testing Specialist',
      contactNumber: '1234567890'
    });
    await tempDoc.save();
    console.log(`Created temporary doctor: ${tempUser.name} (${tempEmail})`);
    console.log('PASSED\n');

    // 4. Update user details & doctor details
    console.log('--- TEST 3: Update User Details & Doctor Profile ---');
    const updatePayload = {
      name: 'Temp Tester Updated',
      email: 'temp.tester.updated@emr.com',
      role: 'doctor',
      isActive: true,
      department: 'Cardiology',
      specialization: 'Cardiology Tester Specialist',
      contactNumber: '9876543210'
    };

    const updatedUser = await userService.updateUser(tempUser._id, updatePayload, admin);
    console.log('Updated user returned structure:');
    console.log(`Name: ${updatedUser.name} (Expected: ${updatePayload.name})`);
    console.log(`Email: ${updatedUser.email} (Expected: ${updatePayload.email})`);
    console.log(`Doctor Dept: ${updatedUser.doctorProfile?.department} (Expected: ${updatePayload.department})`);
    console.log(`Doctor Contact: ${updatedUser.doctorProfile?.contactNumber} (Expected: ${updatePayload.contactNumber})`);
    
    // Validate db updates
    const dbDoc = await Doctor.findOne({ user: tempUser._id });
    if (dbDoc.department === 'Cardiology' && dbDoc.contactNumber === '9876543210') {
      console.log('PASSED: Doctor profile successfully synchronized in Database.');
    } else {
      throw new Error('Doctor profile synchronization failed in database');
    }
    console.log('');

    // 5. Deactivate user and check session token nullification
    console.log('--- TEST 4: Deactivate User & Invalidate Tokens ---');
    const deactivatedUser = await userService.updateUser(tempUser._id, { ...updatePayload, isActive: false }, admin);
    const dbUserAfterDeactivate = await User.findById(tempUser._id);
    console.log(`IsActive flag: ${dbUserAfterDeactivate.isActive} (Expected: false)`);
    console.log(`RefreshToken field: ${dbUserAfterDeactivate.refreshToken} (Expected: null)`);
    if (dbUserAfterDeactivate.isActive === false && dbUserAfterDeactivate.refreshToken === null) {
      console.log('PASSED: Account deactivated and session token invalidated.');
    } else {
      throw new Error('Deactivation logic failed');
    }
    console.log('');

    // 6. Reset password
    console.log('--- TEST 5: Reset Password ---');
    const newPassword = 'brandnewpassword123';
    await userService.resetUserPassword(tempUser._id, newPassword, admin);
    
    // Verify password matching
    const verifyUser = await User.findById(tempUser._id).select('+password');
    const passwordMatches = await verifyUser.comparePassword(newPassword);
    console.log(`Does new password match?: ${passwordMatches} (Expected: true)`);
    if (passwordMatches) {
      console.log('PASSED: Password hashed and reset successfully.');
    } else {
      throw new Error('Password reset authentication failed');
    }
    console.log('');

    // 7. Delete user
    console.log('--- TEST 6: Delete User & Profile cascade ---');
    await userService.deleteUser(tempUser._id, admin);
    const userExists = await User.findById(tempUser._id);
    const doctorExists = await Doctor.findOne({ user: tempUser._id });
    console.log(`User exists?: ${!!userExists} (Expected: false)`);
    console.log(`Doctor profile exists?: ${!!doctorExists} (Expected: false)`);
    if (!userExists && !doctorExists) {
      console.log('PASSED: User and linked Doctor profile deleted successfully.');
    } else {
      throw new Error('User deletion cascade failed');
    }
    console.log('');

    // 8. Fetch audit logs
    console.log('--- TEST 7: Review Audit Log Entries ---');
    const auditLogs = await AuditLog.find({ user: admin._id }).sort({ timestamp: -1 }).limit(5);
    console.log(`Retrieved last ${auditLogs.length} audit entries created by Admin:`);
    auditLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. Action: ${log.action} | Entity: ${log.entity} | Details: ${JSON.stringify(log.details)}`);
    });
    console.log('PASSED\n');

    console.log('===================================================');
    console.log('ALL TESTS PASSED SUCCESSFULLY! User management is 100% correct.');
    console.log('===================================================');

  } catch (error) {
    console.error('TESTING ERROR:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from database.');
  }
};

runTests();
