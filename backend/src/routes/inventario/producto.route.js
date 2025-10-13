const router = require("express").Router();
const productosController = require("../../controllers/inventario/Productos.controller");
// const authMiddleware = require('../../middleware/authMiddleware');
// const roleMiddleware = require('../../middleware/roleMiddleware');

// Rutas para productos
router.post(
  "/crear",
  /*authMiddleware, roleMiddleware(['admin']),*/ productosController.createProducto
);
router.get("/buscar", /*authMiddleware,*/ productosController.getAllProductos);
router.get(
  "/buscar/:id",
  /*authMiddleware,*/ productosController.getProductoById
);
router.put(
  "/actualizar/:id",
  /*authMiddleware, roleMiddleware(['admin']),*/ productosController.updateProducto
);
router.delete(
  "/eliminar/:id",
  /*authMiddleware, roleMiddleware(['admin']),*/ productosController.deleteProducto
);

module.exports = router;
