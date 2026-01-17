import React from "react";

import Table from "../components/Tabla.jsx";

export default function Pruebas() {
  const columns = [
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
    },
    {
      title: "Edad",
      dataIndex: "edad",
      key: "edad",
    },
  ];
  return (
    <div>
      <Table columns={columns} />
    </div>
  );
}
