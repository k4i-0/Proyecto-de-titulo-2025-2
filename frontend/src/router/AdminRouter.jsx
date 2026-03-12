import { Routes, Route } from "react-router-dom";
import DashboardAdmin from "../pages/Admin/DashboardAdmin.jsx";
import Inicio from "../pages/Admin/Inicio.jsx";
import Sucursal from "../pages/Admin/Inventario/Sucursal.jsx";
import SucursalDetalle from "../pages/Admin/Inventario/SucursalDetalle.jsx";
import Bodega from "../pages/Admin/Inventario/Bodega.jsx";
import Productos from "../pages/Admin/Inventario/Productos.jsx";
import Inventario from "../pages/Admin/Inventario/Inventario.jsx";
import Categoria from "../pages/Admin/Inventario/Categoria.jsx";
import Proveedores from "../pages/Admin/Inventario/Proveedores.jsx";
import GestionColaborador from "../pages/Admin/GestionColaboradores/GestionColaborador.jsx";
import CompraDirecta from "../pages/Admin/OrdenesCompra/CompraDirecta.jsx";
import RecepcionOrdenCompraDirecta from "../pages/Admin/RecepcionProveedores/RecepcionOrdenCompraDirecta.jsx";
import Pruebas from "../pages/Pruebas.jsx";

import NoEncontrado from "../pages/Compartidas/NoEncontrado.jsx";

const AdminRouter = () => {
  return (
    <Routes>
      <Route element={<DashboardAdmin />}>
        <Route index element={<Inicio />} />
        <Route path="sucursales" element={<Sucursal />} />
        <Route path="sucursal/:idSucursal" element={<SucursalDetalle />} />
        <Route path="bodega/:idSucursal" element={<Bodega />} />
        <Route path="productos" element={<Productos />} />
        <Route path="inventario" element={<Inventario />} />
        <Route path="categorias" element={<Categoria />} />
        <Route path="proveedores" element={<Proveedores />} />
        <Route path="gestion/colaboradores" element={<GestionColaborador />} />
        <Route path="gestion/colaboradores/sucursal" element={<Pruebas />} />
        <Route path="gestion/compra_directa" element={<CompraDirecta />} />
        <Route
          path="gestion/recepcionar_compra_directa"
          element={<RecepcionOrdenCompraDirecta />}
        />
        <Route path="pruebas" element={<Pruebas />} />
        <Route path="*" element={<NoEncontrado />} />
      </Route>
    </Routes>
  );
};

export default AdminRouter;
