const OrdenCompra = require("../../models/inventario/OrdenCompra");
const CompraProveedorDetalle = require("../../models/inventario/CompraProveedorDetalle");
const Producto = require("../../models/inventario/Productos");

const { generarCodigo } = require("../../function/generarCodigo");
//Generar codigo para despacho, detalle despacho y lote

// funciones sobre tablas en bd

//---------------ORDEN DE COMPRA----------------
async function crearOrdenCompra(
  tipoOrden,
  totalCompra,
  observaciones,
  destalleEstadoOrdenCompra,
) {
  try {
    const nuevaOrdenCompra = await OrdenCompra.create({
      nombreOrden: await generarCodigo("ordenCompra"),
      fechaOrden: new Date(),
      estado: "creada",
      tipo: tipoOrden,
      total: totalCompra,
      observaciones,
      detalleEstado: destalleEstadoOrdenCompra,
    });

    return { code: 201, data: nuevaOrdenCompra };
  } catch (error) {
    console.error("Error al crear la orden de compra:", error);
    return { code: 500, error: "Error al crear la orden de compra" };
  }
}

async function obtenerOrdenCompra(whereClause, attributes, include, order) {
  try {
    const ordenesCompra = await OrdenCompra.findAll({
      where: whereClause,
      attributes: attributes,
      include: include,
      order: order || [["fechaOrden", "DESC"]],
    });
    if (!ordenesCompra || ordenesCompra.length === 0) {
      return { code: 404, error: "No se encontraron ordenes de compra" };
    }
    return { code: 200, data: ordenesCompra };
  } catch (error) {
    console.error("Error al obtener las ordenes de compra:", error);
    return { code: 500, error: "Error al obtener las ordenes de compra" };
  }
}

async function obtenerOConDetalles(whereClause) {
  try {
    const ordenesCompra = await OrdenCompra.findAll({
      where: whereClause,
      attributes: ["idOrdenCompra", "nombreOrden"],
      include: [
        {
          model: CompraProveedorDetalle,
          attributes: [
            "idCompraProveedorDetalle",
            "cantidad",
            "precioUnitario",
            "total",
          ],
          include: [
            {
              model: Producto,
              attributes: ["idProducto", "nombre", "codigoProducto"],
            },
          ],
        },
      ],
    });
    if (!ordenesCompra || ordenesCompra.length === 0) {
      return { code: 404, error: "No se encontraron ordenes de compra" };
    }
    return { code: 200, data: ordenesCompra };
  } catch (error) {
    console.error(
      "Error al obtener las ordenes de compra con detalles:",
      error,
    );
    return {
      code: 500,
      error: "Error al obtener las ordenes de compra con detalles",
    };
  }
}

async function eliminarOrdenCompra(params) {}

async function editarOrdenCompra(nombreOrden, productos, observaciones) {
  try {
    const ordenCompra = await OrdenCompra.findOne({
      where: { nombreOrden: nombreOrden },
    });
    if (!ordenCompra) {
      return { code: 404, error: "Orden de compra no encontrada" };
    }
    await ordenCompra.update({
      observaciones: observaciones,
    });
    if (productos && productos.length > 0) {
      const comprobarOrdenDetalles = await CompraProveedorDetalle.findAll({
        where: { idOrdenCompra: ordenCompra.idOrdenCompra },
      });
      for (const item of productos) {
        const { idCompraProveedorDetalle, cantidad, precioUnitario } = item;
        const detalle = comprobarOrdenDetalles.find(
          (d) => d.idCompraProveedorDetalle === idCompraProveedorDetalle,
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
      let totalOrden = 0;
      for (const item of productos) {
        totalOrden += item.cantidad * item.precioUnitario;
      }
      await ordenCompra.update({ total: totalOrden });
    }
    return { code: 200, message: "Orden de compra editada correctamente" };
  } catch (error) {
    console.error("Error al editar la orden de compra:", error);
    return { code: 500, error: "Error al editar la orden de compra" };
  }
}

async function cambiarEstadoOC(numeroOrden, estado, observaciones) {
  try {
    const ordenCompra = await OrdenCompra.findOne({
      where: { numeroOrden: numeroOrden },
    });
    if (!ordenCompra) {
      return { code: 404, error: "Orden de compra no encontrada" };
    }
    await ordenCompra.update({
      estado: estado,
      observaciones: ordenCompra.observaciones
        ? `${ordenCompra.observaciones}\n${observaciones}`
        : observaciones,
    });
    return {
      code: 200,
      message: "Estado de la orden de compra actualizado correctamente",
    };
  } catch (error) {
    console.error("Error al cambiar el estado de la orden de compra:", error);
    return {
      code: 500,
      error: "Error al cambiar el estado de la orden de compra",
    };
  }
}

module.exports = {
  crearOrdenCompra,
  obtenerOrdenCompra,
  obtenerOConDetalles,
  eliminarOrdenCompra,
  editarOrdenCompra,
  eliminarOrdenCompra,
  cambiarEstadoOC,
};
