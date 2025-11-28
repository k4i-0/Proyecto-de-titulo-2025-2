const Sucursal = require("../../models/inventario/Sucursal");
const Funcionario = require("../../models/Usuarios/Funcionario");
const Bodega = require("../../models/inventario/Bodega");
const { Op } = require("sequelize");

const { crearBitacora } = require("../../services/bitacora.service");
const jwt = require("jsonwebtoken");

exports.createSucursal = async (req, res) => {
  const { nombre, direccion, estado } = req.body;

  const { token } = req.cookies;
  //return res.status(201).send("prueba");
  if (!nombre || !direccion || !estado) {
    return res.status(422).json({ error: "Faltan datos obligatorios" });
  }
  if (!token) {
    return res.status(498).json({ error: "Token no proporcionado" });
  }

  const userData = jwt.verify(token, process.env.JWT_SECRET);
  if (!userData || userData == undefined || userData == null) {
    return res.status(498).json({ error: "Token inválido" });
  }

  const usuarioCreador = await Funcionario.findOne({
    where: { email: userData.email },
  });
  if (!usuarioCreador) {
    return res.status(404).json({ error: "Usuario creador no encontrado" });
  }

  const SucursalExistente = await Sucursal.findOne({
    order: [["createdAt", "DESC"]],
  });

  //console.log("Sucursal existente:", SucursalExistente);

  // Generar nuevo ID basado en la hora actual si no existe una sucursal
  let fechaHora = new Date();
  var nuevoId = parseInt(
    fechaHora.getHours().toString() +
      fechaHora.getMinutes().toString() +
      fechaHora.getSeconds().toString()
  );

  if (SucursalExistente) {
    if (SucursalExistente.idSucursal == nuevoId) {
      // Si el ID generado ya existe, incrementar en 1
      nuevoId = nuevoId + 1;
    }
  }

  //Validacion de datos con Joi
  try {
    const nuevaSucursal = await Sucursal.create({
      idSucursal: nuevoId,
      nombre,
      direccion,
      estado,
      idFuncionario: usuarioCreador.dataValues.idFuncionario,
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
    const sucursales = await Sucursal.findAll({});
    if (sucursales.length === 0 || !sucursales) {
      return res.status(204).json({ error: "No hay sucursales disponibles" });
    }
    res.status(200).json(sucursales);
  } catch (error) {
    console.error("Error al obtener las sucursales:", error);
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
      res.status(204).json({ error: "Sucursal no encontrada" });
    }
  } catch (error) {
    console.error("Error al obtener la sucursal:", error);
    res.status(500).json({ error: "Error al obtener la sucursal" });
  }
};

// Actualizar una sucursal por ID
exports.updateSucursal = async (req, res) => {
  try {
    const { nombre, direccion, estado } = req.body;
    const busquedaSucursal = await Sucursal.findByPk(req.params.id);
    if (!busquedaSucursal) {
      return res.status(404).json({ error: "Sucursal no encontrada" });
    }
    const respuesta = await Sucursal.update(
      {
        nombre,
        direccion,
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
    //Mantiene simpre al menos 1 sucursal en el sistema
    const todasSucursales = await Sucursal.findAll();
    if (todasSucursales.length <= 1) {
      return res
        .status(400)
        .json({ error: "No se puede eliminar la última sucursal" });
    }
    const bodegasSucursal = await Bodega.findAll({
      where: { idSucursal: req.params.id },
    });
    for (const bodega of bodegasSucursal) {
      //eliminar Estantes de la bodega
      await Estante.destroy({
        where: { idBodega: bodega.dataValues.idBodega },
      });
    }
    //eliminar Bodegas de la sucursal
    await Bodega.destroy({
      where: { idSucursal: req.params.id },
    });
    //eliminar Sucursal
    const busquedaSucursal = await Sucursal.destroy({
      where: { idSucursal: req.params.id },
    });
    if (busquedaSucursal) {
      return res.status(200).json({
        message: "Sucursal eliminada (estado actualizado a 'Eliminado')",
      });
    }
    return res.status(404).json({ error: "Sucursal no encontrada" });
  } catch (error) {
    console.log("Error al eliminar la sucursal:", error);

    res.status(500).json({ error: "Error al eliminar la sucursal" });
  }
};
