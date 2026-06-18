const router = require("express").Router();

const descuentoController = require("../../controllers/ventas/descuento.controller");

router.post(
  "/registrar/descuento/producto",
  descuentoController.registrarDescuentoSobreProducto,
);

router.get(
  "/categoria/descuento/buscar",
  descuentoController.obtenerProductosCategoriaConDescuentos,
);

router.get(
  "/producto/buscar/:idProducto",
  descuentoController.obtenerDescuentoProducto,
);

router.get(
  "/categoria/buscar/descuentos/:idCategoria",
  descuentoController.buscarDescuentoCategoria,
);

router.get(
  "/ver/descuentos/unicos",
  descuentoController.obtenerDescuentosUnicos,
);

router.post("/crear/descuento/unico", descuentoController.crearDescuentoUnico);

router.post(
  "/cambiar/estado/descuento",
  descuentoController.cambiarEstadoDescuento,
);

router.post(
  "/crear/descuento/categoria",
  descuentoController.agregarDescuentoCategoria,
);
module.exports = router;
