// import React, { useEffect } from "react";
// import { Navigate, Outlet, useLocation } from "react-router-dom";
// import { useAuth } from "../context/AuthContext.jsx";
// import { Spin } from "antd";
// import Cookies from "js-cookie";

// const ProtectedRoute = ({
//   allowedRoles,
//   children,
//   fallbackPath = "/login",
// }) => {
//   const { user, isAuthenticated, initializing, checkAuth } = useAuth();
//   const location = useLocation();

//   console.log("ROl", user?.nombreRol);
//   useEffect(() => {
//     console.log("Verificando autenticación...");
//     checkAuth();
//   }, [checkAuth, isAuthenticated, location.pathname]);

//   if (initializing) {
//     return (
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           height: "100vh",
//           backgroundColor: "#f0f2f5",
//         }}
//       >
//         <Spin size="large" tip="Verificando sesión..." fullscreen />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     const modoCaja = Cookies.get("modoCaja");
//     if (modoCaja === "true") {
//       return <Navigate to="/cajas/login" replace fullscreen />;
//     }
//     return <Navigate to="/login" replace fullscreen />;
//   }

//   const userRole = user?.nombreRol;
//   const userTipoSession = sessionStorage.getItem("tipoSession");
//   console.log("Tipo de sesión del usuario:", userTipoSession);

//   if (!userRole || (allowedRoles && !allowedRoles.includes(userRole))) {
//     if (userRole === "Administrador" && userTipoSession !== "Caja") {
//       return <Navigate to="/admin" replace />;
//     }
//     if (userRole === "Vendedor" && userTipoSession !== "Caja") {
//       return <Navigate to="/vendedor" replace />;
//     }
//     if (userRole === "Cajero" && userTipoSession !== "Caja") {
//       return <Navigate to="/cajero" replace />;
//     }
//     if (userTipoSession === "Caja") {
//       return <Navigate to="/cajas" replace />;
//     }
//     return <Navigate to={fallbackPath} replace />;
//   }

//   return children ? children : <Outlet />;
// };

// export default ProtectedRoute;
// //
import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Spin } from "antd";
// import Cookies from "js-cookie"; // Si no lo usas, puedes quitarlo

const ProtectedRoute = ({
  allowedRoles,
  requiredPrivilege, // <-- NUEVO PROP OPCIONAL
  children,
  fallbackPath = "/login",
}) => {
  const { user, isAuthenticated, initializing, checkAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

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
    const modoCaja = localStorage.getItem("modoCaja");
    if (modoCaja === "true") {
      return <Navigate to="/cajas/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.nombreRol;
  const rawSession = sessionStorage.getItem("tipoSession") || "";
  const userTipoSession = rawSession.replace(/"/g, "").trim();
  const isRutaCaja = location.pathname.startsWith("/cajas");

  // ==========================================
  // REGLA 1: MUNDO CAJA (Aislamiento Total)
  // ==========================================
  if (userTipoSession === "Caja") {
    if (!isRutaCaja) {
      return <Navigate to="/cajas" replace />;
    }
    return children ? children : <Outlet />;
  }

  // ==========================================
  // REGLA 2: MUNDO ADMINISTRACIÓN
  // ==========================================
  if (userTipoSession === "Administracion" || userTipoSession !== "Caja") {
    const redirigirPorRol = () => {
      if (userRole === "Administrador") return <Navigate to="/admin" replace />;
      if (userRole === "Vendedor") return <Navigate to="/vendedor" replace />;
      if (userRole === "Cajero") return <Navigate to="/cajero" replace />;
      return <Navigate to={fallbackPath} replace />;
    };

    // A) Bloqueo de intrusos
    if (isRutaCaja) {
      return redirigirPorRol();
    }

    // B) Validación de Roles Normales
    if (!userRole || (allowedRoles && !allowedRoles.includes(userRole))) {
      return redirigirPorRol();
    }

    // C) NUEVA: Validación de Privilegios Finos
    // Revisamos si la ruta pide un privilegio y si el usuario lo tiene en true
    if (requiredPrivilege && user?.privilegios) {
      const tienePrivilegio = user.privilegios[requiredPrivilege] === true;

      if (!tienePrivilegio) {
        // Si no tiene el privilegio, lo regresamos a la raíz de su rol (o a una página de "No autorizado")
        return redirigirPorRol();
      }
    }

    return children ? children : <Outlet />;
  }

  return <Navigate to={fallbackPath} replace />;
};

export default ProtectedRoute;
