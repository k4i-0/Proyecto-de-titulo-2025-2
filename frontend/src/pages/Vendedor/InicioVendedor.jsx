import React from "react";

import { Row, Col, Typography, Button } from "antd";
const { Title } = Typography;

import { useNavigate } from "react-router-dom";

export default function InicioVendedor() {
  const navigate = useNavigate();
  return (
    <>
      <Row>
        <Col span={24} style={{ marginTop: 20, textAlign: "center" }}>
          <Title level={1}>Bienvenido Vendedor</Title>
        </Col>
      </Row>
      <Row gutter={16} justify="center" style={{ marginTop: 50 }}>
        <Col>
          <Button
            style={{ padding: 40, borderRadius: 10 }}
            onClick={() => navigate("compra")}
          >
            Proveedores
          </Button>
        </Col>
        <Col>
          <Button style={{ padding: 40, borderRadius: 10 }} disabled>
            Gestión de Ventas
          </Button>
        </Col>
        <Col>
          <Button style={{ padding: 40, borderRadius: 10 }} disabled>
            Gestión de Clientes
          </Button>
        </Col>
      </Row>
    </>
  );
}
