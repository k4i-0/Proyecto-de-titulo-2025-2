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
    await crearBitacora(
      "login controller",
      `Inicio de sesión del usuario: ${email}`,
      funcionarioEncontrado.dataValues.idFuncionario,
    );
    //ACTUALIZAR ESTADO DE SESSION A ACTIVADA
    await funcionarioEncontrado.update({
      session: true,
      tipoSession: "Administracion",
      ultimaSession: new Date(),
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, //process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1 * 60 * 60 * 1000,
    });
    //console.log(funcionarioEncontrado.dataValues);
    return res.status(200).json({
      datos: {
        email: funcionarioEncontrado.email,
        nombreRol: funcionarioEncontrado.dataValues.role.dataValues.nombreRol,
        nombre: funcionarioEncontrado.dataValues.nombre,
        tipoSession: "Administracion",
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
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias de session activa
    });

    //ENVIA DATOS PARA SESSION ABIERTA
    return res.status(200).json({
      datos: {
        email: verificarFuncionario.email,
        nombreRol: verificarFuncionario.dataValues.role.dataValues.nombreRol,
        nombre: verificarFuncionario.dataValues.nombre,
        tipoSession: "Caja",
      },
    });
  } catch (error) {
    console.log("Error en loginCodigo:", error);
    return res.status(500).json({ message: "Error interno" });
  }
}

async function logout(req, res) {
  const { token } = req.cookies;
  const { email } = req.body;
  if (!email) {
    return res.status(404).send("Email no proporcionado");
  }
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
    await crearBitacora(
      "logout controller",
      `Cierre de sesión del usuario: ${emailDelToken}`,
      0,
    );

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

module.exports = { login, logout, miEstado, loginCodigo };
