const router = require("express").Router();
const despachoController = require("../../controllers/inventario/Despacho.controller");

router.get("/:idOrden/ver", despachoController.obtenerDespachosPorOrden);

module.exports = router;
