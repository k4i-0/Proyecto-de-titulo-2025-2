const router = require("express").Router();
const funcionarioController = require("../../controllers/usuario/funcionario.controller");

// Rutas para funcionarios
router.get(
  "/buscar",
  /*authMiddleware,*/ funcionarioController.getAllFuncionarios,
);

router.get(
  "/historial/:idFuncionario",
  funcionarioController.obtenerHistorialContratosFuncionario,
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

router.post(
  "/cambio/clave/funcionario/:idFuncionario",
  funcionarioController.actualizarClavesFuncionario,
);

router.post(
  "/actualizar/privilegios/:idFuncionario",
  funcionarioController.actualizarPermisosFuncionario,
);
//Rutas contratos de funcionarios simples

// Rutas para contratos de funcionarios
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

router.post(
  "/reasignar-sucursal",
  funcionarioController.reasignarSucursalFuncionario,
);

///crud roles
router.get("/obtener/todos/roles", funcionarioController.getAllRoles);

router.post("/crear/rol", funcionarioController.crearRol);

router.put("/editar/rol/:idRol", funcionarioController.actualizarRol);

router.delete("/eliminar/rol/:idRol", funcionarioController.eliminarRol);

module.exports = router;
