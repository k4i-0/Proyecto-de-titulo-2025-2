import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ allowedRoles, fallbackPath = "/" }) => {
  const { user, isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return <div className="text-center mt-5">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.nombreRol;
  if (!userRole || (allowedRoles && !allowedRoles.includes(userRole))) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Renderiza las rutas hijas
  return <Outlet />;
};

export default ProtectedRoute;
