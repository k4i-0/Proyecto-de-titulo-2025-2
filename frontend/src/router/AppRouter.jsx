import { Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/login.jsx";
import LoginCodigo from "../pages/Auth/LoginCodigo.jsx";
import RedireccionPorRol from "../pages/Auth/RedireccionPorRol.jsx";
import NoEncontrado from "../pages/Compartidas/NoEncontrado.jsx";
import AdminRouter from "./AdminRouter.jsx";
import VendedorRouter from "./VendedorRouter.jsx";
import ProtectedRoute from "../context/ProteccionRutas.jsx";

import Cookies from "js-cookie";

const AppRouter = () => {
  Cookies.set("modoCaja", "false", { expires: 365 });
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cajas/login" element={<LoginCodigo />} />
      <Route path="/" element={<RedireccionPorRol />} />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["Administrador"]}>
            <AdminRouter />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendedor/*"
        element={
          <ProtectedRoute allowedRoles={["Vendedor"]}>
            <VendedorRouter />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NoEncontrado />} />
    </Routes>
  );
};

export default AppRouter;
