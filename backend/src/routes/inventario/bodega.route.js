const router = require("express").Router();
const bodegaController = require("../../controllers/inventario/Bodega.controller");
// const authMiddleware = require('../../middleware/authMiddleware');
// const roleMiddleware = require('../../middleware/roleMiddleware');

// Rutas para bodegas
router.post(
  "/crear",
  /*authMiddleware, roleMiddleware(['admin']),*/ bodegaController.createBodega
);
router.get("/buscar", /*authMiddleware,*/ bodegaController.getAllBodega);
router.get("/buscar/:id", /*authMiddleware,*/ bodegaController.getBodegaById);
router.put(
  "/actualizar/:id",
  /*authMiddleware, roleMiddleware(['admin']),*/ bodegaController.updateBodega
);
router.delete(
  "/eliminar/:id",
  /*authMiddleware, roleMiddleware(['admin']),*/ bodegaController.deleteBodega
);

module.exports = router;
