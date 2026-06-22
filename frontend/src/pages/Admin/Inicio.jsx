import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Button,
  Space,
  Table,
  Progress,
  Tag,
  Avatar,
  Divider,
  Badge,
  Timeline,
  List,
  Switch,
  notification,
  Skeleton,
} from "antd";
import {
  BarChartOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  BankOutlined,
  ShoppingCartOutlined,
  ProductOutlined,
  ShopOutlined,
  TeamOutlined,
  TruckOutlined,
  InboxOutlined,
  DollarOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import "./Inicio.css";

const { Title, Text } = Typography;

import { useAuth } from "../../context/AuthContext";

import Cookies from "js-cookie";

//funciones metricas dashboard
import {
  obtenerMetricasDashboard,
  obtenerMetricasSucursalDashboard,
} from "../../services/Metricas.service";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sucursales, setSucursales] = useState();
  const [metricas, setMetricas] = useState(null);

  /**
   * Modificar
   {
  "idSucursal": 1,
  "nombre": "Sucursal Centro",
  "estado": "Activa",
  "ventasHoy": 1250000,
  "colabActivos": 10,
  }
  *Esdo debe traer una funcion de backend
   */

  const recuperarMetricas = async () => {
    try {
      const respuesta = await obtenerMetricasDashboard();

      if (respuesta.status === 200) {
        setMetricas(respuesta.data);

        return;
      }
      notification.error({
        message: respuesta.error || "error al cargar métricas del dashboard!!",
      });
    } catch (error) {
      notification.error({
        message: error || "error desconocido, contacte a soporte",
      });
      console.log(error);
    }
  };

  const recuperarMetricasSucursal = async () => {
    try {
      const respuesta = await obtenerMetricasSucursalDashboard();

      if (respuesta.status === 200) {
        //console.log(respuesta.data);

        setSucursales(respuesta.data);
        notification.success({
          message: "Métricas por sucursal obtenidas exitamente!!",
        });
        return;
      }
      notification.error({
        message: respuesta.error || "error al cargar métricas por sucursal!!",
      });
    } catch (error) {
      notification.error({
        message: error || "error desconocido, contacte a soporte",
      });
      console.log(error);
    }
  };

  useEffect(() => {
    recuperarMetricas();
    recuperarMetricasSucursal();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  //usuario
  const { user } = useAuth();

  // Actividad reciente
  // const actividadReciente = [
  //   {
  //     tipo: "venta",
  //     descripcion: "Venta completada en Sucursal Centro",
  //     monto: "$45.800",
  //     tiempo: "Hace 2 minutos",
  //     color: "green",
  //   },
  //   {
  //     tipo: "inventario",
  //     descripcion: "Stock bajo: Leche Entera 1L",
  //     sucursal: "Sucursal Mall",
  //     tiempo: "Hace 15 minutos",
  //     color: "orange",
  //   },
  //   {
  //     tipo: "empleado",
  //     descripcion: "Nuevo turno iniciado",
  //     empleado: "Juan Pérez",
  //     tiempo: "Hace 30 minutos",
  //     color: "blue",
  //   },
  //   {
  //     tipo: "venta",
  //     descripcion: "Venta completada en Sucursal Plaza",
  //     monto: "$128.500",
  //     tiempo: "Hace 45 minutos",
  //     color: "green",
  //   },
  // ];

  const formatearDinero = (valor) => {
    const numero = Number(valor);

    if (isNaN(numero)) return "$ 0";

    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numero);
  };

  const columnasSucursales = [
    {
      title: "Sucursal",
      dataIndex: "nombre",
      key: "nombre",
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado) => (
        <Badge
          status={estado === "Abierta" ? "success" : "default"}
          text={estado}
        />
      ),
    },
    {
      title: "Ventas Hoy",
      dataIndex: "ventasHoy",
      key: "ventasHoy",
      align: "right", // Alineado a la derecha por ser moneda
      render: (total) => formatearDinero(total), // Usando tu función de formato
    },
    {
      title: "Colaboradores Activos",
      dataIndex: "colabActivos",
      key: "colabActivos",
      align: "center",
    },
    {
      title: "Acciones",
      key: "acciones",
      align: "center",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/admin/sucursal/${record.idSucursal}`)}
        >
          Detalle
        </Button>
      ),
    },
  ];

  // // Accesos rápidos
  // const accesoRapido = [
  //   {
  //     title: "Colaboradores",
  //     icon: <TeamOutlined style={{ fontSize: 32 }} />,
  //     description: "Gestionar personal",
  //     color: "#1890ff",
  //     path: "/admin/gestion/colaboradores",
  //     stats: "24 activos",
  //   },
  //   {
  //     title: "Sucursales",
  //     icon: <ShopOutlined style={{ fontSize: 32 }} />,
  //     description: "Administrar locales",
  //     color: "#52c41a",
  //     path: "/admin/sucursales",
  //     stats: "4 activas",
  //   },
  //   {
  //     title: "Inventario",
  //     icon: <InboxOutlined style={{ fontSize: 32 }} />,
  //     description: "Control de stock",
  //     color: "#faad14",
  //     path: "/admin/inventario",
  //     stats: "1,250 productos",
  //   },
  //   {
  //     title: "Reportes",
  //     icon: <BarChartOutlined style={{ fontSize: 32 }} />,
  //     description: "Análisis y estadísticas",
  //     color: "#722ed1",
  //     path: "/admin/reportes",
  //     stats: "Ver todos",
  //   },
  // ];

  const accesosDirectos = [
    {
      title: "Solicitudes Compra",
      icon: <InboxOutlined />,
      path: "/admin/gestion/solicitudes_compra",
      tone: "teal",
    },
    {
      title: "Compra Directa",
      icon: <ShoppingCartOutlined />,
      path: "/admin/gestion/compra_directa",
      tone: "amber",
    },
    {
      title: "Inventario",
      icon: <ProductOutlined />,
      path: "/admin/inventario",
      tone: "teal",
    },
    {
      title: "Sucursales",
      icon: <ShopOutlined />,
      path: "/admin/sucursales",
      tone: "blue",
    },
    {
      title: "Proveedores",
      icon: <TruckOutlined />,
      path: "/admin/proveedores",
      tone: "coral",
    },
    {
      title: "Colaboradores",
      icon: <TeamOutlined />,
      path: "/admin/gestion/colaboradores",
      tone: "indigo",
    },
  ];

  const CardEstatistica = ({
    loading,
    title,
    value,
    prefix,
    children,
    valueStyle,
  }) => (
    <Card
      hoverable
      className="stat-card"
      //bordered={false}
      style={{ height: "160px", borderRadius: "12px" }} // Altura fija para armonía
    >
      <Skeleton loading={loading} active paragraph={{ rows: 2 }}>
        <Statistic
          title={title}
          value={value}
          prefix={prefix}
          valueStyle={valueStyle}
        />
        {children}
      </Skeleton>
    </Card>
  );

  return (
    <div
      style={{
        padding: "24px",
        //background: "#abaeb2",
        minHeight: "100vh",
        height: "100%",
      }}
    >
      {/* <Title level={1} style={{ marginBottom: 24, textAlign: "center" }}>
        Panel de Administración
      </Title> */}
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} style={{ margin: 0, marginBottom: 4 }}>
              Bienvenido {user.nombre}, a tu panel de administración
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

      {/* Métricas Principales */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <CardEstatistica
            loading={!metricas}
            title="Ventas Totales"
            value={metricas?.totalVentasDelDia || 0}
            prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
            valueStyle={{ color: "#3f8600" }}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <CardEstatistica
            loading={!metricas}
            title="Artículos Vendidos"
            value={metricas?.cantidadProductosVendidos || 0}
            prefix={<ShoppingCartOutlined style={{ color: "#1890ff" }} />}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <CardEstatistica
            loading={!metricas}
            title="Producto Estrella"
            value={metricas?.productoMasVendido?.nombre || "N/A"}
            prefix={<TrophyOutlined style={{ color: "#722ed1" }} />}
            valueStyle={{ fontSize: "18px", color: "#722ed1" }}
          >
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">Cantidad: </Text>
              <Text strong>
                {metricas?.productoMasVendido?.cantidadVendida || 0}
              </Text>
            </div>
          </CardEstatistica>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <CardEstatistica
            loading={!metricas}
            title="Hora de Mayor Flujo"
            value={
              metricas?.horaPicoClientes?.hora
                ? `${metricas.horaPicoClientes.hora}:00`
                : "N/A"
            }
            prefix={<ClockCircleOutlined style={{ color: "#fa8c16" }} />}
          >
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">Ventas: </Text>
              <Text strong>
                {metricas?.horaPicoClientes?.cantidadVentas || 0}
              </Text>
            </div>
          </CardEstatistica>
        </Col>
      </Row>
      {/* Accesos Rápidos y Actividad Reciente
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <FireOutlined />
                <span>Accesos Rápidos</span>
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              {accesoRapido.map((item, index) => (
                <Col xs={12} sm={12} md={6} key={index}>
                  <Card
                    hoverable
                    onClick={() => navigate(item.path)}
                    style={{
                      textAlign: "center",
                      borderRadius: 8,
                      border: `2px solid ${item.color}20`,
                    }}
                  >
                    <div style={{ color: item.color, marginBottom: 12 }}>
                      {item.icon}
                    </div>
                    <Title level={5} style={{ margin: "8px 0 4px" }}>
                      {item.title}
                    </Title>
                    <Text
                      type="secondary"
                      style={{ fontSize: "12px", display: "block" }}
                    >
                      {item.description}
                    </Text>
                    <Tag
                      color={item.color}
                      style={{ marginTop: 12, borderRadius: 12 }}
                    >
                      {item.stats}
                    </Tag>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row> */}

      {/* Acceso Directo */}
      <section className="admin-quick-access">
        <div className="admin-quick-access__head">
          <Title level={2} style={{ margin: 0 }}>
            Acceso Directo
          </Title>
        </div>
        <div
          style={{
            display: "flex",
            gap: 7,
            flexWrap: "nowrap",
            overflowX: "auto",
          }}
        >
          {accesosDirectos.map((item) => (
            <Card
              key={item.title}
              hoverable
              className={`admin-quick-card admin-quick-card--${item.tone}`}
              onClick={() => navigate(item.path)}
              style={{
                minWidth: 100,
                textAlign: "center",
                flex: "1 1 0",
              }}
              styles={{ body: { padding: "12px 8px" } }}
            >
              <div style={{ fontSize: 26, marginBottom: 4 }}>{item.icon}</div>
              <Text style={{ fontSize: 18, fontWeight: 600 }}>
                {item.title}
              </Text>
            </Card>
          ))}
        </div>
      </section>

      {/* Tabla de Sucursales */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <BankOutlined />
                <span>Rendimiento por Sucursal</span>
              </Space>
            }
            extra={
              <>
                <Button icon={<BarChartOutlined />} size="large">
                  Reportes
                </Button>
                <Button
                  type="link"
                  onClick={() => navigate("/admin/sucursales")}
                >
                  Ver Todas
                </Button>
              </>
            }
          >
            <Table
              columns={columnasSucursales}
              dataSource={sucursales}
              pagination={false}
              rowKey="idSucursal"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
