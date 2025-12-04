const Bodega = require("./inventario/Bodega");
const Inventario = require("./inventario/Inventario");
const Sucursal = require("./inventario/Sucursal");
const Lote = require("./inventario/Lote");
const Proveedor = require("./inventario/Proveedor");
const Vendedor = require("./inventario/VendedorProveedor");
const Caja = require("./ventas/Caja");
const Funcionario = require("./Usuarios/Funcionario");
const Roles = require("./Usuarios/Rol");
const Bitacora = require("./Usuarios/Bitacora");
const Actividad = require("./Usuarios/Actividad");
const DatosVenta = require("./ventas/DatosVenta");
const Descuento = require("./ventas/Descuento");
const Categoria = require("./inventario/Categoria");
const Productos = require("./inventario/Productos");
const Cliente = require("./ventas/Cliente");
const Estante = require("./inventario/Estante");
const Boleta = require("./ventas/Boleta");

//intermedias
const Despacho = require("./inventario/Despacho");
const CompraProveedor = require("./inventario/CompraProveedor");
const ContratoFuncionario = require("./Usuarios/ContratoFuncionario");
const CajaFuncionario = require("./ventas/CajaAsignada");
const DescuentoAsociado = require("./ventas/DetalleDescuento");
const VentaCliente = require("./ventas/VentaCliente");
const BitacoraActividad = require("./Usuarios/BitacoraActividad");
const DetalleDescuento = require("./ventas/DetalleDescuento");
const DescuentoSobre = require("./ventas/DescuentoSobre");
const CompraProveedorDetalle = require("./inventario/CompraProveedorDetalle");

// ========== ASOCIACIONES PRINCIPALES ==========

// Sucursal -> Bodega (1:N)
Sucursal.hasMany(Bodega, {
  foreignKey: "idSucursal",
});
Bodega.belongsTo(Sucursal, {
  foreignKey: "idSucursal",
});

// Bodega -> Estantes (1:N)
Bodega.hasMany(Estante, {
  foreignKey: "idBodega",
});
Estante.belongsTo(Bodega, {
  foreignKey: "idBodega",
});

// inventario -> estante (1:N)
Estante.hasMany(Inventario, {
  foreignKey: "idEstante",
});
Inventario.belongsTo(Estante, {
  foreignKey: "idEstante",
});

// Categoria -> Productos (1:N)
Categoria.hasMany(Productos, {
  foreignKey: "idCategoria",
});
Productos.belongsTo(Categoria, {
  foreignKey: "idCategoria",
});

// Productos -> Inventario (1:N)
// Productos.hasMany(Inventario, {
//   foreignKey: "idProducto",
// });
// Inventario.belongsTo(Productos, {
//   foreignKey: "idProducto",
// });

// Productos -> Lote (1:N)
Productos.hasMany(Lote, {
  foreignKey: "idProducto",
});
Lote.belongsTo(Productos, {
  foreignKey: "idProducto",
});

//inventario a lote (1:N)
Lote.hasMany(Inventario, {
  foreignKey: "idLote",
});
Inventario.belongsTo(Lote, {
  foreignKey: "idLote",
});

// Proveedor -> Vendedor (1:N)
Proveedor.hasMany(Vendedor, {
  foreignKey: "idProveedor",
});
Vendedor.belongsTo(Proveedor, {
  foreignKey: "idProveedor",
});

// Sucursal -> Caja (1:N)
Sucursal.hasMany(Caja, {
  foreignKey: "idSucursal",
});
Caja.belongsTo(Sucursal, {
  foreignKey: "idSucursal",
});

// Roles -> Funcionario (1:N)
Roles.hasMany(Funcionario, {
  foreignKey: "idRol",
  sourceKey: "idRol",
});
Funcionario.belongsTo(Roles, {
  foreignKey: "idRol",
  targetKey: "idRol",
});

// Bitacora -> Funcionario (1:N)
Funcionario.hasMany(Bitacora, {
  foreignKey: "idFuncionario",
});
Bitacora.belongsTo(Funcionario, {
  foreignKey: "idFuncionario",
});

//Encargado de sucursal
Funcionario.hasMany(Sucursal, {
  foreignKey: "idFuncionario",
});
Sucursal.belongsTo(Funcionario, {
  foreignKey: "idFuncionario",
});

//Detalle venta -> Producto
Productos.hasMany(DatosVenta, {
  foreignKey: "idProducto",
});
DatosVenta.belongsTo(Productos, {
  foreignKey: "idProducto",
});

Boleta.hasMany(DatosVenta, {
  foreignKey: "idBoleta",
});
DatosVenta.belongsTo(Boleta, {
  foreignKey: "idBoleta",
});

Proveedor.hasMany(Caja, {
  foreignKey: "idProveedor",
});
Caja.belongsTo(Proveedor, {
  foreignKey: "idProveedor",
});

// ========== TABLAS INTERMEDIAS ==========

//============Tablas intermedias ternarias o mas ==========

//Despacho
Lote.hasMany(Despacho, { foreignKey: "idLote" });
Sucursal.hasMany(Despacho, { foreignKey: "idSucursal" });
Funcionario.hasMany(Despacho, { foreignKey: "idFuncionario" });
Proveedor.hasMany(Despacho, { foreignKey: "idProveedor" });

Despacho.belongsTo(Lote, { foreignKey: "idLote" });
Despacho.belongsTo(Sucursal, { foreignKey: "idSucursal" });
Despacho.belongsTo(Funcionario, { foreignKey: "idFuncionario" });
Despacho.belongsTo(Proveedor, { foreignKey: "idProveedor" });

//Compra
Productos.hasMany(CompraProveedor, { foreignKey: "idProducto" });
Sucursal.hasMany(CompraProveedor, { foreignKey: "idSucursal" });
Funcionario.hasMany(CompraProveedor, { foreignKey: "idFuncionario" });
Proveedor.hasMany(CompraProveedor, { foreignKey: "idProveedor" });

CompraProveedor.belongsTo(Productos, { foreignKey: "idProducto" });
CompraProveedor.belongsTo(Sucursal, { foreignKey: "idSucursal" });
CompraProveedor.belongsTo(Funcionario, { foreignKey: "idFuncionario" });
CompraProveedor.belongsTo(Proveedor, { foreignKey: "idProveedor" });

//CompraProveedorDetalle
CompraProveedor.hasMany(CompraProveedorDetalle, {
  foreignKey: "idCompraProveedor",
});
CompraProveedorDetalle.belongsTo(CompraProveedor, {
  foreignKey: "idCompraProveedor",
});
CompraProveedorDetalle.belongsTo(Productos, { foreignKey: "idProducto" });
Productos.hasMany(CompraProveedorDetalle, { foreignKey: "idProducto" });

// Caja-Funcionario-Sucursal (Caja asignada a funcionario)
Funcionario.hasMany(CajaFuncionario, { foreignKey: "idFuncionario" });
Caja.hasMany(CajaFuncionario, { foreignKey: "idCaja" });
Sucursal.hasMany(CajaFuncionario, { foreignKey: "idSucursal" });

CajaFuncionario.belongsTo(Funcionario, { foreignKey: "idFuncionario" });
CajaFuncionario.belongsTo(Caja, { foreignKey: "idCaja" });
CajaFuncionario.belongsTo(Sucursal, { foreignKey: "idSucursal" });

//Venta Cliente-Funcionario-Caja-Boleta

Funcionario.hasMany(VentaCliente, { foreignKey: "idFuncionario" });
Caja.hasMany(VentaCliente, { foreignKey: "idCaja" });
Boleta.hasMany(VentaCliente, { foreignKey: "idBoleta" });
Cliente.hasMany(VentaCliente, { foreignKey: "idCliente" });

VentaCliente.belongsTo(Funcionario, { foreignKey: "idFuncionario" });
VentaCliente.belongsTo(Caja, { foreignKey: "idCaja" });
VentaCliente.belongsTo(Boleta, { foreignKey: "idBoleta" });
VentaCliente.belongsTo(Cliente, { foreignKey: "idCliente" });

// Asocioacion descuento sobre productos y categoria
Descuento.hasMany(DescuentoSobre, { foreignKey: "idDescuento" });
Productos.hasMany(DescuentoSobre, { foreignKey: "idProducto" });
Categoria.hasMany(DescuentoSobre, { foreignKey: "idCategoria" });

DescuentoSobre.belongsTo(Descuento, { foreignKey: "idDescuento" });
DescuentoSobre.belongsTo(Productos, { foreignKey: "idProducto" });
DescuentoSobre.belongsTo(Categoria, { foreignKey: "idCategoria" });

// ========== TABLAS INTERMEDIAS BINARIAS ==========

// Boleta Descuento (intermedia)
Boleta.belongsToMany(DetalleDescuento, {
  through: DescuentoAsociado,
  foreignKey: "idBoleta",
});
DetalleDescuento.belongsToMany(Boleta, {
  through: DescuentoAsociado,
  foreignKey: "idDetalledescuento",
});

//Sucursal - Funcionario (ContratoFuncionario)
Sucursal.belongsToMany(Funcionario, {
  through: ContratoFuncionario,
  foreignKey: "idSucursal",
});
Funcionario.belongsToMany(Sucursal, {
  through: ContratoFuncionario,
  foreignKey: "idFuncionario",
});

ContratoFuncionario.belongsTo(Funcionario, {
  foreignKey: "idFuncionario",
});

ContratoFuncionario.belongsTo(Sucursal, {
  foreignKey: "idSucursal",
});

module.exports = {
  Bodega,
  Inventario,
  Sucursal,
  Lote,
  Proveedor,
  Vendedor,
  Caja,
  Funcionario,
  Roles,
  Bitacora,
  Actividad,
  DatosVenta,
  Descuento,
  Categoria,
  Productos,
  Cliente,
  Estante,
  Boleta,
  Despacho,
  CompraProveedor,
  ContratoFuncionario,
  CajaFuncionario,
  DescuentoAsociado,
  VentaCliente,
  BitacoraActividad,
  DetalleDescuento,
  DescuentoSobre,
  CompraProveedorDetalle,
};
