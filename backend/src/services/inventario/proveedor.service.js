const Productos = require("../../models/inventario/Productos");
const Proveedor = require("../../models/inventario/Proveedor");
const Provee = require("../../models/inventario/Provee");

async function asociarProductosProveedor(productos, idProveedor) {
  try {
    for (const item of productos) {
      const { idProducto } = item;
      const comprobarProducto = await Productos.findByPk(idProducto);
      if (!comprobarProducto) {
        return {
          code: 404,
          error: `Producto con ID ${idProducto} no encontrado`,
        };
      }
      const comprobarAsociacion = await Provee.findOne({
        where: {
          idProducto: idProducto,
          idProveedor: idProveedor,
        },
      });
      if (!comprobarAsociacion) {
        const nuevaAsociacion = await Provee.create({
          registradoPor: "Sistema",
          fechaRegistro: new Date(),
          estado: "Activo",
          idProveedor: idProveedor,
          idProducto: idProducto,
        });
        console.log("Nueva asociación creada:", nuevaAsociacion);
      }
    }
    return {
      code: 201,
      message: "Asociación de productos a proveedor creada exitosamente",
    };
  } catch (error) {
    console.error(
      "Error al crear la asociación de productos a proveedor:",
      error,
    );
    return {
      code: 500,
      error: "Error al crear la asociación de productos a proveedor",
    };
  }
}

module.exports = {
  asociarProductosProveedor,
};
