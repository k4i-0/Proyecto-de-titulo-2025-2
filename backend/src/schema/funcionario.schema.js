const joi = require("joi");

const asignarFuncionarioSucursalSchema = joi.object({
  idFuncionario: joi.number().integer().required(),
  idSucursal: joi.number().integer().required(),
});

module.exports = {
  asignarFuncionarioSucursalSchema,
};
