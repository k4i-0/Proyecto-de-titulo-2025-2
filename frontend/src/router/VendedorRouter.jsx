import { Routes, Route } from "react-router-dom";
import DashboardVendedor from "../pages/Vendedor/DashboardVendedor.jsx";
import InicioVendedor from "../pages/Vendedor/InicioVendedor.jsx";
import AprovisionamientoProveedor from "../pages/Vendedor/AprovicionamientoProveedor.jsx";
import GestionInventario from "../pages/Vendedor/GestionInventario.jsx";
import RecepcionDespachos from "../pages/Vendedor/RecepcionDespachos.jsx";

import NoEncontrado from "../pages/Compartidas/NoEncontrado.jsx";

const VendedorRouter = () => {
  return (
    <Routes>
      <Route element={<DashboardVendedor />}>
        <Route index element={<InicioVendedor />} />
        <Route path="compra" element={<AprovisionamientoProveedor />} />
        <Route path="inventario" element={<GestionInventario />} />
        <Route
          path="despachos/:rutProveedor?"
          element={<RecepcionDespachos />}
        />

        <Route path="*" element={<NoEncontrado />} />
      </Route>
    </Routes>
  );
};

export default VendedorRouter;
