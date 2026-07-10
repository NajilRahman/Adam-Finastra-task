import Joi from 'joi';

const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

export const createAppointmentSchema = Joi.object({
  isNewPatient: Joi.boolean().required(),
  
  patientId: Joi.string().when('isNewPatient', {
    is: false,
    then: Joi.string().required().messages({ 'any.required': 'Patient ID is required for existing patient' }),
    otherwise: Joi.string().optional()
  }),

  patientName: Joi.string().when('isNewPatient', {
    is: true,
    then: Joi.string().required().messages({ 'any.required': 'Patient name is required for new patient' }),
    otherwise: Joi.string().optional()
  }),
  patientMobile: Joi.string().when('isNewPatient', {
    is: true,
    then: Joi.string().required().messages({ 'any.required': 'Patient mobile number is required for new patient' }),
    otherwise: Joi.string().optional()
  }),
  patientEmail: Joi.string().email().allow('').optional(),
  patientDob: Joi.date().when('isNewPatient', {
    is: true,
    then: Joi.date().required().messages({ 'any.required': 'Patient date of birth is required for new patient' }),
    otherwise: Joi.date().optional()
  }),
  patientGender: Joi.string().valid('male', 'female', 'other').when('isNewPatient', {
    is: true,
    then: Joi.string().required().messages({ 'any.required': 'Patient gender is required for new patient' }),
    otherwise: Joi.string().optional()
  }),

  doctor: Joi.string().hex().length(24).required().messages({
    'string.length': 'Invalid Doctor ID format',
    'any.required': 'Doctor ID is required'
  }),
  department: Joi.string().required().messages({
    'any.required': 'Department is required'
  }),
  date: Joi.string().isoDate().required().messages({
    'string.isoDate': 'Date must be in YYYY-MM-DD format',
    'any.required': 'Appointment date is required'
  }),
  slot: Joi.object({
    startTime: Joi.string().regex(timeRegex).required().messages({
      'string.pattern.base': 'Start time must be in HH:MM format',
      'any.required': 'Slot start time is required'
    }),
    endTime: Joi.string().regex(timeRegex).required().messages({
      'string.pattern.base': 'End time must be in HH:MM format',
      'any.required': 'Slot end time is required'
    })
  }).required(),
  purpose: Joi.string().min(3).required().messages({
    'string.min': 'Purpose must be at least 3 characters long',
    'any.required': 'Purpose is required'
  })
});

export const updateAppointmentSchema = Joi.object({
  purpose: Joi.string().min(3).optional(),
  notes: Joi.string().allow('').optional(),
  status: Joi.string().valid('scheduled', 'arrived', 'completed', 'cancelled').optional()
});

export const updateNotesSchema = Joi.object({
  notes: Joi.string().allow('').required().messages({
    'any.required': 'Notes field is required'
  })
});
