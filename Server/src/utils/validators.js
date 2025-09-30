const Joi = require('joi');

exports.signupSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().optional(),
  provider: Joi.string().valid('email', 'google', 'linkedin', 'github', 'apple').default('email')
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

exports.eventSchema = Joi.object({
  title: Joi.string().required(),
  slug: Joi.string().alphanum().min(3).max(50).required(),
  description: Joi.string().optional(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  registrationDeadline: Joi.date().optional(),
  locationType: Joi.string().valid('online','offline','hybrid').default('online'),
  location: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  prizes: Joi.array().items(Joi.object({
    title: Joi.string().required(),
    amount: Joi.number().required()
  })).optional()
});

exports.jobSchema = Joi.object({
  title: Joi.string().required(),
  slug: Joi.string().alphanum().min(3).max(50).required(),
  companyName: Joi.string().required(),
  description: Joi.string().required(),
  jobType: Joi.string().valid('full-time','part-time','internship','contract').required(),
  experienceLevel: Joi.string().valid('fresher','junior','mid','senior').required(),
  locationType: Joi.string().valid('remote','onsite','hybrid').required(),
  salary: Joi.object({
    min: Joi.number().required(),
    max: Joi.number().required(),
    currency: Joi.string().default("INR")
  }).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  applicationDeadline: Joi.date().optional()
});
