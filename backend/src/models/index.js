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
const DetalleVenta = require("./ventas/DetalleVenta");
const Descuento = require("./ventas/Descuento");
const Categoria = require("./inventario/Categoria");
const Productos = require("./inventario/Productos");
const Cliente = require("./ventas/Cliente");
const Estante = require("./inventario/Estante");
const OrdenCompra = require("./inventario/OrdenCompra");
// const Boleta = require("./ventas/Boleta");
//const DetalleDespacho = require("./inventario/DetalleDespacho");

//intermedias
const Despacho = require("./inventario/Despacho");
const CompraProveedor = require("./inventario/CompraProveedor");
const ContratoFuncionario = require("./Usuarios/ContratoFuncionario");
const CajaFuncionario = require("./ventas/CajaAsignada");
const VentaCliente = require("./ventas/VentaCliente");
const BitacoraActividad = require("./Usuarios/BitacoraActividad");

const DescuentoSobre = require("./ventas/DescuentoSobre");
const CompraProveedorDetalle = require("./inventario/CompraProveedorDetalle");
const Provee = require("./inventario/Provee");
const LoteProducto = require("./inventario/LoteProducto");
const compraproveedordetalle = require("./inventario/CompraProveedorDetalle");
const RealizaVenta = require("./ventas/RealizaVenta");
const EntregaProveedor = require("./inventario/EntregaProveedor");

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

// Despacho -> Lote (1:N)
Despacho.hasMany(Lote, {
  foreignKey: "idLote",
});
Lote.belongsTo(Despacho, {
  foreignKey: "idLote",
});

// compraProveedorDetalle productos 1:N
Productos.hasMany(CompraProveedorDetalle, {
  foreignKey: "idProducto",
});
CompraProveedorDetalle.belongsTo(Productos, {
  foreignKey: "idProducto",
});

// OrdenCompra CompraProveedorDetalle  1:N
OrdenCompra.hasMany(CompraProveedorDetalle, {
  foreignKey: "idOrdenCompra",
});
CompraProveedorDetalle.belongsTo(OrdenCompra, {
  foreignKey: "idOrdenCompra",
});

// lote Despacho 1:N
Despacho.hasMany(Lote, {
  foreignKey: "idDespacho",
});
Lote.belongsTo(Despacho, {
  foreignKey: "idDespacho",
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

//Tabla intermedia LoteProducto
Lote.hasMany(LoteProducto, { foreignKey: "idLote" });
Productos.hasMany(LoteProducto, { foreignKey: "idProducto" });

LoteProducto.belongsTo(Lote, { foreignKey: "idLote" });
LoteProducto.belongsTo(Productos, { foreignKey: "idProducto" });

Lote.belongsToMany(Productos, {
  through: LoteProducto,
  foreignKey: "idLote",
  otherKey: "idProducto",
  as: "productos",
});

Productos.belongsToMany(Lote, {
  through: LoteProducto,
  foreignKey: "idProducto",
  otherKey: "idLote",
  as: "lotes",
});

//Despacho
Despacho.hasMany(EntregaProveedor, { foreignKey: "idDespacho" });
Sucursal.hasMany(EntregaProveedor, { foreignKey: "idSucursal" });
Funcionario.hasMany(EntregaProveedor, { foreignKey: "idFuncionario" });
Proveedor.hasMany(EntregaProveedor, { foreignKey: "idProveedor" });

EntregaProveedor.belongsTo(Despacho, { foreignKey: "idDespacho" });
EntregaProveedor.belongsTo(Sucursal, { foreignKey: "idSucursal" });
EntregaProveedor.belongsTo(Funcionario, { foreignKey: "idFuncionario" });
EntregaProveedor.belongsTo(Proveedor, { foreignKey: "idProveedor" });

//Compra
OrdenCompra.hasMany(CompraProveedor, {
  foreignKey: "idOrdenCompra",
});
Sucursal.hasMany(CompraProveedor, { foreignKey: "idSucursal" });
Funcionario.hasMany(CompraProveedor, { foreignKey: "idFuncionario" });
Proveedor.hasMany(CompraProveedor, { foreignKey: "idProveedor" });

CompraProveedor.belongsTo(OrdenCompra, {
  foreignKey: "idOrdenCompra",
});
CompraProveedor.belongsTo(Sucursal, { foreignKey: "idSucursal" });
CompraProveedor.belongsTo(Funcionario, { foreignKey: "idFuncionario" });
CompraProveedor.belongsTo(Proveedor, { foreignKey: "idProveedor" });

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
  DetalleVenta,
  Descuento,
  Categoria,
  Productos,
  Cliente,
  Estante,
  Despacho,
  CompraProveedor,
  ContratoFuncionario,
  CajaFuncionario,
  VentaCliente,
  BitacoraActividad,
  DescuentoSobre,
  CompraProveedorDetalle,
  Provee,
  LoteProducto,
  RealizaVenta,
  DetalleVenta,
  OrdenCompra,
  EntregaProveedor,
};
