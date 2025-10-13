const router = require("express").Router();
const sucursalController = require("../../controllers/inventario/Sucursales.controller");
// const authMiddleware = require('../../middleware/authMiddleware');
// const roleMiddleware = require('../../middleware/roleMiddleware');

// Rutas para sucursales
router.post(
  "/crear",
  /*authMiddleware, roleMiddleware(['admin']),*/ sucursalController.createSucursal
);
router.get("/buscar", /*authMiddleware,*/ sucursalController.getAllSucursal);
router.get(
  "/buscar/:id",
  /*authMiddleware,*/ sucursalController.getSucursalById
);
router.put(
  "/actualizar/:id",
  /*authMiddleware, roleMiddleware(['admin']),*/ sucursalController.updateSucursal
);
router.delete(
  "/eliminar/:id",
  /*authMiddleware, roleMiddleware(['admin']),*/ sucursalController.deleteSucursal
);

module.exports = router;
