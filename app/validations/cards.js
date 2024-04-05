const Joi = require("joi");

const Schema = Joi.object({
  card_name: Joi.string().not().empty().required(),
  card_image: Joi.string().not().empty().required(),
  metadata: Joi.string().not().empty().required(),
 
});

const cardValidation = async (data) => {
  // console.log(data);
  const result = await Schema.validate(data);
  return result;
};

module.exports = cardValidation;
