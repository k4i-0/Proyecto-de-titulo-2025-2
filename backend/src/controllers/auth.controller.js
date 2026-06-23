const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Funcionario = require("../models/Usuarios/Funcionario");
const roles = require("../models/Usuarios/Rol");

const { crearBitacora } = require("../services/bitacora.service");

const { desencriptar } = require("../config/AES");

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(203).send({ code: 1238, message: "Faltan Datos" });
  }
  try {
    //BUSCO FUNCIONARIO POR EMAIL
    const funcionarioEncontrado = await Funcionario.findOne({
      where: { email },
      include: [
        {
          model: roles,
        },
      ],
    });
    //SI NO EXISTE RETURN 404
    if (!funcionarioEncontrado) {
      return res
        .status(404)
        .send({ code: 1010, message: "Usuario No encontrado, verifique" });
    }
    if (funcionarioEncontrado.estado !== "Activo") {
      return res.status(401).json({
        code: 1012,
        message: "Usuario inactivo, verifique con el administrador",
      });
    }
    //COMPROBAR CONTRASEÑA
    const passwordMatch = await bcrypt.compare(
      password,
      funcionarioEncontrado.password,
    );
    //SI CONTRASEÑA INCORRECTA RETURN 401
    if (!passwordMatch) {
      await funcionarioEncontrado.increment("intentosFallidos");
      if (funcionarioEncontrado.intentosFallidos >= 3) {
        await funcionarioEncontrado.update({
          estado: "Bloqueado",
        });
      }
      return res
        .status(401)
        .json({ code: 1011, message: "Contraseña incorrecta" });
    }
    //VERIFICAR ESTADO DEL USUARIO

    //VERIFICAR ESTADO DE LA SESSION
    // if (funcionarioEncontrado.session === true) {
    //   return res
    //     .status(409)
    //     .json({ code: 1020, message: "Usuario ya tiene sesión activa" });
    // }

    //CREAR TOKEN
    const token = jwt.sign(
      {
        rut: funcionarioEncontrado.dataValues.rut,
        email,
        role: funcionarioEncontrado.dataValues.role.dataValues.nombreRol,
        session: "Administracion",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    //SI NO SE CREA TOKEN RETURN 404
    if (!token) {
      return res
        .status(404)
        .json({ code: 1013, message: "Error al crear Token" });
    }

    //REGISTRAR BITACORA ACTIVIDAD LOGIN
    // await crearBitacora(
    //   "login controller",
    //   `Inicio de sesión del usuario: ${email}`,
    //   funcionarioEncontrado.dataValues.idFuncionario,
    // );
    //ACTUALIZAR ESTADO DE SESSION A ACTIVADA
    let sesionTipo = "";
    if (
      funcionarioEncontrado.dataValues.role.dataValues.nombreRol ===
      "Administrador"
    )
      sesionTipo = "Administracion";
    if (
      funcionarioEncontrado.dataValues.role.dataValues.nombreRol === "Vendedor"
    )
      sesionTipo = "Vendedor";
    if (funcionarioEncontrado.dataValues.role.dataValues.nombreRol === "Cajero")
      sesionTipo = "Caja";

    await funcionarioEncontrado.update({
      session: true,
      tipoSession: sesionTipo,
      ultimaSession: new Date(),
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, //process.env.NODE_ENV === "production", // candado http si es true solo acepta https
      sameSite: "lax", // para evitar ataques CSRF, permite enviar cookies solo en solicitudes del mismo sitio
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      datos: {
        email: funcionarioEncontrado.email,
        nombreRol: funcionarioEncontrado.dataValues.role.dataValues.nombreRol,
        nombre: funcionarioEncontrado.dataValues.nombre,
        tipoSession: funcionarioEncontrado.dataValues.tipoSession,
        privilegios: funcionarioEncontrado.role.privilegiosRol,
        esUsuarioNuevoCaja: funcionarioEncontrado.dataValues.esUsuarioNuevoCaja,
        esUsuarioNuevoAdministracion:
          funcionarioEncontrado.dataValues.esUsuarioNuevoAdministracion,
      },
      token: {
        token,
      },
    });
  } catch (error) {
    console.log(error);
    if (res.headersSent) {
      return;
    }
    return res.status(500).send({ message: "Error interno" });
  }
}

async function loginCodigo(req, res) {
  const { token } = req.cookies;
  //VERIFICA QUE SE RECIBA TOKEN EN COOKIES Y LO ELIMINA PARA EVITAR CONFLICTOS
  if (token) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
  }

  try {
    const { codigo } = req.body;
    //VERIFICA QUE SE RECIBA EL CODIGO
    //console.log("Codigo:", codigo);
    if (!codigo) {
      return res.status(203).json({ message: "Faltan datos" });
    }

    //DESENCRIPTAR CODIGO BARRA
    const codigoDesencriptado = desencriptar(codigo);

    //COMPRUEBA SI EL FUNCIONARIO EXISTE
    const verificarFuncionario = await Funcionario.findOne({
      where: { rut: codigoDesencriptado },
      include: [
        {
          model: roles,
        },
      ],
    });

    //console.log("Funcionario encontrado:", verificarFuncionario);

    //SI NO EXISTE RETURN 404
    if (!verificarFuncionario) {
      return res
        .status(404)
        .json({ code: 1010, message: "Usuario No encontrado, verifique" });
    }

    //VERIFICAR ESTADO DEL USUARIO
    if (verificarFuncionario.estado !== "Activo") {
      return res.status(401).json({ code: 1012, message: "Usuario inactivo" });
    }

    //VERIFICAR ESTADO DE LA SESSION
    // if (verificarFuncionario.session === true) {
    //   return res
    //     .status(409)
    //     .json({ code: 1020, message: "Usuario ya tiene sesión activa" });
    // }

    //CREAR TOKEN
    const token = jwt.sign(
      {
        rut: verificarFuncionario.dataValues.rut,
        email: verificarFuncionario.email,
        role: verificarFuncionario.dataValues.role.dataValues.nombreRol,
        tipoSession: "Caja",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    //SI NO SE CREA TOKEN RETURN 404
    if (!token) {
      return res
        .status(404)
        .json({ code: 1013, message: "Error al crear Token" });
    }

    // ACTUALIZAR ESTADO DE SESSION A ACTIVADA Y TIPO DE SESSION A CAJA
    await verificarFuncionario.update({
      session: true,
      tipoSession: "Caja",
      ultimaSession: new Date(),
    });

    //ENVIA COOKIE CON TOKEN AL NAVEGADOR
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1 * 60 * 60 * 1000, // 1 hora de session activa
    });

    //ENVIA DATOS PARA SESSION ABIERTA
    return res.status(200).json({
      datos: {
        email: verificarFuncionario.email,
        nombreRol: verificarFuncionario.dataValues.role.dataValues.nombreRol,
        nombre: verificarFuncionario.dataValues.nombre,
        privilegios: verificarFuncionario.role.dataValues.privilegiosRol,
        tipoSession: "Caja",
        esUsuarioNuevoCaja: verificarFuncionario.dataValues.esUsuarioNuevoCaja,
        esUsuarioNuevoAdministracion:
          verificarFuncionario.dataValues.esUsuarioNuevoAdministracion,
      },
    });
  } catch (error) {
    console.log("Error en loginCodigo:", error);
    return res.status(500).json({ message: "Error interno" });
  }
}

async function loginCajaAlternativo(req, res) {
  try {
    const { rut, passwordCajaAlternativo } = req.body;
    console.log("Datos recibidos en loginCajaAlternativo:", req.body);
    if (!rut || !passwordCajaAlternativo) {
      return res.status(203).json({ message: "Faltan datos" });
    }
    const funcionarioEncontrado = await Funcionario.findOne({
      where: { rut: rut },

      include: [
        {
          model: roles,
        },
      ],
    });
    //console.log("funcionarioEncontrado:", funcionarioEncontrado);

    //SI NO EXISTE RETURN 404
    if (!funcionarioEncontrado) {
      return res
        .status(404)
        .send({ code: 1010, message: "Usuario No encontrado, verifique" });
    }
    if (funcionarioEncontrado.estado !== "Activo") {
      return res.status(401).json({
        code: 1012,
        message: "Usuario inactivo, verifique con el administrador",
      });
    }
    if (!funcionarioEncontrado.passwordAlternativo) {
      return res.status(401).json({
        code: 1014,
        message:
          "Usuario no tiene contraseña alternativa, verifique con el administrador",
      });
    }
    const passwordMatch = await bcrypt.compare(
      passwordCajaAlternativo,
      funcionarioEncontrado.passwordAlternativo,
    );
    //SI CONTRASEÑA INCORRECTA RETURN 401
    if (!passwordMatch) {
      await funcionarioEncontrado.increment("intentosFallidos");
      if (funcionarioEncontrado.intentosFallidos >= 3) {
        await funcionarioEncontrado.update({
          estado: "Bloqueado",
        });
      }
      return res
        .status(401)
        .json({ code: 1011, message: "Contraseña incorrecta" });
    }
    //CREAR TOKEN
    const token = jwt.sign(
      {
        rut: funcionarioEncontrado.rut,
        email: funcionarioEncontrado.email,
        role: funcionarioEncontrado.role.nombreRol,
        session: "Caja",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    //SI NO SE CREA TOKEN RETURN 404
    if (!token) {
      return res
        .status(404)
        .json({ code: 1013, message: "Error al crear Token" });
    }
    // //REGISTRAR BITACORA ACTIVIDAD LOGIN
    // await crearBitacora(
    //   "login controller",
    //   `Inicio de sesión del usuario: ${rut} con contraseña alternativa`,
    //   funcionarioEncontrado.dataValues.idFuncionario,
    // );
    //ACTUALIZAR ESTADO DE SESSION A ACTIVADA
    let sesionTipo = "Caja";

    await funcionarioEncontrado.update({
      session: true,
      tipoSession: sesionTipo,
      ultimaSession: new Date(),
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, //process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      datos: {
        email: funcionarioEncontrado.email,
        nombreRol: funcionarioEncontrado.dataValues.role.dataValues.nombreRol,
        nombre: funcionarioEncontrado.dataValues.nombre,
        tipoSession: funcionarioEncontrado.dataValues.tipoSession,
        privilegios:
          funcionarioEncontrado.dataValues.role.dataValues.privilegiosRol,
        esUsuarioNuevoCaja: funcionarioEncontrado.dataValues.esUsuarioNuevoCaja,
        esUsuarioNuevoAdministracion:
          funcionarioEncontrado.dataValues.esUsuarioNuevoAdministracion,
      },
      token: {
        token,
      },
    });
  } catch (error) {
    console.log("Error en loginCajaAlternativo:", error);
    return res.status(500).json({ message: "Error interno" });
  }
}

async function logout(req, res) {
  const { token } = req.cookies;

  //console.log("Token recibido en logout:", req.cookies);
  if (!token) {
    return res.status(203).send({ message: "Sin cookies" });
  }
  let emailDelToken = "Usuario desconocido (token inválido/expirado)";
  try {
    const payload = jwt.decode(token, process.env.JWT_SECRET);
    if (payload && payload.email) {
      emailDelToken = payload.email;
    }
    const funcionarioEncontrado = await Funcionario.findOne({
      where: { email: emailDelToken },
    });
    if (funcionarioEncontrado) {
      await funcionarioEncontrado.update({
        session: false,
        tipoSession: "Sin Session",
      });
    } else {
      console.warn(
        `No se encontró el funcionario para actualizar sesión durante logout: ${emailDelToken}`,
      );
      return res
        .status(404)
        .json({ message: "Usuario no encontrado, reintente" });
    }
  } catch (error) {
    console.warn(
      `Intento de logout con token inválido/expirado: ${error.name}`,
    );
  }
  try {
    // // await crearBitacora(
    //   "logout controller",
    //   `Cierre de sesión del usuario: ${emailDelToken}`,
    //   1,
    // );

    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    res.status(200).json({ message: "Sesión cerrada" });
  } catch (error) {
    console.log("Error Critico: ", error);
    res.status(500).json({ message: "Error interno" });
  }
}

async function miEstado(req, res) {
  try {
    const { token } = req.cookies;
    //console.log("Token recibido en miEstado:", token);
    if (!token) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });
      return res.status(401).json({ message: "Sin autorización" });
    }

    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    //console.log("Payload decodificado:", decodedPayload);
    if (!decodedPayload) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });
      return res.status(401).json({ message: "No autorizado" });
    }
    //verificar usuario
    const verificarFuncionario = await Funcionario.findOne({
      where: { email: decodedPayload.email },
      include: [
        {
          model: roles,
        },
      ],
    });
    if (!verificarFuncionario) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });
      return res.status(401).json({ message: "Usuario no encontrado" });
    }
    if (verificarFuncionario.estado !== "Activo") {
      res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });
      return res.status(401).json({ message: "Usuario inactivo" });
    }
    if (verificarFuncionario.session === false) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });
      return res.status(401).json({ message: "Usuario sin sesión activa" });
    }

    return res.status(200).send({
      message: "Token válido",
      payload: {
        email: verificarFuncionario.email,
        nombreRol: verificarFuncionario.dataValues.role.dataValues.nombreRol,
        nombre: verificarFuncionario.dataValues.nombre,
        tipoSession: verificarFuncionario.dataValues.tipoSession,
        privilegios: verificarFuncionario.role.dataValues.privilegiosRol,
        esUsuarioNuevoCaja: verificarFuncionario.dataValues.esUsuarioNuevoCaja,
        esUsuarioNuevoAdministracion:
          verificarFuncionario.dataValues.esUsuarioNuevoAdministracion,
      },
    });
  } catch (error) {
    console.log(error.message);
    if (error.name === "TokenExpiredError") {
      res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });
      return res.status(401).json({ message: "La sesión ha expirado" });
    }

    if (error.name === "JsonWebTokenError") {
      res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });
      return res.status(401).json({ message: "Token inválido o manipulado" });
    }
    return res.status(500).json({ message: "Error interno" });
  }
}

async function actualizarContraseñaCaja(req, res) {
  try {
    const { email, newContraseñaCaja } = req.body;
    console.log("Datos recibidos en actualizarContraseñaCaja:", req.body);
    if (!email || !newContraseñaCaja) {
      return res.status(203).json({ message: "Faltan datos" });
    }

    const funcionarioEncontrado = await Funcionario.findOne({
      where: { email },
    });

    if (!funcionarioEncontrado) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    console.log("Contraseña antes", funcionarioEncontrado.passwordCaja);
    const hashedPassword = await bcrypt.hash(newContraseñaCaja, 10);
    console.log("Contraseña hasheada:", hashedPassword);

    const updatedFuncionario = await funcionarioEncontrado.update({
      passwordAlternativo: hashedPassword,
      esUsuarioNuevoCaja: false,
    });
    console.log(
      "Funcionario actualizado:",
      updatedFuncionario.dataValues.passwordAlternativo,
    );
    if (!updatedFuncionario) {
      return res
        .status(500)
        .json({ message: "Error al actualizar la contraseña" });
    }

    return res
      .status(200)
      .json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.log("Error en actualizarContraseñaCaja:", error);
    return res.status(500).json({ message: "Error interno" });
  }
}

async function actualizarContraseñaAdministracion(req, res) {
  try {
    const { email, newContraseñaAdmin } = req.body;
    console.log(
      "Datos recibidos en actualizarContraseñaAdministracion:",
      req.body,
    );
    if (!email || !newContraseñaAdmin) {
      return res.status(203).json({ message: "Faltan datos" });
    }

    const funcionarioEncontrado = await Funcionario.findOne({
      where: { email },
    });

    if (!funcionarioEncontrado) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    console.log("Contraseña antes", funcionarioEncontrado.password);
    const hashedPassword = await bcrypt.hash(newContraseñaAdmin, 10);
    console.log("Contraseña hasheada:", hashedPassword);

    const updatedFuncionario = await funcionarioEncontrado.update({
      password: hashedPassword,
      esUsuarioNuevoAdministracion: false,
    });
    console.log(
      "Funcionario actualizado:",
      updatedFuncionario.dataValues.password,
    );
    if (!updatedFuncionario) {
      return res
        .status(500)
        .json({ message: "Error al actualizar la contraseña" });
    }

    return res
      .status(200)
      .json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.log("Error en actualizarContraseñaAdministracion:", error);
    return res.status(500).json({ message: "Error interno" });
  }
}

module.exports = {
  login,
  logout,
  miEstado,
  loginCodigo,
  loginCajaAlternativo,
  actualizarContraseñaCaja,
  actualizarContraseñaAdministracion,
};
