const jwt = require("jsonwebtoken");
const Funcionario = require("../models/usuarios/Funcionario");

async function login(req, res) {
  const { user, password } = req.body;
  if (!user || !password) {
    res.status(203).send({ message: "Faltan Datos" });
  }
  try {
    const funcionarioEncontrado = Funcionario.findOne({ where: user });
    if (!funcionarioEncontrado) {
      res.status(404).send({ message: "Usuario No encontrado, verifique" });
    }

    //decodificar contraseña y comparar y crear cookie y retornar.
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

module.exports = { login, verificarToken };
