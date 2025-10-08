const routes = require("express");
const router = routes.Router();

const AuthRoutes = require("./auth.route");
const productoRoutes = require("./producto.route");

//Autenticacion
router.use("/auth", AuthRoutes);

//Rutas de Productos
router.use("/productos", productoRoutes);

module.exports = router;
