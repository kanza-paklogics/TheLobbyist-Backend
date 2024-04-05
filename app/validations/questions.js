const Joi = require("joi");

/**
 *  JOI SCHEMA TO VERIFY QUESTION DATA
 */
const Schema = Joi.object({
  statements: Joi.string().not().empty().required(),
  // options: Joi.array().length(7).not().empty().required(),
  options: Joi.object().keys({
    options: Joi.array().items(Joi.string()).min(4).max(6).required(),
  }),
  fun_fact: Joi.string().not().empty().required(),
  answers: Joi.string().not().empty().required(),
  code: Joi.string().not().empty().required(),
  images: Joi.array().not().empty().required(),
  // card_image: Joi.array().items(Joi.string()).not().empty().required(),
});

const questionValidation = async (data) => {
  // console.log(data);
  const result = await Schema.validate(data);
  return result;
};

module.exports = questionValidation;
