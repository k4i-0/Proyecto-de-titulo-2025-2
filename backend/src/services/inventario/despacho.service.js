const Despacho = require("../../models/inventario/Despacho");

const { generarCodigo } = require("../../function/generarCodigo");

//---------------DESPACHO----------------
async function crearDespacho(
  tipoDocumento,
  tipoDespacho,
  numeroDocumento,
  repartidor,
  estadoDespacho,
  observacionesDespacho,
  idOrdenCompra,
) {
  try {
    //Crear Despacho
    const nuevoDespacho = await Despacho.create({
      codigoDespacho: await generarCodigo("despacho"),
      fechaDespacho: new Date(),
      tipoDocumento: tipoDocumento,
      tipoDespacho: tipoDespacho,
      numeroDocumento: numeroDocumento,
      repartidor: repartidor,
      estado: estadoDespacho,
      observaciones: observacionesDespacho,
      idOrdenCompra: idOrdenCompra,
    });
    return { code: 201, data: nuevoDespacho };
  } catch (error) {
    console.error("Error al crear el despacho:", error);
    return { code: 500, error: "Error al crear el despacho" };
  }
}

module.exports = {
  crearDespacho,
};
