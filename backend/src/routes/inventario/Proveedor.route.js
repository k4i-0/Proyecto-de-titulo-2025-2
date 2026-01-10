const router = require("express").Router();
const proveedorController = require("../../controllers/inventario/Proveedor.controller");

//Rutas
router.post("/crear", proveedorController.createProveedor);

router.get("/buscar", proveedorController.getAllProveedores);

router.get("/buscar/:rutProveedor", proveedorController.getProveedorVendedor);

router.put("/actualizar/:id", proveedorController.updateProveedor);

router.delete("/eliminar/:id", proveedorController.deleteProveedor);

router.post("/crear-vendedor", proveedorController.createProveedorVendedor);

router.get("/buscar-vendedores", proveedorController.getAllVendedores);

//Tabla intermedia de proveedores y productos
router.post(
  "/enlazar-producto-proveedor",
  proveedorController.enlazarProductoProveedor
);

//obtener detalle proveedor con sus productos enlazados
router.get(
  "/detalle-proveedor-enlazado/:idProveedor",
  proveedorController.obtenerDetalleProveedorConProductos
);

router.delete(
  "/desenlazar-producto-proveedor",
  proveedorController.desenlazarProductoProveedor
);

router.put(
  "/actualizar-vendedor/:idProveedor",
  proveedorController.updateVendedor
);

router.delete(
  "/eliminar-vendedor/:idVendedor",
  proveedorController.deleteVendedor
);

//

module.exports = router;
