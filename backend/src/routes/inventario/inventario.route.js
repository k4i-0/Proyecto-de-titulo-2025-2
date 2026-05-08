const router = require("express").Router();
const inventarioController = require("../../controllers/inventario/Inventario.controller");
const { verifyToken, isVendedor } = require("../../middleware/auth.middleware");
// const authMiddleware = require('../../middleware/authMiddleware');
// const roleMiddleware = require('../../middleware/roleMiddleware');

// Rutas para productos
router.post(
  "/crear",
  /*authMiddleware, roleMiddleware(['admin']),*/ inventarioController.createInventario,
);
router.get(
  "/buscar",
  /*authMiddleware,*/ inventarioController.getAllInventario,
);
router.get(
  "/por-sucursal",
  verifyToken,
  isVendedor,
  inventarioController.getInventarioPorSucursal,
);
router.get(
  "/buscar/:id",
  /*authMiddleware,*/ inventarioController.getInventarioById,
);
router.put(
  "/actualizar/:id",
  /*authMiddleware, roleMiddleware(['admin']),*/ inventarioController.updateInventario,
);
router.delete(
  "/eliminar/:id",
  /*authMiddleware, roleMiddleware(['admin']),*/ inventarioController.deleteInventario,
);

//ingreso manual de productos a una o varias sucursales
router.post(
  "/vendedor/ingreso-manual",
  verifyToken,
  isVendedor,
  inventarioController.ingresoManualProductos,
);

module.exports = router;
