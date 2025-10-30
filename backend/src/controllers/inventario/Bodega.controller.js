const Bodega = require("../../models/inventario/Bodega");
const { Op, where } = require("sequelize");

const { crearBitacora } = require("../../services/bitacora.service");
const jwt = require("jsonwebtoken");

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
    await crearBitacora({
      nombre: `crear bodega ${nombre}`,
      fechaCreacion: new Date(),
      descripcion: `Se creó la bodega: ${nombre}`,
      funcionOcupo: "createBodega controller",
      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Bajo",
    });
    res.status(201).json(nuevaBodega);
  } catch (error) {
    console.error("Error al crear la bodega:", error);
    await crearBitacora({
      nombre: `error al crear bodega ${nombre}`,
      fechaCreacion: new Date(),
      descripcion: `Error al crear la bodega: ${nombre}`,
      funcionOcupo: "createBodega controller",
      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Alto",
    });
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
      await crearBitacora({
        nombre: `consulta de bodegas`,
        fechaCreacion: new Date(),
        descripcion: `Se consultaron vacia de bodegas`,
        funcionOcupo: "getAllBodegas controller",
        usuariosCreador: ` Sistema por ${
          jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
          "error de lectura cookie"
        } `,
        nivelAlerta: "Bajo",
      });
      return res.status(204).json({ error: "No hay bodegas registradas" });
    }
    await crearBitacora({
      nombre: `consulta de bodegas`,
      fechaCreacion: new Date(),
      descripcion: `Se consultaron todas las bodegas`,
      funcionOcupo: "getAllBodegas controller",
      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Bajo",
    });
    res.status(200).json(bodegas);
  } catch (error) {
    await crearBitacora({
      nombre: `error al consultar bodegas`,
      fechaCreacion: new Date(),
      descripcion: `Error al consultar las bodegas`,
      funcionOcupo: "getAllBodegas controller",

      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Alto",
    });
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
      await crearBitacora({
        nombre: `consulta de bodega ID: ${req.params.id}`,
        fechaCreacion: new Date(),
        descripcion: `Se consultó la bodega con ID: ${req.params.id}`,
        funcionOcupo: "getBodegaById controller",
        usuariosCreador: ` Sistema por ${
          jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
          "error de lectura cookie"
        } `,
        nivelAlerta: "Bajo",
      });
      res.status(200).json(bodega);
    } else {
      res.status(404).json({ error: "Bodega no encontrada" });
    }
  } catch (error) {
    await crearBitacora({
      nombre: `error al consultar bodega ID: ${req.params.id}`,
      fechaCreacion: new Date(),
      descripcion: `Error al consultar la bodega con ID: ${req.params.id}`,
      funcionOcupo: "getBodegaById controller",
      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Alto",
    });
    res.status(500).json({ error: "Error al obtener la bodega" });
  }
};

// Actualizar una bodega por ID
exports.updateBodega = async (req, res) => {
  try {
    const { nombre, ubicacion, capacidad, estado } = req.body;
    console.log("Datos recibidos para actualizar:", req.body, req.params.id);
    if (!nombre || !ubicacion || !capacidad || !estado) {
      return res.status(422).json({ error: "Faltan datos obligatorios" });
    }
    if (!req.params.id || req.params.id === null) {
      return res.status(422).json({ error: "Revise ID de bodega" });
    }
    const busquedaBodega = await Bodega.findByPk(req.params.id);
    if (!busquedaBodega) {
      return res.status(422).json({ error: "Bodega no encontrada" });
    }
    await Bodega.update(
      {
        nombre,
        ubicacion,
        capacidad,
        estado,
        idSucursal: busquedaBodega.dataValues.idSucursal,
      },
      {
        where: { idBodega: req.params.id },
      }
    );

    const updatedBodega = await Bodega.findByPk(req.params.id);
    await crearBitacora({
      nombre: `actualización de bodega ID: ${req.params.id}`,
      fechaCreacion: new Date(),
      descripcion: `Se actualizó la bodega con ID: ${req.params.id}`,
      funcionOcupo: "updateBodega controller",
      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Bajo",
    });
    res.status(200).json(updatedBodega);
  } catch (error) {
    console.log("Error al actualizar la bodega:", error);
    await crearBitacora({
      nombre: `error al actualizar bodega ID: ${req.params.id}`,
      fechaCreacion: new Date(),
      descripcion: `Error al actualizar la bodega con ID: ${req.params.id}`,
      funcionOcupo: "updateBodega controller",
      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Alto",
    });
    res.status(500).json({ error: "Error al actualizar la bodega" });
  }
};

// Eliminar una bodega por ID
exports.deleteBodega = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(422).json({ error: "ID de bodega es obligatorio" });
    }
    const busquedaBodega = await Bodega.findByPk(req.params.id);
    if (busquedaBodega) {
      busquedaBodega.estado = "Eliminado";
      await busquedaBodega.save();
      await crearBitacora({
        nombre: `eliminación de bodega ID: ${req.params.id}`,
        fechaCreacion: new Date(),
        descripcion: `Se eliminó la bodega con ID: ${req.params.id}`,
        funcionOcupo: "deleteBodega controller",
        usuariosCreador: ` Sistema por ${
          jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
          "error de lectura cookie"
        } `,
        nivelAlerta: "Bajo",
      });
      return res.status(200).json({
        message: "Bodega eliminada (estado actualizado a 'Eliminado')",
      });
    }
    return res.status(422).json({ error: "Bodega no encontrada" });
  } catch (error) {
    await crearBitacora({
      nombre: `error al eliminar bodega ID: ${req.params.id}`,
      fechaCreacion: new Date(),
      descripcion: `Error al eliminar la bodega con ID: ${req.params.id}`,
      funcionOcupo: "deleteBodega controller",
      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Alto",
    });
    res.status(500).json({ error: "Error al eliminar la bodega" });
  }
};
