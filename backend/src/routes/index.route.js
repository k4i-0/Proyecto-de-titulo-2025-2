const routes = require("express");
const router = routes.Router();

const AuthRoutes = require("./auth.route");
const productoRoutes = require("./inventario/producto.route");
const categoriaRoutes = require("./inventario/categoria.route");
const sucursalRoutes = require("./inventario/sucursal.route");
const inventarioRoutes = require("./inventario/inventario.route");
const bodegaRoutes = require("./inventario/bodega.route");
const estanteRoutes = require("./inventario/estante.route");
const proveedorRoutes = require("./inventario/Proveedor.route");

//Autenticacion
router.use("/auth", AuthRoutes);

//Rutas de Productos
router.use("/productos", productoRoutes);

//Rutas de Categorias
router.use("/categorias", categoriaRoutes);

//Rutas de Sucursales
router.use("/sucursales", sucursalRoutes);

//Rutas Bodega
router.use("/bodegas", bodegaRoutes);

//Rutas Inventario
router.use("/inventario", inventarioRoutes);

//Rutas Estantes
router.use("/estantes", estanteRoutes);

//Rutas Proveedores
router.use("/proveedores", proveedorRoutes);

module.exports = router;
