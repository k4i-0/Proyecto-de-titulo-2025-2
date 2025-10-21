const Bitacora = require("../models/usuarios/Bitacora");

async function crearBitacora(data) {
  try {
    const nuevaBitacora = await Bitacora.create(data);
    return nuevaBitacora;
  } catch (error) {
    throw new Error("Error al crear la Bitacora: " + error.message);
  }
}

async function obtenerTodasBitacora() {
  try {
    const consultaBitacora = await Bitacora.findAll();
    if (!consultaBitacora) {
      throw new Error("No se encontraron Bitacora");
    }
    return consultaBitacora;
  } catch (error) {
    throw new Error("Error al obtener las Bitacora: " + error.message);
  }
}

async function editarBitacora(datos) {
  try {
    const { idBitacora } = datos;

    const consultaBitacora = await Bitacora.findByPk(idBitacora);
    if (!consultaBitacora) {
      throw new Error("No se encontró la bitacora con el ID proporcionado");
    }
    consultaBitacora.nombre = nombre;
    consultaBitacora.descripcion = descripcion;
    consultaBitacora.nivelAlerta = nivelAlerta;
    consultaBitacora.funcionOcupo = funcionOcupo;
    consultaBitacora.usuariosCreador = usuariosCreador;
    await consultaBitacora.save();
    return consultaBitacora;
  } catch (error) {
    throw new Error("Error al editar la bitacora: " + error.message);
  }
}

async function eliminarBitacora(idBitacora) {
  try {
    if (!idBitacora) {
      throw new Error("Falta el ID de la bitacora a eliminar");
    }
    const consultaBitacora = await Bitacora.findByPk(idBitacora);
    if (!consultaBitacora) {
      throw new Error("No se encontró la bitacora con el ID proporcionado");
    }
    await consultaBitacora.destroy();
    return true;
  } catch (error) {
    throw new Error("Error al eliminar la bitacora: " + error.message);
  }
}

module.exports = {
  crearBitacora,
  obtenerTodasBitacora,
  editarBitacora,
  eliminarBitacora,
};
