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

//intermedias
const Despacho = require("./inventario/Despacho");
const CompraProveedor = require("./inventario/CompraProveedor");
const ContratoFuncionario = require("./Usuarios/ContratoFuncionario");
const CajaFuncionario = require("./ventas/CajaAsignada");
const DescuentoAsociado = require("./ventas/DescuentoAsociado");
const VentaCliente = require("./ventas/VentaCliente");
const BitacoraActividad = require("./Usuarios/BitacoraActividad");
const estante = require("./inventario/Estante");

// ========== ASOCIACIONES PRINCIPALES ==========

// Sucursal -> Bodega (1:N)
Sucursal.hasMany(Bodega, {
  foreignKey: "idSucursal",
  sourceKey: "idSucursal",
});
Bodega.belongsTo(Sucursal, {
  foreignKey: "idSucursal",
  targetKey: "idSucursal",
});

// Bodega -> Estantes (1:N)
Bodega.hasMany(Estante, {
  foreignKey: "idBodega",
  sourceKey: "idBodega",
});

Estante.belongsTo(Bodega, {
  foreignKey: "idBodega",
  sourceKey: "idBodega",
});

// inventario -> estante (1:N)

Inventario.hasMany(Estante, {
  foreignKey: "idInventario",
  sourceKey: "idInventario",
});

Estante.belongsTo(Inventario, {
  foreignKey: "idInventario",
  sourceKey: "idInventario",
});

// Bodega -> Inventario (1:N)
Bodega.hasMany(Inventario, {
  foreignKey: "idBodega",
  sourceKey: "idBodega",
});
Inventario.belongsTo(Bodega, {
  foreignKey: "idBodega",
  targetKey: "idBodega",
});

// Bodega -> Lote (1:N)
//Bodega.hasMany(Lote, {
//  foreignKey: "idBodega",
//  sourceKey: "idBodega",
//});
//Lote.belongsTo(Bodega, {
//  foreignKey: "idBodega",
//  targetKey: "idBodega",
//});

// Categoria -> Productos (1:N)
Categoria.hasMany(Productos, {
  foreignKey: "idCategoria",
  sourceKey: "idCategoria",
});
Productos.belongsTo(Categoria, {
  foreignKey: "idCategoria",
  targetKey: "idCategoria",
});

// Productos -> Inventario (1:N)
Productos.hasMany(Inventario, {
  foreignKey: "idProducto",
  sourceKey: "idProducto",
});
Inventario.belongsTo(Productos, {
  foreignKey: "idProducto",
  targetKey: "idProducto",
});

// Productos -> Lote (1:N)
Productos.hasMany(Lote, {
  foreignKey: "idProducto",
  sourceKey: "idProducto",
});
Lote.belongsTo(Productos, {
  foreignKey: "idProducto",
  targetKey: "idProducto",
});

// Proveedor -> Vendedor (1:N)
Proveedor.hasMany(Vendedor, {
  foreignKey: "idProveedor",
  sourceKey: "idProveedor",
});
Vendedor.belongsTo(Proveedor, {
  foreignKey: "idProveedor",
  targetKey: "idProveedor",
});

// Sucursal -> Caja (1:N)
Sucursal.hasMany(Caja, {
  foreignKey: "idSucursal",
  sourceKey: "idSucursal",
});
Caja.belongsTo(Sucursal, {
  foreignKey: "idSucursal",
  targetKey: "idSucursal",
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
Bitacora.hasMany(Funcionario, {
  foreignKey: "idBitacora",
  sourceKey: "idBitacora",
});
Funcionario.belongsTo(Bitacora, {
  foreignKey: "idBitacora",
  targetKey: "idBitacora",
});

// Bitacora -> Funcionario (1:N)
Bitacora.hasMany(Funcionario, {
  foreignKey: "idBitacora",
  sourceKey: "idBitacora",
});
Funcionario.belongsTo(Bitacora, {
  foreignKey: "idBitacora",
  targetKey: "idBitacora",
});

// Descuento -> DatosVenta (1:N)
Descuento.hasMany(DatosVenta, {
  foreignKey: "idDescuento",
  sourceKey: "idDescuento",
});
DatosVenta.belongsTo(Descuento, {
  foreignKey: "idDescuento",
  targetKey: "idDescuento",
});

// Productos -> DatosVenta (1:N)
Productos.hasMany(DatosVenta, {
  foreignKey: "idProducto",
  sourceKey: "idProducto",
});
DatosVenta.belongsTo(Productos, {
  foreignKey: "idProducto",
  targetKey: "idProducto",
});

// ========== TABLAS INTERMEDIAS ==========

// // BitacoraActividad (intermedia)
// Bitacora.belongsToMany(Actividad, {
//   through: BitacoraActividad,
//   foreignKey: "idBitacora",
//   otherKey: "idActividad",
// });
// Actividad.belongsToMany(Bitacora, {
//   through: BitacoraActividad,
//   foreignKey: "idActividad",
//   otherKey: "idBitacora",
// });

// Despacho (intermedia)
Lote.hasMany(Despacho, { foreignKey: "idLote" });
Despacho.belongsTo(Lote, { foreignKey: "idLote" });

Proveedor.hasMany(Despacho, { foreignKey: "idProveedor" });
Despacho.belongsTo(Proveedor, { foreignKey: "idProveedor" });

Funcionario.hasMany(Despacho, { foreignKey: "idFuncionario" });
Despacho.belongsTo(Funcionario, { foreignKey: "idFuncionario" });

Sucursal.hasMany(Despacho, { foreignKey: "idSucursal" });
Despacho.belongsTo(Sucursal, { foreignKey: "idSucursal" });

// CompraProveedor (intermedia)
Lote.hasMany(CompraProveedor, { foreignKey: "idLote" });
CompraProveedor.belongsTo(Lote, { foreignKey: "idLote" });

Proveedor.hasMany(CompraProveedor, { foreignKey: "idProveedor" });
CompraProveedor.belongsTo(Proveedor, { foreignKey: "idProveedor" });

Funcionario.hasMany(CompraProveedor, { foreignKey: "idFuncionario" });
CompraProveedor.belongsTo(Funcionario, { foreignKey: "idFuncionario" });

Sucursal.hasMany(CompraProveedor, { foreignKey: "idSucursal" });
CompraProveedor.belongsTo(Sucursal, { foreignKey: "idSucursal" });

// ContratoFuncionario (intermedia)
Funcionario.hasMany(ContratoFuncionario, { foreignKey: "idFuncionario" });
ContratoFuncionario.belongsTo(Funcionario, { foreignKey: "idFuncionario" });

Sucursal.hasMany(ContratoFuncionario, { foreignKey: "idSucursal" });
ContratoFuncionario.belongsTo(Sucursal, { foreignKey: "idSucursal" });

// CajaFuncionario (intermedia)
Funcionario.hasMany(CajaFuncionario, { foreignKey: "idFuncionario" });
CajaFuncionario.belongsTo(Funcionario, { foreignKey: "idFuncionario" });

Caja.hasMany(CajaFuncionario, { foreignKey: "idCaja" });
CajaFuncionario.belongsTo(Caja, { foreignKey: "idCaja" });

Sucursal.hasMany(CajaFuncionario, { foreignKey: "idSucursal" });
CajaFuncionario.belongsTo(Sucursal, { foreignKey: "idSucursal" });

// DescuentoAsociado (intermedia)
Productos.hasMany(DescuentoAsociado, { foreignKey: "idProducto" });
DescuentoAsociado.belongsTo(Productos, { foreignKey: "idProducto" });

Categoria.hasMany(DescuentoAsociado, { foreignKey: "idCategoria" });
DescuentoAsociado.belongsTo(Categoria, { foreignKey: "idCategoria" });

Descuento.hasMany(DescuentoAsociado, { foreignKey: "idDescuento" });
DescuentoAsociado.belongsTo(Descuento, { foreignKey: "idDescuento" });

// VentaCliente (intermedia)
Funcionario.hasMany(VentaCliente, { foreignKey: "idFuncionario" });
VentaCliente.belongsTo(Funcionario, { foreignKey: "idFuncionario" });

Caja.hasMany(VentaCliente, { foreignKey: "idCaja" });
VentaCliente.belongsTo(Caja, { foreignKey: "idCaja" });

Cliente.hasMany(VentaCliente, { foreignKey: "idCliente" });
VentaCliente.belongsTo(Cliente, { foreignKey: "idCliente" });

DatosVenta.hasMany(VentaCliente, { foreignKey: "idDatosVenta" });
VentaCliente.belongsTo(DatosVenta, { foreignKey: "idDatosVenta" });

Descuento.hasMany(VentaCliente, { foreignKey: "idDescuento" });
VentaCliente.belongsTo(Descuento, { foreignKey: "idDescuento" });

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
  Despacho,
  CompraProveedor,
  ContratoFuncionario,
  CajaFuncionario,
  DescuentoAsociado,
  VentaCliente,
  BitacoraActividad,
  Estante,
};
