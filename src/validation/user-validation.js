import Joi from "joi";

const registerUserValidation = Joi.object({
  username: Joi.string().required().max(100),
  password: Joi.string().required().min(6).max(100),
  name: Joi.string().required().max(100),
});

const loginUserValidation = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const getUserValidation = Joi.string().max(100).required();

const updateUserValidation = Joi.object({
  username: Joi.string().required().max(100),
  password: Joi.string().max(100).optional(),
  name: Joi.string().max(100).optional(),
});

export {
  registerUserValidation,
  loginUserValidation,
  getUserValidation,
  updateUserValidation,
};
