const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Funcionario = require("../models/Usuarios/Funcionario");
const roles = require("../models/Usuarios/Rol");

const { crearBitacora } = require("../services/bitacora.service");

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
      funcionarioEncontrado.passwordCaja
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
    res.status(200).json({
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

async function logout(req, res) {
  // console.log("antes de", req.cookies);
  const { token } = req.cookies;
  if (!token) {
    res.status(203).send({ message: "Sin cookies" });
  }
  let emailDelToken = "Usuario desconocido (token inválido/expirado)";
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
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

    res.clearCookie("token", { httpOnly: true, secure: false });
    res.status(200).json({ message: "Sesión cerrada" });
  } catch (error) {
    res.status(500).json({ message: "Error interno" });
    console.log(error);
  }
}

async function miEstado(req, res) {
  try {
    const { token } = req.cookies;
    //console.log("Token recibido en miEstado:", token);
    if (!token) {
      res.clearCookie("token", { httpOnly: true, secure: false });
      return res.status(401).json({ message: "No autorizado" });
    }

    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    //console.log("Payload decodificado:", decodedPayload);
    if (!decodedPayload) {
      res.clearCookie("token", { httpOnly: true, secure: false });
      return res.status(401).json({ message: "No autorizado" });
    }
    return res
      .status(200)
      .send({ message: "Token válido", payload: decodedPayload });
  } catch (error) {
    console.log(error.message);
    if (error.message === "jwt expired") {
      return res.status(498).json({ message: "Token expirado" });
    }
    return res.status(500).json({ message: "Error interno" });
  }
}

module.exports = { login, logout, miEstado };
