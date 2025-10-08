const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Funcionario = require("../models/usuarios/Funcionario");
const roles = require("../models/usuarios/Rol");

async function login(req, res) {
  const { rut, password } = req.body;
  if (!rut || !password) {
    res.status(203).send({ message: "Faltan Datos" });
  }
  try {
    const funcionarioEncontrado = await Funcionario.findOne({
      where: { rut },
      include: [roles],
    });
    if (!funcionarioEncontrado) {
      res.status(404).send({ message: "Usuario No encontrado, verifique" });
    }
    const passwordMatch = await bcrypt.compare(
      password,
      funcionarioEncontrado.passwordCaja
    );
    if (!passwordMatch)
      return res.status(401).json({ message: "Contraseña incorrecta" });
    const token = jwt.sign(
      { rut, role: funcionarioEncontrado.nombreRol },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400000,
    });
    res.json({ message: "Login exitoso" });
  } catch (error) {
    res.status(500).send({ message: "Error interno" });
    console.log(error);
  }
}

async function logout(req, res) {
  try {
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
    req.userId = data.id;
    next();
  } catch {
    res.status(403).send("Token inválido");
  }
}

module.exports = { login, logout, verificarToken };
