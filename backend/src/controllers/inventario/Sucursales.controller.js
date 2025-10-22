const Sucursal = require("../../models/inventario/Sucursal");
const { Op } = require("sequelize");

const { crearBitacora } = require("../../services/bitacora.service");
const jwt = require("jsonwebtoken");

exports.createSucursal = async (req, res) => {
  const { idSucursal, nombre, ubicacion, telefono, estado } = req.body;
  if (!nombre || !ubicacion || !telefono || !estado) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }
  //Validacion de datos con Joi
  try {
    const nuevaSucursal = await Sucursal.create({
      idSucursal,
      nombre,
      ubicacion,
      telefono,
      estado,
    });
    await crearBitacora({
      nombre: `crear Sucursal ${nombre}`,
      fechaCreacion: new Date(),
      descripcion: `Se creó la Sucursal: ${nombre}`,
      funcionOcupo: "createSucursal controller",
      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Bajo",
    });
    res.status(201).json(nuevaSucursal);
  } catch (error) {
    console.error("Error al crear la sucursal:", error);
    await crearBitacora({
      nombre: `error al crear sucursal ${nombre}`,
      fechaCreacion: new Date(),
      descripcion: `Error al crear la sucursal: ${nombre}`,
      funcionOcupo: "createSucursal controller",
      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Alto",
    });
    res.status(500).json({ error: "Error al crear la sucursal" });
  }
};

// Obtener todos las sucursales
exports.getAllSucursal = async (req, res) => {
  try {
    const sucursales = await Sucursal.findAll({
      where: {
        estado: {
          [Op.ne]: "Eliminada",
        },
      },
    });
    if (sucursales.length === 0 || !sucursales) {
      return res.status(404).json({ error: "No hay sucursales disponibles" });
    }
    res.status(200).json(sucursales);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las sucursales" });
  }
};

// Obtener un sucursales por ID
exports.getSucursalById = async (req, res) => {
  try {
    const sucursal = await Sucursal.findByPk(req.params.id);
    if (sucursal) {
      res.status(200).json(sucursal);
    } else {
      res.status(404).json({ error: "Sucursal no encontrada" });
    }
  } catch (error) {
    await crearBitacora({
      nombre: `error al consultar Sucursal`,
      fechaCreacion: new Date(),
      descripcion: `Error al consultar las Sucursal`,
      funcionOcupo: "getAllSucursal controller",

      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Alto",
    });
    res.status(500).json({ error: "Error al obtener la sucursal" });
  }
};

// Actualizar una sucursal por ID
exports.updateSucursal = async (req, res) => {
  try {
    const { nombre, ubicacion, telefono, estado } = req.body;
    const busquedaSucursal = await Sucursal.findByPk(req.params.id);
    if (!busquedaSucursal) {
      return res.status(404).json({ error: "Sucursal no encontrada" });
    }
    const respuesta = await Sucursal.update(
      {
        nombre,
        ubicacion,
        telefono,
        estado,
      },
      {
        where: { idSucursal: req.params.id },
      }
    );

    const updatedSucursal = await Sucursal.findByPk(req.params.id);
    await crearBitacora({
      nombre: `actualización de sucursal ID: ${req.params.id}`,
      fechaCreacion: new Date(),
      descripcion: `Se actualizó la sucursal con ID: ${req.params.id}`,
      funcionOcupo: "updatesucursal controller",
      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Bajo",
    });
    res.status(200).json(updatedSucursal);
  } catch (error) {
    console.log("Error al actualizar la sucursal:", error);
    await crearBitacora({
      nombre: `error al actualizar Sucursal ID: ${req.params.id}`,
      fechaCreacion: new Date(),
      descripcion: `Error al actualizar la Sucursal con ID: ${req.params.id}`,
      funcionOcupo: "updateSucursal controller",
      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Alto",
    });
    res.status(500).json({ error: "Error al actualizar la sucursal" });
  }
};

// Eliminar una sucursal por ID
exports.deleteSucursal = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: "ID de sucursal es obligatorio" });
    }
    const busquedaSucursal = await Sucursal.findByPk(req.params.id);
    if (busquedaSucursal) {
      busquedaSucursal.estado = "Eliminada";
      await busquedaSucursal.save();
      await crearBitacora({
        nombre: `eliminación de Sucursal ID: ${req.params.id}`,
        fechaCreacion: new Date(),
        descripcion: `Se eliminó la Sucursal con ID: ${req.params.id}`,
        funcionOcupo: "deleteSucursal controller",
        usuariosCreador: ` Sistema por ${
          jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
          "error de lectura cookie"
        } `,
        nivelAlerta: "Bajo",
      });
      return res.status(200).json({
        message: "Sucursal eliminada (estado actualizado a 'Eliminado')",
      });
    }
    return res.status(404).json({ error: "Sucursal no encontrada" });
  } catch (error) {
    console.log("Error al eliminar la sucursal:", error);
    await crearBitacora({
      nombre: `error al eliminar Sucursal ID: ${req.params.id}`,
      fechaCreacion: new Date(),
      descripcion: `Error al eliminar la Sucursal con ID: ${req.params.id}`,
      funcionOcupo: "deleteSucursal controller",
      usuariosCreador: "Sistema por",
      nivelAlerta: "Alto",
    });
    res.status(500).json({ error: "Error al eliminar la sucursal" });
  }
};
