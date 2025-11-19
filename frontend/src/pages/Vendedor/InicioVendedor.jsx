import React from "react";

import { Row, Col, Typography } from "antd";
const { Title } = Typography;

export default function InicioVendedor() {
  return (
    <>
      <Row>
        <Col span={24} style={{ marginTop: 20, textAlign: "center" }}>
          <Title level={1}>Bienvenido Vendedor</Title>
        </Col>
      </Row>
    </>
  );
}
