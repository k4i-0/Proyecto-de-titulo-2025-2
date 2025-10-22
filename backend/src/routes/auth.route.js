const routes = require("express");
const router = routes.Router();

const authController = require("../controllers/auth.controller");

router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/yo", authController.verificarToken);

module.exports = router;
