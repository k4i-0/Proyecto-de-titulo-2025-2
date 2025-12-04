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
  const { codigo, tipo, estado, capacidad, idBodega } = req.body;
  // console.log(req.body);
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
      capacidad,
      idBodega,
    });
    res.status(201).json(nuevoEstante);
  } catch (error) {
    console.error("Error al crear el estante:", error);
    res.status(500).json({ error: "Error al crear el estante" });
  }
};

exports.updateEstante = async (req, res) => {
  const { codigo, tipo, estado, capacidad, idBodega } = req.body;
  console.log(req.body);
  if (!codigo || !tipo || !estado || !idBodega || !capacidad) {
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
    const updatedEstante = await Estante.update(
      {
        codigo,
        tipo,
        estado,
        capacidad,
        idBodega,
        idInventario: estante.dataValues.idInventario,
      },
      { where: { idEstante: id } }
    );
    console.log("Estante actualizado:", updatedEstante);
    res.status(200).json(updatedEstante);
  } catch (error) {
    console.error("Error al actualizar el estante:", error);
    res.status(500).json({ error: "Error al actualizar el estante" });
  }
};

exports.deleteEstante = async (req, res) => {
  try {
    const estante = await Estante.findOne({
      where: { idEstante: req.params.id },
    });
    const estantesBodega = await Estante.findAll({
      where: { idBodega: estante.dataValues.idBodega },
    });
    if (estantesBodega.length <= 1) {
      return res.status(400).json({
        error: "No se puede eliminar el último estante de esta bodega",
      });
    }
    const estanteEliminar = await Estante.destroy({
      where: { idEstante: req.params.id },
    });
    if (estanteEliminar) {
      return res
        .status(200)
        .json({ message: "Estante eliminado correctamente" });
    }

    res.status(400).json({ error: "No se pudo eliminar el estante" });
  } catch (error) {
    console.error("Error al eliminar el estante:", error);
    res.status(500).json({ error: "Error al eliminar el estante" });
  }
};
