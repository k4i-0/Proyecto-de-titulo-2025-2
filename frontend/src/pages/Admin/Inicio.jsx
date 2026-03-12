// // import { useState, useEffect } from "react";
// import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
// import {
//   Row,
//   Col,
//   Card,
//   Button,
//   Typography,
//   Alert,
//   Statistic,
//   Divider,
// } from "antd";

// const { Title, Text } = Typography;

// import { useAuth } from "../context/AuthContext";

// // import { useNavigate } from "react-router-dom";

// //funciones
// // import obtenerSucursales from "../services/inventario/Sucursal.service";

// export default function Inicio() {
//   const { user } = useAuth();
//   // const [flag, setFlag] = useState(false);
//   // const [mensaje, setMensaje] = useState("");

//   // const navigate = useNavigate();

//   // useEffect(() => {
//   //   const consultaSucursal = async () => {
//   //     const respuesta = await obtenerSucursales();
//   //     //console.log(respuesta);
//   //     if (respuesta.status === 200) {
//   //       setFlag(false);
//   //       setMensaje("");
//   //     }
//   //     if (respuesta.status === 204) {
//   //       setFlag(true);
//   //       setMensaje(
//   //         "No existen sucursales disponibles, debe crear una sucursal"
//   //       );
//   //     }
//   //   };
//   //   consultaSucursal();
//   // }, []);
//   return (
//     <>
//       <Row justify="center" align="middle" style={{ margin: 20 }}>
//         <Title level={1}>Bienvenido {user.nombre}</Title>
//       </Row>
//       <Row justify="start" align="middle" gutter={16}>
//         <Divider
//           orientation="left"
//           orientationMargin={0}
//           style={{ borderColor: "#000" }}
//         >
//           <Title type="success" level={3}>
//             Indicadores Diarios
//           </Title>
//         </Divider>
//       </Row>

//       <Row
//         justify="center"
//         align="middle"
//         gutter={16}
//         style={{ marginTop: 20, textAlign: "center" }}
//       >
//         <Col style={{ marginBottom: 20 }}>
//           <Card
//             hoverable
//             title="Ventas Totales"
//             style={{ width: 200, height: 180 }}
//             variant="borderless"
//           >
//             <Statistic
//               formatter={() => "20.000.000"}
//               value={20000000}
//               precision={0}
//               valueStyle={{ color: "#3f8600" }}
//               prefix="$"
//             />
//             <Text type="success">M</Text>
//           </Card>
//         </Col>
//         <Col style={{ marginBottom: 20 }}>
//           <Card
//             hoverable
//             title="Sucursales Activas"
//             style={{ width: 200, height: 180 }}
//           >
//             <Title level={2}>2</Title>
//             <Text type="success">Sucursales</Text>
//           </Card>
//         </Col>
//         <Col style={{ marginBottom: 20 }}>
//           <Card
//             hoverable
//             title="Productos Vendidos"
//             style={{ width: 200, height: 180 }}
//           >
//             <Title level={2}>1500</Title>
//             <Text type="success">Productos</Text>
//           </Card>
//         </Col>
//         <Col style={{ marginBottom: 20 }}>
//           <Card
//             hoverable
//             title="Mayor venta"
//             style={{ width: 200, height: 180 }}
//           >
//             <Title level={2}>$1.500.000</Title>
//             <Text type="success">Sucusal A</Text>
//           </Card>
//         </Col>
//       </Row>

//       {/* Kpis Financieros Relevantes */}
//       <Row style={{ margin: 20 }}>
//         <Divider orientation="left" style={{ borderColor: "#000" }}>
//           <Title type="success" level={3}>
//             Indicadores Financieros Mensuales
//           </Title>
//         </Divider>
//       </Row>
//       <Row
//         justify="center"
//         align="middle"
//         gutter={16}
//         style={{ marginTop: "20", textAlign: "center" }}
//       >
//         <Col style={{ marginBottom: 20 }}>
//           <Card
//             hoverable
//             title="Margen Utilitario"
//             style={{ width: "auto", height: 180 }}
//           >
//             {/* (Ingresos Totales-Costos Totales) / Ingresos Totales*/}
//             <Title level={2}>1.500.000</Title>
//             <Text type="success">Millones</Text>
//           </Card>
//         </Col>

//         <Col style={{ marginBottom: 20 }}>
//           <Card
//             hoverable
//             title="Rotacion Inventario"
//             style={{ width: "auto", height: 180 }}
//           >
//             {/* Valor Venta / Valor Promedio Inventario */}
//             <Title level={2}>2</Title>
//             <Text type="success">Cantidad</Text>
//           </Card>
//         </Col>

//         <Col style={{ marginBottom: 20 }}>
//           <Card
//             hoverable
//             title="Productos Mas vendido"
//             style={{ width: "auto", height: 180 }}
//           >
//             <Title level={3}>Producto A</Title>
//             <Text type="success">n veces</Text>
//           </Card>
//         </Col>

//         <Col style={{ marginBottom: 20 }}>
//           <Card
//             hoverable
//             title="Productos menos vendido"
//             style={{ width: "auto", height: 180 }}
//           >
//             <Title level={3}>Producto b</Title>
//             <Text type="danger">x veces</Text>
//           </Card>
//         </Col>

//         <Col style={{ marginBottom: 20 }}>
//           {/* Perdidas por productos dañados, vencidos , robados, o consumidos internamente */}
//           <Card
//             hoverable
//             title="Perdidas Stock"
//             style={{ width: "auto", height: 180 }}
//           >
//             <Title level={3}>25.000.000</Title>
//             <Text type="danger">Millones</Text>
//           </Card>
//         </Col>
//       </Row>
//     </>
//   );
// }

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
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  ShopOutlined,
  RiseOutlined,
  FallOutlined,
  UserOutlined,
  InboxOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  FireOutlined,
  TrophyOutlined,
  EyeOutlined,
  SettingOutlined,
  BankOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

import { useAuth } from "../../context/AuthContext";

import Cookies from "js-cookie";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
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
      key: "1",
      sucursal: "Sucursal Centro",
      ventasHoy: 1250000,
      ventasAyer: 1150000,
      transacciones: 285,
      ticketPromedio: 4385,
      estado: "Activa",
      tendencia: "up",
      cambio: 8.7,
    },
    {
      key: "2",
      sucursal: "Sucursal Mall",
      ventasHoy: 1580000,
      ventasAyer: 1620000,
      transacciones: 342,
      ticketPromedio: 4620,
      estado: "Activa",
      tendencia: "down",
      cambio: -2.5,
    },
    {
      key: "3",
      sucursal: "Sucursal Plaza",
      ventasHoy: 980000,
      ventasAyer: 920000,
      transacciones: 198,
      ticketPromedio: 4949,
      estado: "Activa",
      tendencia: "up",
      cambio: 6.5,
    },
    {
      key: "4",
      sucursal: "Sucursal Norte",
      ventasHoy: 750000,
      ventasAyer: 780000,
      transacciones: 165,
      ticketPromedio: 4545,
      estado: "Activa",
      tendencia: "down",
      cambio: -3.8,
    },
  ];

  // Actividad reciente
  const actividadReciente = [
    {
      tipo: "venta",
      descripcion: "Venta completada en Sucursal Centro",
      monto: "$45.800",
      tiempo: "Hace 2 minutos",
      color: "green",
    },
    {
      tipo: "inventario",
      descripcion: "Stock bajo: Leche Entera 1L",
      sucursal: "Sucursal Mall",
      tiempo: "Hace 15 minutos",
      color: "orange",
    },
    {
      tipo: "empleado",
      descripcion: "Nuevo turno iniciado",
      empleado: "Juan Pérez",
      tiempo: "Hace 30 minutos",
      color: "blue",
    },
    {
      tipo: "venta",
      descripcion: "Venta completada en Sucursal Plaza",
      monto: "$128.500",
      tiempo: "Hace 45 minutos",
      color: "green",
    },
  ];

  const columnasSucursales = [
    {
      title: "Sucursal",
      dataIndex: "sucursal",
      key: "sucursal",
      render: (text, record) => (
        <Space>
          <Avatar
            icon={<ShopOutlined />}
            style={{ backgroundColor: "#1890ff" }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <Badge status="success" text={record.estado} />
          </div>
        </Space>
      ),
    },
    {
      title: "Ventas Hoy",
      dataIndex: "ventasHoy",
      key: "ventasHoy",
      render: (value) => (
        <Text strong style={{ fontSize: "15px" }}>
          ${value.toLocaleString("es-CL")}
        </Text>
      ),
    },
    {
      title: "Transacciones",
      dataIndex: "transacciones",
      key: "transacciones",
      render: (value) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: "Ticket Promedio",
      dataIndex: "ticketPromedio",
      key: "ticketPromedio",
      render: (value) => `$${value.toLocaleString("es-CL")}`,
    },
    {
      title: "Tendencia",
      key: "tendencia",
      render: (_, record) => (
        <Space>
          {record.tendencia === "up" ? (
            <ArrowUpOutlined style={{ color: "#52c41a" }} />
          ) : (
            <ArrowDownOutlined style={{ color: "#ff4d4f" }} />
          )}
          <Text
            style={{
              color: record.tendencia === "up" ? "#52c41a" : "#ff4d4f",
              fontWeight: 500,
            }}
          >
            {record.cambio > 0 ? "+" : ""}
            {record.cambio}%
          </Text>
        </Space>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: () => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate("/admin/sucursales")}
        >
          Ver Detalles
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
              <Button icon={<BarChartOutlined />} size="large">
                Reportes
              </Button>
              <Button
                type="primary"
                icon={<SettingOutlined />}
                size="large"
                onClick={() => navigate("/admin/configuracion")}
              >
                Configuración
              </Button>
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

      {/* Tabla de Sucursales */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <BankOutlined />
                <span>Rendimiento por Sucursal</span>
              </Space>
            }
            extra={
              <Button type="link" onClick={() => navigate("/admin/sucursales")}>
                Ver Todas
              </Button>
            }
          >
            <Table
              columns={columnasSucursales}
              dataSource={ventasPorSucursal}
              pagination={false}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Actividad Reciente</span>
              </Space>
            }
            style={{ padding: "12px 24px" }}
          >
            <Timeline
              items={actividadReciente.map((item) => ({
                color: item.color,
                children: (
                  <div>
                    <Text strong style={{ display: "block" }}>
                      {item.descripcion}
                    </Text>
                    {item.monto && (
                      <Text style={{ color: "#52c41a", fontWeight: 500 }}>
                        {item.monto}
                      </Text>
                    )}
                    {item.sucursal && (
                      <Text type="secondary"> - {item.sucursal}</Text>
                    )}
                    {item.empleado && (
                      <Text type="secondary"> - {item.empleado}</Text>
                    )}
                    <div>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {item.tiempo}
                      </Text>
                    </div>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
