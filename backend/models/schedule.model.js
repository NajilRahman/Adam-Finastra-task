import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Session name is required']
  },
  startTime: {
    type: String,
    required: [true, 'Session start time is required'],
    match: [/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format']
  },
  endTime: {
    type: String,
    required: [true, 'Session end time is required'],
    match: [/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format']
  }
}, { _id: false });

const breakSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Break name is required']
  },
  startTime: {
    type: String,
    required: [true, 'Break start time is required'],
    match: [/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format']
  },
  endTime: {
    type: String,
    required: [true, 'Break end time is required'],
    match: [/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format']
  }
}, { _id: false });

const scheduleSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Schedule must be linked to a Doctor'],
      unique: true,
      index: true
    },
    workingDays: {
      type: [Number], // 0 for Sunday, 1 for Monday, etc.
      required: [true, 'Working days are required'],
      validate: {
        validator: function (val) {
          return val.every(day => day >= 0 && day <= 6);
        },
        message: 'Working days must be integers between 0 (Sunday) and 6 (Saturday)'
      }
    },
    slotDuration: {
      type: Number,
      required: [true, 'Slot duration is required'],
      min: [5, 'Slot duration must be at least 5 minutes']
    },
    sessions: {
      type: [sessionSchema],
      required: [true, 'Sessions are required'],
      validate: {
        validator: function (val) {
          return val.length > 0;
        },
        message: 'Must configure at least one session'
      }
    },
    breakTimings: {
      type: [breakSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const Schedule = mongoose.model('Schedule', scheduleSchema);
export default Schedule;
