const Lote = require("../../models/inventario/Lote");
const Bodega = require("../../models/inventario/Bodega");
const { generarCodigo } = require("../../function/generarCodigo");

//---------------LOTE----------------
async function crearLote(
  estadoLote,
  cantidad,
  fechaVencimiento,
  idProducto,
  idDetalleDespacho,
  idBodega,
  transaccion,
) {
  try {
    const nuevoLote = await Lote.create(
      {
        codigoLote: await generarCodigo("lote", transaccion),
        fechaCreacion: new Date(),
        fechaVencimiento:
          fechaVencimiento ||
          new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 año de vencimiento
        estado: estadoLote,
        cantidad: cantidad,
        idProducto: idProducto,
        idDetalleDespacho: idDetalleDespacho || null,
        idBodega: idBodega || null,
      },
      { transaction: transaccion },
    );

    //actualizar bodega
    const bodega = await Bodega.findByPk(idBodega);
    if (!bodega) {
      transaccion.rollback();
      return { code: 404, error: "Bodega no encontrada" };
    }
    // if (cantidad > bodega.dataValues.capacidadDisponible) {
    //   return {
    //     code: 422,
    //     error: "Cantidad excede la capacidad disponible del estante",
    //   };
    // }
    await bodega.update(
      {
        capacidadOcupada: bodega.dataValues.capacidadOcupada + 1,
        capacidadDisponible: bodega.dataValues.capacidadDisponible - 1,
      },
      { transaction: transaccion },
    );

    return { code: 201, data: nuevoLote };
  } catch (error) {
    console.error("Error al crear los lotes:", error);
    return { code: 500, error: "Error al crear los lotes" };
  }
}

async function obtenerLotesInventario(idProducto, idBodega) {
  try {
    const lotes = await Lote.findAll({
      where: { idProducto: idProducto, idBodega: idBodega },
    });
    return { code: 200, data: lotes };
  } catch (error) {
    console.log("Error Obtener lotes de prodoucto", error);
    return { code: 500, error: "Error al obtener los lotes" };
  }
}

module.exports = {
  crearLote,
  obtenerLotesInventario,
};
