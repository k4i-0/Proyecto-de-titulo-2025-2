import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./context/ProteccionRutas.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "bootstrap/dist/css/bootstrap.min.css";

import App from "./App.jsx";
import Login from "./pages/login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PantallaCompleta from "./pages/codigoPantallaCompleta.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route element={<ProtectedRoute allowedRoles={["Administrador"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
