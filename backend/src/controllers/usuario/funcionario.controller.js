const Funcionario = require("../../models/Usuarios/Funcionario");
const Roles = require("../../models/Usuarios/Rol");
const ContratoFuncionario = require("../../models/Usuarios/ContratoFuncionario");
const Sucursal = require("../../models/inventario/Sucursal");
const sequelize = require("../../config/bd");
const { Op, col } = require("sequelize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validarRutChileno = require("../../function/verificarRut");
const { encriptar } = require("../../config/AES");
const {
  asignarFuncionarioSucursalSchema,
} = require("../../schema/funcionario.schema");

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
        // estado: {
        //   [Op.not]: "Eliminado",
        // },
      },
      attributes: {
        exclude: ["password", "createdAt", "updatedAt"],
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
          // where: {
          //   estado: { [Op.not]: "Eliminado" },
          // },
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
      const codigoAcceso = func.rut ? encriptar(func.rut) : null;

      return {
        id: func.idFuncionario,
        nombre: func.nombre,
        apellido: func.apellido,
        rut: func.rut,
        email: func.email,
        telefono: func.telefono.slice(3),
        cargo: func.role?.nombreRol || null,
        codigoAcceso,

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
          where: {
            idRol: {
              [Op.notIn]: [1],
            },
          },
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
    nombreRol,
    idSucursal,
    turno,
    contrato,
    estadoContrato,
  } = req.body;
  const t = await sequelize.transaction();
  try {
    console.log("Datos Crear funcionario:", req.body);
    if (
      !nombre ||
      !apellido ||
      !rut ||
      !fechaIngreso ||
      !email ||
      !telefono ||
      !direccion ||
      !nombreRol ||
      !idSucursal ||
      !turno ||
      !contrato ||
      !estadoContrato
    ) {
      return res.status(422).json({ error: "Faltan datos obligatorios" });
    }
    const passwordInicial = await bcrypt.hash(rut.split("-")[0], 10);
    const passwordCajaInicial = await bcrypt.hash(
      rut.split("-")[0].slice(-4),
      10,
    );
    const rolEncontrado = await Roles.findOne(
      {
        where: { nombreRol: nombreRol },
      },
      { transaction: t },
    );
    if (!rolEncontrado) {
      await t.rollback();
      return res.status(404).json({ error: "Rol no encontrado" });
    }
    //verifica rut
    const rutValido = validarRutChileno(rut);
    if (!rutValido) {
      await t.rollback();
      return res.status(422).json({ error: "RUT inválido" });
    }
    //verifica si el rut ya existe
    const rutExistente = await Funcionario.findOne(
      { where: { rut: rut } },
      { transaction: t },
    );
    if (rutExistente) {
      if (rutExistente.estado === "Eliminado") {
        await t.rollback();
        return res.status(409).json({
          error:
            "El RUT pertenece a un funcionario eliminado, solicite activacion",
        });
      }
      await t.rollback();
      return res.status(409).json({ error: "El RUT ya está registrado" });
    }
    const emailExistente = await Funcionario.findOne(
      {
        where: { email: email },
      },
      { transaction: t },
    );
    if (emailExistente) {
      if (emailExistente.estado === "Eliminado") {
        await t.rollback();
        return res.status(409).json({
          error:
            "El email pertenece a un funcionario eliminado, solicite activacion",
        });
      }
      await t.rollback();
      return res.status(409).json({ error: "El email ya está registrado" });
    }
    const nuevoFuncionario = await Funcionario.create(
      {
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
      },
      { transaction: t },
    );
    if (!nuevoFuncionario) {
      await t.rollback();
      return res.status(500).json({ error: "No se pudo crear el funcionario" });
    }

    //asignar contrato al funcionario
    const nuevoContrato = await ContratoFuncionario.create(
      {
        idFuncionario: nuevoFuncionario.idFuncionario,
        idSucursal,
        fechaIngreso,
        tipoContrato: contrato,
        turno: turno,
        estado: estadoContrato,
      },
      { transaction: t },
    );

    await t.commit();

    res.status(201).json({
      message: "Funcionario creado exitosamente",
      nuevoFuncionario,
      // contratoCreado,
    });
  } catch (error) {
    console.error("Error al crear el funcionario:", error);
    await t.rollback();
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
      nombreRol,
      // estado,
      // contrato,
      // turno,
      // estadoContrato,
    } = req.body;
    console.log("Datos recibidos para editar funcionario:", req.body);
    if (
      !rut ||
      !nombre ||
      !apellido ||
      !email ||
      !telefono ||
      !direccion ||
      !nombreRol
      // !cargo ||
      // !estado ||
      // !contrato ||
      // !turno ||
      // !estadoContrato
    ) {
      return res.status(422).json({ error: "Faltan datos obligatorios" });
    }
    const funcionario = await Funcionario.findOne({ where: { rut: rut } });
    if (!funcionario) {
      return res.status(404).json({ error: "Funcionario no encontrado" });
    }
    const rolEncontrado = await Roles.findOne({
      where: { nombreRol: nombreRol },
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
      },

      { where: { rut: rut } },
    );
    if (!funcionarioActualizado) {
      return res
        .status(500)
        .json({ error: "No se pudo actualizar el funcionario" });
    }
    // //busca la sucursal por nombre
    // const sucursalEncontrada = await Sucursal.findOne({
    //   where: { nombre: sucursal },
    // });
    // if (!sucursalEncontrada) {
    //   return res.status(404).json({ error: "Sucursal no encontrada" });
    // }
    //Actualiza contrato
    // const contratoFuncionarioActualizado = await ContratoFuncionario.update(
    //   {
    //     tipoContrato: contrato,
    //     turno: turno,
    //     estado: estadoContrato,
    //   },
    //   {
    //     where: { idFuncionario: funcionario.idFuncionario },
    //   },
    // );
    // if (!contratoFuncionarioActualizado) {
    //   return res
    //     .status(500)
    //     .json({ error: "No se pudo actualizar el contrato del funcionario" });
    // }
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
      where: { idFuncionario: idFuncionario, estado: "Activo" },
    });
    if (funcionarioContrato) {
      return res.status(409).json({
        error: "No se puede eliminar el funcionario con contrato activo",
      });
    }
    const eliminado = await Funcionario.destroy({
      where: { idFuncionario: idFuncionario },
    });

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
      },
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

//FUNCIONES PARA ASIGNAR Y QUITAR FUNCIONARIO DE UNA SUCURSAL (SEGUN INFORME)

exports.asignarFuncionarioSucursal = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    console.log("datos de body", req.body);

    if (
      !req.body.idFuncionario ||
      !req.body.idSucursal ||
      isNaN(req.body.idFuncionario) ||
      isNaN(req.body.idSucursal)
    ) {
      await t.rollback();
      return res.status(422).json({ error: "Faltan datos obligatorios" });
    }
    //valdiacion con joi
    const { error, value } = asignarFuncionarioSucursalSchema.validate(
      {
        idFuncionario: req.body.idFuncionario,
        idSucursal: req.body.idSucursal,
      },
      { abortEarly: false },
    );
    if (error) {
      await t.rollback();
      return res
        .status(422)
        .json({ error: error.details.map((d) => d.message).join(", ") });
    }
    const { idFuncionario, idSucursal } = value;

    //validaciones
    const encontrarFuncionario = await Funcionario.findByPk(idFuncionario, {
      transaction: t,
    });
    const encontrarSucursal = await Sucursal.findByPk(idSucursal, {
      transaction: t,
    });
    if (!encontrarFuncionario) {
      await t.rollback();
      return res.status(404).json({ error: "Funcionario no encontrado" });
    }
    if (!encontrarSucursal) {
      await t.rollback();
      return res.status(404).json({ error: "Sucursal no encontrada" });
    }

    //crear contrato
    const nuevoContrato = await ContratoFuncionario.create(
      {
        idFuncionario,
        idSucursal,
        fechaIngreso: new Date(),
        tipoContrato: "Indefinido",
        turno: "Rotativo",
        fechaTermino: null,
        estado: "Activo",
      },
      { transaction: t },
    );
    if (!nuevoContrato) {
      await t.rollback();
      return res
        .status(500)
        .json({ error: "No se pudo asignar el funcionario" });
    }
    await t.commit();

    return res.status(200).json({
      message: `Funcionario  ${idFuncionario} asignado a sucursal exitosamente`,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al asignar funcionario a sucursal:", error);
    res.status(500).json({ error: "Error al asignar funcionario a sucursal" });
  }
};

//funciones gestion funcionarios

exports.obtenerContratosFuncionarios = async (req, res) => {
  try {
    const contratos = await ContratoFuncionario.findAll({
      where: {
        estado: "Activo",
      },
      order: [["fechaIngreso", "DESC"]],
      include: [
        {
          model: Funcionario,
          where: {
            idRol: {
              [Op.notIn]: [1],
            },
          },
          attributes: [
            "rut",
            "nombre",
            "apellido",
            "email",
            "telefono",
            "direccion",
            "estado",
          ],
        },
        {
          model: Sucursal,
          attributes: ["idSucursal", "nombre", "direccion", "estado"],
        },
      ],
    });
    res.status(200).json(contratos);
  } catch (error) {
    console.error("Error al obtener los contratos de funcionarios:", error);
    res
      .status(500)
      .json({ error: "Error al obtener los contratos de funcionarios" });
  }
};

exports.obtenerHistorialContratosFuncionario = async (req, res) => {
  try {
    const { idFuncionario } = req.params;

    const historial = await ContratoFuncionario.findAll({
      where: { idFuncionario },
      order: [["fechaIngreso", "DESC"]],
      include: [
        {
          model: Sucursal,
          attributes: ["idSucursal", "nombre", "direccion", "estado"],
        },
      ],
    });

    if (!historial.length) return res.status(204).json([]);

    res.status(200).json(historial);
  } catch (error) {
    console.error("Error al obtener historial de contratos:", error);
    res.status(500).json({ error: "Error al obtener historial de contratos" });
  }
};

exports.reasignarSucursalFuncionario = async (req, res) => {
  const t = await sequelize.transaction();
  const { idFuncionario, idSucursal, motivo } = req.body;
  console.log("Datos recibidos para reasignar sucursal:", req.body);
  try {
    if (!idFuncionario || !idSucursal || !motivo) {
      await t.rollback();
      return res.status(422).json({ error: "Faltan datos obligatorios" });
    }

    const funcionario = await Funcionario.findByPk(idFuncionario, {
      transaction: t,
    });
    if (!funcionario) {
      await t.rollback();
      return res.status(404).json({ error: "Funcionario no encontrado" });
    }
    if (funcionario.estado !== "Activo") {
      await t.rollback();
      return res.status(403).json({ error: "Funcionario no activo" });
    }

    const contratoActivo = await ContratoFuncionario.findOne({
      where: {
        idFuncionario,
        estado: "Activo",
      },
      include: [
        {
          model: Sucursal,
          attributes: ["idSucursal", "nombre", "direccion", "estado"],
        },
      ],
      transaction: t,
    });

    if (!contratoActivo) {
      await t.rollback();
      return res
        .status(404)
        .json({ error: "El funcionario no tiene un contrato activo" });
    }

    if (Number(contratoActivo.idSucursal) === Number(idSucursal)) {
      await t.rollback();
      return res
        .status(409)
        .json({ error: "El funcionario ya trabaja en esa sucursal" });
    }

    const sucursalDestino = await Sucursal.findByPk(idSucursal, {
      transaction: t,
    });
    if (!sucursalDestino) {
      await t.rollback();
      return res.status(404).json({ error: "Sucursal no encontrada" });
    }
    if (sucursalDestino.estado !== "Abierta") {
      await t.rollback();
      return res.status(403).json({ error: "Sucursal no activa" });
    }

    //buscar si antes tuvo un contrato en la sucursal destino
    const contratoAnteriorDestino = await ContratoFuncionario.findOne({
      where: {
        idFuncionario,
        idSucursal,
        estado: {
          [Op.in]: ["Eliminado", "Inactivo"],
        },
      },
      transaction: t,
    });

    if (contratoAnteriorDestino) {
      contratoActivo.estado = "Inactivo";
      contratoActivo.motivoCambioContrato = `${new Date().toLocaleDateString("es-CL")} Cambio contrato a inactivo en Sucursal ${idSucursal} con motivo: ${motivo}`;
      await contratoActivo.save({ transaction: t });

      contratoAnteriorDestino.estado = "Activo";
      contratoAnteriorDestino.motivoCambioContrato = `${new Date().toLocaleDateString("es-CL")}: ${contratoAnteriorDestino.motivoCambioContrato || ""} \n Reasignación desde sucursal ${contratoActivo.sucursal.nombre} con motivo: ${motivo}`;
      await contratoAnteriorDestino.save({ transaction: t });
      await t.commit();
      return res.status(201).json({
        message: "Sucursal reasignada correctamente",
        contratoAnterior: contratoAnteriorDestino,
      });
    } else {
      contratoActivo.estado = "Inactivo";
      contratoActivo.motivoCambioContrato = `${new Date().toLocaleDateString("es-CL")} Cambio contrato a inactivo en Sucursal ${idSucursal} con motivo: ${motivo} \n`;
      await contratoActivo.save({ transaction: t });

      const nuevoContrato = await ContratoFuncionario.create(
        {
          idSucursal,
          idFuncionario,
          fechaIngreso: new Date(),
          tipoContrato: contratoActivo.tipoContrato,
          turno: contratoActivo.turno,
          estado: "Activo",
          fechaTermino: contratoActivo.fechaTermino || null,
          motivoCambioContrato: motivo,
        },
        { transaction: t },
      );
      await t.commit();

      return res.status(201).json({
        message: "Sucursal reasignada correctamente",
        contratoAnterior: contratoActivo,
        nuevoContrato,
      });
    }
  } catch (error) {
    console.error("Error al reasignar la sucursal del funcionario:", error);
    if (t.finished !== "commit") {
      await t.rollback();
    }
    return res
      .status(500)
      .json({ error: "Error al reasignar la sucursal del funcionario" });
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

exports.funcionariosSinContrato = async (req, res) => {
  try {
    const funcionarios = await Funcionario.findAll({
      where: {
        estado: "Activo",
        idRol: {
          [Op.notIn]: [1],
        },
        "$contratos.idContratoFuncionario$": { [Op.is]: null },
      },
      include: [
        {
          model: ContratoFuncionario,
          as: "contratos",
          required: false,
          attributes: [],
        },
      ],
    });
    console.log("todos los funcionarios", funcionarios);

    return res.status(200).json(funcionarios);
  } catch (error) {
    console.error("Error al obtener los funcionarios sin contrato:", error);
    return res
      .status(500)
      .json({ error: "Error al obtener los funcionarios sin contrato" });
  }
};

exports.asignarContratoAFuncionario = async (req, res) => {
  try {
    const {
      rutFuncionario,
      idSucursal,
      fechaIngreso,
      tipoContrato,
      turno,
      estadoContrato,
    } = req.body;
    if (
      !rutFuncionario ||
      !idSucursal ||
      !fechaIngreso ||
      !tipoContrato ||
      !turno ||
      !estadoContrato
    ) {
      return res.status(422).json({ error: "Faltan datos obligatorios" });
    }
    const verificarFuncionario = await Funcionario.findOne({
      where: { rut: rutFuncionario },
    });
    if (!verificarFuncionario) {
      return res.status(404).json({ error: "Funcionario no encontrado" });
    }
    if (verificarFuncionario.estado !== "Activo") {
      return res.status(403).json({ error: "Funcionario no activo" });
    }
    const verificarSucursal = await Sucursal.findByPk(idSucursal);
    if (!verificarSucursal) {
      return res.status(404).json({ error: "Sucursal no encontrada" });
    }
    if (verificarSucursal.estado !== "Abierta") {
      return res.status(403).json({ error: "Sucursal no activa" });
    }

    //crear contrato
    const nuevoContrato = await ContratoFuncionario.create({
      idSucursal,
      idFuncionario: verificarFuncionario.idFuncionario,
      fechaIngreso,
      fechaTermino:
        tipoContrato === "Plazo Fijo"
          ? new Date(new Date().setMonth(new Date().getMonth() + 1))
          : null,
      tipoContrato,
      turno,
      estado: estadoContrato,
    });
    if (!nuevoContrato) {
      return res.status(500).json({ error: "No se pudo crear el contrato" });
    }
    return res.status(201).json(nuevoContrato);
  } catch (error) {
    console.log("Error funcion nuevo contrato", error);
    return res.status(500).json({ error: "Error al crear el nuevo contrato" });
  }
};

exports.cambiarTurnoFuncionario = async (req, res) => {
  try {
    const { idContratoFuncionario, turno } = req.body;
    console.log("LLEgo a cambio de turno", req.body);
    console.log("DAtps", idContratoFuncionario, turno);
    if (!idContratoFuncionario || !turno) {
      return res.status(422).json({ error: "Faltan datos obligatorios" });
    }
    const contrato = await ContratoFuncionario.findByPk(idContratoFuncionario);
    if (!contrato) {
      return res.status(404).json({ error: "Contrato no encontrado" });
    }
    if (contrato.estado !== "Activo") {
      return res.status(403).json({ error: "Contrato no activo" });
    }
    contrato.turno = turno;
    await contrato.save();
    return res.status(200).json({ message: "Turno actualizado correctamente" });
  } catch (error) {
    console.error("Error al cambiar el turno del funcionario:", error);
    return res
      .status(500)
      .json({ error: "Error al cambiar el turno del funcionario" });
  }
};

exports.cambiarTipoContratoFuncionario = async (req, res) => {
  try {
    const { rutBuscar, nuevoContrato, motivo } = req.body;
    console.log("Datos en funcion cambio contrato:", req.body);
    if (!rutBuscar || !nuevoContrato || !motivo) {
      return res.status(422).json({ error: "Faltan datos obligatorios" });
    }
    const funcionario = await Funcionario.findOne({
      where: { rut: rutBuscar },
    });
    if (!funcionario) {
      return res.status(404).json({ error: "Funcionario no encontrado" });
    }
    if (funcionario.estado !== "Activo") {
      return res.status(403).json({ error: "Funcionario no activo" });
    }
    const contrato = await ContratoFuncionario.findOne({
      where: {
        idFuncionario: funcionario.idFuncionario,
        estado: "Activo",
      },
    });
    if (!contrato) {
      return res.status(404).json({ error: "Contrato no encontrado" });
    }
    if (contrato.estado !== "Activo") {
      return res.status(403).json({ error: "Contrato no activo" });
    }
    contrato.tipoContrato = nuevoContrato;
    contrato.motivoCambioContrato = motivo;
    if (nuevoContrato === "Plazo Fijo") {
      contrato.fechaTermino = new Date(
        new Date().setMonth(new Date().getMonth() + 1),
      );
    } else {
      contrato.fechaTermino = null;
    }
    await contrato.save();
    return res
      .status(200)
      .json({ message: "Tipo de contrato actualizado correctamente" });
  } catch (error) {
    console.error(
      "Error al cambiar el tipo de contrato del funcionario:",
      error,
    );
    return res
      .status(500)
      .json({ error: "Error al cambiar el tipo de contrato del funcionario" });
  }
};
