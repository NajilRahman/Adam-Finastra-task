import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load models
import User from '../models/user.model.js';
import Doctor from '../models/doctor.model.js';
import Schedule from '../models/schedule.model.js';
import Patient from '../models/patient.model.js';
import Appointment from '../models/appointment.model.js';
import AuditLog from '../models/auditLog.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

export const seedDB = async (shouldCloseConnection = true) => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/emr_appointment_system';
    if (mongoose.connection.readyState === 0) {
      console.log(`Connecting to database: ${mongoUri}`);
      await mongoose.connect(mongoUri);
    }
    // Check if database is already seeded by looking for the admin user
    const adminExists = await User.findOne({ email: 'admin@emr.com' });
    if (adminExists) {
      console.log('Database already seeded. Skipping cleanup and seed.');
      if (shouldCloseConnection) {
        mongoose.connection.close();
      }
      return;
    }

    console.log('Database is empty. Seeding initial data...');

    // 1. Create Super Admin
    const admin = new User({
      name: 'Adam Admin',
      email: 'admin@emr.com',
      password: 'admin123',
      role: 'super_admin'
    });
    await admin.save();
    console.log('Super Admin user created (admin@emr.com / admin123).');

    // 2. Create Receptionist
    const receptionist = new User({
      name: 'Ryan Receptionist',
      email: 'receptionist@emr.com',
      password: 'receptionist123',
      role: 'receptionist'
    });
    await receptionist.save();
    console.log('Receptionist user created (receptionist@emr.com / receptionist123).');

    // 3. Create Doctor 1 User & Profile
    const doctorUser1 = new User({
      name: 'Dr. Jane Smith',
      email: 'doctor.smith@emr.com',
      password: 'doctor123',
      role: 'doctor'
    });
    await doctorUser1.save();

    const doctorProfile1 = new Doctor({
      user: doctorUser1._id,
      name: 'Dr. Jane Smith',
      department: 'Cardiology',
      specialization: 'Interventional Cardiologist',
      contactNumber: '1234567890'
    });
    await doctorProfile1.save();
    console.log('Dr. Jane Smith created (doctor.smith@emr.com / doctor123).');

    // Configure Schedule 1
    const schedule1 = new Schedule({
      doctor: doctorProfile1._id,
      workingDays: [1, 2, 3, 4, 5], // Monday to Friday
      slotDuration: 15, // 15 mins
      sessions: [
        { name: 'Morning Session', startTime: '09:00', endTime: '12:00' },
        { name: 'Evening Session', startTime: '13:00', endTime: '17:00' }
      ],
      breakTimings: [
        { name: 'Lunch Break', startTime: '12:00', endTime: '13:00' }
      ]
    });
    await schedule1.save();
    console.log('Schedule configured for Dr. Jane Smith (09:00-12:00, 13:00-17:00, 15m slots).');

    // 4. Create Doctor 2 User & Profile
    const doctorUser2 = new User({
      name: 'Dr. John Jones',
      email: 'doctor.jones@emr.com',
      password: 'doctor123',
      role: 'doctor'
    });
    await doctorUser2.save();

    const doctorProfile2 = new Doctor({
      user: doctorUser2._id,
      name: 'Dr. John Jones',
      department: 'Pediatrics',
      specialization: 'Pediatric Pulmonologist',
      contactNumber: '9876543210'
    });
    await doctorProfile2.save();
    console.log('Dr. John Jones created (doctor.jones@emr.com / doctor123).');

    // Configure Schedule 2
    const schedule2 = new Schedule({
      doctor: doctorProfile2._id,
      workingDays: [1, 3, 5], // Monday, Wednesday, Friday
      slotDuration: 20, // 20 mins
      sessions: [
        { name: 'Morning Session', startTime: '10:00', endTime: '13:00' },
        { name: 'Evening Session', startTime: '14:00', endTime: '18:00' }
      ],
      breakTimings: [
        { name: 'Afternoon Tea Break', startTime: '13:00', endTime: '14:00' }
      ]
    });
    await schedule2.save();
    console.log('Schedule configured for Dr. John Jones (10:00-13:00, 14:00-18:00, 20m slots).');

    // 5. Create some sample Patients
    const patient1 = new Patient({
      patientId: 'P-20260710-1001',
      name: 'Alice Johnson',
      mobileNumber: '8888888888',
      email: 'alice@example.com',
      dateOfBirth: new Date('1990-05-15'),
      gender: 'female'
    });
    await patient1.save();

    const patient2 = new Patient({
      patientId: 'P-20260710-1002',
      name: 'Bob Miller',
      mobileNumber: '7777777777',
      email: 'bob@example.com',
      dateOfBirth: new Date('1985-11-22'),
      gender: 'male'
    });
    await patient2.save();
    console.log('Sample patients created (Alice Johnson, Bob Miller).');

    console.log('Database seeding complete successfully!');
    if (shouldCloseConnection) {
      mongoose.connection.close();
    }
  } catch (error) {
    console.error('Error during seeding:', error);
    if (shouldCloseConnection) {
      process.exit(1);
    }
  }
};

const nodePath = process.argv[1] ? path.resolve(process.argv[1]) : '';
const modulePath = fileURLToPath(import.meta.url);
if (nodePath === modulePath) {
  seedDB(true);
}
