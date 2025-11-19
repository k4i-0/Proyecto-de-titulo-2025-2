const { where, Op, json } = require("sequelize");
const Producto = require("../../models/inventario/Productos");
const Categoria = require("../../models/inventario/Categoria");

//bitacora
const { crearBitacora } = require("../../services/bitacora.service");
const jwt = require("jsonwebtoken");

// Crear un nuevo producto
exports.createProducto = async (req, res) => {
  try {
    const {
      idProducto,
      codigo,
      nombre,
      marca,
      precioCompra,
      precioVenta,
      peso,
      estado,
      descripcion,
      nameCategoria,
    } = req.body;
    if (
      !idProducto ||
      !codigo ||
      !nombre ||
      !marca ||
      !precioCompra ||
      !peso ||
      !precioVenta ||
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
      idProducto,
      codigo,
      nombre,
      marca,
      estado,
      precioCompra,
      precioVenta,
      peso,
      fechaCreacion: new Date(),
      descripcion,
      idCategoria: categoriaExistente[0].dataValues.idCategoria,
    });
    if (nuevoProducto && req.cookies.token) {
      // await crearBitacora({
      //   nombre: `crear producto ${nombre}`,
      //   fechaCreacion: new Date(),
      //   descripcion: `Se creó el producto: ${nombre}`,
      //   funcionOcupo: "createProducto controller",
      //   usuariosCreador: ` Sistema por ${
      //     jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
      //     "error de lectura cookie"
      //   } `,
      //   nivelAlerta: "Bajo",
      // });
      res.status(201).json(nuevoProducto);
    }
  } catch (error) {
    console.error("Error al crear el producto:", error);
    // await crearBitacora({
    //   nombre: `error al crear producto`,
    //   fechaCreacion: new Date(),
    //   descripcion: `Error al crear el producto`,
    //   funcionOcupo: "createProducto controller",
    //   usuariosCreador: ` Sistema por ${
    //     jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
    //     "error de lectura cookie"
    //   } `,
    //   nivelAlerta: "Alto",
    // });
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
    // console.log(productos);
    if (productos.length === 0 || !productos) {
      // await crearBitacora({
      //   nombre: `consulta de productos`,
      //   fechaCreacion: new Date(),
      //   descripcion: `Base de datos sin productos disponibles`,
      //   funcionOcupo: "getAllProductos controller",
      //   usuariosCreador:
      //     jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
      //     "error de lectura cookie",
      //   nivelAlerta: "Bajo",
      // });
      return res
        .status(204)
        .json({ code: 1212, error: "No hay productos disponibles" });
    }
    // await crearBitacora({
    //   nombre: `consulta de productos`,
    //   fechaCreacion: new Date(),
    //   descripcion: `Se consultaron todos los productos`,
    //   funcionOcupo: "getAllProductos controller",
    //   usuariosCreador: "desconocido",
    //   nivelAlerta: "Bajo",
    // });
    res.status(200).json(productos);
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    // await crearBitacora({
    //   nombre: `error al consultar productos`,
    //   fechaCreacion: new Date(),
    //   descripcion: `Error al consultar los productos`,
    //   funcionOcupo: "getAllProductos controller",
    //   usuariosCreador: `error de ${error}
    //   } `,
    //   nivelAlerta: "Alto",
    // });
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
      // await crearBitacora({
      //   nombre: `consulta de producto ID: ${req.params.id}`,
      //   fechaCreacion: new Date(),
      //   descripcion: `Se consultó el producto con ID: ${req.params.id}`,
      //   funcionOcupo: "getProductoById controller",
      //   usuariosCreador: ` Sistema por ${
      //     jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
      //     "error de lectura cookie"
      //   } `,
      //   nivelAlerta: "Bajo",
      // });
      res.status(200).json(producto);
    } else {
      res.status(204).json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    // await crearBitacora({
    //   nombre: `error al consultar producto ID: ${req.params.id}`,
    //   fechaCreacion: new Date(),
    //   descripcion: `Error al consultar el producto con ID: ${req.params.id}`,
    //   funcionOcupo: "getProductoById controller",
    //   usuariosCreador: ` Sistema por ${
    //     jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
    //     "error de lectura cookie"
    //   } `,
    //   nivelAlerta: "Alto",
    // });
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
      nameCategoria,
    } = req.body;
    const busquedaProducto = await Producto.findByPk(req.params.id);

    if (!busquedaProducto) {
      return res.status(422).json({ error: "Producto no encontrado" });
    }
    const categoriaExistente = await Categoria.findOne({
      where: { nombre: nameCategoria },
    });

    if (!categoriaExistente) {
      return res
        .status(422)
        .json({ error: "Categoría asociada no encontrada" });
    }
    await Producto.update(
      {
        codigo,
        nombre,
        descripcion,
        precioCompra,
        precioVenta,
        peso,
        estado,
        idCategoria: categoriaExistente.idCategoria,
      },
      {
        where: { idProducto: req.params.id },
      }
    );

    const updatedProducto = await Producto.findByPk(req.params.id);
    console.log("Producto después" + JSON.stringify(updatedProducto));
    if (!updatedProducto) {
      return res
        .status(422)
        .json({ error: "Producto no encontrado después de la actualización" });
    }

    res.status(200).json(updatedProducto);
  } catch (error) {
    console.log("Error al actualizar el producto:", error);
    // await crearBitacora({
    //   nombre: `error al actualizar producto ID: ${req.params.id}`,
    //   fechaCreacion: new Date(),
    //   descripcion: `Error al actualizar el producto con ID: ${req.params.id}`,
    //   funcionOcupo: "updateProducto controller",
    //   usuariosCreador: ` Sistema por ${
    //     req.usuario.email ?? "error de lectura cookie"
    //   }`,
    //   nivelAlerta: "Alto",
    // });
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
};

// eliminar un producto por ID
exports.deleteProducto = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(422).json({ error: "ID de producto es obligatorio" });
    }
    const busquedaProducto = await Producto.destroy({
      where: { idProducto: req.params.id },
    });

    if (busquedaProducto) {
      return res.status(200).json({
        message: "Producto eliminado (estado actualizado a 'eliminado')",
      });
    }
    // await crearBitacora({
    //   nombre: `eliminación de producto ID: ${req.params.id}`,
    //   fechaCreacion: new Date(),
    //   descripcion: `Se eliminó el producto con ID: ${req.params.id}`,
    //   funcionOcupo: "deleteProducto controller",
    //   usuariosCreador: ` Sistema por ${
    //     jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
    //     "error de lectura cookie"
    //   } `,
    //   nivelAlerta: "Bajo",
    // });

    return res.status(204).json({ error: "Producto no encontrado" });
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
};
