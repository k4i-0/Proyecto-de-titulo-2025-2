const router = require("express").Router();
const sucursalController = require("../../controllers/inventario/Sucursales.controller");
const { verifyToken, isAdmin } = require('../../middleware/auth.middleware');

// Rutas para sucursales
router.post(
  "/crear",
  verifyToken, isAdmin, sucursalController.createSucursal
);
router.get("/buscar", verifyToken, isAdmin, sucursalController.getAllSucursal);
router.get(
  "/buscar/:id",
  verifyToken, isAdmin, sucursalController.getSucursalById
);
router.put(
  "/actualizar/:id",
  verifyToken, isAdmin, sucursalController.updateSucursal
);
router.delete(
  "/eliminar/:id",
  verifyToken, isAdmin, sucursalController.deleteSucursal
);

module.exports = router;
