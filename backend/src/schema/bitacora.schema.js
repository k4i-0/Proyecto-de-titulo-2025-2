const Joi = require("joi");

const schemaBitacora = Joi.object({
  operacion: Joi.string().required(),
  descripcion: Joi.string().required(),
  idFuncionario: Joi.number().integer().required(),
});

module.exports = schemaBitacora;
