const DetalleDespacho = require("../../models/inventario/DetalleDespacho");

const { generarCodigo } = require("../../function/generarCodigo");

//---------------DETALLE DESPACHO----------------
async function crearDetalleDespacho(
  cantidadDD,
  cantidadRecibidaDD,
  cantidadRechazadaDD,
  observacionesDD,
  idDespacho,
  transaction,
) {
  try {
    const detalleDespacho = await DetalleDespacho.create(
      {
        codigoDetalleDespacho: await generarCodigo("detalleDespacho"),
        cantidad: cantidadDD,
        cantidadRecibida: cantidadRecibidaDD,
        cantidadRechazada: cantidadRechazadaDD,
        observaciones: observacionesDD,
        idDespacho: idDespacho,
      },
      { transaction: transaction },
    );

    return { code: 201, data: detalleDespacho };
  } catch (error) {
    console.error("Error al crear el detalle del despacho:", error);
    return { code: 500, error: "Error al crear el detalle del despacho" };
  }
}

module.exports = {
  crearDetalleDespacho,
};
