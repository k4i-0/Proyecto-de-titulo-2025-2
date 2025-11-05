const Estante = require("../../models/inventario/Estante");
const jwt = require("jsonwebtoken");

exports.getAllEstantes = async (req, res) => {
  try {
    const estantes = await Estante.findAll({});
    if (estantes.length === 0 || !sucursales) {
      return res.status(204).json({ message: "No hay estantes registrados" });
    }
    res.status(200).json(estantes);
  } catch (error) {
    console.error("Error al obtener los estantes:", error);
    res.status(500).json({ error: "Error al obtener los estantes" });
  }
};

exports.getEstanteByIdBodega = async (req, res) => {
  try {
    const estante = await Estante.findAll({
      where: { idBodega: req.params.idBodega },
    });
    console.log("Estante encontrado:", estante.dataValues);
    if (!estante) {
      return res
        .status(204)
        .json({ message: "No hay estantes registrados para esta bodega" });
    }
    res.status(200).json(estante);
  } catch (error) {
    console.error("Error al obtener el estante:", error);
    res.status(500).json({ error: "Error al obtener el estante" });
  }
};

exports.createEstante = async (req, res) => {
  const { codigo, tipo, estado, idBodega } = req.body;
  if (!codigo || !tipo || !estado || !idBodega) {
    return res
      .status(422)
      .json({ error: "Faltan datos obligatorios para crear el estante" });
  }
  try {
    const nuevoEstante = await Estante.create({
      codigo,
      tipo,
      estado,
      idBodega,
    });
    res.status(201).json(nuevoEstante);
  } catch (error) {
    console.error("Error al crear el estante:", error);
    res.status(500).json({ error: "Error al crear el estante" });
  }
};

exports.updateEstante = async (req, res) => {
  const { codigo, tipo, estado, idBodega } = req.body;
  if (!codigo || !tipo || !estado || !idBodega) {
    return res
      .status(422)
      .json({ error: "Faltan datos obligatorios para crear el estante" });
  }
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(422).json({ error: "ID de estante es requerido" });
    }
    const estante = await Estante.findByPk(id);
    if (!estante) {
      return res.status(404).json({ error: "Estante no encontrado" });
    }
    const updatedEstante = await estante.update(
      {
        codigo,
        tipo,
        estado,
        idBodega,
        idInventario: estante.dataValues.idInventario,
      },
      { where: { idEstante: id } }
    );
    res.status(200).json(updatedEstante);
  } catch (error) {
    console.error("Error al actualizar el estante:", error);
    res.status(500).json({ error: "Error al actualizar el estante" });
  }
};

exports.deleteEstante = async (req, res) => {
  try {
    const estante = await Estante.findByPk(req.params.id);
    if (!estante) {
      return res.status(404).json({ error: "Estante no encontrado" });
    }
    await estante.destroy();
    res.status(200).json("ok");
  } catch (error) {
    console.error("Error al eliminar el estante:", error);
    res.status(500).json({ error: "Error al eliminar el estante" });
  }
};
