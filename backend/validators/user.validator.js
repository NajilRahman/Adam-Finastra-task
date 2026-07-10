import Joi from 'joi';

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('super_admin', 'receptionist', 'doctor').required(),
  isActive: Joi.boolean().required(),
  // Conditional fields if role is doctor
  department: Joi.string().when('role', { is: 'doctor', then: Joi.required(), otherwise: Joi.optional() }),
  specialization: Joi.string().when('role', { is: 'doctor', then: Joi.required(), otherwise: Joi.optional() }),
  contactNumber: Joi.string().when('role', { is: 'doctor', then: Joi.required(), otherwise: Joi.optional() })
});

export const toggleStatusSchema = Joi.object({
  isActive: Joi.boolean().required()
});

export const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required()
});
