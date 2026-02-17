const Sucursal = require("../../models/inventario/Sucursal");
const Proveedor = require("../../models/inventario/Proveedor");
const CompraProveedor = require("../../models/inventario/CompraProveedor");
const VendedorProveedor = require("../../models/inventario/VendedorProveedor");
const CompraProveedorDetalle = require("../../models/inventario/CompraProveedorDetalle");
const Producto = require("../../models/inventario/Productos");
const Funcionario = require("../../models/Usuarios/Funcionario");
const Despacho = require("../../models/inventario/Despacho");
const Lote = require("../../models/inventario/Lote");
const LoteProducto = require("../../models/inventario/LoteProducto");
const Inventario = require("../../models/inventario/Inventario");
const OrdenCompra = require("../../models/inventario/OrdenCompra");
const { Op } = require("sequelize");
const { sequelize } = require("../../models");

//otros controladores
const { crearLote } = require("./Lote.controller");

//funciones
async function generarNombreOrden() {
  const hoy = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const ordenesHoy = await CompraProveedor.count({
    where: {
      fechaCompra: {
        [Op.gte]: new Date().setHours(0, 0, 0, 0),
      },
    },
  });
  return `OC-${hoy}-${String(ordenesHoy + 1).padStart(3, "0")}`;
}

///------------------------funciones importantes------------------------///
// Crear una nueva compra a proveedor
exports.crearOrdenCompraProveedor = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      idSucursal,
      idFuncionario,
      idProveedor,
      idVendedorProveedor,
      productos,
      observaciones,
    } = req.body;

    if (
      !idSucursal ||
      !idFuncionario ||
      !idProveedor ||
      !idVendedorProveedor ||
      !productos ||
      productos.length === 0 ||
      !observaciones
    ) {
      return res
        .status(422)
        .json({ code: 1234, error: "Faltan datos obligatorios" });
    }
    // Crear la orden de compra
    const comprobarSucursal = await Sucursal.findByPk(idSucursal);
    const comprobarProveedor = await Proveedor.findByPk(idProveedor);
    const comprobarVendedor = await VendedorProveedor.findOne({
      where: {
        [Op.and]: [
          { idProveedor: idProveedor },
          { idVendedorProveedor: idVendedorProveedor },
        ],
      },
    });
    const comprobarFuncionario = await Funcionario.findByPk(idFuncionario);

    if (!comprobarSucursal) {
      return res
        .status(404)
        .json({ code: 1235, error: "Sucursal no encontrada" });
    }
    if (!comprobarProveedor) {
      return res
        .status(404)
        .json({ code: 1236, error: "Proveedor no encontrado" });
    }
    if (!comprobarVendedor) {
      return res.status(404).json({
        code: 1237,
        error:
          "Vendedor del proveedor no encontrado para el proveedor indicado",
      });
    }
    if (!comprobarFuncionario) {
      return res
        .status(404)
        .json({ code: 1238, error: "Funcionario no encontrado" });
    }
    const totalCompra = productos.reduce(
      (total, item) =>
        total + item.valorUnitarioProducto * item.cantidadProducto,
      0
    );

    // Crear la Orden compra proveedor
    const nuevaOrdenCompra = await OrdenCompra.create({
      nombreOrden: await generarNombreOrden(),
      fechaOrden: new Date(),
      estado: "pendiente",
      total: totalCompra,
      observaciones,
      detalleEstado: "Orden creada y pendiente de aprobación",
      idFuncionario: comprobarFuncionario.idFuncionario,
      idSucursal: comprobarSucursal.idSucursal,
      idProveedor: comprobarProveedor.idProveedor,
    });
    if (!nuevaOrdenCompra) {
      console.log(
        "Fallo al crear la orden de compra proveedor",
        nuevaOrdenCompra
      );
      return res.status(500).json({
        code: 1242,
        error: "Error al crear la orden de compra proveedor",
      });
    }

    // Crear los detalles de la compra
    for (const item of productos) {
      const { productoSeleccionado, cantidadProducto, valorUnitarioProducto } =
        item;
      const totalProducto = cantidadProducto * valorUnitarioProducto;
      const comprobarProducto = await Producto.findByPk(productoSeleccionado);
      if (!comprobarProducto) {
        return res.status(404).json({
          code: 1241,
          error: `Producto con ID ${productoSeleccionado} no encontrado`,
        });
      }
      const nuevaCompraProveedorDetalle = await CompraProveedorDetalle.create({
        idOrdenCompra: nuevaOrdenCompraProveedor.idOrdenCompra,
        nombreProducto: comprobarProducto.nombre,
        idProducto: productoSeleccionado,
        cantidad: cantidadProducto,
        precioUnitario: valorUnitarioProducto,
        total: totalProducto,
      });
      if (!nuevaCompraProveedorDetalle) {
        console.log(
          "Fallo al crear el detalle de la compra proveedor",
          nuevaCompraProveedorDetalle
        );
        return res.status(500).json({
          code: 1240,
          error: "Error al crear el detalle de la orden de compra a proveedor",
        });
      }
    }
    await t.commit();
    res.status(201).json({
      message: "Orden de compra a proveedor creada con éxito",
      compraProveedor: nuevaOrdenCompra,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al crear la orden de compra a proveedor:", error);
    res
      .status(500)
      .json({ error: "Error al crear la orden de compra a proveedor" });
  }
};

///================== Verificar ya que se cambio los modelos==================///
exports.obtenerOrdenesCompraProveedores = async (req, res) => {
  try {
    const ordenesCompra = await OrdenCompra.findAll({
      include: [
        {
          model: Proveedor,
          attributes: ["idProveedor", "nombre", "rut", "email"],
        },
        {
          model: Funcionario,
          attributes: ["idFuncionario", "nombre", "email"],
        },
        {
          model: Sucursal,
          attributes: ["idSucursal", "nombre", "direccion"],
        },
        {
          model: CompraProveedorDetalle,

          include: [
            {
              model: Producto,
            },
          ],
        },
      ],
      order: [["fechaCompra", "DESC"]],
    });
    if (ordenesCompra.length === 0 || !ordenesCompra) {
      return res.status(204).json({
        message: "No hay ordenes de compra a proveedores disponibles",
      });
    }
    res.status(200).json(ordenesCompra);
  } catch (error) {
    console.error(
      "Error al obtener las ordenes de compra a proveedores:",
      error
    );
    res
      .status(500)
      .json({ error: "Error al obtener las ordenes de compra a proveedores" });
  }
};

///==========================Verificar Modelo de estas funciones==========================///

// Crear una nueva orden de compra directa (Creada por administrador)
exports.createOrdenCompraDirecta = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // Extraer los datos del cuerpo de la solicitud
    const {
      rutProveedor,
      idSucursal,
      observaciones,
      nombreFuncionario,
      productos,
      total,
    } = req.body;
    // console.log("Datos recibidos para OC Directa:", req.body);
    // Validar que se recibieron todos los datos necesarios
    if (
      !rutProveedor ||
      !idSucursal ||
      // !nombreFuncionario ||
      !productos ||
      productos.length === 0 ||
      !total
    ) {
      return res
        .status(422)
        .json({ code: 1300, error: "Faltan datos obligatorios" });
    }
    //Iniciar transaccion
    // validar datos con joi o similar (opcional)

    //Comprobar que el proveedor, sucursal y funcionario existen
    const comprobarProveedor = await Proveedor.findOne({
      where: { rut: rutProveedor },
    });
    const comprobarSucursal = await Sucursal.findByPk(idSucursal);
    const comprobarFuncionario = await Funcionario.findOne({
      where: { nombre: nombreFuncionario },
    });

    if (!comprobarProveedor) {
      return res
        .status(404)
        .json({ code: 1301, error: "Proveedor no encontrado" });
    }
    if (!comprobarSucursal) {
      return res
        .status(404)
        .json({ code: 1302, error: "Sucursal no encontrada" });
    }
    if (!comprobarFuncionario) {
      return res
        .status(404)
        .json({ code: 1303, error: "Funcionario no encontrado" });
    }

    // Crear la orden de compra (Tabla CompraProveedor)
    // Con estado pendiente por defecto, cuando se cree el registo en tabla detalle se actualiza el estado a aprobada
    const nuevaOrdenCompraDirecta = await OrdenCompra.create({
      nombreOrden: await generarNombreOrden(),
      fechaCompra: new Date(),
      estado: "creada",
      tipo: "compra directa",
      total: total,
      observaciones: observaciones,
      idSucursal: idSucursal,
      idProveedor: comprobarProveedor.idProveedor,
      idFuncionario: comprobarFuncionario.idFuncionario,
    });
    //comprobar creación orden
    if (!nuevaOrdenCompraDirecta) {
      console.log(
        "Fallo al crear la compra proveedor",
        nuevaOrdenCompraDirecta
      );
      return res.status(500).json({
        error: "Error al crear la orden de compra a proveedor",
      });
    }

    // Crear los detalles de la compra (Tabla CompraProveedorDetalle)
    for (const item of productos) {
      const { idProducto, nombre, cantidad, precioUnitario, subtotal } = item;
      //comprobar que el producto existe
      let comprobarProducto = await Producto.findByPk(idProducto);
      if (!comprobarProducto) {
        //await nuevaOrdenCompraDirecta.update({ estado:"fallo detalle sistema" });
        return res
          .status(404)
          .json({ error: `Producto con ID ${idProducto} no encontrado` });
      }
      //crear el detalle de la compra
      const nuevaCompraProveedorDetalle = await CompraProveedorDetalle.create({
        cantidad: cantidad,
        precioUnitario: precioUnitario,
        subtotal: subtotal,
        idOrdenCompra: nuevaOrdenCompraDirecta.idOrdenCompra,
        idProducto: idProducto,
      });
      //comprobar creación detalle
      if (!nuevaCompraProveedorDetalle) {
        console.log(
          "Fallo al crear el detalle de la compra proveedor",
          nuevaCompraProveedorDetalle
        );
        //await nuevaOrdenCompraDirecta.update({ estado: "fallo detalle" });
        return res.status(500).json({
          error: "Error al crear el detalle de la orden de compra a proveedor",
        });
      }
    }
    // Si todo sale bien, actualizar el estado de la orden a pendiente recibir
    await nuevaOrdenCompraDirecta.update({ estado: "pendiente recibir" });
    //Guardar transaccion si sale todo bien
    await t.commit();
    return res
      .status(201)
      .json({ message: "Orden de compra directa creada exitosamente" });
  } catch (error) {
    //Elimina todo lo que se genero durante la transaccion
    await t.rollback();
    console.log("Error al crear orden de compra directa:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
};

//Ver Ordenes de compra directa (Creada por admin)
exports.obtenerOrdenesCompraDirecta = async (req, res) => {
  try {
    // recordar validar que el usuario es admin con middleware en routes

    //obetner ordenes de compra directa
    const ordenesCompraDirecta = await OrdenCompra.findAll({
      where: { estado: { [Op.notIn]: ["cancelada"] } },
      include: [
        {
          model: Proveedor,
          attributes: ["rut", "nombre", "rut", "email"],
        },
        {
          model: Funcionario,
          attributes: ["rut", "nombre", "email"],
        },
        {
          model: Sucursal,
          attributes: ["idSucursal", "nombre", "direccion"],
        },
        {
          model: CompraProveedorDetalle,

          include: [
            {
              model: Producto,
              attributes: ["codigo", "nombre", "marca", "descripcion"],
            },
          ],
        },
      ],
      order: [["fechaOrden", "DESC"]],
    });
    if (ordenesCompraDirecta.length === 0 || !ordenesCompraDirecta) {
      return res.status(204).json({
        message: "No hay ordenes de compra directa disponibles",
      });
    }
    res.status(200).json(ordenesCompraDirecta);
  } catch (error) {
    console.error(
      "Error al obtener las ordenes de compra directa a proveedores:",
      error
    );
    res
      .status(500)
      .json({ error: "Error al obtener las ordenes de compra directa" });
  }
};

//eliminar o cancelar ordenes de compra cualuquiera
exports.cancelarOrdenCompra = async (req, res) => {
  try {
    //verificar que existe la orden
    const { idCompraProveedor } = req.params;
    console.log("ID de la orden a cancelar:", idCompraProveedor);
    const t = await sequelize.transaction();
    if (
      !idCompraProveedor ||
      idCompraProveedor === "" ||
      idCompraProveedor === null ||
      idCompraProveedor === undefined
    ) {
      return res
        .status(422)
        .json({ error: "ID de la orden de compra es obligatorio" });
    }
    const ordenCompra = await OrdenCompra.findByPk(idCompraProveedor);
    if (!ordenCompra) {
      return res
        .status(404)
        .json({ error: "Orden de compra a proveedor no encontrada" });
    }
    //actualizar estado a cancelada
    await ordenCompra.update({ estado: "cancelada" });
    await t.commit();
    res
      .status(200)
      .json({ message: "Orden de compra a proveedor cancelada exitosamente" });
  } catch (error) {
    await t.rollback();
    console.error("Error al cancelar la orden de compra a proveedores:", error);
    res
      .status(500)
      .json({ error: "Error al cancelar la orden de compra a proveedores" });
  }
};

// Cambiar el estado de una orden de compra
exports.cambiarEstadoOrdenCompra = async (req, res) => {
  try {
    const { idCompraProveedor } = req.params;
    const { estado, observaciones } = req.body;
    if (!estado || estado === "" || estado === null || estado === undefined) {
      return res.status(422).json({ error: "El nuevo estado es obligatorio" });
    }
    if (
      idCompraProveedor === "" ||
      idCompraProveedor === null ||
      idCompraProveedor === undefined
    ) {
      return res
        .status(422)
        .json({ error: "ID de la orden de compra es obligatorio" });
    }
    const t = await sequelize.transaction();
    // Verificar que la orden de compra existe
    const ordenCompra = await OrdenCompra.findByPk(idCompraProveedor);
    if (!ordenCompra) {
      return res
        .status(404)

        .json({ error: "Orden de compra a proveedor no encontrada" });
    }
    // actualizar orden de compra
    await ordenCompra.update({
      estado: estado,
      observaciones: ordenCompra.observaciones
        ? `${ordenCompra.observaciones}\n${observaciones}`
        : observaciones,
    });
    await t.commit();
    res.status(200).json({
      message: "Estado de la orden de compra actualizado exitosamente",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al cambiar el estado de la orden de compra:", error);
    res
      .status(500)
      .json({ error: "Error al cambiar el estado de la orden de compra" });
  }
};

// Editar una orden de compra a proveedor
exports.editarOrdenCompraProveedor = async (req, res) => {
  try {
    const { idCompraProveedor } = req.params;
    const { productos, observaciones } = req.body;
    if (
      !productos ||
      productos.length === 0 ||
      productos === null ||
      productos === undefined
    ) {
      return res
        .status(422)
        .json({ error: "La lista de productos es obligatoria" });
    }
    if (
      idCompraProveedor === "" ||
      idCompraProveedor === null ||
      idCompraProveedor === undefined
    ) {
      return res
        .status(422)
        .json({ error: "ID de la orden de compra es obligatorio" });
    }
    const t = await sequelize.transaction();
    const comprobarOrden = await OrdenCompra.findByPk(idCompraProveedor);
    if (!comprobarOrden) {
      return res
        .status(404)
        .json({ error: "Orden de compra a proveedor no encontrada" });
    }
    // Actualizar los detalles de la orden de compra
    comprobarOrden.update({ observaciones: observaciones });

    // editar detalle productos
    const comprobarOrdenDetalles = await CompraProveedorDetalle.findAll({
      where: { idOrdenCompra: idCompraProveedor },
    });
    for (const item of productos) {
      const { idCompraProveedorDetalle, cantidad, precioUnitario } = item;
      const detalle = comprobarOrdenDetalles.find(
        (d) => d.idCompraProveedorDetalle === idCompraProveedorDetalle
      );
      if (detalle) {
        const totalProducto = cantidad * precioUnitario;
        await detalle.update({
          cantidad: cantidad,
          precioUnitario: precioUnitario,
          total: totalProducto,
        });
      }
    }
    // Recalcular el total de la orden de compra
    let totalOrden = 0;
    for (const item of productos) {
      totalOrden += item.cantidad * item.precioUnitario;
    }
    await comprobarOrden.update({ total: totalOrden });
    await t.commit();
    res.status(200).json({
      message: "Orden de compra a proveedor editada exitosamente",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al editar la orden de compra a proveedor:", error);
    res
      .status(500)
      .json({ error: "Error al editar la orden de compra a proveedor" });
  }
};

//------------------Funciones de despacho relacionadas con compra proveedor------------------//
exports.buscarTodasOrdenesParaRecepcion = async (req, res) => {
  try {
    const ordenesCompra = await CompraProveedor.findAll({
      include: [
        {
          model: Proveedor,
          attributes: ["idProveedor", "nombre", "rut", "email"],
        },
        {
          model: Funcionario,
          attributes: ["idFuncionario", "nombre", "email"],
        },
        {
          model: Sucursal,
          attributes: ["idSucursal", "nombre", "direccion"],
        },
        {
          model: CompraProveedorDetalle,
          include: [
            {
              model: Producto,
              attributes: ["idProducto", "nombre", "marca", "descripcion"],
            },
          ],
        },
      ],
      order: [["fechaCompra", "DESC"]],
    });

    if (!ordenesCompra || ordenesCompra.length === 0) {
      return res.status(204).json({
        message: "No hay ordenes de compra a proveedores disponibles",
      });
    }
    res.status(200).json(ordenesCompra);
  } catch (error) {
    console.error(
      "Error al buscar las órdenes de compra para recepción:",
      error
    );
    res
      .status(500)
      .json({ error: "Error al buscar las órdenes de compra para recepción" });
  }
};

exports.buscarOrdenesCompraParaRecepcion = async (req, res) => {
  try {
    const { rutProveedor } = req.params;

    //verificar que el proveedor existe
    const comprobarProveedor = await Proveedor.findOne({
      where: { rut: rutProveedor },
    });
    if (!comprobarProveedor) {
      return res
        .status(404)
        .json({ code: 1301, error: "Proveedor no encontrado" });
    }
    //console.log("Proveedor encontrado:", comprobarProveedor);
    //encontrar ordenes de compra asociadas al proveedor
    const ordenesCompra = await OrdenCompra.findAll({
      where: {
        idProveedor: comprobarProveedor.idProveedor,
        estado: {
          [Op.notIn]: ["rechazada", "recibida", "cancelada"],
        },
      },
      include: [
        {
          model: Proveedor,
          attributes: ["idProveedor", "nombre", "rut", "email"],
        },
        {
          model: Funcionario,
          attributes: ["idFuncionario", "nombre", "email"],
        },
        {
          model: Sucursal,
          attributes: ["idSucursal", "nombre", "direccion"],
        },
        {
          model: CompraProveedorDetalle,
          include: [
            {
              model: Producto,
              attributes: ["idProducto", "nombre", "marca", "descripcion"],
            },
          ],
        },
      ],
      order: [["fechaOrden", "DESC"]],
    });
    // console.log("Ordenes de compra encontradas:", ordenesCompra);
    if (!ordenesCompra || ordenesCompra.length === 0) {
      return res.status(204).json({
        message: "No hay ordenes de compra a proveedores disponibles",
      });
    }
    res.status(200).json(ordenesCompra);
  } catch (error) {
    console.error(
      "Error al buscar las órdenes de compra para recepción:",
      error
    );
    res
      .status(500)
      .json({ error: "Error al buscar las órdenes de compra para recepción" });
  }
};

exports.confirmacionRecepcionOrdenCompra = async (req, res) => {
  try {
    const { idCompraProveedor } = req.params;

    //buscar orden de compra
    const ordenCompra = await CompraProveedor.findByPk(idCompraProveedor);
    if (!ordenCompra) {
      return res
        .status(404)
        .json({ error: "Orden de compra a proveedor no encontrada" });
    }
    //actualizar estado orden de compra a recibida
    await ordenCompra.update({ estado: "recibida" });
    //verificar si existe un despacho asociado a la orden de compra
    const despachoAsociado = await Despacho.findOne({
      where: { idCompraProveedor: idCompraProveedor },
    });
    if (despachoAsociado) {
      //actulizar estado despacho a entregado
      await despachoAsociado.update({ estado: "Entregado" });
      //buscar lote asociado al despacho
      const loteAsociado = await Lote.findByPk(despachoAsociado.idLote);
      if (loteAsociado) {
        //actualizar estado lote a recibido
        await loteAsociado.update({ estado: "recibido" });
      }
      //buscar los detalles de la orden de compra para actualizar stock
      const detallesOrden = await CompraProveedorDetalle.findAll({
        where: { idCompraProveedor: idCompraProveedor },
      });
      for (const detalle of detallesOrden) {
        const producto = await Producto.findByPk(detalle.idProducto);
        if (producto) {
          //Agregar a tabla lote producto
          const loteProducto = await LoteProducto.create({
            idLote: loteAsociado.idLote,
            idProducto: producto.idProducto,
            cantidad: detalle.cantidad,
            fechaIngreso: new Date(),
            fechaVencimiento: new Date(
              new Date().setFullYear(new Date().getFullYear() + 1)
            ),
            estado: "disponible",
          });
        }
      }

      //actualizar estado inventario
      const inventario = await Inventario.findOne({
        where: { idSucursal: ordenCompra.idSucursal },
      });
    }
  } catch (error) {
    console.error(
      "Error al confirmar la recepción de la orden de compra:",
      error
    );
    res
      .status(500)
      .json({ error: "Error al confirmar la recepción de la orden de compra" });
  }
};
