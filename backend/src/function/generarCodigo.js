const OrdenCompra = require("../models/inventario/OrdenCompra");
const Despacho = require("../models/inventario/Despacho");
const DetalleDespacho = require("../models/inventario/DetalleDespacho");
const Lote = require("../models/inventario/Lote");

//Generar codigo para despacho, detalle despacho y lote
async function generarCodigo(tipo) {
  //OC202612345678 , es un codigo con OC seguido del año y un numero correlativo de 8 digitos
  if (tipo === "ordenCompra") {
    const ultimoOrdenCompra = await OrdenCompra.findOne({
      order: [["idOrdenCompra", "DESC"]],
    });
    if (ultimoOrdenCompra) {
      const ultimoCodigo = parseInt(
        ultimoOrdenCompra.codigoOrdenCompra.slice(-8),
      );
      const nuevoCodigo = `OC${new Date().getFullYear()}${String(ultimoCodigo + 1).padStart(8, "0")}`;
      return nuevoCodigo;
    }
    return `OC${new Date().getFullYear()}00000001`;
  }
  //DESPACHO EJ: DP202612345678
  if (tipo === "despacho") {
    const ultimoDespacho = await Despacho.findOne({
      order: [["idDespacho", "DESC"]],
    });
    if (ultimoDespacho) {
      const ultimoCodigo = parseInt(ultimoDespacho.codigoDespacho.slice(-8));
      const nuevoCodigo = `DP${new Date().getFullYear()}${String(
        ultimoCodigo + 1,
      ).padStart(8, "0")}`;
      return nuevoCodigo;
    }
    return `DP${new Date().getFullYear()}00000001`;
  }
  //DETALLE DESPACHO EJ: CODD202612345678
  if (tipo === "detalleDespacho") {
    const ultimoDetalleDespacho = await DetalleDespacho.findOne({
      order: [["idDetalledespacho", "DESC"]],
    });
    if (ultimoDetalleDespacho) {
      const ultimoCodigo = parseInt(
        ultimoDetalleDespacho.codigoDetalleDespacho.slice(-8),
      );
      const nuevoCodigo = `CDD${new Date().getFullYear()}${String(
        ultimoCodigo + 1,
      ).padStart(8, "0")}`;
      return nuevoCodigo;
    }
    return `CDD${new Date().getFullYear()}00000001`;
  }
  //LOTE EJ: LT202612345678
  if (tipo === "lote") {
    const ultimoLote = await Lote.findOne({
      order: [["idLote", "DESC"]],
    });
    if (ultimoLote) {
      const ultimoCodigo = parseInt(ultimoLote.codigoLote.slice(-8));
      const nuevoCodigo = `LT${new Date().getFullYear()}${String(
        ultimoCodigo + 1,
      ).padStart(8, "0")}`;
      return nuevoCodigo;
    }
    return `LT${new Date().getFullYear()}00000001`;
  }
}

module.exports = {
  generarCodigo,
};
