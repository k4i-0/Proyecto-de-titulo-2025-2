import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Typography,
  Button,
  Card,
  Statistic,
  Space,
  Avatar,
  List,
  Tag,
  Progress,
  Divider,
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
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const { Title, Text } = Typography;

export default function InicioVendedor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Datos de ejemplo para KPIs
  const kpisData = {
    ventasHoy: 450000,
    comisionesHoy: 22500,
    ordenesCompletadas: 12,
    metaDiaria: 500000,
  };

  // Tarjetas de acceso rápido
  const accesoRapido = [
    {
      title: "Compra a Proveedores",
      icon: <ShoppingCartOutlined style={{ fontSize: 40, color: "#52c41a" }} />,
      description: "Gestionar órdenes de compra",
      color: "#52c41a",
      path: "compra",
      enabled: true,
    },
    {
      title: "Gestión de Ventas",
      icon: <DollarOutlined style={{ fontSize: 40, color: "#1890ff" }} />,
      description: "Administrar ventas",
      color: "#1890ff",
      path: "ventas",
      enabled: false,
    },
    {
      title: "Gestión de Clientes",
      icon: <UserOutlined style={{ fontSize: 40, color: "#722ed1" }} />,
      description: "Administrar clientes",
      color: "#722ed1",
      path: "clientes",
      enabled: false,
    },
    {
      title: "Reportes",
      icon: <BarChartOutlined style={{ fontSize: 40, color: "#faad14" }} />,
      description: "Ver estadísticas",
      color: "#faad14",
      path: "reportes",
      enabled: false,
    },
  ];

  // Actividad reciente
  const actividadReciente = [
    {
      tipo: "orden",
      descripcion: "Orden de compra #1234 completada",
      tiempo: "Hace 15 minutos",
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      color: "success",
    },
    {
      tipo: "pendiente",
      descripcion: "Orden de compra #1233 pendiente de aprobación",
      tiempo: "Hace 1 hora",
      icon: <ClockCircleOutlined style={{ color: "#faad14" }} />,
      color: "warning",
    },
    {
      tipo: "inventario",
      descripcion: "Stock actualizado: 45 productos",
      tiempo: "Hace 2 horas",
      icon: <InboxOutlined style={{ color: "#1890ff" }} />,
      color: "processing",
    },
  ];

  const progresoMeta = (kpisData.ventasHoy / kpisData.metaDiaria) * 100;

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100%" }}>
      {/* Header de Bienvenida */}
      <div style={{ marginBottom: 32 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
              ¡Bienvenido, {user.nombre || "Vendedor"}!
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
      </div>

      {/* KPIs Principales */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-modern">
            <Statistic
              title="Ventas de Hoy"
              value={kpisData.ventasHoy}
              precision={0}
              valueStyle={{ color: "#52c41a", fontSize: "28px" }}
              prefix="$"
              suffix={
                <div style={{ fontSize: "14px", marginTop: 8 }}>
                  <RiseOutlined style={{ color: "#52c41a" }} /> +12.5%
                </div>
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="card-modern">
            <Statistic
              title="Comisiones"
              value={kpisData.comisionesHoy}
              precision={0}
              valueStyle={{ color: "#1890ff", fontSize: "28px" }}
              prefix="$"
            />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              5% de las ventas
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="card-modern">
            <Statistic
              title="Órdenes Completadas"
              value={kpisData.ordenesCompletadas}
              valueStyle={{ color: "#722ed1", fontSize: "28px" }}
              prefix={<ShoppingCartOutlined />}
            />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Hoy
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="card-modern">
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ fontSize: "14px" }}>
                Meta Diaria
              </Text>
            </div>
            <Progress
              percent={progresoMeta}
              strokeColor={{
                "0%": "#52c41a",
                "100%": "#237804",
              }}
              status={progresoMeta >= 100 ? "success" : "active"}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                ${kpisData.ventasHoy.toLocaleString("es-CL")} / $
                {kpisData.metaDiaria.toLocaleString("es-CL")}
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Accesos Rápidos */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 16 }}>
          <FireOutlined style={{ marginRight: 8, color: "#ff4d4f" }} />
          Accesos Rápidos
        </Title>
        <Row gutter={[16, 16]}>
          {accesoRapido.map((item, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                hoverable={item.enabled}
                className="card-modern"
                style={{
                  textAlign: "center",
                  opacity: item.enabled ? 1 : 0.6,
                  cursor: item.enabled ? "pointer" : "not-allowed",
                  borderTop: `4px solid ${item.color}`,
                }}
                onClick={() => item.enabled && navigate(item.path)}
              >
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <Avatar
                    size={64}
                    style={{
                      backgroundColor: `${item.color}15`,
                      border: `2px solid ${item.color}`,
                    }}
                    icon={item.icon}
                  />
                  <div>
                    <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                      {item.title}
                    </Title>
                    <Text type="secondary" style={{ fontSize: "13px" }}>
                      {item.description}
                    </Text>
                  </div>
                  {!item.enabled && (
                    <Tag color="default" style={{ marginTop: 8 }}>
                      Próximamente
                    </Tag>
                  )}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Actividad Reciente y Tareas */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Actividad Reciente</span>
              </Space>
            }
            className="card-modern"
          >
            <List
              dataSource={actividadReciente}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor:
                            item.color === "success"
                              ? "#f6ffed"
                              : item.color === "warning"
                              ? "#fffbe6"
                              : "#e6f7ff",
                        }}
                        icon={item.icon}
                      />
                    }
                    title={item.descripcion}
                    description={
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {item.tiempo}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <TrophyOutlined />
                <span>Objetivos del Mes</span>
              </Space>
            }
            className="card-modern"
          >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text strong>Ventas Mensuales</Text>
                  <Text type="secondary">75%</Text>
                </div>
                <Progress percent={75} strokeColor="#52c41a" />
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text strong>Nuevos Clientes</Text>
                  <Text type="secondary">60%</Text>
                </div>
                <Progress percent={60} strokeColor="#1890ff" />
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text strong>Satisfacción Cliente</Text>
                  <Text type="secondary">90%</Text>
                </div>
                <Progress percent={90} strokeColor="#722ed1" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
