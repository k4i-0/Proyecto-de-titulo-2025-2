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
    // Validación inicial de roles (Opcional, pero está bien mantenerla)
    const roles = await Roles.findAll();
    if (!roles || roles.length === 0) {
      return res.status(204).json({ message: "No hay roles registrados" });
    }

    const funcionariosData = await Funcionario.findAll({
      where: {
        estado: {
          [Op.not]: "Eliminado",
        },
        estaEliminado: false,
      },
      attributes: {
        exclude: ["password", "createdAt", "updatedAt"],
      },
      include: [
        {
          model: Roles,
          as: "role",
          required: true,
          where: {
            nombreRol: { [Op.notIn]: ["Sistema"] },
          },
          // 1. CORRECCIÓN CLAVE: Agregar "privilegios" a los atributos extraídos del Rol
          attributes: ["idRol", "nombreRol", "privilegiosRol"],
        },
        {
          model: ContratoFuncionario,
          foreignKey: "idFuncionario",
          as: "contratos",
          required: false,
          attributes: {
            exclude: ["createdAt", "updatedAt", "idContratoFuncionario"],
          },
          include: [
            {
              model: Sucursal,
              as: "sucursal",
              attributes: ["idSucursal", "nombre", "direccion"],
            },
          ],
        },
      ],
    });

    if (!funcionariosData || funcionariosData.length === 0) {
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
        id: func.idFuncionario, // ID genérico para las tablas
        idFuncionario: func.idFuncionario, // ID explícito por si lo requieres para actualizar
        nombre: func.nombre,
        apellido: func.apellido,
        rut: func.rut,
        email: func.email,
        // 2. CORRECCIÓN: Prevención de crasheo si el teléfono es null
        telefono: func.telefono ? String(func.telefono).slice(3) : null,
        cargo: func.role?.nombreRol || null,
        codigoAcceso: codigoAcceso,

        // 3. CORRECCIÓN CLAVE: Cambiar "permisos" por "privilegios" para que el Modal lo lea directo
        // Si tienes privilegios específicos por funcionario en BD, usa func.privilegios.
        // Si vienen del rol, usa func.role.privilegios. Aquí leo ambos por seguridad.
        privilegios:
          func.privilegiosFuncionario || func.role?.privilegiosRol || null,

        sucursalNombre: contratoActivo?.sucursal?.nombre || null,
        sucursal: contratoActivo?.sucursal?.nombre || null, // Se mantiene por retrocompatibilidad

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
          required: true,
          include: [
            {
              model: Roles,
              where: {
                nombreRol: {
                  [Op.notIn]: ["Sistema"],
                },
              },
              required: true,
              attributes: {
                exclude: [
                  "idRol",
                  "privilegiosRol",
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
    //turno,
    //contrato,
    estadoContrato,
  } = req.body;
  const t = await sequelize.transaction();
  try {
    //console.log("Datos Crear funcionario:", req.body);
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
      //!turno ||
      //!contrato ||
      !estadoContrato
    ) {
      return res.status(422).json({ error: "Faltan datos obligatorios" });
    }
    console.log("Datos recibidos para crear funcionario:", req.body);
    //contraseñas iniciales basadas en el rut
    const passwordInicial = await bcrypt.hash(rut.split("-")[0], 10); // rut sin guion ni digito verificador
    const passwordCajaInicial = await bcrypt.hash(
      rut.split("-")[0].slice(-4), // ultimos 4 digitos del rut antes del guion
      10,
    );
    const passwordAlternativo = await bcrypt.hash(
      rut.split("-")[0].slice(-4), // ultimos 4 digitos del rut antes del guion
      10,
    );

    console.log("Contraseñas iniciales generadas:", {
      passwordInicial: rut.split("-")[0],
      passwordCajaInicial: rut.split("-")[0].slice(-4),
      passwordAlternativo: rut.split("-")[0].slice(-4),
    });

    //buscar rol por nombre
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

    //verifica rut  valido
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
    console.log("Funcionario con mismo RUT encontrado:", rutExistente);
    // verificar correo
    const emailExistente = await Funcionario.findOne(
      {
        where: {
          email: email,
          estaEliminado: false,
        },
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

    if (rutExistente) {
      if (rutExistente.estado === "Eliminado") {
        const respuesta = await rutExistente.update({
          nombre: nombre,
          apellido: apellido,
          email: email,
          password: passwordInicial,
          passwordCaja: passwordCajaInicial,
          passwordAlternativo: passwordAlternativo,
          telefono: `+56${telefono}`,
          direccion: direccion,
          session: false,
          tipoSession: "Sin Session",
          estaEliminado: false,
          privilegiosFuncionario: rutExistente.privilegiosFuncionario,
          estado: "Activo",
          updateAt: new Date(),
        });
        if (!respuesta) {
          await t.rollback();
          return res
            .status(500)
            .json({ error: "No se pudo activar el funcionario" });
        }
        //activar contrato del funcionario
        const contratoViejo = await ContratoFuncionario.findOne({
          where: { idFuncionario: rutExistente.idFuncionario },
          transaction: t,
        });
        if (contratoViejo) {
          await contratoViejo.update(
            {
              estado: "Activo",
              fechaTermino: null,
              motivoCambioContrato: "Reactivación de funcionario eliminado",
            },
            { transaction: t },
          );
        } else {
          await ContratoFuncionario.create(
            {
              idFuncionario: rutExistente.idFuncionario,
              idSucursal,
              fechaIngreso: new Date(),
              tipoContrato: null,
              turno: null,
              fechaTermino: null,
              motivoCambioContrato: "Reactivación de funcionario eliminado",
              estado: "Activo",
            },
            { transaction: t },
          );
        }
        await t.commit();
        return res.status(200).json({
          message: "Funcionario Existenten, fue activado exitosamente",
          funcionario: respuesta,
        });
      }
      await t.rollback();
      return res.status(409).json({ error: "El RUT ya está registrado" });
    }

    const nuevoFuncionario = await Funcionario.create(
      {
        rut,
        nombre,
        apellido,
        email,
        password: passwordInicial,
        passwordCaja: passwordCajaInicial,
        passwordAlternativo: passwordAlternativo,
        telefono: `+56${telefono}`,
        direccion,
        privilegiosFuncionario: rolEncontrado.privilegiosRol,
        idRol: rolEncontrado.idRol,
        estado: "Activo",
        esUsuarioNuevo: true,
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
        tipoContrato: null,
        turno: null,
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
    if (t.finished !== "commit") {
      await t.rollback();
    }

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
  const t = await sequelize.transaction();
  try {
    const { idFuncionario } = req.params;
    if (!idFuncionario) {
      return res.status(422).json({ error: "Falta el ID del funcionario" });
    }

    //buscar el funcionario por id
    const funcionarioAEliminar = await Funcionario.findByPk(idFuncionario, {
      transaction: t,
    });
    if (!funcionarioAEliminar) {
      await t.rollback();
      return res.status(404).json({ error: "Funcionario no encontrado" });
    }

    const rolData = await Roles.findOne({
      where: { idRol: funcionarioAEliminar.idRol },
      transaction: t,
    });

    //verificar que no sea sistema
    if (rolData && rolData.nombreRol === "Sistema") {
      await t.rollback();
      return res
        .status(400)
        .json({ error: "No se puede eliminar el funcionario sistema" });
    }

    //verifico que no tenga session activa, si la tiene no se puede eliminar
    if (funcionarioAEliminar.session === true) {
      return res.status(400).json({
        error: "No se puede eliminar un funcionario con sesión activa",
      });
    }
    // Desactivar contrato primero
    const contratoActualizado = await ContratoFuncionario.update(
      {
        estado: "Inactivo",
        motivoCambioContrato: "Baja del personal",
        fechaTermino: new Date(),
      },
      { where: { idFuncionario: idFuncionario }, transaction: t },
    );

    // Marcar funcionario como eliminado
    const funcionarioActualizado = await Funcionario.update(
      { estaEliminado: true, estado: "Eliminado" },
      { where: { idFuncionario: idFuncionario }, transaction: t },
    );

    if (!funcionarioActualizado[0]) {
      // update retorna [numero de filas afectadas]
      await t.rollback();
      return res
        .status(500)
        .json({ error: "No se pudo eliminar el funcionario" });
    }

    await t.commit();
    res.status(200).json({
      message: "Funcionario eliminado exitosamente",
    });
  } catch (error) {
    console.log("Error al eliminar el funcionario:", error);
    if (t.finished !== "commit") {
      await t.rollback();
    }
    res.status(500).json({ error: "Error al eliminar el funcionario" });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Roles.findAll({
      where: {
        nombreRol: {
          [Op.notIn]: ["Sistema"],
        },
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    if (!roles || roles.length === 0) {
      return res.status(204).json({ message: "No hay roles registrados" });
    }
    res.status(200).json(roles);
  } catch (error) {
    console.error("Error al obtener los roles:", error);
    res.status(500).json({ error: "Error al obtener los roles" });
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
    // 1. Validaciones iniciales
    if (!idFuncionario || !idSucursal || !motivo) {
      await t.rollback();
      return res.status(422).json({
        error: "Faltan datos obligatorios (idFuncionario, idSucursal, motivo)",
      });
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
      return res.status(403).json({
        error: "No se puede trasladar a un funcionario que no está activo",
      });
    }

    const sucursalDestino = await Sucursal.findByPk(idSucursal, {
      transaction: t,
    });

    if (!sucursalDestino) {
      await t.rollback();
      return res
        .status(404)
        .json({ error: "Sucursal de destino no encontrada" });
    }
    if (sucursalDestino.estado !== "Abierta") {
      await t.rollback();
      return res.status(403).json({
        error: "La sucursal de destino no está operativa (No Abierta)",
      });
    }

    // 2. Obtener el contrato actual (El que vamos a desactivar)
    const contratoActivo = await ContratoFuncionario.findOne({
      where: {
        idFuncionario,
        estado: "Activo",
      },
      include: [
        {
          model: Sucursal,
          attributes: ["idSucursal", "nombre"],
        },
      ],
      transaction: t,
    });

    if (!contratoActivo) {
      await t.rollback();
      return res.status(404).json({
        error: "El funcionario no tiene un contrato activo para trasladar",
      });
    }

    if (Number(contratoActivo.idSucursal) === Number(idSucursal)) {
      await t.rollback();
      return res.status(409).json({
        error: "El funcionario ya trabaja actualmente en esa sucursal",
      });
    }

    const fechaActual = new Date();
    const fechaActualStr = fechaActual.toLocaleDateString("es-CL");

    // 3. INACTIVAR CONTRATO ORIGEN
    const notaSalida = `[${fechaActualStr}] Traslado hacia ${sucursalDestino.nombre}. Motivo: ${motivo}`;

    contratoActivo.estado = "Inactivo";
    contratoActivo.fechaTermino = fechaActual; // <--- Se asigna la fecha de término hoy
    contratoActivo.motivoCambioContrato = contratoActivo.motivoCambioContrato
      ? `${contratoActivo.motivoCambioContrato} | ${notaSalida}`
      : notaSalida;

    await contratoActivo.save({ transaction: t });

    // 4. BUSCAR CONTRATO PREVIO EN DESTINO
    const contratoDestinoPrevio = await ContratoFuncionario.findOne({
      where: {
        idFuncionario,
        idSucursal,
      },
      transaction: t,
    });

    let contratoResultante;
    const notaEntrada = `[${fechaActualStr}] Traslado desde ${contratoActivo.sucursal.nombre}. Motivo: ${motivo}`;

    if (contratoDestinoPrevio) {
      // RAMA A: Ya existía un registro -> Lo REACTIVAMOS
      contratoDestinoPrevio.estado = "Activo";
      contratoDestinoPrevio.fechaTermino = null; // <--- Se limpia la fecha de término porque vuelve a estar activo
      contratoDestinoPrevio.motivoCambioContrato =
        contratoDestinoPrevio.motivoCambioContrato
          ? `${contratoDestinoPrevio.motivoCambioContrato} | ${notaEntrada}`
          : notaEntrada;

      await contratoDestinoPrevio.save({ transaction: t });
      contratoResultante = contratoDestinoPrevio;
    } else {
      // RAMA B: No existía registro -> Creamos uno NUEVO
      contratoResultante = await ContratoFuncionario.create(
        {
          idSucursal: idSucursal,
          idFuncionario: idFuncionario,
          fechaIngreso: fechaActual, // Su primer día oficial en esta sucursal es hoy
          tipoContrato: contratoActivo.tipoContrato,
          turno: contratoActivo.turno,
          estado: "Activo",
          fechaTermino: null,
          motivoCambioContrato: notaEntrada,
        },
        { transaction: t },
      );
    }

    await t.commit();

    return res.status(201).json({
      message: "Funcionario reasignado de sucursal exitosamente",
      contratoAnterior: contratoActivo,
      contratoActual: contratoResultante,
    });
  } catch (error) {
    console.error("Error al reasignar la sucursal del funcionario:", error);

    if (!t.finished) {
      await t.rollback();
    }

    return res.status(500).json({
      error: "Error interno al reasignar la sucursal del funcionario",
    });
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

//Cambio de clave desde administración
exports.actualizarClavesFuncionario = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { idFuncionario } = req.params;
    const { claveAdministracion, claveCaja } = req.body;

    // 1. Validar que al menos venga una clave para cambiar
    if (!claveAdministracion && !claveCaja) {
      await t.rollback();
      return res.status(400).json({
        message: "Debe ingresar al menos una clave nueva para actualizar.",
      });
    }

    // 2. Buscar al funcionario
    const funcionario = await Funcionario.findByPk(idFuncionario, {
      transaction: t,
    });

    if (!funcionario) {
      await t.rollback();
      return res.status(404).json({ message: "Funcionario no encontrado." });
    }

    // 3. Preparar el objeto con las actualizaciones
    const camposAActualizar = {};

    // Si envió clave de administración, la encriptamos y la agregamos
    if (claveAdministracion) {
      const salt = await bcrypt.genSalt(10);
      camposAActualizar.password = await bcrypt.hash(claveAdministracion, salt);
    }

    // Si envió clave de caja (PIN), la encriptamos y la agregamos
    if (claveCaja) {
      const saltCaja = await bcrypt.genSalt(10);
      // OJO: Ajusta "passwordAlternativo" por el nombre real de tu columna en la base de datos
      camposAActualizar.passwordAlternativo = await bcrypt.hash(
        claveCaja,
        saltCaja,
      );
    }

    // 4. Actualizar la base de datos
    await funcionario.update(camposAActualizar, { transaction: t });
    await t.commit();

    return res.status(200).json({
      message: "Claves de acceso actualizadas correctamente.",
    });
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    console.error("Error al actualizar claves:", error);
    return res.status(500).json({
      message: "Error interno al actualizar las contraseñas del funcionario.",
      error: error.message,
    });
  }
};

exports.actualizarPermisosFuncionario = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { idFuncionario } = req.params;
    const nuevosPrivilegios = req.body.privilegios; // Recibimos el objeto completo desde el frontend
    console.log(
      "Datos recibidos para actualizar permisos:",
      req.body.privilegios,
    );
    // 1. Validar que vengan datos
    if (!nuevosPrivilegios || Object.keys(nuevosPrivilegios).length === 0) {
      await t.rollback();
      return res.status(400).json({
        message: "Debe enviar el objeto de privilegios para actualizar.",
      });
    }

    // 2. Buscar al funcionario
    const funcionario = await Funcionario.findByPk(idFuncionario, {
      transaction: t,
    });

    const rolFuncionario = await Roles.findByPk(funcionario.idRol, {
      transaction: t,
    });

    if (!funcionario) {
      await t.rollback();
      return res.status(404).json({ message: "Funcionario no encontrado." });
    }

    // 3. (Opcional pero Recomendado) Mezclar con los privilegios existentes
    // Esto asegura que si agregas un nuevo privilegio en el futuro a la BD,
    // no se borre accidentalmente al guardar los antiguos desde el frontend.
    const privilegiosActuales =
      funcionario.privilegiosFuncionario || rolFuncionario.privilegiosRol || {};
    const privilegiosActualizados = {
      ...privilegiosActuales,
      ...nuevosPrivilegios,
    };

    // 4. Actualizar la columna en la base de datos
    await funcionario.update(
      { privilegiosFuncionario: privilegiosActualizados },
      { transaction: t },
    );

    await t.commit();

    return res.status(200).json({
      message: "Permisos actualizados correctamente.",
      privilegios: privilegiosActualizados,
    });
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    console.error("Error al actualizar permisos:", error);
    return res.status(500).json({
      message: "Error interno al actualizar los permisos del funcionario.",
      error: error.message,
    });
  }
};

//crud roles

exports.crearRol = async (req, res) => {
  try {
    const { nombreRol, privilegiosRol } = req.body;

    if (!nombreRol) {
      return res
        .status(400)
        .json({ message: "El nombre del rol es obligatorio" });
    }

    // Validar que el nombre no exista previamente
    const rolExistente = await Roles.findOne({ where: { nombreRol } });
    if (rolExistente) {
      return res
        .status(409)
        .json({ message: "Ya existe un rol con ese nombre" });
    }

    // Crear el rol
    const nuevoRol = await Roles.create({
      nombreRol,
      privilegiosRol: privilegiosRol || {}, // Si no mandan nada, guardamos un JSON vacío
    });

    return res.status(201).json({
      message: "Rol creado exitosamente",
      rol: nuevoRol,
    });
  } catch (error) {
    console.error("Error al crear rol:", error);
    return res.status(500).json({ message: "Error interno al crear el rol" });
  }
};

exports.actualizarRol = async (req, res) => {
  try {
    const { idRol } = req.params;
    const { nombreRol, privilegiosRol } = req.body;

    const rol = await Roles.findByPk(idRol);

    if (!rol) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }

    // Protección: Evitar que le cambien el nombre al Administrador (rompería el sistema)
    let nombreFinal = nombreRol;
    if (rol.nombreRol === "Administrador" && nombreRol !== "Administrador") {
      nombreFinal = "Administrador"; // Forzamos a que mantenga su nombre original
    }

    // Validar que el nuevo nombre no choque con otro rol existente
    if (nombreFinal !== rol.nombreRol) {
      const nombreOcupado = await Roles.findOne({
        where: { nombreRol: nombreFinal },
      });
      if (nombreOcupado) {
        return res
          .status(409)
          .json({ message: "El nombre de rol ya está en uso" });
      }
    }

    // Actualizar
    await rol.update({
      nombreRol: nombreFinal,
      privilegiosRol:
        privilegiosRol !== undefined ? privilegiosRol : rol.privilegiosRol,
    });

    return res.status(200).json({
      message: "Rol actualizado exitosamente",
      rol: rol,
    });
  } catch (error) {
    console.error("Error al actualizar rol:", error);
    return res
      .status(500)
      .json({ message: "Error interno al actualizar el rol" });
  }
};

exports.eliminarRol = async (req, res) => {
  try {
    const { idRol } = req.params;

    const rol = await Roles.findByPk(idRol);

    if (!rol) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }

    // Protección Nivel 1: Evitar borrar roles core
    if (
      rol.nombreRol === "Administrador" ||
      rol.nombreRol === "Sistema" ||
      rol.nombreRol === "Cajero" ||
      rol.nombreRol === "Vendedor"
    ) {
      return res
        .status(403)
        .json({ message: "No está permitido eliminar roles del sistema." });
    }

    // Protección Nivel 2: Revisar si hay funcionarios usando este rol
    const usuariosConEsteRol = await Funcionario.count({
      where: { idRol: idRol },
    });

    if (usuariosConEsteRol > 0) {
      return res.status(409).json({
        message: `No se puede eliminar: Hay ${usuariosConEsteRol} funcionario(s) asignados a este rol. Reasígnelos primero.`,
      });
    }

    // Si pasa todas las protecciones, lo eliminamos
    await rol.destroy();

    return res.status(200).json({ message: "Rol eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar rol:", error);
    return res
      .status(500)
      .json({ message: "Error interno al eliminar el rol" });
  }
};
