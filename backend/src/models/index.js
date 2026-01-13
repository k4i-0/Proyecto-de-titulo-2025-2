const Sequelize = require("sequelize");

const sequelize = require("../config/bd");

const db = {};

// Modelos

db.Bodega = require("./inventario/Bodega");
db.Inventario = require("./inventario/Inventario");
db.Sucursal = require("./inventario/Sucursal");
db.Lote = require("./inventario/Lote");
db.Proveedor = require("./inventario/Proveedor");
db.Vendedor = require("./inventario/VendedorProveedor");
db.Caja = require("./ventas/Caja");
db.Funcionario = require("./Usuarios/Funcionario");
db.Roles = require("./Usuarios/Rol");
db.Bitacora = require("./Usuarios/Bitacora");
db.Actividad = require("./Usuarios/Actividad");
db.DetalleVenta = require("./ventas/DetalleVenta");
db.Descuento = require("./ventas/Descuento");
db.Categoria = require("./inventario/Categoria");
db.Productos = require("./inventario/Productos");
db.Cliente = require("./ventas/Cliente");
db.Estante = require("./inventario/Estante");
db.OrdenCompra = require("./inventario/OrdenCompra");
// db.Boleta = require("./ventas/Boleta");
db.DetalleDespacho = require("./inventario/DetalleDespacho");

//intermedias
db.Despacho = require("./inventario/Despacho");
db.CompraProveedor = require("./inventario/CompraProveedor");
db.ContratoFuncionario = require("./Usuarios/ContratoFuncionario");
db.CajaFuncionario = require("./ventas/CajaAsignada");
db.VentaCliente = require("./ventas/VentaCliente");
db.BitacoraActividad = require("./Usuarios/BitacoraActividad");

db.DescuentoSobre = require("./ventas/DescuentoSobre");
db.CompraProveedorDetalle = require("./inventario/CompraProveedorDetalle");
db.Provee = require("./inventario/Provee");
db.compraproveedordetalle = require("./inventario/CompraProveedorDetalle");
db.RealizaVenta = require("./ventas/RealizaVenta");
db.EntregaProveedor = require("./inventario/EntregaProveedor");

//Destructuriacion
const {
  Sucursal,
  Bodega,
  Estante,
  Inventario,
  Categoria,
  Productos,
  Proveedor,
  Vendedor,
  DetalleVenta,
  Lote,
  CompraProveedorDetalle,
  Roles,
  Funcionario,
  Bitacora,
  Caja,
  VentaCliente,
  Descuento,
  Despacho,
  EntregaProveedor,
  OrdenCompra,
  DetalleDespacho,
  Cliente,
  RealizaVenta,
  ContratoFuncionario,
  CajaFuncionario,
  DescuentoSobre,
  Provee,
} = db;

// ========== tablas 1:n Modulo Inventario ==========

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

//Inventario y bodega (1:N)
Inventario.hasMany(Bodega, {
  foreignKey: "idBodega",
});
Bodega.belongsTo(Inventario, {
  foreignKey: "idBodega",
});

//Deprecado
// inventario -> estante (1:N)
// Estante.hasMany(Inventario, {
//   foreignKey: "idEstante",
// });
// Inventario.belongsTo(Estante, {
//   foreignKey: "idEstante",
// });

// Categoria -> Productos (1:N)
Categoria.hasMany(Productos, {
  foreignKey: "idCategoria",
});
Productos.belongsTo(Categoria, {
  foreignKey: "idCategoria",
});

//Productos -> Inventario (1:N)
Productos.hasMany(Inventario, {
  foreignKey: "idProducto",
});
Inventario.belongsTo(Productos, {
  foreignKey: "idProducto",
});

//Productos -> Lote (1:N)
// Productos.hasMany(Lote, {
//   foreignKey: "idProducto",
// });
// Lote.belongsTo(Productos, {
//   foreignKey: "idProducto",
// });

// Proveedor -> Vendedor (1:N)
Proveedor.hasMany(Vendedor, {
  foreignKey: "idProveedor",
});
Vendedor.belongsTo(Proveedor, {
  foreignKey: "idProveedor",
});

//Detalle venta -> Producto
Productos.hasMany(DetalleVenta, {
  foreignKey: "idProducto",
});
DetalleVenta.belongsTo(Productos, {
  foreignKey: "idProducto",
});

// Estante -> Lote (1:N)
Estante.hasMany(Lote, {
  foreignKey: "idEstante",
});
Lote.belongsTo(Estante, {
  foreignKey: "idEstante",
});

// Deatlle Despacho -> Lote (1:N)
DetalleDespacho.hasMany(Lote, {
  foreignKey: "idDetalleDespacho",
});
Lote.belongsTo(DetalleDespacho, {
  foreignKey: "idDetalleDespacho",
});

// Despacho -> Detalle Despacho (1:N)
Despacho.hasMany(DetalleDespacho, {
  foreignKey: "idDespacho",
});
DetalleDespacho.belongsTo(Despacho, {
  foreignKey: "idDespacho",
});

// compraProveedorDetalle productos 1:N
Productos.hasMany(CompraProveedorDetalle, {
  foreignKey: "idProducto",
});
CompraProveedorDetalle.belongsTo(Productos, {
  foreignKey: "idProducto",
});

//Lote -> Producto (1:N)
Productos.hasMany(Lote, {
  foreignKey: "idProducto",
});
Lote.belongsTo(Productos, {
  foreignKey: "idProducto",
});

// ========== tablas 1:n Modulo Usuarios ==========

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

//============ Tablas 1:n Modulo Ventas ===========

// Sucursal -> Caja (1:N)
Sucursal.hasMany(Caja, {
  foreignKey: "idSucursal",
});
Caja.belongsTo(Sucursal, {
  foreignKey: "idSucursal",
});

Proveedor.hasMany(Caja, {
  foreignKey: "idProveedor",
});
Caja.belongsTo(Proveedor, {
  foreignKey: "idProveedor",
});

//Decuento VentaCliente 1:N
VentaCliente.hasMany(Descuento, {
  foreignKey: "idVentaCliente",
});
Descuento.belongsTo(VentaCliente, {
  foreignKey: "idVentaCliente",
});

// ========== TABLAS INTERMEDIAS ==========

//============Tablas intermedias Modulo Inventario ==========

//Despacho
Despacho.hasMany(EntregaProveedor, { foreignKey: "idDespacho" });
Sucursal.hasMany(Despacho, { foreignKey: "idSucursal" });
Funcionario.hasMany(Despacho, { foreignKey: "idFuncionario" });
Proveedor.hasMany(Despacho, { foreignKey: "idProveedor" });

EntregaProveedor.belongsTo(Despacho, { foreignKey: "idDespacho" });
Despacho.belongsTo(Sucursal, { foreignKey: "idSucursal" });
Despacho.belongsTo(Funcionario, { foreignKey: "idFuncionario" });
Despacho.belongsTo(Proveedor, { foreignKey: "idProveedor" });

//Compra
OrdenCompra.hasMany(CompraProveedorDetalle, {
  foreignKey: "idOrdenCompra",
});
Sucursal.hasMany(OrdenCompra, { foreignKey: "idSucursal" });
Funcionario.hasMany(OrdenCompra, { foreignKey: "idFuncionario" });
Proveedor.hasMany(OrdenCompra, { foreignKey: "idProveedor" });

CompraProveedorDetalle.belongsTo(OrdenCompra, {
  foreignKey: "idOrdenCompra",
});
OrdenCompra.belongsTo(Sucursal, { foreignKey: "idSucursal" });
OrdenCompra.belongsTo(Funcionario, { foreignKey: "idFuncionario" });
OrdenCompra.belongsTo(Proveedor, { foreignKey: "idProveedor" });

//Tabla intermedia Provee (Producto - Proveedor)
Proveedor.belongsToMany(Productos, {
  through: Provee,
  foreignKey: "idProveedor",
  otherKey: "idProducto",
  as: "productos",
});
Productos.belongsToMany(Proveedor, {
  through: Provee,
  foreignKey: "idProducto",
  otherKey: "idProveedor",
  as: "proveedores",
});
Proveedor.hasMany(Provee, {
  foreignKey: "idProveedor",
  as: "proveeRegistros",
});

Productos.hasMany(Provee, {
  foreignKey: "idProducto",
  as: "proveeRegistros",
});

Provee.belongsTo(Proveedor, {
  foreignKey: "idProveedor",
  as: "proveedor",
});

Provee.belongsTo(Productos, {
  foreignKey: "idProducto",
  as: "producto",
});

///============Tablas intermedias Modulo venta ==========

//Tabla intermedia RealizaVenta (Funcionario - VentaCliente - Caja)
Funcionario.hasMany(RealizaVenta, { foreignKey: "idFuncionario" });
VentaCliente.hasMany(RealizaVenta, { foreignKey: "idVentaCliente" });
Caja.hasMany(RealizaVenta, { foreignKey: "idCaja" });

RealizaVenta.belongsTo(Funcionario, { foreignKey: "idFuncionario" });
RealizaVenta.belongsTo(VentaCliente, { foreignKey: "idVentaCliente" });
RealizaVenta.belongsTo(Caja, { foreignKey: "idCaja" });

//Venta (Cliente -detalle Venta )

DetalleVenta.hasMany(VentaCliente, { foreignKey: "idDetalleVenta" });
Cliente.hasMany(VentaCliente, { foreignKey: "idCliente" });

VentaCliente.belongsTo(DetalleVenta, { foreignKey: "idDetalleVenta" });
VentaCliente.belongsTo(Cliente, { foreignKey: "idCliente" });

// Asocioacion descuento sobre productos y categoria
Descuento.hasMany(DescuentoSobre, { foreignKey: "idDescuento" });
Productos.hasMany(DescuentoSobre, { foreignKey: "idProducto" });
Categoria.hasMany(DescuentoSobre, { foreignKey: "idCategoria" });

DescuentoSobre.belongsTo(Descuento, { foreignKey: "idDescuento" });
DescuentoSobre.belongsTo(Productos, { foreignKey: "idProducto" });
DescuentoSobre.belongsTo(Categoria, { foreignKey: "idCategoria" });

// ========== TABLAS INTERMEDIAS Modulo usuarios ==========

//(Caja asignada a funcionario)
Funcionario.hasMany(CajaFuncionario, { foreignKey: "idFuncionario" });
Caja.hasMany(CajaFuncionario, { foreignKey: "idCaja" });
Sucursal.hasMany(CajaFuncionario, { foreignKey: "idSucursal" });

CajaFuncionario.belongsTo(Funcionario, { foreignKey: "idFuncionario" });
CajaFuncionario.belongsTo(Caja, { foreignKey: "idCaja" });
CajaFuncionario.belongsTo(Sucursal, { foreignKey: "idSucursal" });

// (ContratoFuncionario)
Sucursal.belongsToMany(Funcionario, {
  through: ContratoFuncionario,
  foreignKey: "idSucursal",
});
Funcionario.belongsToMany(Sucursal, {
  through: ContratoFuncionario,
  foreignKey: "idFuncionario",
});
Funcionario.hasMany(ContratoFuncionario, {
  foreignKey: "idFuncionario",
  as: "contratos",
});
ContratoFuncionario.belongsTo(Funcionario, {
  foreignKey: "idFuncionario",
});

ContratoFuncionario.belongsTo(Sucursal, {
  foreignKey: "idSucursal",
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

// module.exports = {
//   Bodega,
//   Inventario,
//   Sucursal,
//   Lote,
//   Proveedor,
//   Vendedor,
//   Caja,
//   Funcionario,
//   Roles,
//   Bitacora,
//   Actividad,
//   DetalleVenta,
//   Descuento,
//   Categoria,
//   Productos,
//   Cliente,
//   Estante,
//   Despacho,
//   CompraProveedor,
//   ContratoFuncionario,
//   CajaFuncionario,
//   VentaCliente,
//   BitacoraActividad,
//   DescuentoSobre,
//   CompraProveedorDetalle,
//   Provee,
//   RealizaVenta,
//   DetalleVenta,
//   OrdenCompra,
//   EntregaProveedor,
//   DetalleDespacho,
// };
