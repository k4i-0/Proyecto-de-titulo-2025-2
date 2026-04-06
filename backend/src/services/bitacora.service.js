const Bitacora = require("../models/Usuarios/Bitacora");

async function crearBitacora(operacion, descripcion, idFuncionario) {
  try {
    const nuevaBitacora = await Bitacora.create({
      operacion,
      descripcion,
      idFuncionario,
    });
    if (!nuevaBitacora) {
      throw new Error("No se pudo crear la Bitacora");
    }
    return { code: 201, message: "Bitacora Creada Correctamente" };
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
    return {
      code: 200,
      message: "Bitacora obtenida correctamente",
      data: consultaBitacora,
    };
  } catch (error) {
    throw new Error("Error al obtener las Bitacora: " + error.message);
  }
}

async function obtenerBitacoraUsuario(rutFuncionario) {
  try {
    const consultaBitacora = await Bitacora.findAll({
      where: {
        rutFuncionario: rutFuncionario,
      },
    });
    if (!consultaBitacora) {
      throw new Error(
        "No se encontraron Bitacora para el usuario especificado",
      );
    }
    return {
      code: 200,
      message: "Bitacora obtenida correctamente",
      data: consultaBitacora,
    };
  } catch (error) {
    throw new Error(
      "Error al obtener las Bitacora del usuario: " + error.message,
    );
  }
}

module.exports = {
  crearBitacora,
  obtenerTodasBitacora,
  obtenerBitacoraUsuario,
};
