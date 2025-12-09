const Funcionario = require("../../models/Usuarios/Funcionario");
const Roles = require("../../models/Usuarios/Rol");
const ContratoFuncionario = require("../../models/Usuarios/ContratoFuncionario");
const Sucursal = require("../../models/inventario/Sucursal");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");

//Crud Funcionario
exports.getAllFuncionarios = async (req, res) => {
  try {
    const funcionarios = await Funcionario.findAll({
      where: {
        cargo: {
          [Op.notIn]: ["Sistema", "Gerente"],
        },
      },
      attributes: {
        exclude: ["password", "passwordCaja", "createdAt", "updatedAt"],
      },
      include: [
        {
          model: Roles,
        },
      ],
    });
    if (funcionarios.length === 0 || !funcionarios) {
      return res
        .status(204)
        .json({ message: "No hay funcionarios registrados" });
    }
    res.status(200).json(funcionarios);
  } catch (error) {
    console.error("Error al obtener los funcionarios:", error);
    res.status(500).json({ error: "Error al obtener los funcionarios" });
  }
};

exports.obtenerColaboradoresPorSucursal = async (req, res) => {
  const { idSucursal } = req.params;
  try {
    if (!idSucursal) {
      return res.status(422).json({ error: "Falta el ID de la sucursal" });
    }
    const colaboradores = await ContratoFuncionario.findAll({
      where: {
        idSucursal: idSucursal,

        estado: "Activo",
      },
      include: [
        {
          model: Funcionario,
          include: [
            {
              model: Roles,
              attributes: {
                exclude: [
                  "idRol",
                  "privilegios",
                  "descripcion",
                  "createdAt",
                  "updatedAt",
                ],
              },
            },
          ],
          attributes: {
            exclude: [
              "idFuncionario",
              "password",
              "passwordCaja",
              "createdAt",
              "updatedAt",
            ],
          },
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    if (colaboradores.length === 0 || !colaboradores) {
      return res.status(204).json({
        message: "No hay colaboradores registrados para esta sucursal",
      });
    }
    res.status(200).json(colaboradores);
  } catch (error) {
    console.error("Error al obtener los colaboradores:", error);
    res.status(500).json({ error: "Error al obtener los colaboradores" });
  }
};

exports.contratarFuncionario = async (req, res) => {
  const { idSucursal, idFuncionario } = req.body;
  try {
    if (!idSucursal || !idFuncionario) {
      return res.status(422).json({ error: "Faltan datos obligatorios" });
    }
    const findContratoFuncionario = await ContratoFuncionario.findOne({
      where: {
        idFuncionario: idFuncionario,
        idSucursal: idSucursal,
      },
    });
    if (findContratoFuncionario) {
      return res.status(409).json({
        error: "El funcionario ya tiene un contrato en esta sucursal",
      });
    }
    const hoy = new Date();
    const fechaTermino = new Date(hoy);
    fechaTermino.setMonth(fechaTermino.getMonth() + 1);
    const resultado = await ContratoFuncionario.create({
      idSucursal,
      idFuncionario,
      fechaIngreso: hoy,
      tipoContrato: "Plazo Fijo",
      estado: "Activo",
      fechaTermino: fechaTermino,
    });
    if (!resultado) {
      return res.status(500).json({ error: "No se pudo crear el contrato" });
    }
    res.status(200).json({
      message: "Funcionario contratado como colaborador exitosamente",
    });
  } catch (error) {
    console.error("Error al contratar el funcionario:", error);
    res.status(500).json({ error: "Error al contratar el funcionario" });
  }
};

exports.desvincularFuncionario = async (req, res) => {
  const { idContratoFuncionario } = req.params;
  try {
    if (!idContratoFuncionario) {
      return res.status(422).json({ error: "Falta el ID del contrato" });
    }
    const contrato = await ContratoFuncionario.findByPk(idContratoFuncionario);
    if (!contrato) {
      return res.status(404).json({ error: "Contrato no encontrado" });
    }
    contrato.estado = "Inactivo";
    await contrato.save();
    res.status(200).json({ message: "Funcionario desvinculado exitosamente" });
  } catch (error) {
    console.error("Error al desvincular el funcionario:", error);
    res.status(500).json({ error: "Error al desvincular el funcionario" });
  }
};

exports.quienSoy = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      res.clearCookie("token", { httpOnly: true, secure: true });
      return res.status(401).json({ error: "No autorizado" });
    }
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedPayload) {
      res.clearCookie("token", { httpOnly: true, secure: true });
      return res.status(401).json({ message: "No autorizado" });
    }
    const yo = await Funcionario.findOne({
      where: {
        email: decodedPayload.email,
        estado: "Activo",
      },
    });

    if (!yo) {
      return res
        .status(404)
        .json({ error: "Funcionario no encontrado o inactivo" });
    }
    if (yo.estado === "Inactivo") {
      return res.status(403).json({ error: "Funcionario inactivo" });
    }

    const contrato = await ContratoFuncionario.findOne({
      where: {
        idFuncionario: yo.idFuncionario,
        estado: "Activo",
      },
    });

    if (!contrato) {
      return res.status(403).json({ error: "Funcionario sin contrato activo" });
    }
    if (contrato.estado !== "Activo") {
      return res.status(403).json({ error: "Funcionario sin contrato activo" });
    }

    return res.status(200).json({
      idFuncionario: yo.idFuncionario,
      nombre: yo.nombre,
      apellido: yo.apellido,
      email: yo.email,
      cargo: yo.cargo,
      idSucursal: contrato.idSucursal,
    });
  } catch (error) {
    console.error("Error al obtener el funcionario:", error);
    res.status(500).json({ error: "Error al obtener el funcionario" });
  }
};
