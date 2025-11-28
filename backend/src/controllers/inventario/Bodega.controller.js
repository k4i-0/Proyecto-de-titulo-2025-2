const Bodega = require("../../models/inventario/Bodega");
const Estante = require("../../models/inventario/Estante");
const { Op, where } = require("sequelize");

const { crearBitacora } = require("../../services/bitacora.service");
const jwt = require("jsonwebtoken");
// const bodega = require("../../models/inventario/Bodega");

exports.createBodega = async (req, res) => {
  const { nombre, capacidad, estado, idSucursal } = req.body;
  if (!nombre || !capacidad || !estado || !idSucursal) {
    return res.status(422).json({ error: "Faltan datos obligatorios" });
  }
  //Validacion de datos con Joi
  try {
    const nuevaBodega = await Bodega.create({
      nombre,
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
      // where: {
      //   estado: {
      //     [Op.ne]: "Eliminado",
      //   },
      // },
    });
    if (bodegas.length === 0 || !bodegas) {
      return res.status(204).json({ error: "No hay bodegas registradas" });
    }

    res.status(200).json(bodegas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las bodegas" });
  }
};

// Obtener un bodega por ID
exports.getBodegaPorSucursal = async (req, res) => {
  try {
    const bodega = await Bodega.findAll({
      where: {
        idSucursal: req.params.id,
      },
    });
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
    const { nombre, capacidad, estado, idSucursal } = req.body;
    console.log("Datos recibidos para actualizar:", req.body, req.params.id);
    if (!nombre || !capacidad || !estado || !idSucursal) {
      return res.status(422).json({ error: "Faltan datos obligatorios" });
    }
    if (!req.params.id || req.params.id === null) {
      return res.status(422).json({ error: "Revise ID de bodega" });
    }
    const busquedaBodega = await Bodega.findByPk(req.params.id);
    if (
      !busquedaBodega ||
      busquedaBodega.dataValues.idSucursal !== idSucursal
    ) {
      return res.status(422).json({ error: "Bodega no encontrada" });
    }

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
      return res.status(422).json({ error: "ID de bodega es obligatorio" });
    }
    //Evita que se borre todas las bodegas
    const bodegasSucursal = await Bodega.findOne({
      where: { idBodega: req.params.id },
    });
    const todasBodegas = await Bodega.findAll({
      where: { idSucursal: bodegasSucursal.idSucursal },
    });
    if (todasBodegas.length <= 1) {
      return res.status(400).json({
        error: "No se puede eliminar la última bodega de esta sucursal",
      });
    }
    //eliminar Estantes
    await Estante.destroy({
      where: { idBodega: req.params.id },
    });
    //eliminar Bodega
    const busquedaBodega = await Bodega.destroy({
      where: { idBodega: req.params.id },
    });
    if (busquedaBodega) {
      return res
        .status(200)
        .json({ message: "Bodega eliminada correctamente" });
    }
    return res.status(404).json({ error: "Bodega no encontrada" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la bodega" });
  }
};
