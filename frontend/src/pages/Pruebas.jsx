import React from "react";

import KPIStats from "../components/Kpis";

export default function Pruebas() {
  return (
    <div>
      <KPIStats
        datos={[
          {
            titulo: "Datos 1",
            valor: 8500000,
            prefijo: "$",
            estiloValor: { color: "#1c2e4a", fontWeight: "bold" },
          },
          {
            titulo: "Datos 2",
            valor: 4300,
            prefijo: "",
            estiloValor: { color: "#3f8600" },
          },
          {
            titulo: "Datos 3",
            valor: 27,
            prefijo: "",
            estiloValor: { color: "#cf1322" },
          },
        ]}
      />
    </div>
  );
}
