import { useEffect, useState, useMemo } from "react";
import {
  Row,
  Col,
  Button,
  Alert,
  Typography,
  Card,
  Space,
  Popconfirm,
  Empty,
  Tag,
  Statistic,
  Table,
  Input,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  PhoneOutlined,
  MailOutlined,
  ShopOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import AgregarProveedor from "../components/inventario/modalProveedor/AgregarProveedor";
import EditarProveedor from "../components/inventario/modalProveedor/EditarProveedor";

import {
  getAllProveedores,
  eliminarProveedor,
} from "../services/inventario/Proveedor.service";

export default function Proveedores() {
  const navigate = useNavigate();
  const { Title, Text } = Typography;
  const [proveedores, setProveedores] = useState([]);
  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const [proveedorSelect, setProveedorSelect] = useState(null);

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);

  // Estados para filtros
  const [searchText, setSearchText] = useState("");
  const [filterEstado, setFilterEstado] = useState(null);
  const [filterRubro, setFilterRubro] = useState(null);

  const buscarProveedores = async () => {
    try {
      setLoading(true);
      setError(false);
      setMensaje("");
      const respuesta = await getAllProveedores();

      if (respuesta.status === 500) {
        setError(true);
        setMensaje("Error en el servidor");
        setProveedores([]);
      } else if (respuesta.status === 204) {
        setProveedores([]);
      } else if (respuesta.status === 200) {
        setMensaje("");
        setProveedores(respuesta.data);
      }
    } catch (error) {
      setError(true);
      setMensaje("Error al cargar datos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarProveedores();
  }, []);

  const handleCerrarModal = () => {
    setModalCrear(false);
    setModalEditar(false);
  };

  const handleCrear = () => {
    setError(false);
    setMensaje("");
    setModalCrear(true);
  };

  const handleEditar = (proveedor) => {
    setProveedorSelect(proveedor);
    setError(false);
    setMensaje("");
    setModalEditar(true);
  };

  const handleEliminar = async (proveedor) => {
    setLoading(true);
    setError(false);
    setMensaje("");
    try {
      const respuesta = await eliminarProveedor(proveedor.idProveedor);
      if (respuesta.status === 200) {
        setMensaje("Proveedor eliminado exitosamente");
        setError(false);
        setProveedorSelect(null);
        await buscarProveedores();
      } else {
        setError(true);
        setMensaje(respuesta.error || "Error al eliminar el proveedor.");
      }
    } catch (error) {
      setError(true);
      setMensaje("Error de conexión al eliminar el proveedor.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarCard = (record) => {
    if (proveedorSelect?.idProveedor === record.idProveedor) {
      setProveedorSelect(null);
    } else {
      setProveedorSelect(record);
    }
  };

  const handleVerVendedores = (rut, e) => {
    if (e) e.stopPropagation();
    navigate("/vendedores/" + rut);
  };

  const getEstadoConfig = (estado) => {
    const configs = {
      Activo: {
        color: "success",
        icon: "✓",
        text: "Activo",
      },
      Inactivo: {
        color: "error",
        icon: "✗",
        text: "Inactivo",
      },
    };
    return configs[estado] || { color: "default", icon: "", text: estado };
  };

  // Función para limpiar filtros
  const handleLimpiarFiltros = () => {
    setSearchText("");
    setFilterEstado(null);
    setFilterRubro(null);
  };

  // Obtener rubros únicos para el filtro
  const rubrosUnicos = useMemo(() => {
    const rubros = [
      ...new Set(proveedores.map((p) => p.rubro).filter(Boolean)),
    ];
    return rubros.map((rubro) => ({ value: rubro, label: rubro }));
  }, [proveedores]);

  // Datos filtrados
  const proveedoresFiltrados = useMemo(() => {
    return proveedores.filter((proveedor) => {
      // Filtro por texto de búsqueda
      const matchesSearch =
        !searchText ||
        proveedor.nombre?.toLowerCase().includes(searchText.toLowerCase()) ||
        proveedor.rut?.toLowerCase().includes(searchText.toLowerCase()) ||
        proveedor.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        proveedor.telefono?.includes(searchText);

      // Filtro por estado
      const matchesEstado = !filterEstado || proveedor.estado === filterEstado;

      // Filtro por rubro
      const matchesRubro = !filterRubro || proveedor.rubro === filterRubro;

      return matchesSearch && matchesEstado && matchesRubro;
    });
  }, [proveedores, searchText, filterEstado, filterRubro]);

  return (
    <div style={{ padding: "24px" }}>
      <Row justify="center" align="top" style={{ marginBottom: 24 }}>
        {/* Título */}
        <Col span={12}>
          <Title>Gestión de Proveedores</Title>
        </Col>
        <Col span={12}>
          {/* Estadísticas generales */}
          {proveedores.length > 0 && (
            <Row
              gutter={16}
              justify="end"
              align="middle"
              style={{ textAlign: "center" }}
            >
              <Col xs={24} sm={8}>
                <Card style={{ height: 140, width: 150 }}>
                  <Statistic
                    title="Total Proveedores"
                    value={proveedores.length}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card style={{ height: 140, width: 150 }}>
                  <Statistic
                    title="Proveedores Activos"
                    value={
                      proveedores.filter((p) => p.estado === "Activo").length
                    }
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card style={{ height: 140, width: 150 }}>
                  <Statistic
                    title="Proveedores Inactivos"
                    value={
                      proveedores.filter((p) => p.estado === "Inactivo").length
                    }
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: "#ff4d4f" }}
                  />
                </Card>
              </Col>
            </Row>
          )}
        </Col>
      </Row>

      {/* Alertas */}
      {mensaje && (
        <Alert
          type={error ? "error" : "success"}
          showIcon
          message={mensaje}
          closable
          onClose={() => setMensaje("")}
          style={{ marginBottom: 24 }}
        />
      )}

      {proveedores.length === 0 && !loading ? (
        <Row justify="center" style={{ marginTop: 48 }}>
          <Col span={24}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Space direction="vertical" size="large">
                  <div>
                    <Title level={4}>No hay proveedores disponibles</Title>
                    <p style={{ color: "#8c8c8c" }}>
                      Crea tu primer proveedor para comenzar
                    </p>
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={handleCrear}
                  >
                    Crear Primer Proveedor
                  </Button>
                </Space>
              }
            />
          </Col>
        </Row>
      ) : (
        <>
          {/* Tabla de Proveedores */}
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            }}
          >
            {/* Botones de la tabla */}
            <Row
              justify="space-between"
              align="middle"
              style={{ marginBottom: 16 }}
            >
              <Col>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={buscarProveedores}
                    loading={loading}
                  >
                    Actualizar
                  </Button>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCrear}
                    disabled={loading}
                  >
                    Crear Proveedor
                  </Button>
                </Space>
              </Col>
            </Row>

            {/* Filtros de la tabla */}
            <Row
              justify="start"
              align="middle"
              gutter={16}
              style={{ marginBottom: 16 }}
            >
              <Col xs={24} sm={12} md={8}>
                <Input
                  placeholder="Buscar por nombre, RUT, email o teléfono..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={12} sm={6} md={4}>
                <Select
                  placeholder="Estado"
                  style={{ width: "100%" }}
                  value={filterEstado}
                  onChange={setFilterEstado}
                  allowClear
                  options={[
                    { value: "Activo", label: "Activo" },
                    { value: "Inactivo", label: "Inactivo" },
                  ]}
                />
              </Col>
              <Col xs={12} sm={6} md={4}>
                <Select
                  placeholder="Rubro"
                  style={{ width: "100%" }}
                  value={filterRubro}
                  onChange={setFilterRubro}
                  allowClear
                  options={rubrosUnicos}
                />
              </Col>
              <Col xs={12} sm={6} md={4}>
                <Button
                  icon={<FilterOutlined />}
                  onClick={handleLimpiarFiltros}
                  block
                >
                  Limpiar Filtros
                </Button>
              </Col>
              {(searchText || filterEstado || filterRubro) && (
                <Col span={24}>
                  <Text type="secondary">
                    Mostrando {proveedoresFiltrados.length} de{" "}
                    {proveedores.length} proveedores
                  </Text>
                </Col>
              )}
            </Row>

            <Table
              dataSource={proveedoresFiltrados}
              rowKey="idProveedor"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} proveedores`,
              }}
              onRow={(record) => ({
                onClick: () => handleSeleccionarCard(record),
                style: {
                  cursor: "pointer",
                  background:
                    proveedorSelect?.idProveedor === record.idProveedor
                      ? "#e6f7ff"
                      : "white",
                },
              })}
              columns={[
                {
                  title: "Proveedor",
                  dataIndex: "nombre",
                  key: "nombre",
                  width: "20%",
                  render: (text, record) => (
                    <Space direction="vertical" size={0}>
                      <Text strong style={{ fontSize: "15px" }}>
                        {text}
                      </Text>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        RUT: {record.rut}
                      </Text>
                    </Space>
                  ),
                },
                {
                  title: "Contacto",
                  key: "contacto",
                  width: "25%",
                  render: (_, record) => (
                    <Space direction="vertical" size={4}>
                      <Space>
                        <PhoneOutlined style={{ color: "#8c8c8c" }} />
                        <Text>{record.telefono}</Text>
                      </Space>
                      <Space>
                        <MailOutlined style={{ color: "#8c8c8c" }} />
                        <Text>{record.email}</Text>
                      </Space>
                    </Space>
                  ),
                },
                {
                  title: "Rubro",
                  dataIndex: "rubro",
                  key: "rubro",
                  width: "15%",
                },
                {
                  title: "Giro",
                  dataIndex: "giro",
                  key: "giro",
                  width: "15%",
                },
                {
                  title: "Estado",
                  dataIndex: "estado",
                  key: "estado",
                  width: "10%",
                  align: "center",
                  render: (estado) => {
                    const estadoConfig = getEstadoConfig(estado);
                    return (
                      <Tag
                        color={estadoConfig.color}
                        style={{ fontWeight: 600 }}
                      >
                        {estadoConfig.text}
                      </Tag>
                    );
                  },
                },
                {
                  title: "Vendedores",
                  key: "vendedores",
                  width: "15%",
                  align: "center",
                  render: (_, record) => (
                    <Button
                      type="link"
                      icon={<TeamOutlined />}
                      onClick={(e) => handleVerVendedores(record.rut, e)}
                    >
                      Ver Vendedores
                    </Button>
                  ),
                },
                {
                  title: "Acciones",
                  key: "acciones",
                  width: "10%",
                  align: "center",
                  render: (_, record) => (
                    <Space size="small">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditar(record);
                        }}
                      />
                      <Popconfirm
                        title="¿Está seguro de eliminar este proveedor?"
                        description={`Se eliminará el proveedor: ${record.nombre}`}
                        onConfirm={(e) => {
                          e?.stopPropagation();
                          handleEliminar(record);
                        }}
                        okText="Sí, eliminar"
                        cancelText="Cancelar"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Popconfirm>
                    </Space>
                  ),
                },
              ]}
            />
          </Card>
        </>
      )}

      <AgregarProveedor
        show={modalCrear}
        handleClose={handleCerrarModal}
        funcionBuscarProveedores={buscarProveedores}
      />
      <EditarProveedor
        Proveedor={proveedorSelect}
        modalEditar={modalEditar}
        handleCerrarModal={handleCerrarModal}
        funcionBuscarProveedores={buscarProveedores}
      />
    </div>
  );
}
