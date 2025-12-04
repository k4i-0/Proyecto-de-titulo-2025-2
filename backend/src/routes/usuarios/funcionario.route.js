const router = require("express").Router();
const funcionarioController = require("../../controllers/usuario/funcionario.controller");

// Rutas para funcionarios
router.get(
  "/buscar",
  /*authMiddleware,*/ funcionarioController.getAllFuncionarios
);

router.get(
  "/colaboradores/:idSucursal",
  /*authMiddleware,*/ funcionarioController.obtenerColaboradoresPorSucursal
);

router.post(
  "/crear",
  /*authMiddleware, roleMiddleware(['admin']),*/ funcionarioController.contratarFuncionario
);

module.exports = router;
