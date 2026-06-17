import { Routes, Route } from "react-router-dom";

import MenuPrincipal from "../pages/Sistema Caja/MenuPrincipalCaja.jsx";
import MenuVendedorCaja from "../pages/Sistema Caja/MenuVendedorCaja.jsx";

import { useAuth } from "../context/AuthContext.jsx";

const CajaRouter = () => {
  const { user } = useAuth();

  if (user.nombreRol === "Vendedor") {
    return (
      <Routes>
        <Route path="/" element={<MenuVendedorCaja />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<MenuPrincipal />} />
    </Routes>
  );
};

export default CajaRouter;
