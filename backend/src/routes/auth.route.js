const routes = require("express");
const router = routes.Router();

const authController = require("../controllers/auth.controller");

router.post("/login", authController.login);
router.post("/logout", authController.verificarToken, authController.logout);
router.get("/verify", authController.verificarToken);

module.exports = router;
