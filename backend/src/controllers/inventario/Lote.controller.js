//services
const {
  obtenerLotesInventario,
} = require("../../services/inventario/lote.service");
//Funciones asociadas al administrador

exports.obtenerLotesAsociadosInventario = async (req, res) => {
  try {
    console.log("Parámetros recibidos:", req.body);
    const { idProducto, idBodega } = req.body;
    if (!idProducto || !idBodega) {
      return res.status(400).json({ error: "Faltan parámetros requeridos" });
    }

    const lotesAsociados = await obtenerLotesInventario(idProducto, idBodega);
    if (lotesAsociados.code !== 200) {
      return res
        .status(lotesAsociados.code)
        .json({ error: lotesAsociados.error || "Error al obtener lotes" });
    }

    res.status(200).json(lotesAsociados.data);
  } catch (error) {
    console.warn("Error al obtener lotes asociados al inventario:", error);
    res
      .status(500)
      .json({ error: "Error al obtener lotes asociados al inventario" });
  }
};
