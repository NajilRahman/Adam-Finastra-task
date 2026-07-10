import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load models
import Doctor from '../models/doctor.model.js';
import Patient from '../models/patient.model.js';
import Appointment from '../models/appointment.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const runConcurrencyTest = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/emr_appointment_system';
    console.log(`Connecting to database: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    // Ensure database indexes are compiled and built before running checks
    await Appointment.init();

    // Get a Doctor and two Patients
    const doctor = await Doctor.findOne({ name: 'Dr. Jane Smith' });
    if (!doctor) {
      console.error('Doctor "Dr. Jane Smith" not found. Please run seed script first.');
      process.exit(1);
    }

    const patientAlice = await Patient.findOne({ name: 'Alice Johnson' });
    const patientBob = await Patient.findOne({ name: 'Bob Miller' });

    if (!patientAlice || !patientBob) {
      console.error('Patients not found. Please run seed script first.');
      process.exit(1);
    }

    // Set a date for the test appointment (e.g. next Monday)
    const testDate = new Date();
    testDate.setUTCHours(0, 0, 0, 0);
    // Ensure we don't conflict with existing bookings by deleting any previous test bookings
    await Appointment.deleteMany({
      doctor: doctor._id,
      date: testDate,
      'slot.startTime': '09:00'
    });

    console.log('\n--- Starting Concurrency Test ---');
    console.log(`Doctor: ${doctor.name}`);
    console.log(`Date: ${testDate.toISOString().split('T')[0]}`);
    console.log(`Slot: 09:00 - 09:15`);
    console.log('Spawning two simultaneous booking requests...');

    // Prepare two conflicting appointments
    const booking1 = new Appointment({
      patient: patientAlice._id,
      doctor: doctor._id,
      department: doctor.department,
      date: testDate,
      slot: { startTime: '09:00', endTime: '09:15' },
      purpose: 'Alice routine checkup',
      status: 'scheduled'
    });

    const booking2 = new Appointment({
      patient: patientBob._id,
      doctor: doctor._id,
      department: doctor.department,
      date: testDate,
      slot: { startTime: '09:00', endTime: '09:15' },
      purpose: 'Bob cardiology consultation',
      status: 'scheduled'
    });

    // Run parallel inserts
    const results = await Promise.allSettled([
      booking1.save(),
      booking2.save()
    ]);

    let successCount = 0;
    let failCount = 0;
    let failError = null;

    results.forEach((res, index) => {
      const patientName = index === 0 ? 'Alice Johnson' : 'Bob Miller';
      if (res.status === 'fulfilled') {
        console.log(`[SUCCESS] Booking for ${patientName} succeeded!`);
        successCount++;
      } else {
        console.log(`[REJECTED] Booking for ${patientName} failed.`);
        console.log(`Reason: ${res.reason.message}`);
        failCount++;
        failError = res.reason;
      }
    });

    console.log('\n--- Test Summary ---');
    console.log(`Successful Bookings: ${successCount}`);
    console.log(`Failed Bookings: ${failCount}`);

    if (successCount === 1 && failCount === 1) {
      console.log('\n[PASS] Concurrency check succeeded!');
      console.log('MongoDB Compound Partial Unique Index successfully prevented double booking of the same slot.');
    } else {
      console.log('\n[FAIL] Concurrency check failed.');
      console.log('Expected exactly 1 success and 1 rejection.');
    }

    // Clean up our test booking
    await Appointment.deleteMany({
      doctor: doctor._id,
      date: testDate,
      'slot.startTime': '09:00'
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
};

runConcurrencyTest();
