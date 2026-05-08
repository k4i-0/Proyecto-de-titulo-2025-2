const Sucursal = require("../../models/inventario/Sucursal");
const Proveedor = require("../../models/inventario/Proveedor");
const CompraProveedor = require("../../models/inventario/CompraProveedor");
const VendedorProveedor = require("../../models/inventario/VendedorProveedor");
const CompraProveedorDetalle = require("../../models/inventario/CompraProveedorDetalle");
const Producto = require("../../models/inventario/Productos");
const Funcionario = require("../../models/Usuarios/Funcionario");
const Despacho = require("../../models/inventario/Despacho");
const DetalleDespacho = require("../../models/inventario/DetalleDespacho");
const Lote = require("../../models/inventario/Lote");
const LoteProducto = require("../../models/inventario/LoteProducto");
const Inventario = require("../../models/inventario/Inventario");
const Bodega = require("../../models/inventario/Bodega");
const Estante = require("../../models/inventario/Estante");
const OrdenCompra = require("../../models/inventario/OrdenCompra");
const CrearOrdenCompra = require("../../models/inventario/CreaOrdenCompra");
const Provee = require("../../models/inventario/Provee");
const { Op, where } = require("sequelize");
const { sequelize } = require("../../models");
const jwt = require("jsonwebtoken");

const { enviarCorreo } = require("../../services/mail.service");
//service
const {
  crearOrdenCompra,
  obtenerOrdenCompra,
  cambiarEstadoOC,
  editarOrdenCompra,
  obtenerOConDetalles,
  eliminarOrdenCompra,
} = require("../../services/inventario/ordenCompra.service");

const {
  crearDetalleOC,
  modificarDetalleOCAdminSucursal,
} = require("../../services/inventario/compraProveedorDetalle.service");

const {
  crearDespacho,
  buscarOCIdProveedor,
} = require("../../services/inventario/despacho.service");
const {
  crearDetalleDespacho,
} = require("../../services/inventario/detalleDespacho.service");
const { crearLote } = require("../../services/inventario/lote.service");

const {
  asociarProductosProveedor,
} = require("../../services/inventario/proveedor.service");

///++++++++++++++++++++++++++++++FUNCIONES PARA ORDEN DE COMPRA DIRECTA (CREADA POR ADMIN)++++++++++++++++++++++++++++++///
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
    const comprobarProveedor = await Proveedor.findOne(
      {
        where: { rut: rutProveedor },
      },
      { transaction: t },
    );
    const comprobarSucursal = await Sucursal.findByPk(idSucursal, {
      transaction: t,
    });
    const comprobarFuncionario = await Funcionario.findOne(
      {
        where: { nombre: nombreFuncionario },
      },
      { transaction: t },
    );

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
    const r = await crearOrdenCompra(
      "compra directa",
      total,
      observaciones,
      "Orden creada y pendiente de aprobación",
      comprobarProveedor.idProveedor,
      comprobarSucursal.idSucursal,
      comprobarFuncionario.idFuncionario,
      comprobarFuncionario.idFuncionario,
    );
    if (r.code !== 201) {
      return res.status(r.code).json({ error: r.error });
    }

    // Crear los detalles de la compra (Tabla CompraProveedorDetalle)
    console.log("Producto", productos);
    const rDetalle = await crearDetalleOC(productos, r.data.idOrdenCompra);
    if (rDetalle.code !== 201) {
      return res.status(rDetalle.code).json({ error: rDetalle.error });
    }

    //asocia productos a proveedor
    const rAsociar = await asociarProductosProveedor(
      productos,
      comprobarProveedor.idProveedor,
    );
    if (rAsociar.code !== 201) {
      return res.status(rAsociar.code).json({ error: rAsociar.error });
    }

    // Si todo sale bien, actualizar el estado de la orden a pendiente recibir
    await r.data.update({ estado: "pendiente recibir" });
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
    const r = await obtenerOrdenCompra(
      { tipo: "compra directa" },
      null,
      [
        {
          model: CrearOrdenCompra,

          include: [
            {
              model: Proveedor,

              attributes: ["idProveedor", "nombre", "rut", "email"],
            },
            {
              model: Sucursal,

              attributes: ["idSucursal", "nombre", "direccion"],
            },
            {
              model: Funcionario,
              as: "vendedor",
              attributes: ["idFuncionario", "rut", "nombre"],
            },
            {
              model: Funcionario,
              as: "administrador",
              attributes: ["idFuncionario", "rut", "nombre"],
            },
          ],
        },
        {
          model: CompraProveedorDetalle,
          include: [
            {
              model: Producto,
              attributes: [
                "idProducto",
                "nombre",
                "codigo",
                "marca",
                "descripcion",
              ],
            },
          ],
        },
      ],
      [["fechaOrden", "DESC"]],
    );
    // 404 en el service significa lista vacía, no un error real de ruta
    if (r.code === 404) {
      return res.status(200).json([]);
    }
    if (r.code !== 200) {
      return res.status(r.code).json({ error: r.error });
    }
    res.status(200).json(r.data);
  } catch (error) {
    console.error(
      "Error al obtener las ordenes de compra directa a proveedores:",
      error,
    );
    res
      .status(500)
      .json({ error: "Error al obtener las ordenes de compra directa" });
  }
};

//cancelar Orden de compra directa
exports.anularOrdenCompraDirecta = async (req, res) => {
  try {
    const { nombreOrden } = req.params;
    const { observaciones } = req.body.datos;
    console.log("Nombre de la orden a cancelar:", nombreOrden);
    console.log("Datos para anular la orden:", observaciones);
    const t = await sequelize.transaction();
    if (
      !nombreOrden ||
      nombreOrden === "" ||
      nombreOrden === null ||
      nombreOrden === undefined ||
      !observaciones ||
      observaciones === "" ||
      observaciones === null ||
      observaciones === undefined
    ) {
      return res.status(422).json({
        error: "Observaciones son obligatorias para anular la orden de compra",
      });
    }
    const r = await cambiarEstadoOC(nombreOrden, "anulada", observaciones);
    if (r.code !== 200) {
      return res.status(r.code).json({ error: r.error });
    }
    await t.commit();
    res.status(200).json({
      message: "Orden de compra directa anulada exitosamente",
    });
  } catch (error) {
    console.error("Error al anular la orden de compra directa:", error);
    return res
      .status(500)
      .json({ error: "Error al anular la orden de compra directa" });
  }
};

//RECEPCIONAR OC DIRECTA
exports.recepcionarOrdenCompraDirecta = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { nombreOrden } = req.params;
    const {
      tipoDocumento,
      numeroDocumento,
      repartidor,
      observaciones,
      // productos: [{ idProducto, cantidad, cantidadRecibida, cantidadRechazada, observaciones, fechaVencimiento }]
      productos,
    } = req.body;

    if (
      !nombreOrden ||
      !tipoDocumento ||
      !productos ||
      productos.length === 0
    ) {
      return res.status(422).json({
        error:
          "Faltan datos obligatorios: nombrenOrden, tipoDocumento y productos son requeridos",
      });
    }

    // Buscar la OC — obtenerOrdenCompra usa findAll, data es un array
    const rOC = await obtenerOrdenCompra(
      { nombreOrden: nombreOrden, tipo: "compra directa" },
      null,
      [
        {
          model: CrearOrdenCompra,
          include: [
            {
              model: Proveedor,
              attributes: ["idProveedor", "nombre", "rut", "email"],
            },
            {
              model: Sucursal,
              attributes: ["idSucursal", "nombre", "direccion"],
            },
          ],
        },
      ],
    );
    if (rOC.code === 404) {
      return res
        .status(404)
        .json({ error: "Orden de compra directa no encontrada" });
    }
    if (rOC.code !== 200) {
      return res.status(rOC.code).json({ error: rOC.error });
    }

    //Asignar la OC encontrada a una variable para trabajar con ella más fácilmente
    const oc = rOC.data[0]; // data es array → tomar el primer elemento

    if (!oc) {
      return res
        .status(404)
        .json({ error: "Orden de compra directa no encontrada" });
    }
    if (oc.estado !== "pendiente recibir") {
      return res.status(400).json({
        error: `La OC no está en estado 'pendiente recibir' (estado actual: ${oc.estado})`,
      });
    }

    //Crea despacho automatico
    // 1. Crear el Despacho
    const despacho = await crearDespacho(
      tipoDocumento,
      "compra directa",
      numeroDocumento || "no indicado",
      repartidor || "no indicado",
      "Recepcionado",
      observaciones || "Recepción de orden de compra directa",
      oc.dataValues.creaOrdenCompra.dataValues.idOrdenCompra,
      t,
    );
    if (despacho.code !== 201) {
      await t.rollback();
      return res.status(despacho.code).json({ error: despacho.error });
    }

    // 2. Calcular totales globales para el DetalleDespacho
    const totalCantidad = productos.reduce(
      (s, p) => s + (Number(p.cantidad) || 0),
      0,
    );
    const totalRecibida = productos.reduce(
      (s, p) => s + (Number(p.cantidadRecibida) || 0),
      0,
    );
    const totalRechazada = productos.reduce(
      (s, p) => s + (Number(p.cantidadRechazada) || 0),
      0,
    );

    // 3. Crear 1 DetalleDespacho
    const detalleDespacho = await crearDetalleDespacho(
      totalCantidad,
      totalRecibida,
      totalRechazada,
      observaciones || "Detalle de recepción generado automáticamente",
      despacho.data.idDespacho,
      t,
    );
    if (detalleDespacho.code !== 201) {
      await t.rollback();
      return res
        .status(detalleDespacho.code)
        .json({ error: detalleDespacho.error });
    }

    // 4. Obtener la Bodega de la Sucursal de la OC (para asignar Lotes e Inventario)

    const bodega = await Bodega.findOne({
      where: {
        idSucursal: oc.dataValues.creaOrdenCompra.dataValues.idSucursal,
        estado: "En Funcionamiento",
        // capacidadDisponible: { [Op.gt]: 0 },
      },
      transaction: t,
    });

    if (!bodega) {
      await t.rollback();
      return res.status(400).json({
        error: "No hay bodega con capacidad disponible en esta sucursal",
      });
    }

    //5. Crear Lotes y Asignar a Bodega (si hay bodega disponible)
    for (const p of productos) {
      const rLote = await crearLote(
        "disponible",
        p.cantidadRecibida,
        p.fechaVencimiento ? new Date(p.fechaVencimiento) : null,
        p.idProducto,
        detalleDespacho.data.idDetalledespacho,
        bodega?.idBodega || null,
        t,
      );
      if (rLote.code !== 201) {
        await t.rollback();
        return res.status(rLote.code).json({ error: rLote.error });
      }
      //Actualizar Inventario (stock) de cada producto recibido
      const busquedaProductoInventario = await Inventario.findOne({
        where: {
          idBodega: bodega?.idBodega,
          idProducto: p.idProducto,
        },
        transaction: t,
      });
      if (!busquedaProductoInventario) {
        //crear nuevo registro en inventario con la cantidad recibida
        const nuevoRegistroInventario = await Inventario.create(
          {
            stock: p.cantidadRecibida,
            estado: "Bueno",
            idProducto: p.idProducto,
            idBodega: bodega?.idBodega,
          },
          { transaction: t },
        );
        if (!nuevoRegistroInventario) {
          await t.rollback();
          return res
            .status(500)
            .json({ error: "Error al actualizar inventario" });
        }
      } else {
        //actualizar el stock sumando la cantidad recibida
        const nuevoStock =
          busquedaProductoInventario.stock + p.cantidadRecibida;
        await busquedaProductoInventario.update(
          { stock: nuevoStock },
          { transaction: t },
        );
      }
    }
    //Cambiar estado OC a recepcionada
    await cambiarEstadoOC(
      nombreOrden,
      "recepcionada",
      "Orden recepcionada exitosamente",
    );

    await t.commit();
    return res.status(200).json({
      message: "Recepción completada",
      idDespacho: despacho.data.idDespacho,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al recepcionar la orden de compra directa:", error);
    return res
      .status(500)
      .json({ error: "Error al recepcionar la orden de compra directa" });
  }
};

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

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
      error,
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
          [Op.notIn]: ["rechazada", "recepcionada", "cancelada"],
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
      error,
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
              new Date().setFullYear(new Date().getFullYear() + 1),
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
      error,
    );
    res
      .status(500)
      .json({ error: "Error al confirmar la recepción de la orden de compra" });
  }
};

//----------------------Funciones de orden de compra a proveedor para vendedores------------------//

exports.obtenerOrdenesCompraVendedor = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const respuesta = await obtenerOrdenCompra(
      {
        tipo: "compra sucursal",
        estado: { [Op.notIn]: ["cancelada"] },
      },
      null,
      [
        {
          model: CrearOrdenCompra,
          include: [
            {
              model: Proveedor,
              attributes: ["idProveedor", "nombre", "rut", "email"],
            },
            {
              model: Sucursal,
              attributes: ["idSucursal", "nombre", "direccion"],
            },
            {
              model: Funcionario,
              as: "vendedor",
              attributes: ["idFuncionario", "rut", "nombre"],
            },
          ],
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
      [["fechaOrden", "DESC"]],
      t,
    );

    if (respuesta.code != 200) {
      await t.rollback();
      return res.status(respuesta.code).json({ error: respuesta.error });
    }
    await t.commit();
    res.status(200).json(respuesta.data);
  } catch (error) {
    console.warn(
      "Error al obtener ordenes de compra a proveedor desde vendedor:",
      error,
    );
    res.status(500).json({
      error: "Error al obtener ordenes de compra a proveedor desde vendedor",
    });
  }
};

exports.obtenerOrdenCompraVendedorPorNombreOrden = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { nombreOrden } = req.params;

    //buscar orden de compra por nombreOrden
    const orden = await CrearOrdenCompra.findOne({
      include: [
        {
          model: Proveedor,
          attributes: ["idProveedor", "rut", "nombre"],
        },
        {
          model: OrdenCompra,
          where: {
            estado: [
              "pendiente recibir",
              "recepcionada",
              "recibida con faltante",
              "despachada",
            ],
            tipo: "compra sucursal",
            nombreOrden: nombreOrden,
          },
          include: [
            {
              model: CompraProveedorDetalle,
              attributes: ["cantidad"],
              include: [
                {
                  model: Producto,
                  attributes: ["idProducto", "codigo", "nombre"],
                },
              ],
            },
            {
              model: Despacho,
              attributes: ["idDespacho", "codigoDespacho", "estado"],
              include: [
                {
                  model: DetalleDespacho,
                  attributes: [
                    "cantidad",
                    "cantidadRecibida",
                    "cantidadRechazada",
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Sucursal,
          attributes: ["idSucursal", "nombre"],
        },
        {
          model: Funcionario,
          as: "vendedor",
          attributes: ["rut", "nombre"],
        },
      ],
    });
    if (!orden) {
      return res.status(404).json({ error: "Orden de compra no encontrada" });
    }
    return res.status(200).json(orden);
  } catch (error) {
    console.warn("Error al recepcionar orden de compra con faltantes:", error);
    res.status(500).json({
      error: "Error al recepcionar orden de compra con faltantes",
    });
  }
};

exports.crearOrdenCompraVendedor = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      rutProveedor,
      idSucursal,
      observaciones,
      idFuncionario,
      productos,
      total,
    } = req.body;

    if (
      !rutProveedor ||
      !idSucursal ||
      !idFuncionario ||
      !productos ||
      !total ||
      !observaciones
    ) {
      return res.status(422).json({ error: "Faltan datos obligatorios" });
    }
    console.log("Crear OC idsucursal", req.body);

    //verificar que el proveedor, sucursal y funcionario existen
    const comprobarProveedor = await Proveedor.findOne({
      where: { rut: rutProveedor },
      transaction: t,
    });
    const comprobarSucursal = await Sucursal.findByPk(idSucursal, {
      transaction: t,
    });
    const comprobarFuncionario = await Funcionario.findByPk(idFuncionario, {
      transaction: t,
    });

    if (!comprobarProveedor) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }
    if (!comprobarSucursal) {
      return res.status(404).json({ error: "Sucursal no encontrada" });
    }
    if (!comprobarFuncionario) {
      return res.status(404).json({ error: "Funcionario no encontrado" });
    }

    //crear orden de compra a proveedor desde vendedor
    const respuestaOC = await crearOrdenCompra(
      "compra sucursal",
      total,
      observaciones,
      "Orden creada",
      comprobarProveedor.idProveedor,
      idSucursal,
      idFuncionario,
      t,
    );
    if (respuestaOC.code !== 201) {
      console.log("fallo crear Orden compra");
      return res.status(respuestaOC.code).json({ error: respuestaOC.error });
    }
    //crear detalle de orden de compra
    const rDetalle = await crearDetalleOC(
      productos,
      respuestaOC.data.idOrdenCompra,
      t,
    );
    if (rDetalle.code !== 201) {
      console.log("Fallo Crear Detalle orden compra");
      return res.status(rDetalle.code).json({ error: rDetalle.error });
    }
    //asignar como proveedor del los productos al proveedor seleccionado en la orden de compra
    for (const p of productos) {
      const proveedorProvee = await Provee.findOrCreate({
        where: {
          idProveedor: comprobarProveedor.idProveedor,
          idProducto: p.idProducto,
        },
        defaults: {
          registradoPor: "Sistema",
          estado: "Activo",
          fechaRegistro: new Date(),
        },
        transaction: t,
      });
    }
    //actualizar estado de la orden a pendiente de aprobacion
    await respuestaOC.data.update(
      { estado: "pendiente de aprobacion" },
      { transaction: t },
    );
    await t.commit();
    //notificar a admiistrador mediante correo o similar.
    res
      .status(201)
      .json({ message: "Orden de compra a proveedor creada exitosamente" });
  } catch (error) {
    console.warn(
      "Error al crear orden de compra a proveedor desde vendedor:",
      error,
    );
    res.status(500).json({
      error: "Error al crear orden de compra a proveedor desde vendedor",
    });
  }
};

exports.buscarOrdenesCompraSucursalVendedor = async (req, res) => {
  try {
    const { rutProveedor } = req.params;
    if (!rutProveedor) {
      return res.status(422).json({ error: "Rut de proveedor es requerido" });
    }
    //verificar con joi rut

    //verificar que el proveedor existe
    const comprobarProveedor = await Proveedor.findOne({
      where: { rut: rutProveedor },
    });
    if (!comprobarProveedor) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }
    //encontrar ordenes de compra asociadas al proveedor

    console.log("Proveedor encontrado:", comprobarProveedor.idProveedor);

    const ordenesCompra = await buscarOCIdProveedor(
      comprobarProveedor.idProveedor,
    );
    if (ordenesCompra.code === 404) {
      return res.status(200).json([]);
    }
    if (ordenesCompra.code !== 200) {
      return res
        .status(ordenesCompra.code)
        .json({ error: ordenesCompra.error });
    }
    res.status(200).json(ordenesCompra.data);
  } catch (error) {
    console.warn(
      "Error al recepcionar orden de compra a proveedor desde vendedor:",
      error,
    );
    res.status(500).json({
      error: "Error al recepcionar orden de compra a proveedor desde vendedor",
    });
  }
};

exports.recepcionarOrdenCompraSucursalVendedor = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      idOrdenCompra,
      idProveedor,
      tipoDocumento,
      numeroDocumento,
      repartidor,
      observaciones,
      productos,
      idSucursal,
      idBodega,
    } = req.body;

    console.log("Datos back", req.body);

    //verific ar con joi los datos recibidos

    //verificar que la orden de compra existe y esta en estado pendiente de aprobacion
    const verificarOC = await OrdenCompra.findOne({
      where: { idOrdenCompra: idOrdenCompra, tipo: "compra sucursal" },
      transaction: t,
    });
    if (!verificarOC) {
      await t.rollback();
      return res.status(404).json({ error: "Orden de compra no encontrada" });
    }

    //Asignar la OC encontrada a una variable para trabajar con ella más fácilmente
    //const oc = verificarOC.data.map((p) => p.get({ plain: true }))[0];
    //console.log("Orden de compra encontrada linea 874:", verificarOC);

    let estadoRecepcion = "Recepcionado";
    let faltantes = 0;

    //verificar que la OC esta en estadorecibida con faltante recibida con faltante
    if (verificarOC.estado === "recibida con faltante") {
      //buscar despacho asociado a la OC
      const despachoAsociado = await Despacho.findAll({
        where: { idOrdenCompra: idOrdenCompra },
        transaction: t,
      });
      console.log("Despachos asociado:", despachoAsociado);

      if (!despachoAsociado || despachoAsociado.length === 0) {
        console.info(
          "No se encontró despacho asociado a la OC con faltante, creando nuevo despacho",
        );
        //cambiando estado de la OC a pendiente de recibir para que se pueda crear un nuevo despacho
        await verificarOC.update(
          { estado: "pendiente recibir" },
          { transaction: t },
        );
      } else {
        console.info(
          "Despacho asociado a la OC con faltante encontrado, actualizando despacho existente",
        );
        //calcular cuanto se entrego y cuanto falta por entregar sumando los detalles del despacho

        for (const p of productos) {
          const detalleDespacho = await DetalleDespacho.findAll({
            where: {
              idDespacho: {
                [Op.in]: despachoAsociado.map((d) => d.idDespacho),
              },
            },
            include: [
              {
                model: Lote,
                where: { idProducto: p.idProducto },
              },
            ],
            transaction: t,
          });

          const detalleOrden = await CompraProveedorDetalle.findOne({
            where: { idOrdenCompra: idOrdenCompra, idProducto: p.idProducto },
          });
          console.log(
            "detalle despacho",
            JSON.stringify(detalleDespacho, null, 2),
          );
          console.log("detalle orden", JSON.stringify(detalleOrden, null, 2));

          //crear un objeto para ingresarlo al array con cantidad recibida, cantidad rechazada y cantidad pendiente por recibir y producto
          const cantidadRecibidaInv = detalleDespacho.reduce(
            (acc, lotes) => acc + lotes?.cantidadRecibida,
            0,
          );
          const cantidadRechazadaInf = detalleDespacho.reduce(
            (acc, lotes) => acc + lotes?.cantidadRechazada,
            0,
          );
          console.log(
            "Cantidades:",
            cantidadRecibidaInv,
            cantidadRechazadaInf,
            detalleOrden.cantidad,
          );

          if (cantidadRecibidaInv === detalleOrden.cantidad) {
            verificarOC.update({ estado: "recepcionada" }, { transaction: t });
            console.log("Orden Cambiada a Recepcionada");
            return res
              .status(400)
              .json({ error: "Producto ya fue completamente recibido" });
          }
          if (
            p.cantidadRecibida + cantidadRecibidaInv >
            detalleOrden.cantidad
          ) {
            await t.rollback();
            return res.status(400).json({
              error:
                "La cantidad recibida no puede ser mayor a la cantidad solicitada",
            });
          }
          if (
            p.cantidadRechazada + cantidadRechazadaInf >
            detalleOrden.cantidad
          ) {
            await t.rollback();
            return res.status(400).json({
              error:
                "La cantidad rechazada no puede ser mayor a la cantidad solicitada",
            });
          }
          if (
            p.cantidadRecibida + cantidadRecibidaInv <
            detalleOrden.cantidad
          ) {
            estadoRecepcion = "Entregado Con Faltantes";
          }
        }
      }
    }
    if (verificarOC.estado === "pendiente recibir") {
      //verificar si hay faltantantes

      for (const p of productos) {
        if (p.cantidadRecibida < p.cantidadSolicitada) {
          faltantes += p.cantidadSolicitada - p.cantidadRecibida;
        }
      }
      if (faltantes > 0) {
        estadoRecepcion = "Entregado Con Faltantes";
      }
    }
    console.log("Estado de recepción calculado linea 890:", estadoRecepcion);
    console.log("Faltantes calculados linea 891:", faltantes);
    //crear despacho automatico
    const rDespacho = await crearDespacho(
      tipoDocumento,
      "proveedor",
      numeroDocumento || "no indicado",
      repartidor || "no indicado",
      estadoRecepcion,
      observaciones || "Recepción de orden de compra a proveedor",
      verificarOC.idOrdenCompra,
      t,
    );
    if (rDespacho.code !== 201) {
      await t.rollback();
      return res.status(rDespacho.code).json({ error: rDespacho.error });
    }

    const despacho = rDespacho.data.get({ plain: true });
    //console.log("Despacho creado linea 905:", despacho);

    //buscar bodega con idBodega recibido y que este en funcionamiento y tenga capacidad disponible
    const bodegasSucursal = await Bodega.findOne({
      where: {
        idBodega: idBodega,
        estado: "En Funcionamiento",
        capacidadDisponible: { [Op.gt]: 0 },
      },
      transaction: t,
      raw: true,
    });
    //const bodegasSucursalLimpias = bodegasSucursal[0];
    //console.log("Bodegas encontradas linea 917:", bodegasSucursalLimpias);
    if (!bodegasSucursal) {
      await t.rollback();
      return res.status(404).json({ error: "Bodega sin capacidad" });
    }

    //crear detalle de despacho
    for (const p of productos) {
      const rDetalleDespacho = await crearDetalleDespacho(
        p.cantidadSolicitada,
        p.cantidadRecibida,
        p.cantidadRechazada,
        observaciones || "Detalle de recepción generado automáticamente",
        despacho.idDespacho,
        t,
      );
      if (rDetalleDespacho.code !== 201) {
        await t.rollback();
        return res
          .status(rDetalleDespacho.code)
          .json({ error: rDetalleDespacho.error });
      }
      let rDetalleDespachoData = rDetalleDespacho.data.toJSON();
      //console.log(
      //  "Detalle de despacho creado linea 943:",
      //  rDetalleDespachoData,
      //);

      //crear lote para cada producto
      const rLote = await crearLote(
        "disponible",
        p.cantidadRecibida,
        null,
        p.idProducto,
        rDetalleDespachoData.idDetalledespacho,
        bodegasSucursal.idBodega,
        t,
      );
      if (rLote.code !== 201) {
        await t.rollback();
        return res.status(rLote.code).json({ error: rLote.error });
      }
      //console.log("Lote linea 959:", rLote);
      //Agregar a inventario cantidad recibida del producto
      const inventarioEncontrado = await Inventario.findOne({
        where: {
          idBodega: bodegasSucursal.idBodega,
          idProducto: p.idProducto,
        },
        transaction: t,
      });
      //console.log("Inventario encontrado 968:", inventarioEncontrado);
      if (!inventarioEncontrado) {
        //crear nuevo registro en inventario con la cantidad recibida
        const nuevoRegistroInventario = await Inventario.create(
          {
            stock: p.cantidadRecibida,
            estado: "Bueno",
            idProducto: p.idProducto,
            idBodega: bodegasSucursal.idBodega,
          },
          { transaction: t },
        );
        if (!nuevoRegistroInventario) {
          await t.rollback();
          return res
            .status(500)
            .json({ error: "Error al actualizar inventario" });
        }
      } else if (p.cantidadRecibida > 0) {
        //actualizar el stock sumando la cantidad recibida
        const updatedInventario = await inventarioEncontrado.update(
          { stock: inventarioEncontrado.stock + Number(p.cantidadRecibida) },
          { transaction: t },
        );
        console.log("Inventario actualizado 992:", updatedInventario);
      }
    }
    //cambiar estado de la orden de compra a recepcionada
    const updatedDespacho = await rDespacho.data.update(
      { estado: "En Inventario" },
      { transaction: t },
    );
    //console.log("Despacho actualizado 1000:", updatedDespacho);

    //actualizar estado Orden de compra a recepcionada

    const ocUpdate = await OrdenCompra.findOne({
      where: { idOrdenCompra: idOrdenCompra },
      transaction: t,
    });
    //console.log("Orden Compra linea 1007", ocUpdate);

    if (faltantes > 0 || estadoRecepcion === "Entregado Con Faltantes") {
      const updatedOcUpdate = await ocUpdate.update(
        { estado: "recibida con faltante" },
        { transaction: t },
      );
      //console.log("Orden Compra actualizada 1014:", updatedOcUpdate);
    } else {
      const updatedOcUpdate = await ocUpdate.update(
        { estado: "recepcionada" },
        { transaction: t },
      );
      //console.log("Orden Compra actualizada 1017:", updatedOcUpdate);
    }
    const info = await enviarCorreo({
      para: "cristian.onate1901@alumnos.ubiobio.cl",
      asunto: `Recepción de orden de compra ${verificarOC.nombreOrden}`,
      html: `La orden de compra ${verificarOC.nombreOrden} ha sido recepcionada con estado: ${estadoRecepcion}. Por favor revise el sistema para más detalles.`,
    });
    console.log("INFO Correo", info);
    await t.commit();
    return res.status(200).json({
      message:
        "Función para crear orden de compra desde vendedor recibida correctamente",
    });
  } catch (error) {
    await t.rollback();
    console.log(
      "Error al crear orden de compra a proveedor desde vendedor:",
      error,
    );
    res.status(500).json({
      error: "Error al crear orden de compra a proveedor desde vendedor",
    });
  }
};

//-----------------------Funciones de orden de compra a proveedor para admin------------------//

exports.obtenerOrdenesCompraAdmin = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const respuesta = await obtenerOrdenCompra(
      {
        tipo: "compra sucursal",
        estado: { [Op.notIn]: ["cancelada"] },
      },
      null,
      [
        {
          model: CrearOrdenCompra,
          include: [
            {
              model: Proveedor,
              attributes: ["idProveedor", "nombre", "rut", "email"],
            },
            {
              model: Sucursal,
              attributes: ["idSucursal", "nombre", "direccion"],
            },
            {
              model: Funcionario,
              as: "vendedor",
              attributes: ["idFuncionario", "rut", "nombre"],
            },
          ],
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
      [["fechaOrden", "DESC"]],
      t,
    );

    if (respuesta.code != 200) {
      await t.rollback();
      return res.status(respuesta.code).json({ error: respuesta.error });
    }
    await t.commit();
    res.status(200).json(respuesta.data);
  } catch (error) {
    console.warn(
      "Error al obtener ordenes de compra a proveedor desde vendedor:",
      error,
    );
    res.status(500).json({
      error: "Error al obtener ordenes de compra a proveedor desde vendedor",
    });
  }
};

exports.anularOrdenCompraAdmin = async (req, res) => {
  try {
    const { nombreOrden } = req.params;

    //validar con joi

    //verificar oc
    const verificarOC = await obtenerOrdenCompra(
      { nombreOrden: nombreOrden, tipo: "compra sucursal" },
      null,
      null,
    );
    if (verificarOC.code === 404) {
      return res
        .status(404)
        .json({ error: "Orden de compra a proveedor no encontrada" });
    }
    if (verificarOC.code !== 200) {
      return res.status(verificarOC.code).json({ error: verificarOC.error });
    }

    //modificar estado a anulada
    const r = await cambiarEstadoOC(
      nombreOrden,
      "anulada",
      "Orden anulada por administrador",
    );
    if (r.code !== 200) {
      return res.status(r.code).json({ error: r.error });
    }
    res.status(200).json({
      message: "Orden de compra a proveedor anulada exitosamente",
    });
  } catch (error) {
    console.warn(
      "Error al anular orden de compra a proveedor desde admin:",
      error,
    );
    res.status(500).json({
      error: "Error al anular orden de compra a proveedor desde admin",
    });
  }
};

exports.aprobarOrdenCompraAdmin = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { nombreOrden } = req.params;

    //validar con joi
    //verificar oc
    const { token } = req.cookies;
    if (!token) {
      return res
        .status(401)
        .json({ error: "Token de autenticación no proporcionado" });
    }

    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedPayload) {
      return res.status(401).json({ error: "Token inválido" });
    }
    //verificar funcionario
    const funcionario = await Funcionario.findOne({
      where: { rut: decodedPayload.rut },
    });
    if (!funcionario) {
      return res.status(404).json({ error: "Funcionario no encontrado" });
    }

    const verificarOC = await obtenerOrdenCompra(
      { nombreOrden: nombreOrden, tipo: "compra sucursal" },
      null,
      null,
    );
    if (verificarOC.code === 404) {
      return res
        .status(404)
        .json({ error: "Orden de compra a proveedor no encontrada" });
    }
    if (verificarOC.code !== 200) {
      return res.status(verificarOC.code).json({ error: verificarOC.error });
    }

    //modificar estado a aprobada
    const r = await cambiarEstadoOC(
      nombreOrden,
      "aprobada",
      "Orden aprobada por administrador",
      funcionario.dataValues.idFuncionario,
      t,
    );
    if (r.code !== 200) {
      return res.status(r.code).json({ error: r.error });
    }

    //cambiar estado de la oc a pendiente recibir, se actualiza en el service cambiarEstadoOC
    r.data.estado = "pendiente recibir";
    await r.data.save({ transaction: t });

    await t.commit();
    res.status(200).json({
      message: "Orden de compra a proveedor aprobada exitosamente",
    });
  } catch (error) {
    console.warn(
      "Error al aprobar orden de compra a proveedor desde admin:",
      error,
    );
    res.status(500).json({
      error: "Error al aprobar orden de compra a proveedor desde admin",
    });
  }
};

exports.modificarOrdenCompraAdmin = async (req, res) => {
  try {
    const { nombreOrden } = req.params;
    const { productos, observaciones } = req.body;

    if (
      !nombreOrden ||
      !productos ||
      productos.length === 0 ||
      !observaciones
    ) {
      return res.status(422).json({
        error:
          "Faltan datos obligatorios: productos y observaciones son requeridos",
      });
    }
    //validar con joi

    //encontar ocDetalle
    /**
     * productos es en formato array de objetos con idCompraproveedordetalle, idProducto, cantidad, precioUnitario, observaciones (opcional)
     */
    const rOCDetalle = await modificarDetalleOCAdminSucursal(
      nombreOrden,
      productos,
      observaciones,
    );
    if (rOCDetalle.code !== 200) {
      return res.status(rOCDetalle.code).json({ error: rOCDetalle.error });
    }

    //cambiar estado de la oc a pendiente recibir
    rOCDetalle.data.update({ estado: "pendiente recibir" });

    res.status(200).json({
      message: "Orden de compra a proveedor modificada exitosamente",
    });
  } catch (error) {
    console.warn(
      "Error al modificar orden de compra a proveedor desde admin:",
      error,
    );
    res.status(500).json({
      error: "Error al modificar orden de compra a proveedor desde admin",
    });
  }
};

exports.eliminarOrdenCompraAdmin = async (req, res) => {
  try {
    const { nombreOrden } = req.params;

    //validar con joi
    const r = await eliminarOrdenCompra(nombreOrden);
    if (r.code !== 200) {
      return res.status(r.code).json({ error: r.error });
    }
    res.status(200).json({
      message: "Orden de compra a proveedor eliminada exitosamente",
    });
  } catch (error) {
    console.warn(
      "Error al eliminar orden de compra a proveedor desde admin:",
      error,
    );
    res.status(500).json({
      error: "Error al eliminar orden de compra a proveedor desde admin",
    });
  }
};

//-----------------------Funciones comunes para ordenes de compra------------------//

exports.verificarStockProductosOrdenCompra = async (req, res) => {
  try {
    const { idSucursal, idProveedor } = req.params;

    console.log("datos en back", idSucursal, idProveedor);

    //verificar que los datos sean validos con joi

    //verificar que la sucursal y el proveedor existen
    const comprobarSucursal = await Sucursal.findByPk(idSucursal);
    const comprobarProveedor = await Proveedor.findByPk(idProveedor);
    if (!comprobarSucursal) {
      return res.status(404).json({ error: "Sucursal no encontrada" });
    }
    if (!comprobarProveedor) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }
    console.log("Datos a verificar stok:\n", req.params);
    //Buscar Bodegas de la sucursal
    const bodegas = await Bodega.findAll({
      where: { idSucursal: idSucursal, estado: "En Funcionamiento" },
    });
    if (!bodegas || bodegas.length === 0) {
      return res.status(404).json({ error: "No hay bodegas disponibles" });
    }
    const idBodegas = bodegas.map((b) => b.idBodega);
    console.log("IdBodegas:", idBodegas);
    //buscar productos asociados al proveedor
    const productosProveedor = await Provee.findAll({
      where: { idProveedor: idProveedor },
    });
    if (!productosProveedor || productosProveedor.length === 0) {
      return res
        .status(404)
        .json({ error: "El proveedor no tiene productos asociados" });
    }
    const idProductos = productosProveedor.map((p) => p.idProducto);
    console.log("idProductos:", idProductos);
    //buscar inventario de los productos del proveedor en las bodegas de la sucursal y que esten con un stock menor o igual a 10 unidades
    const inventario = await Inventario.findAll({
      where: {
        idBodega: { [Op.in]: idBodegas },
        idProducto: { [Op.in]: idProductos },
        stock: { [Op.lte]: 5 },
      },
    });
    console.log("Productos en inv:", inventario);
    if (!inventario || inventario.length === 0) {
      return res.status(404).json({
        error:
          "No Existen Productos con Bajo Stock (10 unidades o menos) en las bodegas de la sucursal asociados al proveedor",
      });
    }

    console.log("Inventario:", JSON.stringify(inventario, null, 2));

    //Crear Data set para Frontend
    const productosRecomendados = [];
    for (const i of inventario) {
      //buscar producto para obtener precio de compra
      let precioCompra = 1000; //valor por defecto en caso de no encontrar precio de compra del producto
      const producto = await Producto.findByPk(i.idProducto);
      if (producto.precioCompra) {
        precioCompra = producto.precioCompra;
      }
      productosRecomendados.push({
        productoSeleccionado: i.idProducto,
        cantidadProducto: i.stock + 10,
        valorUnitarioProducto: precioCompra,
      });
    }
    console.log(
      "Productos recomendados:",
      JSON.stringify(productosRecomendados, null, 2),
    );
    return res.status(200).send(productosRecomendados);
  } catch (error) {
    console.warn(
      "Error al verificar stock de productos para orden de compra:",
      error,
    );
    res.status(500).json({
      error: "Error al verificar stock de productos para orden de compra",
    });
  }
};
