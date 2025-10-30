import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

//llamar funcion miEstado
import { miEstado } from "../services/Auth.services.js";

const ProtectedRoute = ({
  allowedRoles,

  fallbackPath = "/dashboard",
}) => {
  const { user, isAuthenticated, initializing, logout } = useAuth();

  if (initializing) {
    return <div className="text-center mt-5">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  } else {
    miEstado().then((estado) => {
      //console.log("Usuario actual:", user.nombreRol);
      //console.log("Usuario estado llamada:", estado.data.payload.role);
      if (estado.status == 401 || estado.status == 498) {
        // Si el estado es 401, redirigir al usuario a la página de inicio de sesión
        logout();
        return <Navigate to="/" replace />;
      }

      if (estado.status == 200 && estado.data.payload.role != user.nombreRol) {
        // Si el rol ha cambiado, cerrar sesión
        logout();
        return <Navigate to="/" replace />;
      }
    });
  }

  const userRole = user?.nombreRol;
  if (!userRole || (allowedRoles && !allowedRoles.includes(userRole))) {
    return <Navigate to={fallbackPath} replace />;
  }

  // if (!user || !allowedRoles.includes(user.nombreRol)) {
  //   return <Navigate to={fallbackPath} replace />;
  // }

  // Renderiza las rutas hijas
  return <Outlet />;
};

export default ProtectedRoute;
