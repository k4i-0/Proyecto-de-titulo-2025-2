const router = require("express").Router();
const categoriaController = require("../../controllers/inventario/Categoria.controller");
// const authMiddleware = require('../../middleware/authMiddleware');
// const roleMiddleware = require('../../middleware/roleMiddleware');

// Rutas para categorias
router.post(
  "/crear",
  /*authMiddleware, roleMiddleware(['admin']),*/ categoriaController.createCategoria
);
router.get("/buscar", /*authMiddleware,*/ categoriaController.getAllCategorias);
router.get(
  "/buscar/:id",
  /*authMiddleware,*/ categoriaController.getCategoriaById
);
router.put(
  "/actualizar/:id",
  /*authMiddleware, roleMiddleware(['admin']),*/ categoriaController.updateCategoria
);
router.delete(
  "/eliminar/:id",
  /*authMiddleware, roleMiddleware(['admin']),*/ categoriaController.deleteCategoria
);

module.exports = router;
