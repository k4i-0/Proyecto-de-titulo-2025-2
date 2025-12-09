const Sucursal = require("../../models/inventario/Sucursal");
const Proveedor = require("../../models/inventario/Proveedor");
const CompraProveedor = require("../../models/inventario/CompraProveedor");
const VendedorProveedor = require("../../models/inventario/VendedorProveedor");
const CompraProveedorDetalle = require("../../models/inventario/CompraProveedorDetalle");
const Producto = require("../../models/inventario/Productos");
const Funcionario = require("../../models/Usuarios/Funcionario");
const { Op } = require("sequelize");

// Crear una nueva compra a proveedor
exports.crearOrdenCompraProveedor = async (req, res) => {
  try {
    const {
      idSucursal,
      idFuncionario,
      idProveedor,
      idVendedorProveedor,
      productos,
      observaciones,
    } = req.body;

    if (
      !idSucursal ||
      !idFuncionario ||
      !idProveedor ||
      !idVendedorProveedor ||
      !productos ||
      productos.length === 0 ||
      !observaciones
    ) {
      return res
        .status(422)
        .json({ code: 1234, error: "Faltan datos obligatorios" });
    }
    // Crear la orden de compra
    const comprobarSucursal = await Sucursal.findByPk(idSucursal);
    const comprobarProveedor = await Proveedor.findByPk(idProveedor);
    const comprobarVendedor = await VendedorProveedor.findOne({
      where: {
        [Op.and]: [
          { idProveedor: idProveedor },
          { idVendedorProveedor: idVendedorProveedor },
        ],
      },
    });
    const comprobarFuncionario = await Funcionario.findByPk(idFuncionario);

    if (!comprobarSucursal) {
      return res
        .status(404)
        .json({ code: 1235, error: "Sucursal no encontrada" });
    }
    if (!comprobarProveedor) {
      return res
        .status(404)
        .json({ code: 1236, error: "Proveedor no encontrado" });
    }
    if (!comprobarVendedor) {
      return res.status(404).json({
        code: 1237,
        error:
          "Vendedor del proveedor no encontrado para el proveedor indicado",
      });
    }
    if (!comprobarFuncionario) {
      return res
        .status(404)
        .json({ code: 1238, error: "Funcionario no encontrado" });
    }
    const totalCompra = productos.reduce(
      (total, item) =>
        total + item.valorUnitarioProducto * item.cantidadProducto,
      0
    );
    const hoy = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const ordenesHoy = await CompraProveedor.count({
      where: {
        fechaCompra: {
          [Op.gte]: new Date().setHours(0, 0, 0, 0),
        },
      },
    });
    const nuevaCompraProveedor = await CompraProveedor.create({
      fechaCompra: new Date(),
      estado: "pendiente",
      total: totalCompra,
      observaciones,
      nombreOrden: `OC-${hoy}-${String(ordenesHoy + 1).padStart(3, "0")}`,
      idSucursal,
      idProveedor,
      idFuncionario,
    });
    if (!nuevaCompraProveedor) {
      console.log("Fallo al crear la compra proveedor", nuevaCompraProveedor);
      return res.status(500).json({
        code: 1239,
        error: "Error al crear la orden de compra a proveedor",
      });
    }

    // Crear los detalles de la compra
    for (const item of productos) {
      const { productoSeleccionado, cantidadProducto, valorUnitarioProducto } =
        item;
      const totalProducto = cantidadProducto * valorUnitarioProducto;
      const comprobarProducto = await Producto.findByPk(productoSeleccionado);
      if (!comprobarProducto) {
        return res.status(404).json({
          code: 1241,
          error: `Producto con ID ${productoSeleccionado} no encontrado`,
        });
      }
      const nuevaCompraProveedorDetalle = await CompraProveedorDetalle.create({
        idCompraProveedor: nuevaCompraProveedor.idCompraProveedor,
        idProducto: productoSeleccionado,
        cantidad: cantidadProducto,
        precioUnitario: valorUnitarioProducto,
        total: totalProducto,
      });
      if (!nuevaCompraProveedorDetalle) {
        console.log(
          "Fallo al crear el detalle de la compra proveedor",
          nuevaCompraProveedorDetalle
        );
        return res.status(500).json({
          code: 1240,
          error: "Error al crear el detalle de la orden de compra a proveedor",
        });
      }
    }
    res.status(201).json({
      message: "Orden de compra a proveedor creada con éxito",
      compraProveedor: nuevaCompraProveedor,
    });
  } catch (error) {
    console.error("Error al crear la orden de compra a proveedor:", error);
    res
      .status(500)
      .json({ error: "Error al crear la orden de compra a proveedor" });
  }
};

exports.obtenerOrdenesCompraProveedores = async (req, res) => {
  try {
    const ordenesCompra = await CompraProveedor.findAll({
      include: [
        {
          model: Proveedor,
          attributes: ["idProveedor", "nombre", "rut", "email"],
        },
        {
          model: Funcionario,
          attributes: ["idFuncionario", "nombre", "email"],
        },
        {
          model: Sucursal,
          attributes: ["idSucursal", "nombre", "direccion"],
        },
        {
          model: CompraProveedorDetalle,

          include: [
            {
              model: Producto,
              attributes: ["idProducto", "nombre", "marca", "descripcion"],
            },
          ],
        },
      ],
      order: [["fechaCompra", "DESC"]],
    });
    if (ordenesCompra.length === 0 || !ordenesCompra) {
      return res.status(204).json({
        message: "No hay ordenes de compra a proveedores disponibles",
      });
    }
    res.status(200).json(ordenesCompra);
  } catch (error) {
    console.error(
      "Error al obtener las ordenes de compra a proveedores:",
      error
    );
    res
      .status(500)
      .json({ error: "Error al obtener las ordenes de compra a proveedores" });
  }
};
