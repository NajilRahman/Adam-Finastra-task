import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required'],
      index: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required'],
      index: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true
    },
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
      index: true
    },
    slot: {
      startTime: {
        type: String,
        required: [true, 'Slot start time is required'],
        match: [/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format']
      },
      endTime: {
        type: String,
        required: [true, 'Slot end time is required'],
        match: [/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format']
      }
    },
    status: {
      type: String,
      enum: ['scheduled', 'arrived', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true
    },
    purpose: {
      type: String,
      required: [true, 'Purpose of appointment is required'],
      trim: true
    },
    notes: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// CONCURRENCY CONTROL: Compound Partial Unique Index
// Prevents duplicate active bookings for the same doctor, date, and time slot.
// Cancelled appointments are ignored, allowing the slot to be booked again.
appointmentSchema.index(
  { doctor: 1, date: 1, 'slot.startTime': 1 },
  { 
    unique: true, 
    partialFilterExpression: { status: { $in: ['scheduled', 'arrived', 'completed'] } } 
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
