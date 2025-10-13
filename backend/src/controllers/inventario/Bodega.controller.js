const Bodega = require("../../models/inventario/Bodega");
const { Op } = require("sequelize");

exports.createBodega = async (req, res) => {
  const { nombre, ubicacion, capacidad, estado, idSucursal } = req.body;
  if (!nombre || !ubicacion || !capacidad || !estado || !idSucursal) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }
  //Validacion de datos con Joi
  try {
    const nuevaBodega = await Bodega.create({
      nombre,
      ubicacion,
      capacidad,
      estado,
      idSucursal,
    });
    res.status(201).json(nuevaBodega);
  } catch (error) {
    console.error("Error al crear la bodega:", error);
    res.status(500).json({ error: "Error al crear la bodega" });
  }
};

// Obtener todos las bodegas
exports.getAllBodega = async (req, res) => {
  try {
    const bodegas = await Bodega.findAll({
      where: {
        estado: {
          [Op.ne]: "Eliminado",
        },
      },
    });
    if (bodegas.length === 0 || !bodegas) {
      return res.status(404).json({ error: "No hay bodegas registradas" });
    }
    res.status(200).json(bodegas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las bodegas" });
  }
};

// Obtener un bodega por ID
exports.getBodegaById = async (req, res) => {
  try {
    const bodega = await Bodega.findByPk(req.params.id);
    if (bodega) {
      res.status(200).json(bodega);
    } else {
      res.status(404).json({ error: "Bodega no encontrada" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la bodega" });
  }
};

// Actualizar una bodega por ID
exports.updateBodega = async (req, res) => {
  try {
    const { nombre, ubicacion, capacidad, estado, idSucursal } = req.body;
    if (!nombre || !ubicacion || !capacidad || !estado || !idSucursal) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }
    if (!req.params.id || req.params.id === null) {
      return res.status(400).json({ error: "Revise ID de bodega" });
    }
    const busquedaBodega = await Bodega.findByPk(req.params.id);
    if (!busquedaBodega) {
      return res.status(404).json({ error: "Bodega no encontrada" });
    }
    await Bodega.update(
      {
        nombre,
        ubicacion,
        capacidad,
        estado,
        idSucursal,
      },
      {
        where: { idBodega: req.params.id },
      }
    );

    const updatedBodega = await Bodega.findByPk(req.params.id);
    res.status(200).json(updatedBodega);
  } catch (error) {
    console.log("Error al actualizar la bodega:", error);
    res.status(500).json({ error: "Error al actualizar la bodega" });
  }
};

// Eliminar una bodega por ID
exports.deleteBodega = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: "ID de bodega es obligatorio" });
    }
    const busquedaBodega = await Bodega.findByPk(req.params.id);
    if (busquedaBodega) {
      busquedaBodega.estado = "Eliminado";
      await busquedaBodega.save();
      return res.status(200).json({
        message: "Bodega eliminada (estado actualizado a 'Eliminado')",
      });
    }
    return res.status(404).json({ error: "Bodega no encontrada" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la bodega" });
  }
};
