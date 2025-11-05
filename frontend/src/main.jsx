import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./context/ProteccionRutas.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
//import "bootstrap/dist/css/bootstrap.min.css";

import Login from "./pages/login.jsx";
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

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["Administrador"]}>
                <DashboardAdmin />
              </ProtectedRoute>
            }
          >
            <Route index element={<Inicio />} />
            <Route path="/sucursal" element={<Sucursal />} />
            <Route path="/bodega/:idSucursal" element={<Bodega />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/categorias" element={<Categoria />} />
            <Route path="/categorias" element={<Categoria />} />
            <Route path="/proveedores" element={<Proveedor />} />
            <Route path="/vendedores/:rutProveedor" element={<Vendedores />} />
          </Route>

          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["Vendedor"]}>
                <DashboardAdmin />
              </ProtectedRoute>
            }
          ></Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
