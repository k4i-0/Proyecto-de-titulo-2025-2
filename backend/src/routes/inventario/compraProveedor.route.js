const router = require("express").Router();
const compraProveedorController = require("../../controllers/inventario/OrdenCompra.controller");
const authMiddleware = require("../../middleware/auth.middleware");

// Rutas para compra a proveedor directas
router.post(
  "/ocdirecta",
  /*authMiddleware, roleMiddleware(['admin']),*/ compraProveedorController.createOrdenCompraDirecta,
);

router.get(
  "/ocdirecta",
  /*authMiddleware, roleMiddleware(['admin']),*/ compraProveedorController.obtenerOrdenesCompraDirecta,
);

router.delete(
  "/ocdirecta/:nombreOrden",
  /*authMiddleware, roleMiddleware(['admin']),*/ compraProveedorController.cancelarOrdenCompra,
);

router.put(
  "/ocdirecta/:nombreOrden/estado",
  /*authMiddleware, roleMiddleware(['admin']),*/ compraProveedorController.cambiarEstadoOrdenCompra,
);

router.put(
  "/ocdirecta/:nombreOrden/anular",
  compraProveedorController.anularOrdenCompraDirecta,
);

router.put(
  "/ocdirecta/:nombreOrden/editar",
  /*authMiddleware, roleMiddleware(['admin']),*/ compraProveedorController.editarOrdenCompraProveedor,
);

router.put(
  "/ocdirecta/:nombreOrden/recepcionar",
  compraProveedorController.recepcionarOrdenCompraDirecta,
);

//----------------Rutas para orden de compra a proveedor------------------------------------
router.post(
  "/orden-compra",
  /*authMiddleware, roleMiddleware(['vendedor']),*/ compraProveedorController.crearOrdenCompraProveedor,
);
router.get(
  "/orden-compra",
  /*authMiddleware, roleMiddleware(['vendedor']),*/ compraProveedorController.obtenerOrdenesCompraProveedores,
);

//rutas para recepcion de ordenes de compra
router.get(
  "/orden-compra/:rutProveedor/recepcion",
  /*authMiddleware, roleMiddleware(['admin']),*/ compraProveedorController.buscarOrdenesCompraParaRecepcion,
);
module.exports = router;
