const Despacho = require("../../models/inventario/Despacho");
const DespachoDetalle = require("../../models/inventario/DetalleDespacho");
const CrearOrdenCompra = require("../../models/inventario/CreaOrdenCompra");
const Sucursal = require("../../models/inventario/Sucursal");
const Funcionario = require("../../models/Usuarios/Funcionario");
const OrdenCompra = require("../../models/inventario/OrdenCompra");
const CompraProveedorDetalle = require("../../models/inventario/CompraProveedorDetalle");
const Producto = require("../../models/inventario/Productos");
const Proveedor = require("../../models/inventario/Proveedor");
const Lote = require("../../models/inventario/Lote");

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
  transaction,
) {
  try {
    //Crear Despacho
    const nuevoDespacho = await Despacho.create(
      {
        codigoDespacho: await generarCodigo("despacho"),
        fechaDespacho: new Date(),
        tipoDocumento: tipoDocumento,
        tipoDespacho: tipoDespacho,
        numeroDocumento: numeroDocumento,
        repartidor: repartidor,
        estado: estadoDespacho,
        observaciones: observacionesDespacho,
        idOrdenCompra: idOrdenCompra,
      },
      { transaction: transaction },
    );
    return { code: 201, data: nuevoDespacho };
  } catch (error) {
    console.error("Error al crear el despacho:", error);
    return { code: 500, error: "Error al crear el despacho" };
  }
}

async function buscarOCIdProveedor(idProveedor) {
  try {
    const ordenes = await CrearOrdenCompra.findAll({
      where: { idProveedor: idProveedor },
      attributes: ["idProveedor"],
      include: [
        {
          model: Proveedor,
          attributes: ["idProveedor", "rut", "nombre"],
        },
        {
          model: OrdenCompra,
          where: {
            estado: [
              "pendiente recibir",
              "recepcionada",
              "recibida con faltante",
              "despachada",
            ],
            tipo: "compra sucursal",
          },
          include: [
            {
              model: CompraProveedorDetalle,
              attributes: ["cantidad"],
              include: [
                {
                  model: Producto,
                  attributes: ["idProducto", "codigo", "nombre"],
                },
              ],
            },
            {
              model: Despacho,
              attributes: [
                "idDespacho",
                "codigoDespacho",
                "fechaDespacho",
                "tipoDocumento",
                "tipoDespacho",
                "repartidor",
                "estado",
              ],
              include: [
                {
                  model: DespachoDetalle,
                  attributes: [
                    "cantidad",
                    "cantidadRecibida",
                    "cantidadRechazada",
                  ],
                  include: [
                    {
                      model: Lote,
                      attributes: ["idLote", "codigoLote", "fechaVencimiento"],
                      include: [
                        {
                          model: Producto,
                          attributes: ["idProducto", "codigo", "nombre"],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Sucursal,
          attributes: ["idSucursal", "nombre"],
        },
        {
          model: Funcionario,
          as: "vendedor",
          attributes: ["rut", "nombre"],
        },
      ],
    });
    if (!ordenes || ordenes.length === 0) {
      return {
        code: 204,
        error: "No se encontraron ordenes de compra para el proveedor",
      };
    }
    return { code: 200, data: ordenes };
  } catch (error) {
    console.error(
      "Error al buscar órdenes de compra por ID de proveedor:",
      error,
    );
    return { code: 500, error: "Error al buscar órdenes de compra" };
  }
}

module.exports = {
  crearDespacho,
  buscarOCIdProveedor,
};
