const router = require("express").Router();

const metricasController = require("../controllers/metricas.controller");

router.get("/dashboard", metricasController.obtenerMetricasDashboard);
router.get(
  "/dashboard/metricas/sucursales",
  metricasController.obtenerMetricasSucursalDashboard,
);
router.get(
  "/dashboard/sucursal/:idSucursal",
  metricasController.obtenerDashboardSucursal,
);

router.get("/informes/ventas", metricasController.obtenerInformesVentas);
router.get("/informes/inventario", metricasController.obtenerInformeInventario);
router.get("/informes/caja", metricasController.obtenerInformeCaja);

module.exports = router;
