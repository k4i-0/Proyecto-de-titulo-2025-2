const CompraProveedorDetalle = require("../../models/inventario/CompraProveedorDetalle");
const Producto = require("../../models/inventario/Productos");

const sequelizer = require("../../models/");

//---------------DETALLE ORDEN DE COMPRA----------------
async function crearDetalleOC(productos, idOrdenCompra) {
  try {
    for (const item of productos) {
      const { idProducto, cantidad, precioUnitario } = item;
      const totalProducto = cantidad * precioUnitario;
      const comprobarProducto = await Producto.findByPk(idProducto);
      if (!comprobarProducto) {
        return {
          code: 404,
          error: `Producto con ID ${idProducto} no encontrado`,
        };
      }
      const nuevaCompraProveedorDetalle = await CompraProveedorDetalle.create({
        idOrdenCompra: idOrdenCompra,
        nombreProducto: comprobarProducto.nombre,
        idProducto: idProducto,
        cantidad: cantidad,
        precioUnitario: precioUnitario,
        total: totalProducto,
      });
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

module.exports = {
  crearDetalleOC,
};
