const Lote = require("../../models/inventario/Lote");

const { generarCodigo } = require("../../function/generarCodigo");

//---------------LOTE----------------
async function crearLote(
  estadoLote,
  cantidad,
  idEstante,
  idProducto,
  idDetalleDespacho,
) {
  try {
    const nuevoLote = await Lote.create({
      codigoLote: await generarCodigo("lote"),
      fechaCreacion: new Date(),
      fechaVencimiento: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1),
      ), // 1 año de vencimiento
      estado: estadoLote,
      cantidad: cantidad,
      idEstante: idEstante,
      idProducto: idProducto,
      idDetalleDespacho: idDetalleDespacho,
    });
    return { code: 201, data: nuevoLote };
  } catch (error) {
    console.error("Error al crear los lotes:", error);
    return { code: 500, error: "Error al crear los lotes" };
  }
}

module.exports = {
  crearLote,
};
