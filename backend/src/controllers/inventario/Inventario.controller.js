const Inventario = require("../../models/inventario/Inventario");
const Estante = require("../../models/inventario/Estante");
const Lote = require("../../models/inventario/Lote");
const { Op } = require("sequelize");

exports.createInventario = async (req, res) => {
  const { nombre, fechaCreacion, encargado, stock, idBodega, idProducto } =
    req.body;
  if (
    !nombre ||
    !fechaCreacion ||
    !encargado ||
    !stock ||
    !idBodega ||
    !idProducto
  ) {
    return res
      .status(422)
      .json({ code: 1112, error: "Faltan datos obligatorios" });
  }
  //Validacion de datos con Joi
  try {
    const nuevoInventario = await Inventario.create({
      nombre,
      fechaCreacion,
      encargado,
      stock,
      idBodega,
      idProducto,
    });

    res.status(201).json(nuevoInventario);
  } catch (error) {
    console.error("Error al crear el inventario:", error);
    res.status(500).json({ error: "Error al crear el inventario" });
  }
};

// Obtener todos los inventarios
exports.getAllInventario = async (req, res) => {
  try {
    const inventarios = await Inventario.findAll({
      include: [
        {
          model: Estante,
        },
        {
          model: Lote,
        },
      ],
    });

    if (inventarios.length === 0 || !inventarios) {
      return res
        .status(204)
        .json({ code: 1113, error: "No hay inventarios disponibles" });
    }

    res.status(200).json(inventarios);
  } catch (error) {
    console.error("Error al obtener los inventarios:", error);
    res.status(500).json({ error: "Error al obtener los inventarios" });
  }
};

// Obtener un inventario por ID
exports.getInventarioById = async (req, res) => {
  try {
    const inventario = await Inventario.findByPk(req.params.id);
    if (inventario) {
      res.status(200).json(inventario);
    } else {
      res.status(422).json({ code: 1114, error: "Inventario no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el inventario" });
  }
};

// Actualizar un inventario por ID
exports.updateInventario = async (req, res) => {
  try {
    const { nombre, fechaCreacion, encargado, stock, idBodega, idProducto } =
      req.body;
    const busquedaInventario = await Inventario.findByPk(req.params.id);
    if (!busquedaInventario) {
      return res
        .status(422)
        .json({ code: 1114, error: "Inventario no encontrado" });
    }
    await Inventario.update(
      {
        nombre,
        fechaCreacion,
        encargado,
        stock,
        idBodega,
        idProducto,
      },
      {
        where: { idInventario: req.params.id },
      }
    );

    const updatedInventario = await Inventario.findByPk(req.params.id);
    res.status(200).json(updatedInventario);
  } catch (error) {
    console.log("Error al actualizar el inventario:", error);
    res.status(500).json({ error: "Error al actualizar el inventario" });
  }
};

// Eliminar un inventario por ID
exports.deleteInventario = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(422)
        .json({ code: 1115, error: "ID de inventario es obligatorio" });
    }
    const busquedaInventario = await Inventario.findByPk(req.params.id);
    if (busquedaInventario) {
      busquedaInventario.estado = "Eliminado";
      await busquedaInventario.save();
      return res.status(200).json({
        message: "Inventario eliminado (estado actualizado a 'Eliminado')",
      });
    }
    return res.status(404).json({ error: "Inventario no encontrado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el inventario" });
  }
};
