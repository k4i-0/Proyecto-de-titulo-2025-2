const Producto = require("../../models/inventario/Productos");

// Crear un nuevo producto
exports.createProducto = async (req, res) => {
  try {
    const nuevoProducto = await Producto.create(req.body);
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el producto" });
  }
};

// Obtener todos los productos

exports.getAllProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll();
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos" });
  }
};

// Obtener un producto por ID
exports.getProductoById = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (producto) {
      res.status(200).json(producto);
    } else {
      res.status(404).json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" });
  }
};

// Actualizar un producto por ID
exports.updateProducto = async (req, res) => {
  try {
    const { codigo, nombre, descripcion, precio, stock } = req.body;
    const respuesta = await Producto.update(
      { codigo, nombre, descripcion, precio, stock },
      {
        where: { idProducto: req.params.id },
      }
    );
    if (respuesta[0] === 1) {
      const updatedProducto = await Producto.findByPk(req.params.id);
      res.status(200).json(updatedProducto);
    } else {
      res.status(404).json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
};

// eliminar un producto por ID
exports.deleteProducto = async (req, res) => {
  try {
    const respuesta = await Producto.destroy({
      where: { idProducto: req.params.id },
    });
    if (respuesta === 1) {
      res.status(200).json({ message: "Producto eliminado correctamente" });
    } else {
      res.status(404).json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
};
