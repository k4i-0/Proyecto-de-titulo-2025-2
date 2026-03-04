const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/Auth");
const Funcionario = require("../models/Usuarios/Funcionario");
const Roles = require("../models/Usuarios/Rol");

const verifyToken = (req, res, next) => {
  // Intentar obtener token del header Authorization primero
  const authHeader = req.headers.authorization || req.headers.Authorization;
  let token = null;
  
  // Prioridad 1: Header Authorization
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }
  
  // Prioridad 2: Cookie (si no hay header)
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }
  
  
  // Si no hay token en ningún lado
  if (!token) {
    return res.status(401).json({
      message: "No autorizado",
      error: "No hay token válido en header ni en cookies",
    });
  }
  
  try {
    const decoded = jwt.verify(token, jwtSecret); 
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido o expirado",
      error: error.message,
    });
  }
};

// Middleware para verificar roles específicos
const verifyRole = (rolesPermitidos) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.rut) {
        return res.status(401).json({
          message: "Usuario no autenticado",
        });
      }
      const funcionario = await Funcionario.findOne({where: {rut: req.user.rut}, include: [{
          model: Roles,
          attributes: ['nombreRol']
        }]
      });
      //console.log(funcionario.role);
      if (!funcionario) {
        return res.status(404).json({
          message: "Usuario no encontrado",
        });
      }
      const rolUsuario = funcionario.role?.nombreRol;
      //console.log(rolUsuario);
      if (!rolesPermitidos.includes(rolUsuario)) {
        return res.status(403).json({
          message: "No tienes permisos para realizar esta acción",
          requiredRoles: rolesPermitidos,
          userRole: rolUsuario
        });
      }
      next();
    } catch (error) {
      console.log(error); 
      return res.status(500).json({
        message: "Error al verificar permisos",
        error: error.message,
      });
    }
  };
};
// Middleware específico para administradores
const isAdmin = verifyRole(["Administrador"]);
// Middleware para vendedores
const isVendedor = verifyRole(["Vendedor"]);
// Middleware para admin o vendedor
const isAdminOrVendedor = verifyRole(["Administrador", "Vendedor"]);
module.exports = { 
  verifyToken, 
  verifyRole, 
  isAdmin, 
  isVendedor, 
  isAdminOrVendedor 
};