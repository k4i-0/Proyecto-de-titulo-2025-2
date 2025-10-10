import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = ({
  allowedRoles,

  fallbackPath = "/dashboard",
}) => {
  const { user, isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return <div className="text-center mt-5">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
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
