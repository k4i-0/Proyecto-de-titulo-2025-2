const Categoria = require("../../models/inventario/Categoria");
const { Op } = require("sequelize");

const { crearBitacora } = require("../../services/bitacora.service");
const jwt = require("jsonwebtoken");

// Crear una nueva categoria
exports.createCategoria = async (req, res) => {
  const { nombre, subcategoria, estado } = req.body;
  if (!nombre || !subcategoria || !estado) {
    return res.status(422).json({ error: "Faltan datos obligatorios" });
  }
  //Validacion de datos con Joi
  try {
    const nuevaCategoria = await Categoria.create({
      nombre,
      subcategoria,
      estado,
    });
    await crearBitacora({
      nombre: `crear categoria ${nombre}`,
      fechaCreacion: new Date(),
      descripcion: `Se creó la categoria: ${nombre}`,
      funcionOcupo: "createCategoria controller",
      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Bajo",
    });
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    console.error("Error al crear la categoria:", error);
    await crearBitacora({
      nombre: `error al crear categoria ${nombre}`,
      fechaCreacion: new Date(),
      descripcion: `Error al crear la categoria: ${nombre}`,
      funcionOcupo: "createCategoria controller",
      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Alto",
    });
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
      // await crearBitacora({
      //   nombre: `consulta de categorias`,
      //   fechaCreacion: new Date(),
      //   descripcion: `Se consultaron vacia de categorias`,
      //   funcionOcupo: "getAllCategorias controller",
      //   usuariosCreador: ` Sistema por ${
      //     jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
      //     "error de lectura cookie"
      //   } `,
      //   nivelAlerta: "Bajo",
      // });
      return res.status(204).json({ error: "No hay categorias disponibles" });
    }
    // await crearBitacora({
    //   nombre: `consulta de categorias`,
    //   fechaCreacion: new Date(),
    //   descripcion: `Se consultaron todas las categorias`,
    //   funcionOcupo: "getAllCategorias controller",
    //   usuariosCreador: ` Sistema por ${
    //     jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
    //     "error de lectura cookie"
    //   } `,
    //   nivelAlerta: "Bajo",
    // });
    res.status(200).json(categorias);
  } catch (error) {
    console.error("Error al obtener las categorias:", error);
    await crearBitacora({
      nombre: `error al consultar categorias`,
      fechaCreacion: new Date(),
      descripcion: `Error al consultar las categorias`,
      funcionOcupo: "getAllCategorias controller",

      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Alto",
    });
    res.status(500).json({ error: "Error al obtener las categorias" });
  }
};

// Obtener un categoria por ID
exports.getCategoriaById = async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (categoria) {
      await crearBitacora({
        nombre: `consulta de categoria ID: ${req.params.id}`,
        fechaCreacion: new Date(),
        descripcion: `Se consultó la categoria con ID: ${req.params.id}`,
        funcionOcupo: "getCategoriaById controller",
        usuariosCreador: ` Sistema por ${
          jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
          "error de lectura cookie"
        } `,
        nivelAlerta: "Bajo",
      });
      res.status(200).json(categoria);
    } else {
      res.status(204).json({ error: "Categoria no encontrada" });
    }
  } catch (error) {
    console.error("Error al obtener la categoria:", error);
    await crearBitacora({
      nombre: `error al consultar categoria ID: ${req.params.id}`,
      fechaCreacion: new Date(),
      descripcion: `Error al consultar la categoria con ID: ${req.params.id}`,
      funcionOcupo: "getCategoriaById controller",
      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Alto",
    });
    res.status(500).json({ error: "Error al obtener la categoria" });
  }
};

// Actualizar una categoria por ID
exports.updateCategoria = async (req, res) => {
  try {
    const { nombre, tipo, estado } = req.body;
    const busquedaCategoria = await Categoria.findByPk(req.params.id);
    if (!busquedaCategoria) {
      return res.status(422).json({ error: "Categoria no encontrada" });
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
    await crearBitacora({
      nombre: `actualización de categoria ID: ${req.params.id}`,
      fechaCreacion: new Date(),
      descripcion: `Se actualizó la categoria con ID: ${req.params.id}`,
      funcionOcupo: "updateCategoria controller",
      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Bajo",
    });
    res.status(200).json(updatedCategoria);
  } catch (error) {
    console.log("Error al actualizar la categoria:", error);
    await crearBitacora({
      nombre: `error al actualizar categoria ID: ${req.params.id}`,
      fechaCreacion: new Date(),
      descripcion: `Error al actualizar la categoria con ID: ${req.params.id}`,
      funcionOcupo: "updateCategoria controller",
      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Alto",
    });
    res.status(500).json({ error: "Error al actualizar la categoria" });
  }
};

// Eliminar una categoria por ID
exports.deleteCategoria = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(422).json({ error: "ID de categoria es obligatorio" });
    }
    const busquedaCategoria = await Categoria.findByPk(req.params.id);
    if (busquedaCategoria) {
      busquedaCategoria.estado = "eliminado";
      await busquedaCategoria.save();
      await crearBitacora({
        nombre: `eliminación de categoria ID: ${req.params.id}`,
        fechaCreacion: new Date(),
        descripcion: `Se eliminó la categoria con ID: ${req.params.id}`,
        funcionOcupo: "deleteCategoria controller",
        usuariosCreador: ` Sistema por ${
          jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
          "error de lectura cookie"
        } `,
        nivelAlerta: "Bajo",
      });
      return res.status(200).json({
        message: "Categoria eliminada (estado actualizado a 'Eliminado')",
      });
    }
    return res.status(404).json({ error: "Categoria no encontrada" });
  } catch (error) {
    console.log("Error al eliminar la categoria:", error);
    await crearBitacora({
      nombre: `error al eliminar categoria ID: ${req.params.id}`,
      fechaCreacion: new Date(),
      descripcion: `Error al eliminar la categoria con ID: ${req.params.id}`,
      funcionOcupo: "deleteCategoria controller",
      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Alto",
    });
    res.status(500).json({ error: "Error al eliminar la categoria" });
  }
};
