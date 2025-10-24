const { where, Op } = require("sequelize");
const Producto = require("../../models/inventario/Productos");
const Categoria = require("../../models/inventario/Categoria");

//bitacora
const { crearBitacora } = require("../../services/bitacora.service");
const jwt = require("jsonwebtoken");

// Crear un nuevo producto
exports.createProducto = async (req, res) => {
  try {
    const {
      codigo,
      nombre,
      precioCompra,
      precioVenta,
      peso,
      descripcion,
      estado,
      nameCategoria,
    } = req.body;
    if (
      !codigo ||
      !nombre ||
      !precioCompra ||
      !precioVenta ||
      !estado ||
      !nameCategoria
    ) {
      return res.status(422).json({ error: "Faltan datos obligatorios" });
    }
    //Validacion de datos con Joi
    const categoriaExistente = await Categoria.findAll({
      where: { nombre: nameCategoria },
    });
    //console.log(categoriaExistente[0].dataValues.idCategoria);
    if (!categoriaExistente) {
      res.status(301).send(categoriaExistente);
    }

    const nuevoProducto = await Producto.create({
      codigo,
      nombre,
      precioCompra,
      precioVenta,
      peso,
      descripcion,
      estado,
      idCategoria: categoriaExistente[0].dataValues.idCategoria,
    });
    if (nuevoProducto && req.cookies.token) {
      await crearBitacora({
        nombre: `crear producto ${nombre}`,
        fechaCreacion: new Date(),
        descripcion: `Se creó el producto: ${nombre}`,
        funcionOcupo: "createProducto controller",
        usuariosCreador: ` Sistema por ${
          jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
          "error de lectura cookie"
        } `,
        nivelAlerta: "Bajo",
      });
      res.status(201).json(nuevoProducto);
    }
  } catch (error) {
    console.error("Error al crear el producto:", error);
    await crearBitacora({
      nombre: `error al crear producto`,
      fechaCreacion: new Date(),
      descripcion: `Error al crear el producto`,
      funcionOcupo: "createProducto controller",
      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Alto",
    });
    res.status(500).json({ error: "Error al crear el producto" });
  }
};

// Obtener todos los productos

exports.getAllProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      // where: {
      //   estado: {
      //     [Op.ne]: "eliminado",
      //   },
      // },
      include: [{ model: Categoria }],
    });
    if (productos.length === 0 || !productos) {
      await crearBitacora({
        nombre: `consulta de productos`,
        fechaCreacion: new Date(),
        descripcion: `Base de datos sin productos disponibles`,
        funcionOcupo: "getAllProductos controller",
        usuariosCreador:
          jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
          "error de lectura cookie",
        nivelAlerta: "Bajo",
      });
      return res
        .status(204)
        .json({ code: 1212, error: "No hay productos disponibles" });
    }
    await crearBitacora({
      nombre: `consulta de productos`,
      fechaCreacion: new Date(),
      descripcion: `Se consultaron todos los productos`,
      funcionOcupo: "getAllProductos controller",
      usuariosCreador: "desconocido",
      nivelAlerta: "Bajo",
    });
    res.status(200).json(productos);
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    await crearBitacora({
      nombre: `error al consultar productos`,
      fechaCreacion: new Date(),
      descripcion: `Error al consultar los productos`,
      funcionOcupo: "getAllProductos controller",
      usuariosCreador: `error de ${error}
      } `,
      nivelAlerta: "Alto",
    });
    res
      .status(500)
      .json({ code: 500, error: "Error al obtener los productos" });
  }
};

// Obtener un producto por ID
exports.getProductoById = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (producto) {
      await crearBitacora({
        nombre: `consulta de producto ID: ${req.params.id}`,
        fechaCreacion: new Date(),
        descripcion: `Se consultó el producto con ID: ${req.params.id}`,
        funcionOcupo: "getProductoById controller",
        usuariosCreador: ` Sistema por ${
          jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
          "error de lectura cookie"
        } `,
        nivelAlerta: "Bajo",
      });
      res.status(200).json(producto);
    } else {
      res.status(204).json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    await crearBitacora({
      nombre: `error al consultar producto ID: ${req.params.id}`,
      fechaCreacion: new Date(),
      descripcion: `Error al consultar el producto con ID: ${req.params.id}`,
      funcionOcupo: "getProductoById controller",
      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Alto",
    });
    res.status(500).json({ error: "Error al obtener el producto" });
  }
};

// Actualizar un producto por ID
exports.updateProducto = async (req, res) => {
  try {
    const {
      codigo,
      nombre,
      precioCompra,
      precioVenta,
      peso,
      descripcion,
      estado,
      idcategoria,
    } = req.body;
    const busquedaProducto = await Producto.findByPk(req.params.id);
    if (!busquedaProducto) {
      return res.status(422).json({ error: "Producto no encontrado" });
    }
    const respuesta = await Producto.update(
      {
        codigo,
        nombre,
        descripcion,
        precioCompra,
        precioVenta,
        peso,
        estado,
        idcategoria,
      },
      {
        where: { idProducto: req.params.id },
      }
    );

    const updatedProducto = await Producto.findByPk(req.params.id);
    await crearBitacora({
      nombre: `actualización de producto ID: ${req.params.id}`,
      fechaCreacion: new Date(),
      descripcion: `Se actualizó el producto con ID: ${req.params.id}`,
      funcionOcupo: "updateProducto controller",
      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Bajo",
    });
    res.status(200).json(updatedProducto);
  } catch (error) {
    console.log("Error al actualizar el producto:", error);
    await crearBitacora({
      nombre: `error al actualizar producto ID: ${req.params.id}`,
      fechaCreacion: new Date(),
      descripcion: `Error al actualizar el producto con ID: ${req.params.id}`,
      funcionOcupo: "updateProducto controller",
      usuariosCreador: ` Sistema por ${
        req.usuario.email ?? "error de lectura cookie"
      }`,
      nivelAlerta: "Alto",
    });
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
};

// eliminar un producto por ID
exports.deleteProducto = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(422).json({ error: "ID de producto es obligatorio" });
    }
    const busquedaProducto = await Producto.findByPk(req.params.id);

    if (busquedaProducto) {
      busquedaProducto.estado = "eliminado";

      await busquedaProducto.save();

      return res.status(200).json({
        message: "Producto eliminado (estado actualizado a 'eliminado')",
      });
    }
    await crearBitacora({
      nombre: `eliminación de producto ID: ${req.params.id}`,
      fechaCreacion: new Date(),
      descripcion: `Se eliminó el producto con ID: ${req.params.id}`,
      funcionOcupo: "deleteProducto controller",
      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Bajo",
    });

    return res.status(204).json({ error: "Producto no encontrado" });
  } catch (error) {
    //console.log("Error al eliminar el producto:", error);
    await crearBitacora({
      nombre: `error al eliminar producto ID: ${req.params.id}`,
      fechaCreacion: new Date(),
      descripcion: `Error al eliminar el producto con ID: ${req.params.id}`,
      funcionOcupo: "deleteProducto controller",
      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Alto",
    });
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
};
