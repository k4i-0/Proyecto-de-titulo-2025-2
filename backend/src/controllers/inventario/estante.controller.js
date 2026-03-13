const Estante = require("../../models/inventario/Estante");
const Bodega = require("../../models/inventario/Bodega");
const jwt = require("jsonwebtoken");
const { Lote } = require("../../models");
const { Op } = require("sequelize");

exports.getAllEstantes = async (req, res) => {
  try {
    const estantes = await Estante.findAll({});
    if (estantes.length === 0) {
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
  if (!codigo || !tipo || !estado || !idBodega) {
    return res
      .status(422)
      .json({ error: "Faltan datos obligatorios para crear el estante" });
  }
  try {
    // Verificar que no exista un estante con el mismo código en la misma bodega
    const busquedaEstante = await Estante.findOne({
      where: { codigoEstante: codigo, idBodega },
    });
    if (busquedaEstante) {
      return res
        .status(422)
        .json({ error: "Ya existe un estante con ese código en esta bodega" });
    }

    // Verificar que exista la bodega
    const busquedaBodega = await Bodega.findByPk(idBodega);
    if (!busquedaBodega) {
      return res.status(422).json({ error: "Bodega no encontrada" });
    }

    //Verificar que no exista un estante con capacidad mayor que la bodega
    const todoEstantesBodega = await Estante.findAll({
      where: { idBodega },
    });
    const capacidadTotalBodega = todoEstantesBodega.reduce(
      (total, estante) => total + estante.dataValues.capacidad,
      0,
    );
    if (
      Number(busquedaBodega.dataValues.capacidad) ===
      Number(capacidadTotalBodega)
    ) {
      return res.status(422).json({
        error: "Bodega llena, no se puede crear mas estantes",
      });
    }
    if (
      Number(capacidad) + Number(capacidadTotalBodega) >
      Number(busquedaBodega.dataValues.capacidad)
    ) {
      return res.status(422).json({
        error: "Capacidad del estante excede la capacidad de la bodega",
      });
    }

    const nuevoEstante = await Estante.create({
      codigoEstante: codigo,
      tipo,
      estado,
      capacidad,
      capacidadOcupada: 0,
      capacidadDisponible: capacidad,
      idBodega,
    });
    res.status(201).json(nuevoEstante);
  } catch (error) {
    console.error("Error al crear el estante:", error);
    res.status(500).json({ error: "Error al crear el estante" });
  }
};

exports.updateEstante = async (req, res) => {
  const { codigo, tipo, capacidad, idBodega } = req.body;
  console.log(req.body);
  if (!codigo || !tipo || !idBodega || !capacidad) {
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
    let estadoEstante = estante.dataValues.estado;
    if (capacidad > estante.dataValues.capacidad) {
      estadoEstante = "Disponible";
    }
    const updatedEstante = await Estante.update(
      {
        codigo,
        tipo,
        estado: estadoEstante,
        capacidad,
        idBodega,
        idInventario: estante.dataValues.idInventario,
      },
      { where: { idEstante: id } },
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
    //verificar que estante no tenga productos
    const loteEstante = await Lote.findAll({
      where: {
        idEstante: req.params.id,
        estado: { [Op.notIn]: ["agotado", "rechazado"] },
      },
    });
    if (loteEstante.length > 0) {
      const totalProductosEstante = loteEstante.reduce(
        (total, lote) => total + lote.dataValues.cantidad,
        0,
      );
      const estanteDisponibles = await Estante.findAll({
        where: {
          idBodega: estante.dataValues.idBodega,
          estado: "disponible",
          capacidadDisponible: {
            [Op.gte]: totalProductosEstante,
          },
        },
      });
      if (estanteDisponibles.length === 0) {
        return res.status(400).json({
          error: "No se puede eliminar el estante porque tiene productos",
        });
      }
      //asignar lotes a estante contiguo
      const estanteContiguo = estanteDisponibles[0];
      await Lote.update(
        { idEstante: estanteContiguo.dataValues.idEstante },
        { where: { idEstante: req.params.id } },
      );
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
