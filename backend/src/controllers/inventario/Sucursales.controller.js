const Sucursal = require("../../models/inventario/Sucursal");
const { Op } = require("sequelize");

exports.createSucursal = async (req, res) => {
  const { idSucursal, nombre, ubicacion, telefono, estado } = req.body;
  if (!idSucursal || !nombre || !ubicacion || !telefono || !estado) {
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
    res.status(201).json(nuevaSucursal);
  } catch (error) {
    console.error("Error al crear la sucursal:", error);
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
    res.status(200).json(updatedSucursal);
  } catch (error) {
    console.log("Error al actualizar la sucursal:", error);
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
      busquedaSucursal.estado = "Eliminado";
      await busquedaSucursal.save();
      return res.status(200).json({
        message: "Sucursal eliminada (estado actualizado a 'Eliminado')",
      });
    }
    return res.status(404).json({ error: "Sucursal no encontrada" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la sucursal" });
  }
};
