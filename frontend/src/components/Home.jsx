import React from "react";

import Inicio from "./Inicio";
import Bodega from "./inventario/Bodega";
import Categoria from "./inventario/Categoria";
import Productos from "./inventario/Productos";
import Sucursal from "./inventario/Sucursal";
import Inventario from "./inventario/Inventario";

export default function Home({ nombreRol, vista }) {
  return (
    <div style={{ height: "100%" }}>
      <h3
        style={{
          textAlign: "center",
          padding: "10px",
        }}
      >
        Bienvenido {nombreRol}
      </h3>
      <div>
        {vista === "home" && <Inicio />}
        {vista === "productos" && <Productos />}
        {vista === "categorias" && <Categoria />}
        {vista === "inventario" && <Inventario />}
        {vista === "sucursal" && <Sucursal />}
        {vista === "bodega" && <Bodega />}
      </div>
    </div>
  );
}
