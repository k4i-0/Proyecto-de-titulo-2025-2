const Categoria = require("../../models/inventario/Categoria");
const { Op } = require("sequelize");

// Crear una nueva categoria
exports.createCategoria = async (req, res) => {
  const { nombre, descripcion, estado } = req.body;
  if (!nombre || !descripcion || !estado) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }
  //Validacion de datos con Joi
  try {
    const nuevaCategoria = await Categoria.create({
      nombre,
      descripcion,
      estado,
    });
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    console.error("Error al crear la categoria:", error);
    res.status(500).json({ error: "Error al crear la categoria" });
  }
};

// Obtener todos las categorias
exports.getAllCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      where: {
        estado: {
          [Op.ne]: "eliminado",
        },
      },
    });
    if (categorias.length === 0 || !categorias) {
      return res.status(404).json({ error: "No hay categorias disponibles" });
    }
    res.status(200).json(categorias);
  } catch (error) {
    console.error("Error al obtener las categorias:", error);
    res.status(500).json({ error: "Error al obtener las categorias" });
  }
};

// Obtener un categoria por ID
exports.getCategoriaById = async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (categoria) {
      res.status(200).json(categoria);
    } else {
      res.status(404).json({ error: "Categoria no encontrada" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la categoria" });
  }
};

// Actualizar una categoria por ID
exports.updateCategoria = async (req, res) => {
  try {
    const { nombre, tipo, estado } = req.body;
    const busquedaCategoria = await Categoria.findByPk(req.params.id);
    if (!busquedaCategoria) {
      return res.status(404).json({ error: "Categoria no encontrada" });
    }
    const respuesta = await Categoria.update(
      {
        nombre,
        tipo,
        estado,
      },
      {
        where: { idCategoria: req.params.id },
      }
    );

    const updatedCategoria = await Categoria.findByPk(req.params.id);
    res.status(200).json(updatedCategoria);
  } catch (error) {
    console.log("Error al actualizar la categoria:", error);
    res.status(500).json({ error: "Error al actualizar la categoria" });
  }
};

// Eliminar una categoria por ID
exports.deleteCategoria = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: "ID de categoria es obligatorio" });
    }
    const busquedaCategoria = await Categoria.findByPk(req.params.id);
    if (busquedaCategoria) {
      busquedaCategoria.estado = "Eliminado";
      await busquedaCategoria.save();
      return res.status(200).json({
        message: "Categoria eliminada (estado actualizado a 'Eliminado')",
      });
    }
    return res.status(404).json({ error: "Categoria no encontrada" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la categoria" });
  }
};
