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
import RecepcionOrdenCompra from "../pages/Admin/RecepcionProveedores/RecepcionOrdenCompra.jsx";
import OrdenesCompra from "../pages/Admin/OrdenesCompra/OrdenesCompra.jsx";
import Bitacoras from "../pages/Admin/Bitacoras.jsx";
import IngresoManual from "../pages/Admin/OrdenesCompra/IngresoManual.jsx";
import DetalleCompraDirecta from "../pages/Admin/OrdenesCompra/DetalleCompraDirecta.jsx";

//Ventas
import GestionDescuentos from "../pages/Admin/ventas/GestionDescuentos.jsx";
import GestionCajas from "../pages/Admin/ventas/gestionCajas.jsx";
import DescuentosUnicos from "../pages/Admin/ventas/DescuentosUnicos.jsx";
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
          path="gestion/compra_directa/detalle"
          element={<DetalleCompraDirecta />}
        />
        <Route
          path="gestion/ingreso_manual_inventario"
          element={<IngresoManual />}
        />
        <Route path="gestion/solicitudes_compra" element={<OrdenesCompra />} />
        <Route path="bitacoras" element={<Bitacoras />} />
        <Route
          path="gestion/recepcionar_orden_compra"
          element={<RecepcionOrdenCompra />}
        />
        <Route path="pruebas" element={<Pruebas />} />
        <Route path="*" element={<NoEncontrado />} />

        {/**Modulo de ventas */}
        <Route path="descuentos" element={<GestionDescuentos />} />
        <Route path="gestion/cajas" element={<GestionCajas />} />
        <Route path="descuentos/unicos" element={<DescuentosUnicos />} />
      </Route>
    </Routes>
  );
};

export default AdminRouter;
