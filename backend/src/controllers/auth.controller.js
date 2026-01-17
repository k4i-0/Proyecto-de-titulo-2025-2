const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Funcionario = require("../models/Usuarios/Funcionario");
const roles = require("../models/Usuarios/Rol");

const { crearBitacora } = require("../services/bitacora.service");

const { desencriptar } = require("../config/AES");

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(203).send({ code: 1238, message: "Faltan Datos" });
  }
  try {
    const funcionarioEncontrado = await Funcionario.findOne({
      where: { email },
      include: [
        {
          model: roles,
        },
      ],
    });
    if (!funcionarioEncontrado) {
      res
        .status(404)
        .send({ code: 1010, message: "Usuario No encontrado, verifique" });
    }
    const passwordMatch = await bcrypt.compare(
      password,
      funcionarioEncontrado.password
    );

    if (!passwordMatch)
      return res
        .status(401)
        .json({ code: 1011, message: "Contraseña incorrecta" });

    const token = jwt.sign(
      {
        email,
        role: funcionarioEncontrado.dataValues.role.dataValues.nombreRol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    if (!token) {
      res.status(404).json({ code: 1013, message: "Error al crear Token" });
    }
    await crearBitacora({
      nombre: `login usuario ${email}`,
      fechaCreacion: new Date(),
      descripcion: `Inicio de sesión del usuario: ${email}`,
      funcionOcupo: "login controller",
      usuariosCreador: ` Sistema por ${email} `,
      nivelAlerta: "Bajo",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, //process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    //console.log(funcionarioEncontrado.dataValues);
    return res.status(200).json({
      datos: {
        email: funcionarioEncontrado.email,
        nombreRol: funcionarioEncontrado.dataValues.role.dataValues.nombreRol,
        nombre: funcionarioEncontrado.dataValues.nombre,
      },
      token: {
        token,
      },
    });
  } catch (error) {
    res.status(500).send({ message: "Error interno" });
    console.log(error);
  }
}

async function loginCodigo(req, res) {
  const { token } = req.cookies;
  if (token) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
  }

  try {
    const { codigo } = req.body;
    if (!codigo) {
      return res.status(203).json({ message: "Faltan datos" });
    }

    const codigoDesencriptado = desencriptar(
      "90279fe442d436ac0842130a61843a7f"
    );

    const verificarFuncionario = await Funcionario.findOne({
      where: { rut: codigoDesencriptado },
      include: [
        {
          model: roles,
        },
      ],
    });
    if (!verificarFuncionario) {
      return res
        .status(404)
        .json({ code: 1010, message: "Usuario No encontrado, verifique" });
    }
    const token = jwt.sign(
      {
        email: verificarFuncionario.email,
        role: verificarFuncionario.dataValues.role.dataValues.nombreRol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    if (!token) {
      return res
        .status(404)
        .json({ code: 1013, message: "Error al crear Token" });
    }
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, //process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      datos: {
        email: verificarFuncionario.email,
        nombreRol: verificarFuncionario.dataValues.role.dataValues.nombreRol,
        nombre: verificarFuncionario.dataValues.nombre,
      },
    });
  } catch (error) {
    console.log("Error en loginCodigo:", error);
    return res.status(500).json({ message: "Error interno" });
  }
}

async function logout(req, res) {
  // console.log("antes de", req.cookies);
  const { token } = req.cookies;
  if (!token) {
    return res.status(203).send({ message: "Sin cookies" });
  }
  let emailDelToken = "Usuario desconocido (token inválido/expirado)";
  try {
    const payload = jwt.decode(token, process.env.JWT_SECRET);
    if (payload && payload.email) {
      emailDelToken = payload.email;
    }
  } catch (error) {
    console.warn(
      `Intento de logout con token inválido/expirado: ${error.name}`
    );
  }
  try {
    await crearBitacora({
      nombre: "logout usuario",
      fechaCreacion: new Date(),
      descripcion: `Cierre de sesión del usuario: ${emailDelToken}`,
      funcionOcupo: "logout controller",
      usuariosCreador: ` Sistema por ${emailDelToken} `,
      nivelAlerta: "Bajo",
    });

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
