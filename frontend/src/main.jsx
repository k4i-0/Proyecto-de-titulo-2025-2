import "@ant-design/v5-patch-for-react-19";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./context/ProteccionRutas.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
//import "bootstrap/dist/css/bootstrap.min.css";

import NoEncontrado from "./pages/NoEncontrado.jsx";

import Login from "./pages/login.jsx";
import RedireccionPorRol from "./pages/RedireccionPorRol.jsx";

//admin
import DashboardAdmin from "./pages/DashboardAdmin.jsx";
import Bodega from "./pages/Bodega.jsx";

import "./styles/main.css";
import Inicio from "./pages/Inicio.jsx";
import Sucursal from "./pages/Sucursal.jsx";
import Productos from "./pages/Productos.jsx";
import Inventario from "./pages/Inventario.jsx";
import Categoria from "./pages/Categoria.jsx";
import Proveedor from "./pages/Proveedor.jsx";
import Vendedores from "./pages/Vendedores.jsx";
import Aprovisionamiento from "./pages/Aprovisionamiento.jsx";

//vendedor
import DashboardVendedor from "./pages/Vendedor/DashboardVendedor.jsx";
import InicioVendedor from "./pages/Vendedor/InicioVendedor.jsx";
import AprovisionamientoProveedor from "./pages/Vendedor/AprovicionamientoProveedor.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<RedireccionPorRol />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["Administrador"]}>
                <DashboardAdmin />
              </ProtectedRoute>
            }
          >
            <Route index element={<Inicio />} />
            <Route path="sucursal" element={<Sucursal />} />
            <Route path="bodega/:idSucursal" element={<Bodega />} />
            <Route path="productos" element={<Productos />} />
            <Route path="inventario" element={<Inventario />} />

            <Route path="categorias" element={<Categoria />} />
            <Route path="proveedores" element={<Proveedor />} />
            <Route path="vendedores/:rutProveedor" element={<Vendedores />} />

            <Route path="aprovisionamiento" element={<Aprovisionamiento />} />
          </Route>

          <Route
            path="/vendedor"
            element={
              <ProtectedRoute allowedRoles={["Vendedor"]}>
                <DashboardVendedor />
              </ProtectedRoute>
            }
          >
            <Route index element={<InicioVendedor />} />
            <Route path="compra" element={<AprovisionamientoProveedor />} />
          </Route>

          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
