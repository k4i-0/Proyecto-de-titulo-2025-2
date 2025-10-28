import React from "react";

import Inicio from "./Inicio";
import Bodega from "./inventario/Bodega";
import Categoria from "./inventario/Categoria";
import Productos from "./inventario/Productos";
import Sucursal from "./inventario/Sucursal";
import Inventario from "./inventario/Inventario";

export default function Home({ nombreRol, vista, onCambiarVista }) {
  return (
    <div style={{ height: "100%" }}>
      <h3
        style={{
          textAlign: "center",
          padding: "10px",
        }}
      ></h3>
      <div>
        {vista === "home" && (
          <Inicio nombreRol={nombreRol} onCambiarVista={onCambiarVista} />
        )}
        {vista === "productos" && <Productos onCambiarVista={onCambiarVista} />}
        {vista === "categorias" && (
          <Categoria onCambiarVista={onCambiarVista} />
        )}
        {vista === "inventario" && (
          <Inventario onCambiarVista={onCambiarVista} />
        )}
        {vista === "sucursal" && <Sucursal onCambiarVista={onCambiarVista} />}
        {vista === "bodega" && <Bodega onCambiarVista={onCambiarVista} />}
      </div>
    </div>
  );
}
