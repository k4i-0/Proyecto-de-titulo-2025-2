import { Routes, Route } from "react-router-dom";

import DashboardCajero from "../pages/Cajero/DashboardCajero.jsx";
import InicioCaja from "../pages/Cajero/InicioCaja.jsx";
import NoEncontrado from "../pages/Compartidas/NoEncontrado.jsx";

const CajeroRouter = () => {
  return (
    <Routes>
      <Route element={<DashboardCajero />}>
        <Route index element={<InicioCaja />} />
        <Route path="*" element={<NoEncontrado />} />
      </Route>
    </Routes>
  );
};

export default CajeroRouter;
