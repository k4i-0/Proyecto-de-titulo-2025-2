const { where, Op } = require("sequelize");
const Producto = require("../../models/inventario/Productos");
const Categoria = require("../../models/inventario/Categoria");

// Crear un nuevo producto
exports.createProducto = async (req, res) => {
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

  try {
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
    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error("Error al crear el producto:", error);
    res.status(500).json({ error: "Error al crear el producto" });
  }
};

// Obtener todos los productos

exports.getAllProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      where: {
        estado: {
          [Op.ne]: "eliminado",
        },
      },
      include: [{ model: Categoria }],
    });
    if (productos.length === 0 || !productos) {
      return res
        .status(204)
        .json({ code: 1212, error: "No hay productos disponibles" });
    }
    console.log(productos);
    res.status(200).json(productos);
  } catch (error) {
    console.error("Error al obtener los productos:", error);
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
      res.status(200).json(producto);
    } else {
      res.status(204).json({ error: "Producto no encontrado" });
    }
  } catch (error) {
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
    res.status(200).json(updatedProducto);
  } catch (error) {
    console.log("Error al actualizar el producto:", error);
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
    return res.status(204).json({ error: "Producto no encontrado" });
  } catch (error) {
    //console.log("Error al eliminar el producto:", error);
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
};
