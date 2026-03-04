const CompraProveedorDetalle = require("../../models/inventario/CompraProveedorDetalle");
const Producto = require("../../models/inventario/Productos");

//---------------DETALLE ORDEN DE COMPRA----------------
async function crearDetalleOC(productos, idOrdenCompra) {
  try {
    for (const item of productos) {
      const { productoSeleccionado, cantidadProducto, valorUnitarioProducto } =
        item;
      const totalProducto = cantidadProducto * valorUnitarioProducto;
      const comprobarProducto = await Producto.findByPk(productoSeleccionado);
      if (!comprobarProducto) {
        return {
          code: 1241,
          error: `Producto con ID ${productoSeleccionado} no encontrado`,
        };
      }
      const nuevaCompraProveedorDetalle = await CompraProveedorDetalle.create({
        idOrdenCompra: idOrdenCompra,
        nombreProducto: comprobarProducto.nombre,
        idProducto: productoSeleccionado,
        cantidad: cantidadProducto,
        precioUnitario: valorUnitarioProducto,
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
