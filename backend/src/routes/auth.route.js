const routes = require("express");
const router = routes.Router();

import authController from "../../controllers/auth.controller";

router.post("/login", authController.login);
router.post("/logout", authController.logout);

module.exports = router;
