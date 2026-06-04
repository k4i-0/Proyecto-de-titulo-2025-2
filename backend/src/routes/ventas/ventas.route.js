const router = require("express").Router();

const ventasController = require("../../controllers/ventas/ventas.controller");

router.get("/buscar/producto/venta", ventasController.buscarProductoVenta);
router.get("/estado/caja/:deviceID", ventasController.estadoCaja);
router.get(
  "/consultar/datos/caja/:deviceID",
  ventasController.consultarDatosCaja,
);
router.get("/consultar/estado/MP/:deviceID", ventasController.consultarDatosMP);
router.get(
  "/consultar/estado/venta/:idOrdenMP",
  ventasController.consultaVentaTarjeta,
);

router.post("/apertura/caja/:deviceID", ventasController.aperturaCaja);
router.post("/registro/caja", ventasController.registroCajaSucursal);
router.post("/cierre/caja/:deviceID", ventasController.cierreCaja);
router.post(
  "/solicitud/pago/tarjeta/:deviceID",
  ventasController.solicitarPagoTarjeta,
);
router.post("/registro/venta/:deviceID", ventasController.registroVenta);
router.post(
  "/cancelar/venta/tarjeta/:idOrdenMP",
  ventasController.cancelarVentaTarjeta,
);

module.exports = router;
