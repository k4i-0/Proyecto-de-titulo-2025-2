const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Funcionario = require("../models/Usuarios/Funcionario");
const roles = require("../models/Usuarios/Rol");

const { crearBitacora } = require("../services/bitacora.service");

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(203).send({ message: "Faltan Datos" });
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
      secure: true, //process.env.NODE_ENV === "production",
      // sameSite: "strict",
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
  try {
    await crearBitacora({
      nombre: `logout usuario ${req.userEmail.email}`,
      fechaCreacion: new Date(),
      descripcion: `Cierre de sesión del usuario: ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      }`,
      funcionOcupo: "logout controller",
      usuariosCreador: ` Sistema por ${
        jwt.verify(req.cookies.token, process.env.JWT_SECRET).email ??
        "error de lectura cookie"
      } `,
      nivelAlerta: "Bajo",
    });
    res.clearCookie("access_token");
    res.json({ message: "Sesión cerrada" });
  } catch (error) {
    res.status(500).send({ message: "Error interno" });
    console.log(error);
  }
}
async function verificarToken(req, res) {
  const token = req.cookies.access_token;
  if (!token) return res.status(403).send("No autorizado");
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.userEmail = data;
  } catch {
    res.status(403).send("Token inválido");
  }
}

module.exports = { login, logout, verificarToken };
