const Lote = require("../../models/inventario/Lote");
const Estante = require("../../models/inventario/Estante");
const { generarCodigo } = require("../../function/generarCodigo");

//---------------LOTE----------------
async function crearLote(
  estadoLote,
  cantidad,
  fechaVencimiento,
  idProducto,
  idDetalleDespacho,
  idEstante,
  transaccion,
) {
  try {
    const nuevoLote = await Lote.create({
      codigoLote: await generarCodigo("lote"),
      fechaCreacion: new Date(),
      fechaVencimiento:
        fechaVencimiento ||
        new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 año de vencimiento
      estado: estadoLote,
      cantidad: cantidad,
      idEstante: idEstante || null,
      idProducto: idProducto,
      idDetalleDespacho: idDetalleDespacho,
    });

    //actualizar estante
    const estante = await Estante.findByPk(idEstante);
    if (!estante) {
      return { code: 404, error: "Estante no encontrado" };
    }
    if (cantidad > estante.dataValues.capacidadDisponible) {
      return {
        code: 422,
        error: "Cantidad excede la capacidad disponible del estante",
      };
    }
    await estante.update({
      capacidadOcupada: estante.dataValues.capacidadOcupada + cantidad,
      capacidadDisponible: estante.dataValues.capacidadDisponible - cantidad,
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
