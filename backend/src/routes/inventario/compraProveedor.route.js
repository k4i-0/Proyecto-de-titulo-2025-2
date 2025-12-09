const router = require("express").Router();
const compraProveedorController = require("../../controllers/inventario/CompraProveedor.controller");

// Rutas para compra a proveedor
router.post(
  "/crear-orden",
  /*authMiddleware, roleMiddleware(['vendedor']),*/ compraProveedorController.crearOrdenCompraProveedor
);
router.get(
  "/buscar-ordenes",
  /*authMiddleware, roleMiddleware(['vendedor']),*/ compraProveedorController.obtenerOrdenesCompraProveedores
);

module.exports = router;
