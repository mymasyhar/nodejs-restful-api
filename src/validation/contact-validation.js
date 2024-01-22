import Joi from "joi";

const createContactValidation = Joi.object({
  firstName: Joi.string().required().max(100),
  lastName: Joi.string().optional().max(100),
  email: Joi.string().optional().max(100).email(),
  phone: Joi.string().optional().max(20),
});

const getContactValidation = Joi.number().positive().required();

const updateContactValidation = Joi.object({
  id: Joi.number().positive().required(),
  firstName: Joi.string().required().max(100),
  lastName: Joi.string().optional().max(100),
  email: Joi.string().optional().max(100).email(),
  phone: Joi.string().optional().max(20),
});

const searchContactValidation = Joi.object({
  page: Joi.number().positive().min(1).default(1),
  size: Joi.number().positive().min(1).max(100).default(10),
  name: Joi.string().optional(),
  email: Joi.string().optional(),
  phone: Joi.string().optional(),
});

export {
  createContactValidation,
  getContactValidation,
  updateContactValidation,
  searchContactValidation,
};
