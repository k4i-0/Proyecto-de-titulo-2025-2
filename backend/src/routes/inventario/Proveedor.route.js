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

router.put(
  "/actualizar-vendedor/:idProveedor",
  proveedorController.updateVendedor
);

router.delete(
  "/eliminar-vendedor/:idVendedor",
  proveedorController.deleteVendedor
);

module.exports = router;
