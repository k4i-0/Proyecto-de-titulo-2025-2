const router = require("express").Router();
const estanteController = require("../../controllers/inventario/estante.controller");

//Rutas
router.post("/crear", estanteController.createEstante);

router.get("/buscar", estanteController.getAllEstantes);

router.get("/buscar/:idBodega", estanteController.getEstanteByIdBodega);

router.put("/actualizar/:id", estanteController.updateEstante);

router.delete("/eliminar/:id", estanteController.deleteEstante);

module.exports = router;
