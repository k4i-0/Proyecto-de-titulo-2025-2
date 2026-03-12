import { Routes, Route } from "react-router-dom";
import DashboardVendedor from "../pages/Vendedor/DashboardVendedor.jsx";
import InicioVendedor from "../pages/Vendedor/InicioVendedor.jsx";
import AprovisionamientoProveedor from "../pages/Vendedor/AprovicionamientoProveedor.jsx";

const VendedorRouter = () => {
  return (
    <Routes>
      <Route element={<DashboardVendedor />}>
        <Route index element={<InicioVendedor />} />
        <Route path="compra" element={<AprovisionamientoProveedor />} />
      </Route>
    </Routes>
  );
};

export default VendedorRouter;
