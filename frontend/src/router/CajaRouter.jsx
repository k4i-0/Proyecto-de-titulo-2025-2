import { Routes, Route } from "react-router-dom";

import MenuPrincipal from "../pages/Sistema Caja/MenuPrincipal.jsx";

const CajaRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<MenuPrincipal />} />
    </Routes>
  );
};

export default CajaRouter;
