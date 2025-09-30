const routes = require("express");
const router = routes.Router();

import AuthRoutes from "./auth.route";
import productoRoutes from "./producto.route";

//Autenticacion
router.use("/auth", AuthRoutes);

//Rutas de Productos
router.use("/productos", productoRoutes);

module.exports = router;
