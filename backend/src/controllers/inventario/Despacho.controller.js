const Despachos = require("../../models/inventario/Despacho");
const DetalleDespacho = require("../../models/inventario/DetalleDespacho");
const CrearOrdenCompra = require("../../models/inventario/CreaOrdenCompra");
const OrdenCompra = require("../../models/inventario/OrdenCompra");
const Lote = require("../../models/inventario/Lote");
const Producto = require("../../models/inventario/Productos");
const Proveedor = require("../../models/inventario/Proveedor");

exports.obtenerDespachosPorOrden = async (req, res) => {
  try {
    const { nombreOrden } = req.params;
    console.log("req.params", req.params);
    if (!nombreOrden) {
      return res
        .status(400)
        .json({ message: "El nombre de la orden es requerido" });
    }

    const orden = await OrdenCompra.findOne({
      where: { nombreOrden: nombreOrden },
    });
    if (!orden) {
      return res.status(404).json({ message: "Orden de compra no encontrada" });
    }
    const despachos = await Despachos.findAll({
      where: { idOrdenCompra: orden.idOrdenCompra },
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
        {
          model: OrdenCompra,
          attributes: ["nombreOrden"],
          include: [
            {
              model: CrearOrdenCompra,

              include: [
                {
                  model: Proveedor,
                  attributes: ["nombre", "rut"],
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

exports.obtenerTodoDespachos = async (req, res) => {
  try {
    const despachos = await Despachos.findAll({
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

    if (despachos.length === 0) {
      return res.status(404).send({ message: "No se encontraron despachos" });
    }

    if (!despachos) {
      return res.status(404).send({ message: "No se encontraron despachos" });
    }

    return res.status(200).json(despachos);
  } catch (error) {
    console.log("Error obtenerTodos los despachos", error);
    return res
      .status(500)
      .send({ message: "Erro al consultar todos los despachos" });
  }
};

exports.obtenerDespachosPorRutProveedor = async (req, res) => {
  try {
    const { rutProveedor } = req.params;
    console.log("datos query", req.params);

    if (!rutProveedor) {
      return res
        .status(400)
        .send({ message: "El rut del proveedor es requerido" });
    }

    const proveedor = await Proveedor.findOne({
      where: { rut: rutProveedor },
    });
    if (!proveedor) {
      return res.status(404).send({ message: "No se encontró el proveedor" });
    }

    const despachos = await Despachos.findAll({
      include: [
        {
          model: OrdenCompra,
          attributes: ["nombreOrden"],
          include: [
            {
              model: CrearOrdenCompra,
              attributes: [],
              where: { idProveedor: proveedor.idProveedor },
            },
          ],
        },
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

    if (despachos.length === 0) {
      return res.status(404).send({
        message: "No se encontraron despachos para este proveedor",
      });
    }

    return res.status(200).json(despachos);

    return res.status(200).send({ message: "OK", data: despachos });
  } catch (error) {
    console.log("Error obtenerTodoDespachos:", error);
    return res
      .status(500)
      .send({ message: "Erro al consultar todos los despachos" });
  }
};
