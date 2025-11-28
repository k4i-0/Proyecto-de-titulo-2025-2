const Proveedor = require("../../models/inventario/Proveedor");
const Vendedor = require("../../models/inventario/VendedorProveedor");
const { Op } = require("sequelize");

exports.getAllProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll({});
    if (proveedores.length === 0) {
      return res
        .status(204)
        .json({ message: "No hay proveedores registrados" });
    }
    res.status(200).json(proveedores);
  } catch (error) {
    console.error("Error al obtener los proveedores:", error);
    res.status(500).json({ error: "Error al obtener los proveedores" });
  }
};

exports.getProveedorVendedor = async (req, res) => {
  try {
    // console.log("Rut recibido:", req.params.rutProveedor);
    const proveedor = await Proveedor.findOne({
      where: { rut: req.params.rutProveedor },
    });
    // console.log("Proveedor encontrado:", proveedor);
    const vendedor = await Vendedor.findAll({
      where: { idProveedor: proveedor.dataValues.idProveedor },
    });
    // console.log("Vendedores encontrados:", vendedor);
    if (!vendedor || vendedor.length === 0) {
      return res
        .status(204)
        .json({ message: "No hay vendedores registrados para este proveedor" });
    }
    res.status(200).json(vendedor);
  } catch (error) {
    console.error("Error al obtener el proveedor:", error);
    res.status(500).json({ error: "Error al obtener el proveedor" });
  }
};

exports.createProveedor = async (req, res) => {
  const { rut, nombre, telefono, email, rubro, giro, estado } = req.body;
  if (!rut || !nombre || !telefono || !email || !rubro || !giro || !estado) {
    return res
      .status(422)
      .json({ error: "Faltan datos obligatorios para crear el proveedor" });
  }
  try {
    //encontar si el proveedor ya existe
    const proveedorExistente = await Proveedor.findOne({ where: { rut: rut } });
    if (proveedorExistente) {
      return res
        .status(409)
        .json({ error: "RUT ya registrado como proveedor" });
    }
    const nuevoProveedor = await Proveedor.create({
      rut,
      nombre,
      telefono,
      email,
      fechaIngreso: new Date(),
      rubro,
      giro,
      estado,
    });
    res.status(201).json(nuevoProveedor);
  } catch (error) {
    console.error("Error al crear el proveedor:", error);
    res.status(500).json({ error: "Error al crear el proveedor" });
  }
};

exports.updateProveedor = async (req, res) => {
  const { rut, nombre, telefono, email, rubro, giro, estado } = req.body;
  if (!rut || !nombre || !telefono || !email || !rubro || !giro || !estado) {
    return res.status(422).json({
      error: "Faltan datos obligatorios para actualizar el proveedor",
    });
  }
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);
    if (!proveedor) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }
    const [updated] = await Proveedor.update(
      { rut, nombre, telefono, email, rubro, giro, estado },
      { where: { idProveedor: req.params.id } }
    );
    if (!updated) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }
    res.status(200).json({ message: "Proveedor actualizado con éxito" });
  } catch (error) {
    console.error("Error al actualizar el proveedor:", error);
    res.status(500).json({ error: "Error al actualizar el proveedor" });
  }
};

exports.deleteProveedor = async (req, res) => {
  try {
    const deleted = await Proveedor.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }
    res.status(200).json({ message: "Proveedor eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar el proveedor:", error);
    res.status(500).json({ error: "Error al eliminar el proveedor" });
  }
};

//Vendedores Proveedor

exports.createProveedorVendedor = async (req, res) => {
  const { nombre, rut, telefono, email, rutProveedor } = req.body;
  if (!nombre || !rut || !telefono || !email || !rutProveedor) {
    return res
      .status(422)
      .json({ error: "Faltan datos obligatorios para crear el vendedor" });
  }

  const proveedor = await Proveedor.findOne({ where: { rut: rutProveedor } });

  if (!proveedor) {
    return res.status(404).json({ error: "Proveedor no encontrado" });
  }
  const vendedorExistente = await Vendedor.findOne({
    where: {
      [Op.and]: [
        { idProveedor: proveedor.dataValues.idProveedor },
        {
          [Op.or]: [{ rut: rut }, { email: email }],
        },
      ],
    },
  });
  if (vendedorExistente) {
    return res.status(409).json({
      error: "RUT o email ya registrado con un vendedor de este proveedor",
    });
  }
  try {
    const nuevoVendedor = await Vendedor.create({
      nombre,
      rut,
      telefono,
      email,
      idProveedor: proveedor.dataValues.idProveedor,
    });
    console.log("Proveedor encontrado:", nuevoVendedor);
    res.status(200).json(nuevoVendedor);
  } catch (error) {
    console.error("Error al crear el vendedor:", error);
    res.status(500).json({ error: "Error al crear el vendedor" });
  }
};

exports.getAllVendedores = async (req, res) => {
  try {
    const vendedores = await Vendedor.findAll({});
    if (vendedores.length === 0) {
      return res.status(204).json({ message: "No hay vendedores registrados" });
    }
    res.status(200).json(vendedores);
  } catch (error) {
    console.error("Error al obtener los vendedores:", error);
    res.status(500).json({ error: "Error al obtener los vendedores" });
  }
};

exports.deleteVendedor = async (req, res) => {
  try {
    const deleted = await Vendedor.destroy({
      where: { idVendedorProveedor: req.params.idVendedor },
    });
    if (!deleted) {
      return res.status(404).json({ error: "Vendedor no encontrado" });
    }
    res.status(200).json({ message: "Vendedor eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar el vendedor:", error);
    res.status(500).json({ error: "Error al eliminar el vendedor" });
  }
};

exports.updateVendedor = async (req, res) => {
  const { nombre, rut, telefono, email, idProveedor } = req.body;
  if (!nombre || !rut || !telefono || !email || !idProveedor) {
    return res.status(422).json({
      error: "Faltan datos obligatorios para actualizar el vendedor",
    });
  }
  try {
    const vendedor = await Vendedor.findByPk(req.params.idVendedor);
    if (!vendedor) {
      return res.status(404).json({ error: "Vendedor no encontrado" });
    }
    const [updated] = await Vendedor.update(
      { nombre, rut, telefono, email, idProveedor },
      {
        where: { idVendedorProveedor: vendedor.dataValues.idVendedorProveedor },
      }
    );
    if (!updated) {
      return res.status(404).json({ error: "Vendedor no encontrado" });
    }
    res.status(200).json({ message: "Vendedor actualizado con éxito" });
  } catch (error) {
    console.error("Error al actualizar el vendedor:", error);
    res.status(500).json({ error: "Error al actualizar el vendedor" });
  }
};
