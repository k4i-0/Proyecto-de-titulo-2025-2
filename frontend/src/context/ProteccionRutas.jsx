import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ allowedRoles, fallbackPath = "/dashboard" }) => {
  const { user, isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return <div className="text-center mt-5">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.rol)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Renderiza las rutas hijas
  return <Outlet />;
};

export default ProtectedRoute;
