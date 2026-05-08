const router = require("express").Router();
const compraProveedorController = require("../../controllers/inventario/OrdenCompra.controller");
const authMiddleware = require("../../middleware/auth.middleware");

// RUTAS COMPRA DIRECTA ADMINISTRADOR
router.post(
  "/ocdirecta",
  /*authMiddleware, roleMiddleware(['admin']),*/ compraProveedorController.createOrdenCompraDirecta,
);

router.get(
  "/ocdirecta",
  /*authMiddleware, roleMiddleware(['admin']),*/ compraProveedorController.obtenerOrdenesCompraDirecta,
);

router.put(
  "/ocdirecta/:nombreOrden/anular",
  compraProveedorController.anularOrdenCompraDirecta,
);

router.put(
  "/ocdirecta/:nombreOrden/recepcionar",
  compraProveedorController.recepcionarOrdenCompraDirecta,
);

//----------------Rutas para orden de compra a proveedor------------------------------------

//rutas para recepcion de ordenes de compra
router.get(
  "/orden-compra/:rutProveedor/recepcion",
  /*authMiddleware, roleMiddleware(['admin']),*/ compraProveedorController.buscarOrdenesCompraParaRecepcion,
);

//-----------------Rutas de orden de compra a proveedor vendedores-----------------------------

router.get(
  "/vendedor/orden",
  compraProveedorController.obtenerOrdenesCompraVendedor,
);

router.post(
  "/vendedor/orden",
  compraProveedorController.crearOrdenCompraVendedor,
);

router.get(
  "/vendedor/orden/:rutProveedor/compra-sucursal",
  compraProveedorController.buscarOrdenesCompraSucursalVendedor,
);

router.get(
  "/vendedor/orden/:nombreOrden/ver-orden",
  compraProveedorController.obtenerOrdenCompraVendedorPorNombreOrden,
);

router.post(
  "/vendedor/orden/recepcion/compra-sucursal",
  compraProveedorController.recepcionarOrdenCompraSucursalVendedor,
);

//-----------------Rutas de orden de compra a proveedor administradores-----------------------------

router.get("/admin/orden", compraProveedorController.obtenerOrdenesCompraAdmin);

router.put(
  "/admin/orden/:nombreOrden/anular",
  compraProveedorController.anularOrdenCompraAdmin,
);

router.put(
  "/admin/orden/:nombreOrden/aprobar",
  compraProveedorController.aprobarOrdenCompraAdmin,
);

router.put(
  "/admin/orden/:nombreOrden/modificar",
  compraProveedorController.modificarOrdenCompraAdmin,
);

router.delete(
  "/admin/orden/:nombreOrden",
  compraProveedorController.eliminarOrdenCompraAdmin,
);

//-----------------Rutas compartidad para orden de compra a proveedor vendedores y administradores-----------------------------

router.get(
  "/funcionalidades/orden-compra/verificar-stock/:idSucursal/:idProveedor",
  compraProveedorController.verificarStockProductosOrdenCompra,
);
module.exports = router;
