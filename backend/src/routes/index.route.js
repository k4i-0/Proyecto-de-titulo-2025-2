const router = routes.Router();

// Ruta de ejemplo
router.get("/test", (req, res) => {
  res.json({ message: "Ruta de prueba funcionando correctamente." });
});
//Rutas de Vendedor
//router.use("/vendedores", vendedorRoutes);

module.exports = router;
