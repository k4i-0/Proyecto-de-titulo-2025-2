const Bitacora = require("../models/Usuarios/Bitacora");
const Funcionario = require("../models/Usuarios/Funcionario");
const {
  crearBitacora,
  obtenerTodasBitacora,
} = require("../services/bitacora.service");
const { Op } = require("sequelize");

const joi = require("joi");

const validarRutChileno = require("../function/verificarRut");

// Obtener todas las entradas de la bitácora

async function obtenerTodasBitacoraFuncionario(req, res) {
  try {
    const bitacoras = await obtenerTodasBitacora();
    res.status(200).json(bitacoras.data);
  } catch (error) {
    if (error.message === "No se encontraron Bitacora") {
      return res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({
        error: "Error al obtener las bitácoras",
        details: error.message,
      });
    }
  }
}

async function obtenerbitacoraPorFuncionario(req, res) {
  try {
    const { rutFuncionario } = req.params;

    const { error, value } = await joi
      .string()
      .pattern(/^\d{7,8}-[0-9kK]$/)
      .required()
      .validate(rutFuncionario);

    if (error) {
      return res
        .status(400)
        .json({ error: "RUT inválido: " + error.details[0].message });
    }
    //validar que el rut sea correcto
    if (!validarRutChileno(rutFuncionario)) {
      return res.status(400).json({ error: "RUT inválido" });
    }

    const bitacoras = await Bitacora.findAll({
      include: [
        {
          model: Funcionario,
          where: { rut: rutFuncionario, idFuncionario: { [Op.not]: 1 } },
          attributes: ["nombre", "apellido", "rut"],
        },
      ],
    });
    if (bitacoras.length === 0) {
      return res.status(404).json({
        error:
          "No se encontraron Bitacora para el funcionario con RUT: " +
          rutFuncionario,
      });
    }
    res.status(200).json(bitacoras);
  } catch (error) {
    console.error("Error al obtener las bitácoras por funcionario:", error);
    res.status(500).json({
      error: "Error al obtener las bitácoras por funcionario",
      details: error.message,
    });
  }
}

module.exports = {
  obtenerTodasBitacoraFuncionario,
  obtenerbitacoraPorFuncionario,
};
