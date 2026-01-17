const routes = require("express");
const router = routes.Router();

const authController = require("../controllers/auth.controller");

router.post("/login", authController.login);
router.post("/login-codigo", authController.loginCodigo);
router.post("/logout", authController.logout);
router.get("/yo", authController.miEstado);

module.exports = router;
