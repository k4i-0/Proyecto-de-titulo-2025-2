const Bodega = require("./inventario/Bodega");
const Inventario = require("./inventario/Inventario");
const Sucursal = require("./inventario/Sucursal");
const Lote = require("./inventario/Lote");
const Proveedor = require("./inventario/Proveedor");
const Vendedor = require("./inventario/VendedorProveedor");
const Caja = require("./ventas/Caja");
const Funcionario = require("./usuarios/Funcionario");
const Roles = require("./usuarios/Rol");
const Bitacora = require("./usuarios/Bitacora");
const Actividad = require("./usuarios/Actividad");
const DatosVenta = require("./ventas/DatosVenta");
const Descuento = require("./ventas/Descuento");
const Categoria = require("./inventario/Categoria");
const Productos = require("./inventario/Productos");
const Cliente = require("./ventas/Cliente");

//intermedias
const Despacho = require("./inventario/Despacho");
const CompraProveedor = require("./inventario/CompraProveedor");
const ContratoFuncionario = require("./usuarios/ContratoFuncionario");
const CajaFuncionario = require("./ventas/CajaAsignada");
const DescuentoAsociado = require("./ventas/DescuentoAsociado");
const VentaCliente = require("./ventas/VentaCliente");

//Bodega tiene muchos inventarios
Bodega.hasMany(Inventario, {
  foreingKey: "idBodega",
  sourceKey: "idBodega",
});
//Inventario solo tiene una bodega
Inventario.belongsTo(Bodega, {
  foreingKey: "idBodega",
  targetKey: "idBodega",
});
//Sucursal tiene muchas Bodegas
Sucursal.hasMany(Bodega, {
  foreingKey: "idSucursal",
  sourceKey: "idSucursal",
});
//Bodega Solo tiene una sucursal
Bodega.belongsTo(Sucursal, {
  foreingKey: "idSucursal",
  targetKey: "idSucursal",
});
//una bodega tiene muchos lotes
Bodega.hasMany(Lote, {
  foreingKey: "idBodega",
  sourceKey: "idBodega",
});
//un lote esta en una sola bodega
Lote.belongsTo(Bodega, {
  foreingKey: "idBodega",
  targetKey: "idBodega",
});
//Categoria Tiene Muchos Productos
Categoria.hasMany(Productos, {
  foreingKey: "idCategoria",
  sourceKey: "idCategoria",
});
//Productos tiene solo una categoria
Productos.belongsTo(Categoria, {
  foreingKey: "idCategroria",
  targetKey: "idCategoria",
});

//productos tiene muchos inventarios
Productos.hasMany(Inventario, {
  foreingKey: "idProducto",
  sourceKey: "idProducto",
});
//inventario tiene un solo producto
Inventario.belongsTo(Productos, {
  foreingKey: "idProducto",
  targetKey: "idProducto",
});

//Producto tiene muchos lotes
Productos.hasMany(Lote, {
  foreingKey: "idProducto",
  sourceKey: "idProducto",
});
//Lote tiene un solo producto
Lote.belongsTo(Productos, {
  foreingKey: "idProducto",
  targetKey: "idProducto",
});
//Proveedor tiene muchos vendedores
Proveedor.hasMany(Vendedor, {
  foreingKey: "idProveedor",
  sourceKey: "idProveedor",
});
//Vendedor tiene un solo proveedor
Vendedor.belongsTo(Proveedor, {
  foreingKey: "idProveedor",
  targetKey: "idProveedor",
});
//Sucursal tiene muchas cajas
Sucursal.hasMany(Caja, {
  foreingKey: "idSucursal",
  sourceKey: "idSucursal",
});
//Caja tiene una sola sucursal
Caja.belongsTo(Sucursal, {
  foreingKey: "idSucursal",
  targetKey: "idSucursal",
});
// Rol tiene muchos Funcionarios
Roles.hasMany(Funcionario, {
  foreingKey: "idRol",
  sourceKey: "idRol",
});
// Funcionario tiene un solo Rol
Funcionario.belongsTo(Roles, {
  foreingKey: "idRol",
  targetKey: "idRol",
});
//Bitacora tiene muchos funcionarios
Bitacora.hasMany(Funcionario, {
  foreingKey: "idBitacora",
  sourceKey: "idBitacora",
});
//Funcionario tiene una sola bitacora
Funcionario.belongsTo(Bitacora, {
  foreingKey: "idBitacora",
  targetKey: "idBitacora",
});
//bitacora tiene muchas actividades
Bitacora.hasMany(Actividad, {
  foreingKey: "idBitacora",
  sourceKey: "idBitacora",
});
//actividad tiene una sola bitacora
Actividad.belongsTo(Bitacora, {
  foreingKey: "idBitacora",
  targetKey: "idBitacora",
});
//Proveedor tiene muchas cajas
Proveedor.hasMany(Caja, {
  foreingKey: "idProveedor",
  sourceKey: "idProveedor",
});
//Caja tiene un solo proveedor
Caja.belongsTo(Proveedor, {
  foreingKey: "idProveedor",
  targetKey: "idProveedor",
});
//Descuento tiene muchos datos de venta
Descuento.hasMany(DatosVenta, {
  foreingKey: "idDescuento",
  sourceKey: "idDescuento",
});
//Datos de venta tiene un solo descuento
DatosVenta.belongsTo(Descuento, {
  foreingKey: "idDescuento",
  targetKey: "idDescuento",
});

//Un Producto tienen muchos datos de venta
Productos.hasMany(DatosVenta, {
  foreingKey: "idProducto",
  sourceKey: "idProducto",
});
//Un dato de venta tiene un solo producto
DatosVenta.belongsTo(Productos, {
  foreingKey: "idProducto",
  targetKey: "idProducto",
});

/*
//Tabla intermedias
*/

//Tabla intermedia Producto Inventario
//Despacho de productos por lote
Lote.hasMany(Despacho, { foreingKey: "idLote" });
Despacho.belongsTo(Lote, { foreingKey: "idLote" });

Proveedor.hasMany(Despacho, { foreingKey: "idProveedor" });
Despacho.belongsTo(Proveedor, { foreingKey: "idProveedor" });

Funcionario.hasMany(Despacho, { foreingKey: "idFuncionario" });
Despacho.belongsTo(Funcionario, { foreingKey: "idFuncionario" });

Sucursal.hasMany(Despacho, { foreingKey: "idSucursal" });
Despacho.belongsTo(Sucursal, { foreingKey: "idSucursal" });

//Compra de productos por lote
Lote.hasMany(CompraProveedor, { foreingKey: "idLote" });
CompraProveedor.belongsTo(Lote, { foreingKey: "idLote" });

Proveedor.hasMany(CompraProveedor, { foreingKey: "idProveedor" });
CompraProveedor.belongsTo(Proveedor, { foreingKey: "idProveedor" });

Funcionario.hasMany(CompraProveedor, { foreingKey: "idFuncionario" });
CompraProveedor.belongsTo(Funcionario, { foreingKey: "idFuncionario" });

Sucursal.hasMany(CompraProveedor, { foreingKey: "idSucursal" });
CompraProveedor.belongsTo(Sucursal, { foreingKey: "idSucursal" });

//Contrato de funcionarios
Funcionario.hasMany(ContratoFuncionario, { foreingKey: "idFuncionario" });
ContratoFuncionario.belongsTo(Funcionario, { foreingKey: "idFuncionario" });

Sucursal.hasMany(ContratoFuncionario, { foreingKey: "idSucursal" });
ContratoFuncionario.belongsTo(Sucursal, { foreingKey: "idSucursal" });

//Caja asignada a funcionario
Funcionario.hasMany(CajaFuncionario, { foreingKey: "idFuncionario" });
CajaFuncionario.belongsTo(Funcionario, { foreingKey: "idFuncionario" });

Caja.hasMany(CajaFuncionario, { foreingKey: "idCaja" });
CajaFuncionario.belongsTo(Caja, { foreingKey: "idCaja" });

Sucursal.hasMany(CajaFuncionario, { foreingKey: "idSucursal" });
CajaFuncionario.belongsTo(Sucursal, { foreingKey: "idSucursal" });

//Descuento producto y categoria
Productos.hasMany(DescuentoAsociado, { foreingKey: "idProducto" });
DescuentoAsociado.belongsTo(Productos, { foreingKey: "idProducto" });

Categoria.hasMany(DescuentoAsociado, { foreingKey: "idCategoria" });
DescuentoAsociado.belongsTo(Categoria, { foreingKey: "idCategoria" });

Descuento.hasMany(DescuentoAsociado, { foreingKey: "idDescuento" });
DescuentoAsociado.belongsTo(Descuento, { foreingKey: "idDescuento" });

//Venta de productos a clientes
Funcionario.hasMany(VentaCliente, { foreingKey: "idFuncionario" });
VentaCliente.belongsTo(Funcionario, { foreingKey: "idFuncionario" });

Caja.hasMany(VentaCliente, { foreingKey: "idCaja" });
VentaCliente.belongsTo(Caja, { foreingKey: "idCaja" });

Cliente.hasMany(VentaCliente, { foreingKey: "idCliente" });
VentaCliente.belongsTo(Cliente, { foreingKey: "idCliente" });

DatosVenta.hasMany(VentaCliente, { foreingKey: "idDatosVenta" });
VentaCliente.belongsTo(DatosVenta, { foreingKey: "idDatosVenta" });

Descuento.hasMany(VentaCliente, { foreingKey: "idDescuento" });
VentaCliente.belongsTo(Descuento, { foreingKey: "idDescuento" });

module.exports = {
  Bodega,
  Inventario,
  Sucursal,
  Lote,
  Proveedor,
  Vendedor,
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
};
