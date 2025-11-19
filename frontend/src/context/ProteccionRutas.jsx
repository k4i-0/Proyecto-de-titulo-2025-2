import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

//llamar funcion miEstado
// import { miEstado } from "../services/Auth.services.js";

const ProtectedRoute = ({
  allowedRoles,
  children,
  fallbackPath = "/login",
}) => {
  const { user, isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.nombreRol;
  if (!userRole || (allowedRoles && !allowedRoles.includes(userRole))) {
    if (userRole === "Administrador") {
      return <Navigate to="/admin" replace />;
    }
    if (userRole === "Vendedor") {
      return <Navigate to="/vendedor" replace />;
    }
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
