import Schedule from '../models/schedule.model.js';
import Appointment from '../models/appointment.model.js';
import { timeToMinutes, minutesToTime } from '../utils/timeHelper.js';
import { NotFoundError } from '../utils/appError.js';

export const getAvailableSlots = async (doctorId, date) => {
  const schedule = await Schedule.findOne({ doctor: doctorId });
  if (!schedule) {
    throw new NotFoundError('Doctor schedule not configured');
  }

  const targetDate = new Date(date);
  const dayOfWeek = targetDate.getUTCDay();

  if (!schedule.workingDays.includes(dayOfWeek)) {
    return [];
  }

  const slots = [];
  const duration = schedule.slotDuration;

  const breaks = schedule.breakTimings.map((b) => ({
    start: timeToMinutes(b.startTime),
    end: timeToMinutes(b.endTime)
  }));

  for (const session of schedule.sessions) {
    const sessionStart = timeToMinutes(session.startTime);
    const sessionEnd = timeToMinutes(session.endTime);

    for (let T = sessionStart; T + duration <= sessionEnd; T += duration) {
      const slotStart = T;
      const slotEnd = T + duration;

      const overlapsBreak = breaks.some(
        (b) => slotStart < b.end && slotEnd > b.start
      );

      if (overlapsBreak) {
        continue;
      }

      slots.push({
        startTime: minutesToTime(slotStart),
        endTime: minutesToTime(slotEnd),
        startMins: slotStart
      });
    }
  }

  const appointments = await Appointment.find({
    doctor: doctorId,
    date: targetDate,
    status: { $ne: 'cancelled' }
  });

  const bookedSlotStarts = new Set(appointments.map((app) => app.slot.startTime));

  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const isToday = targetDate.getTime() === todayUTC.getTime();

  const currentMins = now.getHours() * 60 + now.getMinutes();

  return slots.map((slot) => {
    const isBooked = bookedSlotStarts.has(slot.startTime);
    const isPast = isToday && slot.startMins < currentMins;
    
    return {
      startTime: slot.startTime,
      endTime: slot.endTime,
      isBooked,
      isPast,
      isAvailable: !isBooked && !isPast
    };
  });
};
