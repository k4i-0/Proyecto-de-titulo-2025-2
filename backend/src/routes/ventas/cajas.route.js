const router = require("express").Router();

const cajaController = require("../../controllers/ventas/caja.controller");

router.get("/buscar/todas/cajas", cajaController.buscarTodasLasCajas);
router.get(
  "/buscar/por/sucursal/:idSucursal",
  cajaController.buscarCajasPorSucursal,
);
router.get(
  "/consultar/datos/cuadratura/:deviceID",
  cajaController.buscarDatosCuadraturaCaja,
);

router.post(
  "/bloquear/caja/:deviceID",
  cajaController.bloquearFuncionamientoCaja,
);
router.post(
  "/desbloquear/caja/:deviceID",
  cajaController.desbloquearFuncionamientoCaja,
);
router.post("/cuadrar/caja/:deviceID", cajaController.cuadrarCaja);
module.exports = router;
