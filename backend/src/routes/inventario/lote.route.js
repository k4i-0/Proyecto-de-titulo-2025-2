const router = require("express").Router();

const loteController = require("../../controllers/inventario/Lote.controller");

//rutas asociadas a administrador
router.post(
  "/inventario",
  /*authMiddleware, roleMiddleware(['admin']),*/ loteController.obtenerLotesAsociadosInventario,
);

module.exports = router;
