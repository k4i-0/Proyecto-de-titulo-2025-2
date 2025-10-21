const Bitacora = require("../models/usuarios/Bitacora");
const {
  crearBitacora,
  obtenerTodasBitacora,
  editarBitacora,
  eliminarBitacora,
} = require("../services/bitacora.service");

// Crear una nueva entrada en la bitácora
async function crearBitacora(req, res) {
  try {
    const { nombre, descripcion, nivelAlerta, funcionOcupo, usuariosCreador } =
      req.body;
    if (
      !nombre ||
      !descripcion ||
      !nivelAlerta ||
      !funcionOcupo ||
      !usuariosCreador
    ) {
      return res.status(422).json({ error: "Faltan datos obligatorios" });
    }
    if (!["Bajo", "Medio", "Alto"].includes(nivelAlerta)) {
      throw new Error(
        "Nivel de alerta inválido. Debe ser 'Bajo', 'Medio' o 'Alto'"
      );
    }
    const fechaCreacion = new Date();
    const nuevaBitacora = await crearBitacora({
      nombre,
      descripcion,
      nivelAlerta,
      funcionOcupo,
      fechaCreacion,
      usuariosCreador,
    });
    if (!nuevaBitacora) {
      return res.status(500).json({ error: "Error al crear la bitacora" });
    }
    res.status(201).json(nuevaBitacora);
  } catch (error) {
    if (error.message.includes("Ya existe una Bitacora con ese nombre")) {
      return res.status(409).json({ error: error.message });
    }
    if (error.message.includes("Nivel de alerta inválido")) {
      return res.status(422).json({ error: error.message });
    } else {
      res
        .status(500)
        .json({ error: "Error al crear la bitacora", details: error.message });
    }
  }
}

// Obtener todas las entradas de la bitácora
async function obtenerTodasBitacora(req, res) {
  try {
    const bitacoras = await obtenerTodasBitacora();
    res.status(200).json(bitacoras);
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

// Editar una entrada de la bitácora
async function editarBitacora(req, res) {
  try {
    const {
      idBitacora,
      nombre,
      descripcion,
      nivelAlerta,
      funcionOcupo,
      usuariosCreador,
    } = req.body;
    if (
      !idBitacora ||
      !nombre ||
      !nivelAlerta ||
      !funcionOcupo ||
      !usuariosCreador
    ) {
      return res.status(422).json({ error: "Faltan datos obligatorios" });
    }
    const bitacoraEditada = await editarBitacora({
      idBitacora,
      nombre,
      descripcion,
      nivelAlerta,
      funcionOcupo,
      usuariosCreador,
    });
    res.status(200).json(bitacoraEditada);
  } catch (error) {
    if (
      error.message === "No se encontró la bitacora con el ID proporcionado"
    ) {
      return res.status(404).json({ error: error.message });
    } else {
      res
        .status(500)
        .json({ error: "Error al editar la bitácora", details: error.message });
    }
  }
}

// Eliminar una entrada de la bitácora
async function eliminarBitacora(req, res) {
  try {
    const { idBitacora } = req.params;
    if (!idBitacora) {
      return res.status(422).json({ error: "Falta el ID de la bitácora" });
    }
    const resultado = await eliminarBitacora(idBitacora);
    if (!resultado) {
      return res.status(404).json({ error: "No se encontró la bitácora" });
    }
    res.status(204).send();
  } catch (error) {
    if (
      error.message === "No se encontró la bitacora con el ID proporcionado"
    ) {
      return res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({
        error: "Error al eliminar la bitácora",
        details: error.message,
      });
    }
  }
}

module.exports = {
  crearBitacora,
  obtenerTodasBitacora,
  editarBitacora,
  eliminarBitacora,
};
