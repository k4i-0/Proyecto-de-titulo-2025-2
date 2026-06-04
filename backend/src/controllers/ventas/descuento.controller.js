const DescuentoSobre = require("../../models/ventas/DescuentoSobre");
const Descuento = require("../../models/ventas/Descuento");
const Producto = require("../../models/inventario/Productos");
const Categoria = require("../../models/inventario/Categoria");
const { sequelize } = require("../../models/index");
const { Op } = require("sequelize");

exports.registrarDescuentoSobreProducto = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { idProducto, porcentajeDescuento, montoDescuento, fechaFin } =
      req.body;
    console.log(
      "Datos recibidos para registrar descuento sobre producto:",
      req.body,
    );
    if (!idProducto || !porcentajeDescuento || montoDescuento === undefined) {
      await t.rollback();
      return res.status(400).json({ error: "Faltan Datos" });
    }

    const producto = await Producto.findByPk(idProducto, { transaction: t });
    if (!producto) {
      await t.rollback();
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    const nuevoDescuento = await Descuento.create(
      {
        montoDescuento: montoDescuento,
        fechaInicio: new Date(),
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        descripcion: " ",
        porcentajeDescuento: porcentajeDescuento,
        estadoDescuento: "Activo",
      },
      { transaction: t },
    );
    if (!nuevoDescuento) {
      await t.rollback();
      return res.status(500).json({ error: "Error al crear el descuento" });
    }
    const descuentoSobreProducto = await DescuentoSobre.create(
      {
        idProducto: idProducto,
        idDescuento: nuevoDescuento.idDescuento,
      },
      { transaction: t },
    );
    if (!descuentoSobreProducto) {
      await t.rollback();
      return res
        .status(500)
        .json({ error: "Error al asociar el descuento al producto" });
    }

    await t.commit();
    return res
      .status(200)
      .json({ message: "Descuento sobre producto registrado exitosamente" });
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    console.error("Error al registrar descuento sobre producto:", error);
    res
      .status(500)
      .json({ error: "Error al registrar descuento sobre producto" });
  }
};

exports.obtenerProductosCategoriaConDescuentos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      include: [
        {
          model: Categoria, // 👈 Agregas esto en el primer nivel del array include
          attributes: ["nombreCategoria"],
        },
        {
          model: DescuentoSobre,

          required: false,
          include: [
            {
              model: Descuento,
              where: { estadoDescuento: "Activo" },
              attributes: ["porcentajeDescuento", "montoDescuento"],

              required: false,
            },
            {
              model: Categoria,
              attributes: ["nombreCategoria"],
            },
          ],
        },
        {
          model: Categoria,
          required: false,
          attributes: ["idCategoria", "nombreCategoria"],
          include: [
            {
              model: DescuentoSobre,
              required: false,
              include: [
                {
                  model: Descuento,
                  where: { estadoDescuento: "Activo" },
                  attributes: ["porcentajeDescuento", "montoDescuento"],
                  required: false,
                },
              ],
            },
          ],
        },
      ],

      order: [["idProducto", "ASC"]],
    });

    if (!productos || productos.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(productos);
  } catch (error) {
    console.error("Error al obtener los productos con descuentos:", error);
    res.status(500).json({
      code: 500,
      error: "Error interno al obtener los productos y sus descuentos",
    });
  }
};

exports.obtenerDescuentoProducto = async (req, res) => {
  try {
    const { idProducto } = req.params;

    if (!idProducto) {
      return res
        .status(400)
        .json({ message: "Faltan Datos: idProducto es requerido" });
    }

    // 1. Buscamos el producto para saber su idCategoria
    const productoTarget = await Producto.findByPk(idProducto);

    if (!productoTarget) {
      return res
        .status(404)
        .json({ message: "Producto no encontrado en la base de datos" });
    }

    // 2. Armamos las condiciones de búsqueda
    // Siempre buscamos los descuentos directos al producto
    const condicionesBusqueda = [{ idProducto: idProducto }];

    // Si el producto tiene una categoría, también buscamos los descuentos de esa categoría
    if (productoTarget.idCategoria) {
      condicionesBusqueda.push({ idCategoria: productoTarget.idCategoria });
    }

    // 3. Ejecutamos la consulta con un operador OR
    const descuentosEncontrados = await DescuentoSobre.findAll({
      where: {
        [Op.or]: condicionesBusqueda,
      },
      include: [
        {
          model: Descuento,
        },
        {
          model: Producto,
          // attributes: ["idProducto", "nombre", "codigo"], // Puedes descomentar esto para traer menos datos innecesarios
        },
        {
          model: Categoria,
          // attributes: ["idCategoria", "nombreCategoria"],
        },
      ],
      // Ordenamos para que los descuentos del producto salgan primero y los de categoría después
      order: [["idProducto", "ASC NULLS LAST"]],
    });

    return res.status(200).json(descuentosEncontrados);
  } catch (err) {
    console.error("Error al obtener los descuentos del producto:", err);
    return res
      .status(500)
      .json({ message: "Error interno al obtener descuentos" });
  }
};

exports.cambiarEstadoDescuento = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { idDescuento } = req.body;
    if (!idDescuento) {
      await t.rollback();
      return res.status(404).json({ message: "Faltan datos" });
    }
    const busquedaDescuento = await Descuento.findByPk(idDescuento, {
      transaction: t,
    });
    if (!busquedaDescuento) {
      await t.rollback();
      return res.status(404).json({ message: "Descuento no encontrado" });
    }
    if (busquedaDescuento.estadoDescuento === "Activo") {
      await busquedaDescuento.update(
        { estadoDescuento: "Inactivo" },
        { transaction: t },
      );
    } else {
      await busquedaDescuento.update({ estadoDescuento: "Activo" });
    }
    await t.commit();
    return res
      .status(200)
      .json({ message: "Estado del descuento actualizado exitosamente" });
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    console.log("Error en funcion cambiar estado descuento", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

exports.buscarDescuentoCategoria = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { idCategoria } = req.params;
    if (!idCategoria) {
      await t.rollback();
      return res.status(404).json({ message: "Faltan datos" });
    }
    const descuentosCategoria = await DescuentoSobre.findAll({
      where: { idCategoria: idCategoria },
      include: [
        {
          model: Descuento,
          where: { estadoDescuento: "Activo" },
        },
      ],
      transaction: t,
    });
    console.log(
      "Descuentos encontrados para la categoría:",
      descuentosCategoria,
    );
    if (descuentosCategoria.length === 0 || !descuentosCategoria) {
      await t.commit();
      return res.status(204).json({ message: "No se encontraron descuentos" });
    }
    await t.commit();
    return res.status(200).json(descuentosCategoria);
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    console.log("Error en funcion buscar descuento categoria", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

exports.agregarDescuentoCategoria = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { idCategoria, porcentajeDescuento, montoDescuento, fechaFin } =
      req.body;
    if (
      !idCategoria ||
      porcentajeDescuento === undefined ||
      montoDescuento === undefined
    ) {
      await t.rollback();
      return res.status(400).json({ message: "Faltan datos" });
    }
    const categoria = await Categoria.findByPk(idCategoria, { transaction: t });
    if (!categoria) {
      await t.rollback();
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    if (categoria.estado === "Inactivo" || categoria.estado === "Suspendido") {
      await t.rollback();
      return res.status(400).json({ message: "Categoría no activa" });
    }
    const nuevoDescuento = await Descuento.create(
      {
        montoDescuento: montoDescuento,
        fechaInicio: new Date(),
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        descripcion: " ",
        porcentajeDescuento: porcentajeDescuento,
        estadoDescuento: "Activo",
      },
      { transaction: t },
    );
    if (!nuevoDescuento) {
      await t.rollback();
      return res.status(500).json({ message: "Error al crear el descuento" });
    }
    const descuentoSobreCategoria = await DescuentoSobre.create(
      {
        idCategoria: idCategoria,
        idDescuento: nuevoDescuento.idDescuento,
      },
      { transaction: t },
    );
    if (!descuentoSobreCategoria) {
      await t.rollback();
      return res
        .status(500)
        .json({ message: "Error al asociar el descuento a la categoría" });
    }
    await t.commit();
    return res
      .status(200)
      .json({ message: "Descuento sobre categoría registrado exitosamente" });
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    console.log("Error en funcion agregar descuento categoria", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
