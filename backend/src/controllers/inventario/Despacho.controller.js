const Despachos = require("../../models/inventario/Despacho");
const DetalleDespacho = require("../../models/inventario/DetalleDespacho");
const Lote = require("../../models/inventario/Lote");
const Producto = require("../../models/inventario/Productos");

exports.obtenerDespachosPorOrden = async (req, res) => {
  try {
    const { idOrden } = req.params;
    console.log("req.params", req.params);
    if (!idOrden) {
      return res
        .status(400)
        .json({ message: "El ID de la orden es requerido" });
    }

    const despachos = await Despachos.findAll({
      where: { idOrdenCompra: idOrden },
      include: [
        {
          model: DetalleDespacho,
          include: [
            {
              model: Lote,
              include: [
                {
                  model: Producto,
                  attributes: ["codigo", "nombre", "precioVenta"],
                },
              ],
            },
          ],
        },
      ],
    });
    console.log("despachos", despachos);
    if (despachos.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron despachos para esta orden" });
    }

    return res.status(200).json(despachos);
  } catch (error) {
    console.error("Error al obtener despachos por orden:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
