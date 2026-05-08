const CompraProveedorDetalle = require("../../models/inventario/CompraProveedorDetalle");
const OrdenCompra = require("../../models/inventario/OrdenCompra");
const CrearOrdenCompra = require("../../models/inventario/CreaOrdenCompra");
const Bodega = require("../../models/inventario/Bodega");
const Sucursal = require("../../models/inventario/Sucursal");
const Inventario = require("../../models/inventario/Inventario");
const Producto = require("../../models/inventario/Productos");
const Provee = require("../../models/inventario/Provee");

const sequelizer = require("../../models/");

//---------------DETALLE ORDEN DE COMPRA----------------
async function crearDetalleOC(productos, idOrdenCompra, transaction) {
  try {
    for (const item of productos) {
      const { idProducto, cantidad, precioUnitario } = item;
      const totalProducto = cantidad * precioUnitario;
      const comprobarProducto = await Producto.findByPk(idProducto, {
        transaction: transaction,
      });
      if (!comprobarProducto) {
        return {
          code: 404,
          error: `Producto con ID ${idProducto} no encontrado`,
        };
      }

      const nuevaCompraProveedorDetalle = await CompraProveedorDetalle.create(
        {
          idOrdenCompra: idOrdenCompra,
          nombreProducto: comprobarProducto.nombre,
          idProducto: idProducto,
          cantidad: cantidad,
          precioUnitario: precioUnitario,
          total: totalProducto,
        },
        { transaction: transaction },
      );
      if (precioUnitario > comprobarProducto.precioCompra) {
        await comprobarProducto.update(
          { precioCompra: precioUnitario },
          { transaction: transaction },
        );
      }
    }
    return {
      code: 201,
      message: "Detalle de orden de compra a proveedor creado exitosamente",
    };
  } catch (error) {
    console.error(
      "Error al crear el detalle de la orden de compra a proveedor:",
      error,
    );
    return {
      code: 500,
      error: "Error al crear el detalle de la orden de compra a proveedor",
    };
  }
}

async function modificarDetalleOCAdminSucursal(
  nombreOrden,
  productos,
  observaciones,
) {
  try {
    //encontrar la orden de compra por nombre
    const ordenCompra = await OrdenCompra.findOne({
      where: { nombreOrden: nombreOrden },
    });

    if (!ordenCompra) {
      return { code: 404, error: "Orden de compra no encontrada" };
    }
    //encontrar los detalles de la orden de compra
    const detalles = await CompraProveedorDetalle.findAll({
      where: { idOrdenCompra: ordenCompra.idOrdenCompra },
    });
    if (!detalles || detalles.length === 0) {
      return {
        code: 404,
        error: "Detalles de la orden de compra no encontrados",
      };
    }
    //Modificar los detalles con los nuevos datos

    //Buscar todos las filas asociadas a idOrdenCompra
    const detallesOrdenCompra = await CompraProveedorDetalle.findAll({
      where: { idOrdenCompra: ordenCompra.idOrdenCompra },
    });
    for (const i in detallesOrdenCompra) {
      const detalle = detallesOrdenCompra[i];
      const productoModificado = productos.find(
        (p) => p.idCompraProveedorDetalle === detalle.idCompraProveedorDetalle,
      );
      if (productoModificado) {
        const { cantidad, precioUnitario, eliminado } = productoModificado;
        if (eliminado) {
          await detalle.destroy();
          continue;
        }
        const totalProducto = cantidad * precioUnitario;
        await detalle.update({
          cantidad: cantidad,
          precioUnitario: precioUnitario,
          subtotal: totalProducto,
        });
      }
    }

    //Calcular el total de la orden de compra sumando los totales de cada detalle
    const detallesActualizados = await CompraProveedorDetalle.findAll({
      where: { idOrdenCompra: ordenCompra.idOrdenCompra },
    });
    let totalOrdenCompra = 0;

    // Sumar el subtotal de cada detalle para obtener el total de la orden de compra
    for (const detalle of detallesActualizados) {
      const valorASumar = Number(detalle.subtotal) || 0;
      totalOrdenCompra += valorASumar;
    }

    await ordenCompra.update({
      total: totalOrdenCompra,
      estado: "aceptada con modificaciones",
      detalleEstado: observaciones,
    });

    return {
      code: 200,
      message: "Detalle de orden de compra modificado exitosamente",
      data: ordenCompra,
    };
  } catch (error) {
    console.error(
      "Error al modificar el detalle de la orden de compra a proveedor:",
      error,
    );
    return {
      code: 500,
      error: "Error al modificar el detalle de la orden de compra a proveedor",
    };
  }
}

module.exports = {
  crearDetalleOC,
  modificarDetalleOCAdminSucursal,
};
