const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/Auth");

const Funcionario = require("../models/Funcionario");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "No autorizado",
      error: "No hay token valido",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({
      message: "No se proporcionó token de autenticación",
    });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; // Agregar datos del usuario al request
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido o expirado",
      error: error.message,
    });
  }
};

async function isAdmin(req, res, next) {
  try {
    const user = await Funcionario.findOne({ email: req.email });
    const roles = await Role.find({ _id: { $in: user.roles } });
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "admin") {
        next();
        return;
      }
    }
    return respondError(
      req,
      res,
      401,
      "Se requiere un rol de administrador para realizar esta acción"
    );
  } catch (error) {
    handleError(error, "authorization.middleware -> isAdmin");
  }
}

module.exports = { verifyToken };
