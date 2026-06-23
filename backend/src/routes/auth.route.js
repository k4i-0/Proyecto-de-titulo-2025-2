const routes = require("express");
const router = routes.Router();

const authController = require("../controllers/auth.controller");
const bitacoraController = require("../controllers/bitacora.controller");

//middleware
const { verifyToken, isAdmin } = require("../middleware/auth.middleware");

// Rutas de autenticación

router.post("/login", authController.login);
router.post("/login-codigo", authController.loginCodigo);
router.post("/login/caja/alternativo", authController.loginCajaAlternativo);
router.post("/logout", authController.logout);
router.get("/yo", verifyToken, authController.miEstado);
router.post(
  "/actualizar/contrasena/caja/nuevo/user",
  verifyToken,
  authController.actualizarContraseñaCaja,
);

router.post(
  "/actualizar/contrasena/administracion/nuevo/user",
  verifyToken,
  authController.actualizarContraseñaAdministracion,
);

//Bitacoras Solo Admin
router.get(
  "/bitacoras",
  verifyToken,
  isAdmin,
  bitacoraController.obtenerTodasBitacoraFuncionario,
);
router.get(
  "/bitacoras/funcionario/:rutFuncionario",
  verifyToken,
  isAdmin,
  bitacoraController.obtenerbitacoraPorFuncionario,
);

module.exports = router;
