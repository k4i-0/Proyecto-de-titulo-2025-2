//import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Typography,
  Card,
  Statistic,
  Space,
  Avatar,
  List,
  Tag,
  Progress,
  Divider,
  Button,
} from "antd";
import {
  ShoppingCartOutlined,
  DollarOutlined,
  TrophyOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  UserOutlined,
  ShopOutlined,
  BarChartOutlined,
  FireOutlined,
  ProductOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

import { useNavigate } from "react-router-dom";

export default function InicioVendedor() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "30px", minHeight: "100%" }}>
      <Title level={2}>Acceso Directo</Title>

      <Button
        style={{ width: 200, height: "auto", padding: "20px" }}
        onClick={() => navigate("/vendedor/compra")}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Space direction="vertical" align="center" size="large">
              <ShoppingCartOutlined style={{ fontSize: 32 }} />

              <Text>Solicitudes De Compras</Text>
            </Space>
          </Col>

          {/* Agrega más tarjetas de acceso directo aquí */}
        </Row>
      </Button>

      <Button
        style={{ width: 200, height: "auto", padding: "20px" }}
        onClick={() => navigate("/vendedor/inventario")}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Space direction="vertical" align="center" size="large">
              <ProductOutlined style={{ fontSize: 32 }} />

              <Text>Control De Productos</Text>
            </Space>
          </Col>

          {/* Agrega más tarjetas de acceso directo aquí */}
        </Row>
      </Button>

      <Button
        style={{ width: 200, height: "auto", padding: "20px" }}
        onClick={() => navigate("/vendedor/despachos")}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Space direction="vertical" align="center" size="large">
              <ProductOutlined style={{ fontSize: 32 }} />

              <Text>Recepcion Despachos</Text>
            </Space>
          </Col>

          {/* Agrega más tarjetas de acceso directo aquí */}
        </Row>
      </Button>
    </div>
  );
}
