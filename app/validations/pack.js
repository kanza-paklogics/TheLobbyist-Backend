const Joi = require("joi");

const Schema = Joi.object({
  pack_name: Joi.string().not().empty().required(),
  pack_id: Joi.string().not().empty().required(),
  no_cards: Joi.string().not().empty().required(),
  metadata: Joi.string().allow("", null),
});

const packValidation = async (data) => {
  // console.log(data);
  
  const result = await Schema.validate(data);
  return result;
};

module.exports = packValidation;
