import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Typography,
  Card,
  Statistic,
  Space,
  Button,
  Divider,
} from "antd";
import {
  ShoppingCartOutlined,
  TruckOutlined,
  ClockCircleOutlined,
  ProductOutlined,
  FileTextOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const colorMap = {
  teal: { icon: "#13c2c2", bg: "#e6fffb", border: "#87e8de" },
  amber: { icon: "#faad14", bg: "#fffbe6", border: "#ffe58f" },
  blue: { icon: "#1890ff", bg: "#e6f7ff", border: "#91d5ff" },
  indigo: { icon: "#722ed1", bg: "#f9f0ff", border: "#d3adf7" },
};

export default function InicioVendedor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Accesos directos del vendedor
  const accesosDirectos = [
    {
      title: "Solicitudes de Compra",
      icon: <ShoppingCartOutlined />,
      path: "/vendedor/compra",
      tone: "teal",
      description: "Gestiona solicitudes de compra",
    },
    {
      title: "Control de Productos",
      icon: <ProductOutlined />,
      path: "/vendedor/inventario",
      tone: "amber",
      description: "Administra el inventario de productos",
    },
    {
      title: "Recepción de Despachos",
      icon: <TruckOutlined />,
      path: "/vendedor/despachos",
      tone: "blue",
      description: "Recibe despachos de proveedores",
    },
    {
      title: "Gestión de Despachos",
      icon: <FileTextOutlined />,
      path: "/vendedor/gestion/despachos",
      tone: "indigo",
      description: "Administra despachos realizados",
    },
  ];

  return (
    <div style={{ padding: "24px", minHeight: "100vh" }}>
      {/* Header */}
      <Row align="middle" justify="space-between" style={{ marginBottom: 32 }}>
        <Col>
          <Title level={2} style={{ margin: 0, marginBottom: 4 }}>
            Bienvenido {user?.nombre}, a tu panel de vendedor
          </Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            <ClockCircleOutlined style={{ marginRight: 8 }} />
            {currentTime.toLocaleDateString("es-CL", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            - {currentTime.toLocaleTimeString("es-CL")}
          </Text>
        </Col>
      </Row>

      {/* Métrica rápida */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title={<span style={{ fontSize: "14px" }}>Tu Rol</span>}
              value={user?.rol || "Vendedor"}
              valueStyle={{ color: "#1890ff", fontSize: "20px" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Título de Accesos Rápidos */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
          Acceso Rápido
        </Title>
        <Text type="secondary">Gestiona tu operación diaria</Text>
        <Divider style={{ margin: "12px 0" }} />
      </div>

      {/* Accesos Directos */}
      <Row gutter={[16, 16]}>
        {accesosDirectos.map((acceso, index) => {
          const colors = colorMap[acceso.tone];
          return (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                hoverable
                onClick={() => navigate(acceso.path)}
                style={{
                  borderLeft: `4px solid ${colors.icon}`,
                  backgroundColor: colors.bg,
                  transition: "all 0.3s ease",
                  minHeight: "200px",
                  display: "flex",
                  flexDirection: "column",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 12px 24px rgba(0, 0, 0, 0.15)";
                  e.currentTarget.style.transform = "translateY(-5px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <Space direction="vertical" style={{ flex: 1, width: "100%" }}>
                  <div
                    style={{
                      fontSize: 32,
                      color: colors.icon,
                      marginBottom: 8,
                    }}
                  >
                    {acceso.icon}
                  </div>
                  <Title level={4} style={{ margin: 0, color: "#1f2c47" }}>
                    {acceso.title}
                  </Title>
                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    {acceso.description}
                  </Text>
                  <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
                    <ArrowRightOutlined
                      style={{ fontSize: "16px", color: colors.icon }}
                    />
                  </div>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
