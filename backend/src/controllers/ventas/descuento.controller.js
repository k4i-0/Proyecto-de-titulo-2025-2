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

    if (montoDescuento < 0 || porcentajeDescuento < 0) {
      await t.rollback();
      return res.status(400).json({
        error: "El monto o porcentaje de descuento no puede ser negativo",
      });
    }
    const producto = await Producto.findByPk(idProducto, { transaction: t });
    if (!producto) {
      await t.rollback();
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    if (producto.precioVenta - montoDescuento < 0) {
      await t.rollback();
      return res.status(400).json({
        error:
          "El monto de descuento no puede ser mayor al precio del producto",
      });
    }

    //encontrar todos los descuento sobre el producto y su categoría para verificar que no exista otro descuento activo

    const descuentosExistentes = await DescuentoSobre.findAll({
      where: {
        [Op.or]: [
          { idProducto: idProducto },
          { idCategoria: producto.idCategoria },
        ],
      },
      include: [
        {
          model: Descuento,
          where: { estadoDescuento: "Activo" },
          required: true,
        },
      ],
      transaction: t,
    });

    const sumaDescuentos = descuentosExistentes.reduce((total, ds) => {
      const info = ds.Descuento;
      let valorEnDinero = 0;

      if (info.porcentajeDescuento && Number(info.porcentajeDescuento) > 0) {
        valorEnDinero = Math.round(
          (producto.precioVenta * Number(info.porcentajeDescuento)) / 100,
        );
      } else {
        valorEnDinero = Number(info.montoDescuento);
      }

      return total + valorEnDinero;
    }, 0);

    let nuevoDescuentoEnDinero = 0;

    if (nuevoPorcentaje && Number(nuevoPorcentaje) > 0) {
      nuevoDescuentoEnDinero = Math.round(
        (producto.precioVenta * Number(nuevoPorcentaje)) / 100,
      );
    } else {
      nuevoDescuentoEnDinero = Number(nuevoMonto);
    }

    if (sumaDescuentos + nuevoDescuentoEnDinero > producto.precioVenta) {
      await t.rollback();
      return res.status(400).json({
        error:
          "La suma de los descuentos no puede ser mayor al precio del producto",
      });
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

    const productos = await Producto.findAll({
      where: { idCategoria: idCategoria },
      include: [
        {
          model: DescuentoSobre,
          required: false,
          include: [
            {
              model: Descuento,
              where: { estadoDescuento: "Activo" },
              required: false,
            },
          ],
        },
      ],
      transaction: t,
    });

    const descuentosCategoriaExistentes = await DescuentoSobre.findAll({
      where: { idCategoria: idCategoria },
      include: [
        {
          model: Descuento,
          where: { estadoDescuento: "Activo" },
          required: true,
        },
      ],
      transaction: t,
    });

    for (const prod of productos) {
      const precioVenta = Number(prod.precioVenta);
      let totalDescuentosAcumulados = 0;

      // A) Sumar los descuentos que la categoría ya tiene actualmente
      for (const dsCat of descuentosCategoriaExistentes) {
        const d = dsCat.Descuento || dsCat.descuento;
        if (d) {
          if (d.porcentajeDescuento && Number(d.porcentajeDescuento) > 0) {
            totalDescuentosAcumulados += Math.round(
              (precioVenta * Number(d.porcentajeDescuento)) / 100,
            );
          } else {
            totalDescuentosAcumulados += Number(d.montoDescuento || 0);
          }
        }
      }
      const listaDescuentosProd =
        prod.DescuentoSobres || prod.descuentoSobres || [];

      if (listaDescuentosProd.length > 0) {
        for (const dsProd of listaDescuentosProd) {
          const d = dsProd.Descuento || dsProd.descuento;

          if (d) {
            // 🚀 Protegemos nuevamente contra el undefined
            if (d.porcentajeDescuento && Number(d.porcentajeDescuento) > 0) {
              totalDescuentosAcumulados += Math.round(
                (precioVenta * Number(d.porcentajeDescuento)) / 100,
              );
            } else {
              totalDescuentosAcumulados += Number(d.montoDescuento || 0);
            }
          }
        }
      }

      // C) Calcular cuánto dinero representa el NUEVO descuento que estamos intentando crear
      let valorNuevoDescuento = 0;
      if (porcentajeDescuento && Number(porcentajeDescuento) > 0) {
        valorNuevoDescuento = Math.round(
          (precioVenta * Number(porcentajeDescuento)) / 100,
        );
      } else {
        valorNuevoDescuento = Number(montoDescuento || 0);
      }

      if (totalDescuentosAcumulados + valorNuevoDescuento > precioVenta) {
        await t.rollback();
        return res.status(400).json({
          message: `Error: El producto '${prod.nombre}' (Precio: $${precioVenta}) quedaría con saldo negativo si aplicas este descuento. (Descuentos actuales: $${totalDescuentosAcumulados}).`,
        });
      }
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
