const Inventario = require("../../models/inventario/Inventario");
const Estante = require("../../models/inventario/Estante");
const Lote = require("../../models/inventario/Lote");
const Bodega = require("../../models/inventario/Bodega");
const Productos = require("../../models/inventario/Productos");
const Sucursal = require("../../models/inventario/Sucursal");
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

// Obtener todos los inventarios (con relaciones Producto y Bodega)
exports.getAllInventario = async (req, res) => {
  try {
    const { idSucursal } = req.query; // filtro opcional por sucursal

    // Si se filtra por sucursal, buscar primero las bodegas de esa sucursal
    let whereInventario = {};
    if (idSucursal) {
      const bodegas = await Bodega.findAll({
        where: { idSucursal },
        attributes: ["idBodega"],
      });
      const idBodegas = bodegas.map((b) => b.idBodega);
      if (idBodegas.length === 0) {
        return res.status(200).json([]);
      }
      whereInventario.idBodega = { [Op.in]: idBodegas };
    }

    const inventarios = await Inventario.findAll({
      where: whereInventario,
      include: [
        {
          model: Productos,
          attributes: ["idProducto", "nombre", "codigo", "marca"],
        },
        {
          model: Bodega,
          attributes: ["idBodega", "nombre"],
          include: [{ model: Sucursal, attributes: ["idSucursal", "nombre"] }],
        },
      ],
      order: [["idInventario", "ASC"]],
    });

    if (inventarios.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(inventarios);
  } catch (error) {
    console.error("Error al obtener los inventarios:", error);
    res.status(500).json({ error: "Error al obtener los inventarios" });
  }
};

// Obtener inventario agrupado por sucursal
exports.getInventarioPorSucursal = async (req, res) => {
  try {
    const sucursales = await Sucursal.findAll({
      attributes: ["idSucursal", "nombre", "direccion", "estado"],
      include: [
        {
          model: Bodega,
          attributes: ["idBodega", "nombre"],
          include: [
            {
              model: Inventario,
              attributes: [
                "idInventario",
                "stock",
                "stockMinimo",
                "stockMaximo",
                "stockReservado",
                "estado",
              ],
              include: [
                {
                  model: Productos,
                  attributes: ["idProducto", "codigo", "nombre", "marca"],
                },
              ],
            },
          ],
        },
      ],
      order: [
        ["idSucursal", "ASC"],
        [Bodega, "idBodega", "ASC"],
        [Bodega, Inventario, "idInventario", "ASC"],
      ],
    });

    const resultado = sucursales.map((sucursal) => {
      const inventarios = (sucursal.bodegas || []).flatMap((bodega) =>
        (bodega.inventarios || []).map((inventario) => ({
          idInventario: inventario.idInventario,
          stock: inventario.stock,
          stockMinimo: inventario.stockMinimo,
          stockMaximo: inventario.stockMaximo,
          stockReservado: inventario.stockReservado,
          estado: inventario.estado,
          bodega: {
            idBodega: bodega.idBodega,
            nombre: bodega.nombre,
          },
          producto: inventario.producto || null,
        })),
      );

      return {
        idSucursal: sucursal.idSucursal,
        nombre: sucursal.nombre,
        direccion: sucursal.direccion,
        estado: sucursal.estado,
        totalInventarios: inventarios.length,
        totalStock: inventarios.reduce((acc, item) => acc + (item.stock || 0), 0),
        inventarios,
      };
    });

    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error al obtener inventario por sucursal:", error);
    res.status(500).json({ error: "Error al obtener inventario por sucursal" });
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
      },
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
