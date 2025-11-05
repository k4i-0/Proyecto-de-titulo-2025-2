import { useState, useEffect } from "react";
import { Row, Col, Card, Button, Typography, Alert } from "antd";

const { Title } = Typography;

import { useNavigate } from "react-router-dom";

//funciones
import obtenerSucursales from "../services/inventario/Sucursal.service";

export default function Inicio({ nombreRol }) {
  const [flag, setFlag] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const consultaSucursal = async () => {
      const respuesta = await obtenerSucursales();
      //console.log(respuesta);
      if (respuesta.status === 200) {
        setFlag(false);
        setMensaje("");
      }
      if (respuesta.status === 204) {
        setFlag(true);
        setMensaje(
          "No existen sucursales disponibles, debe crear una sucursal"
        );
      }
    };
    consultaSucursal();
  }, []);
  return (
    <>
      <Row justify="center" align="middle">
        <Col span={24} style={{ textAlign: "center", marginBottom: "20px" }}>
          <Title>Bienvenido {nombreRol}</Title>
          <Title level={5}>Gestiona tu negocio de manera eficiente.</Title>
          {flag && <Alert type="warning" showIcon message={mensaje} />}
        </Col>
      </Row>
      <Row
        justify="center"
        align="middle"
        gutter={18}
        style={{ marginTop: 20 }}
      >
        <Col span={8}>
          <Card title="Gestiona tus Sucursales">
            <p>Gestiona tu Sucursal y demás bodegas asociadas.</p>
            <Button variant="primary" onClick={() => navigate("/sucursal")}>
              Ir a Sucursal
            </Button>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Gestiona tu Inventario">
            <p>Administra productos, categorías y stock de manera eficiente.</p>
            <Button
              variant="primary"
              disabled={flag}
              onClick={() => navigate("/inventario")}
            >
              Ir a Inventario
            </Button>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Gestiona tus Proveedores">
            <p>Administra tus proveedores y su apartado de manera eficiente.</p>
            <Button
              disabled={flag}
              variant="primary"
              onClick={() => navigate("/proveedores")}
            >
              Ir a Proveedores
            </Button>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Gestiona tus productos">
            <p>Administra tus productos y su apartado de manera eficiente.</p>
            <Button
              disabled={flag}
              variant="primary"
              onClick={() => navigate("/productos")}
            >
              Ir a Productos
            </Button>
          </Card>
        </Col>
      </Row>
    </>
  );
}
