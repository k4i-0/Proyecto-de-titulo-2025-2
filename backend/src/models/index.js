const Bodega = require("./inventario/Bodega");
const Inventario = require("./inventario/Inventario");
const Sucursal = require("./inventario/Sucursal");
const Lote = require("./inventario/Lote");

const Categoria = require("./inventario/Categoria");
const Productos = require("./inventario/Productos");

const ProductoEnInventario = require("./inventario/productoInventario");
const ProductoEnlote = require("./inventario/ProductoLote");
const productoLote = require("./inventario/ProductoLote");

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

//Tabla intermedia Producto Inventario
Productos.belongsToMany(Inventario, {
  through: ProductoEnInventario,
  foreingKey: "idProductos",
  otherKey: "idInventario",
});
Inventario.belongsToMany(Productos, {
  through: ProductoEnInventario,
  foreingKey: "idInventario",
  otherKey: "idProducto",
});

//Tabla Intermedia Producto Lote
Productos.belongsToMany(Lote, {
  through: productoLote,
  foreingKey: "idProducto",
  otherKey: "idLote",
});

Lote.belongsToMany(Productos, {
  through: ProductoEnlote,
  foreingKey: "idLote",
  otherKey: "idProducto",
});
