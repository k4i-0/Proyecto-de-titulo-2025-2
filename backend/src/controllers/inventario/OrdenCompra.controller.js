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
const Bodega = require("../../models/inventario/Bodega");
const Estante = require("../../models/inventario/Estante");
const OrdenCompra = require("../../models/inventario/OrdenCompra");
const CrearOrdenCompra = require("../../models/inventario/CreaOrdenCompra");
const { Op } = require("sequelize");
const { sequelize } = require("../../models");

//service
const {
  crearOrdenCompra,
  obtenerOrdenCompra,
  cambiarEstadoOC,
  editarOrdenCompra,
  obtenerOConDetalles,
} = require("../../services/inventario/ordenCompra.service");

const {
  crearDetalleOC,
} = require("../../services/inventario/compraProveedorDetalle.service");

const { crearDespacho } = require("../../services/inventario/despacho.service");
const {
  crearDetalleDespacho,
} = require("../../services/inventario/detalleDespacho.service");
const { crearLote } = require("../../services/inventario/lote.service");

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
      tipoOrden,
      observaciones,
    } = req.body;

    if (
      !idSucursal ||
      !idFuncionario ||
      !idProveedor ||
      !idVendedorProveedor ||
      !productos ||
      !tipoOrden ||
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
    // const comprobarVendedor = await VendedorProveedor.findOne({
    //   where: {
    //     [Op.and]: [
    //       { idProveedor: idProveedor },
    //       { idVendedorProveedor: idVendedorProveedor },
    //     ],
    //   },
    // });
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
    // if (!comprobarVendedor) {
    //   return res.status(404).json({
    //     code: 1237,
    //     error:
    //       "Vendedor del proveedor no encontrado para el proveedor indicado",
    //   });
    // }
    if (!comprobarFuncionario) {
      return res
        .status(404)
        .json({ code: 1238, error: "Funcionario no encontrado" });
    }
    const totalCompra = productos.reduce(
      (total, item) =>
        total + item.valorUnitarioProducto * item.cantidadProducto,
      0,
    );

    // Crear la Orden compra proveedor
    const r = await crearOrdenCompra(
      "compra sucursal",
      totalCompra,
      observaciones,
      "Orden creada y pendiente de aprobación",
      comprobarFuncionario.idFuncionario,
      comprobarSucursal.idSucursal,
      comprobarProveedor.idProveedor,
    );
    if (r.code !== 201) {
      return res.status(r.code).json({ error: r.error });
    }

    // Crear los detalles de la compra
    const rDetalle = await crearDetalleOC(productos, r.data.idOrdenCompra);
    if (rDetalle.code !== 201) {
      return res.status(rDetalle.code).json({ error: rDetalle.error });
    }
    await t.commit();
    res.status(201).json({
      message: "Orden de compra a proveedor creada con éxito",
      compraProveedor: r.data,
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
    const ordenesCompra = obtenerOrdenCompra();
    if (ordenesCompra.code !== 200) {
      return res
        .status(ordenesCompra.code)
        .json({ error: ordenesCompra.error });
    }
    return res.status(200).json(ordenesCompra);
  } catch (error) {
    console.error(
      "Error al obtener las ordenes de compra a proveedores:",
      error,
    );
    res
      .status(500)
      .json({ error: "Error al obtener las ordenes de compra a proveedores" });
  }
};

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
      {},
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

//eliminar o cancelar ordenes de compra cualuquiera
exports.cancelarOrdenCompra = async (req, res) => {
  try {
    //verificar que existe la orden
    const { nombreOrden } = req.params;
    console.log("ID de la orden a cancelar:", nombreOrden);
    const t = await sequelize.transaction();
    if (
      !nombreOrden ||
      nombreOrden === "" ||
      nombreOrden === null ||
      nombreOrden === undefined
    ) {
      return res
        .status(422)
        .json({ error: "ID de la orden de compra es obligatorio" });
    }
    const r = await cambiarEstadoOC(
      nombreOrden,
      "cancelada",
      "Orden cancelada",
    );
    if (r.code !== 200) {
      return res.status(r.code).json({ error: r.error });
    }
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
    const { nombreOrden } = req.params;
    const { estado, observaciones } = req.body;

    if (!estado || estado === "" || estado === null || estado === undefined) {
      return res.status(422).json({ error: "El nuevo estado es obligatorio" });
    }
    if (
      nombreOrden === "" ||
      nombreOrden === null ||
      nombreOrden === undefined
    ) {
      return res
        .status(422)
        .json({ error: "Nombre de la orden de compra es obligatorio" });
    }
    const t = await sequelize.transaction();
    const r = await cambiarEstadoOC(nombreOrden, estado, observaciones);
    if (r.code !== 200) {
      return res.status(r.code).json({ error: r.error });
    }
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
    const { nombreOrden } = req.params;
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
      nombreOrden === "" ||
      nombreOrden === null ||
      nombreOrden === undefined
    ) {
      return res
        .status(422)
        .json({ error: "ID de la orden de compra es obligatorio" });
    }
    const t = await sequelize.transaction();
    const r = await editarOrdenCompra(nombreOrden, productos, observaciones);
    if (r.code !== 200) {
      return res.status(r.code).json({ error: r.error });
    }
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
    );
    if (rOC.code === 404) {
      return res
        .status(404)
        .json({ error: "Orden de compra directa no encontrada" });
    }
    if (rOC.code !== 200) {
      return res.status(rOC.code).json({ error: rOC.error });
    }
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

    // 1. Crear el Despacho
    const despacho = await crearDespacho(
      tipoDocumento,
      "compra directa",
      numeroDocumento || "no indicado",
      repartidor || "no indicado",
      "Recepcionado",
      observaciones || "Recepción de orden de compra directa",
      oc.idOrdenCompra,
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
    );
    if (detalleDespacho.code !== 201) {
      await t.rollback();
      return res
        .status(detalleDespacho.code)
        .json({ error: detalleDespacho.error });
    }

    // 4. Obtener la Bodega de la Sucursal de la OC (para asignar Lotes e Inventario)
    const sucursalOC = await CrearOrdenCompra.findOne({
      where: { idOrdenCompra: oc.idOrdenCompra },
      attributes: ["idSucursal"],
      transaction: t,
    });

    let bodega = null;
    if (sucursalOC?.idSucursal) {
      bodega = await Bodega.findOne({
        where: {
          idSucursal: sucursalOC.idSucursal,
          estado: "En Funcionamiento",
        },
        transaction: t,
      });
    }

    // 5. Crear 1 Lote por producto recibido + asignar estante + actualizar Inventario
    for (const prod of productos) {
      if (!prod.idProducto || Number(prod.cantidadRecibida) <= 0) continue;

      const cantRecibida = Number(prod.cantidadRecibida);

      // Buscar estante con más espacio libre en la bodega ──
      let idEstanteAsignado = null;
      let estanteElegido = null;

      if (bodega) {
        const estantesDisponibles = await Estante.findAll({
          where: { idBodega: bodega.idBodega, estado: "Disponible" },
          include: [{ model: Lote, attributes: ["cantidad"] }],
          transaction: t,
        });

        const estantesConEspacio = estantesDisponibles
          .map((e) => {
            const ocupado = (e.Lotes || []).reduce(
              (s, l) => s + (l.cantidad || 0),
              0,
            );
            return { estante: e, libre: e.capacidad - ocupado };
          })
          .filter((e) => e.libre > 0)
          .sort((a, b) => b.libre - a.libre); // mayor espacio primero

        if (estantesConEspacio.length > 0) {
          estanteElegido = estantesConEspacio[0];
          idEstanteAsignado = estanteElegido.estante.idEstante;
        } else {
          await t.rollback();
          return res.status(404).json({
            error: "No hay estantes disponibles para asignar al lote",
          });
        }
      }

      //Crear Lote
      const loteResult = await crearLote(
        "disponible",
        cantRecibida,
        prod.fechaVencimiento || null,
        prod.idProducto,
        detalleDespacho.data.idDetalledespacho,
        idEstanteAsignado,
      );
      if (loteResult.code !== 201) {
        await t.rollback();
        return res.status(500).json({
          error: `Error al crear lote para producto ${prod.idProducto}`,
        });
      }

      //Marcar estante como Completo si se llenó ──
      if (estanteElegido) {
        const librePostLote = estanteElegido.libre - cantRecibida;
        if (librePostLote <= 0) {
          await Estante.update(
            { estado: "Completo" },
            { where: { idEstante: idEstanteAsignado }, transaction: t },
          );
        }
      }

      //Upsert Inventario (idProducto + idBodega) ──
      if (bodega) {
        const [inv, created] = await Inventario.findOrCreate({
          where: { idProducto: prod.idProducto, idBodega: bodega.idBodega },
          defaults: {
            stock: cantRecibida,
            stockMinimo: 0,
            stockMaximo: 100,
            stockReservado: 0,
            estado: "Bueno",
          },
          transaction: t,
        });
        if (!created) {
          await inv.update(
            { stock: inv.stock + cantRecibida },
            { transaction: t },
          );
        }
        console.log("inventario: ", inv);
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
      message: "Orden de compra directa recepcionada exitosamente",
      idDespacho: despacho.data.idDespacho,
      idDetalleDespacho: detalleDespacho.data.idDetalledespacho,
      bodegaAsignada: bodega?.idBodega || null,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al recepcionar la orden de compra directa:", error);
    return res
      .status(500)
      .json({ error: "Error al recepcionar la orden de compra directa" });
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
