// RedireccionPorRol.jsx - NUEVO
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RedireccionPorRol = () => {
  const { user, isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
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
