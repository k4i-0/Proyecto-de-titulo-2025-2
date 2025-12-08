import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Statistic,
  Button,
  Table,
  Typography,
  Space,
  Tag,
  Divider,
  Empty,
  message,
  Drawer,
  Spin,
  List,
  Avatar,
} from "antd";
import {
  ShoppingCartOutlined,
  TeamOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  AppstoreAddOutlined,
  ArrowLeftOutlined,
  RiseOutlined,
  ShopOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

import obtenerInventarios from "../services/inventario/Inventario.service";
import { getAllProveedores } from "../services/inventario/Proveedor.service";
import { obtenerSucursalPorId } from "../services/inventario/Sucursal.service";

export default function SucursalDetalle() {
  const { idSucursal } = useParams();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Datos de ejemplo - Reemplazar con datos reales de tu API
  const [sucursalInfo, setSucursalInfo] = useState();
  const [inventarios, setInventarios] = useState([]);

  //Consulta a api
  const [metricas, setMetricas] = useState({
    ventasDia: 0,
    funcionariosActivos: 0,
    cajasActivas: 0,
    ventasHora: 0,
    crecimiento: 0,
  });
  const [verProveedores, setVerProveedores] = useState(false);
  const [proveedores, setProveedores] = useState([]);

  //llamar api para obtener inventario
  const cargarInventarios = async () => {
    try {
      setLoading(true);
      const response = await obtenerInventarios();
      //console.log("Respuesta inventarios:", response);
      if (!response) {
        message.error("Error al obtener inventarios");
        setInventarios([]);
        return;
      }

      if (response.status === 422) {
        message.warning("No hay productos en el inventario");
        setInventarios([]);
        return;
      }

      // Asumiendo que la respuesta tiene la data en response.data
      const data = response.data || response;
      setInventarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener inventarios:", error);
      message.error("No se pudieron cargar los productos");
      setInventarios([]);
    } finally {
      setLoading(false);
    }
  };
  const cargarMetricas = useCallback(async () => {
    try {
      setLoading(true);
      const sucusal = await obtenerSucursalPorId(idSucursal);
      if (sucusal.status === 200) {
        message.success("Sucursal cargada correctamente");
        setSucursalInfo(sucusal.data);
        setLoading(false);
        return;
      }
      if (sucusal.status === 204) {
        message.info("Sucursal no encontrada");
        setSucursalInfo([]);
        setLoading(false);
        return;
      }
      message.error("Error en el servidor al obtener la sucursal");
      setLoading(false);
      return;
    } catch (error) {
      message.error("Error al cargar métricas");
      console.error("Error al cargar métricas:", error);
      setLoading(false);
      return;
    }
  }, [idSucursal]);
  // const obtenerProveedores = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await getAllProveedores();
  //     console.log("Respuesta proveedores:", response);
  //     if (response.status === 200) {
  //       console.log("Proveedores:", response.data);
  //       setProveedores(response.data);
  //       setLoading(false);
  //       return;
  //     }
  //     if (response.status === 204) {
  //       message.info("No hay proveedores registrados");
  //       setProveedores([]);
  //       setLoading(false);
  //       return;
  //     }
  //     message.error("Error en el servidor al obtener los proveedores");
  //     setLoading(false);
  //   } catch (error) {
  //     message.error("Error al obtener los proveedores");
  //     console.error("Error al obtener los proveedores:", error);
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    cargarInventarios();
    cargarMetricas();
  }, [cargarMetricas]);

  const columnsInventario = [
    {
      title: "Producto",
      dataIndex: "producto",
      key: "producto",
      render: (producto) => producto?.nombre || "N/A",
      //   sorter: (a, b) => a.producto.localeCompare(b.producto),
    },
    {
      title: "Código Producto",
      dataIndex: "producto",
      key: "producto",
      align: "center",
      render: (producto) => producto?.codigo || "N/A",
    },
    {
      title: "Código Lote",
      dataIndex: "lote",
      key: "lote",
      align: "center",
      render: (lote) => lote?.codigo || "N/A",
    },
    {
      title: "Stock Actual",
      dataIndex: "stock",
      key: "stock",
      align: "center",
      sorter: (a, b) => a.stock - b.stock,
      render: (stock, record) => (
        <Text
          strong
          style={{
            color:
              stock === 0
                ? "#ff4d4f"
                : stock < record.stockMinimo
                ? "#faad14"
                : "#52c41a",
          }}
        >
          {stock}
        </Text>
      ),
    },
    // {
    //   title: "Stock Mínimo",
    //   dataIndex: "stockMinimo",
    //   key: "stockMinimo",
    //   align: "center",
    // },
    {
      title: "Ubicación en Bodega",
      dataIndex: "ubicacion",
      key: "ubicacion",
      align: "center",
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      align: "center",
      filters: [
        { text: "Buena", value: "Buena" },
        { text: "Malo", value: "Malo" },
        { text: "Revision", value: "Revision" },
      ],
      onFilter: (value, record) => record.estado === value,
      render: (estado) => {
        const colores = {
          Buena: "success",
          Malo: "error",
          Revision: "warning",
        };
        return <Tag color={colores[estado]}>{estado}</Tag>;
      },
    },
  ];

  const handleGestionProductos = () => {
    // Navegar a la página de gestión de productos
    navigate("/admin/productos");
  };

  // const handleVerProveedores = async () => {
  //   await obtenerProveedores();
  //   setVerProveedores(!verProveedores);
  // };

  return (
    <>
      <Row style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/sucursales")}
            type="primary"
          >
            Volver
          </Button>
        </Col>
      </Row>

      <Row justify="center" style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Space>
              <ShopOutlined style={{ fontSize: "32px", color: "#1890ff" }} />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  {sucursalInfo?.nombre} {idSucursal}
                </Title>
                <Text type="secondary">{sucursalInfo?.direccion}</Text>
              </div>
            </Space>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ventas del Día"
              value={metricas.ventasDia}
              prefix={<DollarOutlined />}
              suffix="CLP"
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Funcionarios Activos"
              value={metricas.funcionariosActivos}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Cajas Activas"
              value={metricas.cajasActivas}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ventas por Hora"
              value={metricas.ventasHora}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Rendimiento de Ventas">
            <Statistic
              title="Crecimiento vs. Mes Anterior"
              value={metricas.crecimiento}
              precision={2}
              valueStyle={{ color: "#3f8600" }}
              prefix={<RiseOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Estado del Inventario">
            <Space direction="vertical" style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text>Productos Disponibles:</Text>
                <Text strong style={{ color: "#52c41a" }}>
                  {inventarios.filter((p) => p.estado === "Disponible").length}
                </Text>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text>Stock Bajo:</Text>
                <Text strong style={{ color: "#faad14" }}>
                  {inventarios.filter((p) => p.estado === "Stock Bajo").length}
                </Text>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text>Agotados:</Text>
                <Text strong style={{ color: "#ff4d4f" }}>
                  {inventarios.filter((p) => p.estado === "Agotado").length}
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col>
          <Button
            type="primary"
            onClick={() =>
              navigate("/admin/gestion/colaboradores/" + idSucursal)
            }
          >
            Administrar Colaboradores
          </Button>
        </Col>
        <Col>
          <Button
            type="primary"
            onClick={() => navigate("/admin/proveedores/" + idSucursal)}
          >
            Ver Proveedores
          </Button>
        </Col>
      </Row>
      {/* <Drawer open={verProveedores} onClose={() => setVerProveedores(false)}>
        <Row justify="end" style={{ marginBottom: 16 }}>
          <Col>
            <Button
              type="default"
              onClick={() => navigate("/admin/aprovisionamiento/" + idSucursal)}
            >
              <PlusOutlined />
            </Button>
          </Col>
        </Row>
        <Title style={{ textAlign: "center" }} level={4}>
          Proveedores de la Sucursal
        </Title>

        {loading ? (
          <Spin tip="Loading" size="large" fullscreen>
            Cargando...
          </Spin>
        ) : proveedores.length > 0 ? (
          <>
            <List
              dataSource={proveedores}
              renderItem={(prov) => (
                <List.Item key={prov.idProveedor}>
                  <List.Item.Meta
                    title={
                      <Space>
                        <UserOutlined />
                        {prov.nombre}
                        <Tag color={prov.estado === "Activo" ? "green" : "red"}>
                          {prov.estado}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                      >
                        <div>
                          <strong>RUT:</strong> {prov.rut}
                        </div>
                        <div>
                          <PhoneOutlined /> {prov.telefono}
                        </div>
                        <div>
                          <MailOutlined /> {prov.email}
                        </div>
                        <div>
                          <ShopOutlined /> <strong>Rubro:</strong> {prov.rubro}
                        </div>
                        <div>
                          <strong>Giro:</strong> {prov.giro}
                        </div>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </>
        ) : (
          <>
            <Empty
              description="No hay proveedores registrados"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />

            <Row justify="center">
              <Button
                type="primary"
                onClick={() =>
                  navigate("/admin/aprovisionamiento/" + idSucursal)
                }
              >
                Ingresar Nuevo Proveedor
              </Button>
            </Row>
          </>
        )}
      </Drawer> */}

      <Divider />

      {/* Sección de Inventario */}
      <Row style={{ marginBottom: 16 }}>
        <Col span={24}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={3}>Inventario de Productos</Title>
            <Button
              type="primary"
              icon={<AppstoreAddOutlined />}
              onClick={handleGestionProductos}
              size="large"
            >
              Gestión de Productos
            </Button>
          </div>
          <Text type="secondary">
            Gestiona productos, categorías y visualiza el inventario de esta
            sucursal
          </Text>
        </Col>
      </Row>

      {/* Tabla de inventario */}
      <Row>
        <Col span={24}>
          <Card>
            <Table
              columns={columnsInventario}
              dataSource={inventarios}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total: ${total} productos`,
              }}
              locale={{
                emptyText: (
                  <Empty
                    description="No hay productos en el inventario"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
