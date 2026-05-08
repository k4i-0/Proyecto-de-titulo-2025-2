const router = require("express").Router();
const funcionarioController = require("../../controllers/usuario/funcionario.controller");

// Rutas para funcionarios
router.get(
  "/buscar",
  /*authMiddleware,*/ funcionarioController.getAllFuncionarios,
);

router.get(
  "/colaboradores/:idSucursal",
  /*authMiddleware,*/ funcionarioController.obtenerColaboradoresPorSucursal,
);

router.post(
  "/crear",
  /*authMiddleware, roleMiddleware(['admin']),*/ funcionarioController.crearFuncionario,
);

router.put(
  "/editar",
  /*authMiddleware, roleMiddleware(['admin']),*/ funcionarioController.editarFuncionario,
);

router.delete(
  "/eliminar/:idFuncionario",
  /*authMiddleware, roleMiddleware(['admin']),*/ funcionarioController.eliminarFuncionario,
);
router.get("/quienSoy", funcionarioController.quienSoy);

router.get("/contratos", funcionarioController.obtenerContratosFuncionarios);

router.get(
  "/busqueda/sin-contrato",
  funcionarioController.funcionariosSinContrato,
);

router.post(
  "/asignar-contrato",
  funcionarioController.asignarContratoAFuncionario,
);

router.post("/cambio-turno", funcionarioController.cambiarTurnoFuncionario);

router.post(
  "/cambio-contrato",
  funcionarioController.cambiarTipoContratoFuncionario,
);

module.exports = router;
