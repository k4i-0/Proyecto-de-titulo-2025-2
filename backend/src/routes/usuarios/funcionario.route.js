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
  /*authMiddleware, roleMiddleware(['admin']),*/ funcionarioController.crearFuncionario
);

router.put(
  "/editar",
  /*authMiddleware, roleMiddleware(['admin']),*/ funcionarioController.editarFuncionario
);

router.delete(
  "/eliminar/:idFuncionario",
  /*authMiddleware, roleMiddleware(['admin']),*/ funcionarioController.eliminarFuncionario
);
router.get("/quienSoy", funcionarioController.quienSoy);

module.exports = router;
