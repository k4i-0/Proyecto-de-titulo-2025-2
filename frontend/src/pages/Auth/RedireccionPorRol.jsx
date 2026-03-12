import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Cookies from "js-cookie";

const RedireccionPorRol = () => {
  const { user, isAuthenticated, initializing } = useAuth();

  const [esCaja, setEsCaja] = useState(() => Cookies.get("modoCaja"));
  if (initializing) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    console.log("Caja", esCaja);
    if (esCaja === true) {
      return <Navigate to="/cajas/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.nombreRol;

  if (userRole === "Administrador") {
    return <Navigate to="/admin" replace />;
  }

  if (userRole === "Vendedor") {
    return <Navigate to="/vendedor" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default RedireccionPorRol;
