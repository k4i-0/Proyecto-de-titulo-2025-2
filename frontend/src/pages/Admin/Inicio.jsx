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
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import "./Inicio.css";

const { Title, Text } = Typography;

import { useAuth } from "../../context/AuthContext";

import Cookies from "js-cookie";

//funciones backend
import obtenerSucursales from "../../services/inventario/Sucursal.service";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sucursales, setSucursales] = useState();

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
  const recuperarSucursales = async () => {
    try {
      const respuesta = await obtenerSucursales();
      if (respuesta.status === 200) {
        //console.log(respuesta.data);
        setSucursales(respuesta.data);
        notification.success({
          message: "Sucursales obtenidas exitamente!!",
        });
        return;
      }
      notification.error({
        message: respuesta.error || "error al cargar sucursales!!",
      });
    } catch (error) {
      notification.error({
        message: error || "error desconocido, contacte a soporte",
      });
      console.log(error);
    }
  };

  useEffect(() => {
    recuperarSucursales();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [esCaja, setEsCaja] = useState(
    () => Cookies.get("modoCaja") === "true",
  );

  //usuario
  const { user } = useAuth();

  //handlers
  const handleChange = (checked) => {
    Cookies.set("modoCaja", checked);
    setEsCaja(checked); // actualiza estado → re-renderiza
  };

  // Datos de ventas por sucursal
  const ventasPorSucursal = [
    {
      key: "100",
      sucursal: "Sucursal Centro",
      ventasHoy: 1250000,
      colabActivos: 10,
      ventasAyer: 1150000,
      transacciones: 285,
      ticketPromedio: 4385,
      estado: "Activa",
      tendencia: "up",
      cambio: 8.7,
    },
  ];

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

  const columnasSucursales = [
    {
      title: "Sucursal",
      dataIndex: "nombre",
      key: "nombre",
      render: (text) => (
        <Space>
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Estado",
      key: "estado",
      dataIndex: "estado",
      render: (text) => (
        <Space>
          <div>
            <Badge status="success" text={text} />
          </div>
        </Space>
      ),
    },
    {
      title: "Ventas Hoy",
    },
    {
      title: "Colaboradores Activos",
      key: "colabActivos",
      dataIndex: "colabActivos",
      render: (text) => (
        <Space>
          <div style={{ textAlign: "center" }}>
            <Text>{text}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Administracion",
      key: "acciones",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/admin/sucursal/${record.idSucursal}`)}
        >
          Ir sucursal
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

  const totalVentasHoy = ventasPorSucursal.reduce(
    (acc, curr) => acc + curr.ventasHoy,
    0,
  );

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

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Title level={1} style={{ marginBottom: 24, textAlign: "center" }}>
        Panel de Administración
      </Title>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} style={{ margin: 0, marginBottom: 4 }}>
              Bienvenido {user.nombre}
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
          <Col>
            <Space>
              <Switch
                checked={esCaja}
                onChange={handleChange}
                checkedChildren="Caja"
                unCheckedChildren="Admin"
              />
              <span>{esCaja ? "Modo Caja" : "Modo Administración"}</span>

              {/* <Button
                type="primary"
                icon={<SettingOutlined />}
                size="large"
                onClick={() => navigate("/admin/configuracion")}
              >
                Configuración
              </Button> */}
            </Space>
          </Col>
        </Row>
      </div>

      {/* Métricas Principales */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={<span>Ventas Totales</span>}
              value={totalVentasHoy}
              precision={0}
              prefix="$"
            />
          </Card>
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
