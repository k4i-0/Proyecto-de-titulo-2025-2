const router = require("express").Router();
const compraProveedorController = require("../../controllers/inventario/CompraProveedor.controller");

// Rutas para compra a proveedor
router.post(
  "/crear-oc-directa",
  /*authMiddleware, roleMiddleware(['admin']),*/ compraProveedorController.createOrdenCompraDirecta
);

router.get(
  "/buscar-oc-directa",
  /*authMiddleware, roleMiddleware(['admin']),*/ compraProveedorController.obtenerOrdenesCompraDirecta
);

router.delete(
  "/eliminar-oc-directa/:idCompraProveedor",
  /*authMiddleware, roleMiddleware(['admin']),*/ compraProveedorController.cancelarOrdenCompra
);

router.put(
  "/cambiar-estado-oc/:idCompraProveedor",
  /*authMiddleware, roleMiddleware(['admin']),*/ compraProveedorController.cambiarEstadoOrdenCompra
);

router.put(
  "/editar-oc/:idCompraProveedor",
  /*authMiddleware, roleMiddleware(['admin']),*/ compraProveedorController.editarOrdenCompraProveedor
);

router.post(
  "/crear-orden",
  /*authMiddleware, roleMiddleware(['vendedor']),*/ compraProveedorController.crearOrdenCompraProveedor
);
router.get(
  "/buscar-ordenes",
  /*authMiddleware, roleMiddleware(['vendedor']),*/ compraProveedorController.obtenerOrdenesCompraProveedores
);

//rutas para recepcion de ordenes de compra
router.get(
  "/buscar-ordenes-recepcion/:rutProveedor",
  /*authMiddleware, roleMiddleware(['admin']),*/ compraProveedorController.buscarOrdenesCompraParaRecepcion
);
module.exports = router;
