import { Routes, Route } from "react-router-dom";
import DashboardVendedor from "../pages/Vendedor/DashboardVendedor.jsx";
import InicioVendedor from "../pages/Vendedor/InicioVendedor.jsx";
import AprovisionamientoProveedor from "../pages/Vendedor/AprovicionamientoProveedor.jsx";
import GestionInventario from "../pages/Vendedor/GestionInventario.jsx";

import GestionDespachos from "../pages/Vendedor/GestionDespachos.jsx";

import DetalleOrdenCompra from "../pages/Vendedor/DetalleOrdenCompra.jsx";

import NoEncontrado from "../pages/Compartidas/NoEncontrado.jsx";

const VendedorRouter = () => {
  return (
    <Routes>
      <Route element={<DashboardVendedor />}>
        <Route index element={<InicioVendedor />} />
        <Route path="compra" element={<AprovisionamientoProveedor />} />
        <Route path="inventario" element={<GestionInventario />} />
        <Route
          path="/gestion/despachos/:nombreOrden?"
          element={<GestionDespachos />}
        />
        <Route
          path="/detalle/orden/:nombreOrden?"
          element={<DetalleOrdenCompra />}
        />

        <Route path="*" element={<NoEncontrado />} />
      </Route>
    </Routes>
  );
};

export default VendedorRouter;
