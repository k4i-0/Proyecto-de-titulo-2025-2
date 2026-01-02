const Funcionario = require("../../models/Usuarios/Funcionario");
const Roles = require("../../models/Usuarios/Rol");
const ContratoFuncionario = require("../../models/Usuarios/ContratoFuncionario");
const Sucursal = require("../../models/inventario/Sucursal");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validarRutChileno = require("../../function/verificarRut");

//Crud Funcionario
exports.getAllFuncionarios = async (req, res) => {
  try {
    const roles = await Roles.findAll();
    if (roles.length === 0 || !roles) {
      return res.status(204).json({ message: "No hay roles registrados" });
    }
    const funcionariosData = await Funcionario.findAll({
      where: {
        idRol: {
          [Op.notIn]: [1],
        },
        estado: {
          [Op.not]: "Eliminado",
        },
      },
      attributes: {
        exclude: ["password", "passwordCaja", "createdAt", "updatedAt"],
      },
      include: [
        {
          model: Roles,
          as: "role",
        },
        {
          model: ContratoFuncionario,
          foreignKey: "idFuncionario",
          as: "contratos",
          required: false,
          where: {
            estado: { [Op.not]: "Eliminado" },
          },
          include: [
            {
              model: Sucursal,
              as: "sucursal",
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
    });

    if (funcionariosData.length === 0 || !funcionariosData) {
      return res
        .status(204)
        .json({ message: "No hay funcionarios registrados" });
    }
    const funcionarios = funcionariosData.map((func) => {
      const contratoActivo =
        func.contratos?.find((c) => c.estado === "Activo") ||
        func.contratos?.[0] ||
        null;
      return {
        id: func.idFuncionario,
        nombre: func.nombre,
        apellido: func.apellido,
        rut: func.rut,
        email: func.email,
        telefono: func.telefono.slice(3),
        cargo: func.role?.nombreRol || null,

        sucursal: contratoActivo?.sucursal?.nombre || null,
        fechaIngreso: contratoActivo?.fechaIngreso || null,
        estado: func.estado || null,
        direccion: func.direccion || null,
        turno: contratoActivo?.turno || null,
        contrato: contratoActivo?.tipoContrato || null,
        tipoContrato: contratoActivo?.tipoContrato || null,
        nombreRol: func.role?.nombreRol || null,
      };
    });

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

exports.crearFuncionario = async (req, res) => {
  const {
    nombre,
    apellido,
    rut,
    fechaIngreso,
    email,
    telefono,
    direccion,
    cargo,
    sucursal,
    turno,
    contrato,
    estadoContrato,
  } = req.body;
  try {
    if (
      !nombre ||
      !apellido ||
      !rut ||
      !fechaIngreso ||
      !email ||
      !telefono ||
      !direccion ||
      !cargo ||
      !sucursal ||
      !turno ||
      !contrato ||
      !estadoContrato
    ) {
      return res.status(422).json({ error: "Faltan datos obligatorios" });
    }
    const passwordInicial = await bcrypt.hash(rut.split("-")[0], 10);
    const passwordCajaInicial = await bcrypt.hash(
      rut.split("-")[0].slice(-4),
      10
    );
    const rolEncontrado = await Roles.findOne({
      where: { nombreRol: cargo },
    });
    if (!rolEncontrado) {
      return res.status(404).json({ error: "Rol no encontrado" });
    }
    //verifica rut
    const rutValido = validarRutChileno(rut);
    if (!rutValido) {
      return res.status(422).json({ error: "RUT inválido" });
    }
    //verifica si el rut ya existe
    const rutExistente = await Funcionario.findOne({ where: { rut: rut } });
    if (rutExistente) {
      if (rutExistente.estado === "Eliminado") {
        return res.status(409).json({
          error:
            "El RUT pertenece a un funcionario eliminado, solicite activacion",
        });
      }
    }
    const nuevoFuncionario = await Funcionario.create({
      rut,
      nombre,
      apellido,
      email,
      password: passwordInicial,
      passwordCaja: passwordCajaInicial,
      telefono: `+56${telefono}`,
      direccion,
      idRol: rolEncontrado.idRol,
      estado: "Activo",
    });
    if (!nuevoFuncionario) {
      return res.status(500).json({ error: "No se pudo crear el funcionario" });
    }
    const sucursalEncontrada = await Sucursal.findOne({
      where: { nombre: sucursal },
    });
    if (!sucursalEncontrada) {
      return res.status(404).json({ error: "Sucursal no encontrada" });
    }
    let fechaTermino = null;
    if (contrato === "Plazo Fijo") {
      const hoy = new Date();
      fechaTermino = new Date(hoy);
      fechaTermino.setMonth(fechaTermino.getMonth() + 1);
    } else {
      fechaTermino = null;
    }
    const contratoCreado = await ContratoFuncionario.create({
      idSucursal: sucursalEncontrada.idSucursal,
      idFuncionario: nuevoFuncionario.idFuncionario,
      fechaIngreso: fechaIngreso,
      tipoContrato: contrato,
      turno: turno,
      estado: estadoContrato,
      fechaTermino: fechaTermino || null,
    });
    if (!contratoCreado) {
      return res.status(500).json({ error: "No se pudo crear el contrato" });
    }
    res.status(201).json({
      message: "Funcionario creado exitosamente",
      nuevoFuncionario,
      contratoCreado,
    });
  } catch (error) {
    console.error("Error al crear el funcionario:", error);
    res.status(500).json({ error: "Error al crear el funcionario" });
  }
};

exports.editarFuncionario = async (req, res) => {
  try {
    const {
      rut,
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      cargo,
      estado,
      sucursal,
      turno,
      contrato,
      estadoContrato,
    } = req.body;
    if (
      !rut ||
      !nombre ||
      !apellido ||
      !email ||
      !telefono ||
      !direccion ||
      !cargo ||
      !estado ||
      !sucursal ||
      !turno ||
      !contrato ||
      !estadoContrato
    ) {
      return res.status(422).json({ error: "Faltan datos obligatorios" });
    }
    const funcionario = await Funcionario.findOne({ where: { rut: rut } });
    if (!funcionario) {
      return res.status(404).json({ error: "Funcionario no encontrado" });
    }
    const rolEncontrado = await Roles.findOne({
      where: { nombreRol: cargo },
    });
    if (!rolEncontrado) {
      return res.status(404).json({ error: "Rol no encontrado" });
    }
    const rutValido = validarRutChileno(rut);
    if (!rutValido) {
      return res.status(422).json({ error: "RUT inválido" });
    }
    const funcionarioActualizado = await funcionario.update(
      {
        nombre,
        apellido,
        email,
        telefono: `+56${telefono}`,
        direccion,
        idRol: rolEncontrado.idRol,
        estado,
      },

      { where: { rut: rut } }
    );
    if (!funcionarioActualizado) {
      return res
        .status(500)
        .json({ error: "No se pudo actualizar el funcionario" });
    }
    //busca la sucursal por nombre
    const sucursalEncontrada = await Sucursal.findOne({
      where: { nombre: sucursal },
    });
    if (!sucursalEncontrada) {
      return res.status(404).json({ error: "Sucursal no encontrada" });
    }
    //Actualiza contrato
    const contratoFuncionarioActualizado = await ContratoFuncionario.update(
      {
        tipoContrato: contrato,
        turno: turno,
        estado: estadoContrato,
        idSucursal: sucursalEncontrada.idSucursal,
      },
      {
        where: { idFuncionario: funcionario.idFuncionario },
      }
    );
    if (!contratoFuncionarioActualizado) {
      return res
        .status(500)
        .json({ error: "No se pudo actualizar el contrato del funcionario" });
    }
    res.status(200).json({
      message: "Funcionario editado exitosamente",
    });
  } catch (error) {
    console.log("Error al editar el funcionario:", error);
    res.status(500).json({ error: "Error al editar el funcionario" });
  }
};

exports.eliminarFuncionario = async (req, res) => {
  try {
    const { idFuncionario } = req.params;
    if (!idFuncionario) {
      return res.status(422).json({ error: "Falta el ID del funcionario" });
    }
    //elimina contrato del funcionario si no tiene contrato activo
    const funcionarioContrato = await ContratoFuncionario.findOne({
      where: { idFuncionario: idFuncionario },
    });
    if (funcionarioContrato) {
      return res.status(409).json({
        error: "No se puede eliminar el funcionario con contrato activo",
      });
    }
    const eliminado = await Funcionario.update(
      {
        estado: "Eliminado",
      },
      {
        where: { idFuncionario: idFuncionario },
      }
    );
    if (!eliminado) {
      return res
        .status(500)
        .json({ error: "No se pudo eliminar el funcionario" });
    }
    const funcionarioEliminado = await Funcionario.update(
      {
        estado: "Eliminado",
      },
      {
        where: { idFuncionario: idFuncionario },
      }
    );
    if (!funcionarioEliminado) {
      return res
        .status(500)
        .json({ error: "No se pudo eliminar el funcionario" });
    }
    res.status(200).json({
      message: "Funcionario eliminado exitosamente",
    });
  } catch (error) {
    console.log("Error al eliminar el funcionario:", error);
    res.status(500).json({ error: "Error al eliminar el funcionario" });
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
