const jwt = require("jsonwebtoken");
const Funcionario = require("../");

async function login(req, res) {
  const { user, password } = req.body;
  if (!user || !password) {
    res.send(204).send({ message: "Sin contenido" });
  }
  try {
  } catch (error) {}
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
