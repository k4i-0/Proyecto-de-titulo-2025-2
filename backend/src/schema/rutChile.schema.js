const joi = require("joi");

const schemaRutChile = joi
  .string()
  .pattern(/^\d{7,8}-[0-9kK]$/)
  .required();

module.exports = schemaRutChile;
