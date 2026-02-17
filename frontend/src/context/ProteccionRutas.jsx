import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Spin } from "antd";

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
          backgroundColor: "#f0f2f5",
        }}
      >
        <Spin size="large" tip="Verificando sesión..." fullscreen />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/cajas/login" replace fullscreen />;
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

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
//
