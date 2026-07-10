import Joi from 'joi';

const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

export const createDoctorSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  department: Joi.string().required(),
  specialization: Joi.string().required(),
  contactNumber: Joi.string().required()
});

export const createReceptionistSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export const configureScheduleSchema = Joi.object({
  workingDays: Joi.array().items(Joi.number().min(0).max(6)).min(1).required().messages({
    'array.min': 'At least one working day must be configured',
    'any.required': 'Working days are required'
  }),
  slotDuration: Joi.number().min(5).max(120).required().messages({
    'number.min': 'Slot duration must be at least 5 minutes',
    'any.required': 'Slot duration is required'
  }),
  sessions: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      startTime: Joi.string().regex(timeRegex).required(),
      endTime: Joi.string().regex(timeRegex).required()
    })
  ).min(1).required().messages({
    'array.min': 'At least one session must be configured',
    'any.required': 'Sessions are required'
  }),
  breakTimings: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      startTime: Joi.string().regex(timeRegex).required(),
      endTime: Joi.string().regex(timeRegex).required()
    })
  ).optional().default([])
});
