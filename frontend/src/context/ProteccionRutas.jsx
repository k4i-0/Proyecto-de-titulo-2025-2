import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Spin } from "antd";
import Cookies from "js-cookie";

const ProtectedRoute = ({
  allowedRoles,
  children,
  fallbackPath = "/login",
}) => {
  const { user, isAuthenticated, initializing, checkAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log("Verificando autenticación...");
    checkAuth();
  }, [checkAuth, isAuthenticated, location.pathname]);

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
    const modoCaja = Cookies.get("modoCaja");
    if (modoCaja === "true") {
      return <Navigate to="/cajas/login" replace fullscreen />;
    }
    return <Navigate to="/login" replace fullscreen />;
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
