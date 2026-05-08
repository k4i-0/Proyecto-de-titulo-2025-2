const router = require("express").Router();
const despachoController = require("../../controllers/inventario/Despacho.controller");

router.get(
  "/:nombreOrden/ver-orden",
  despachoController.obtenerDespachosPorOrden,
);

router.get(
  "/:rutProveedor/ver-proveedor",
  despachoController.obtenerDespachosPorRutProveedor,
);

router.get("/ver-despachos", despachoController.obtenerTodoDespachos);

module.exports = router;
