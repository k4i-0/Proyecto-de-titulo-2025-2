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
  CheckCircleOutlined,
  CloseCircleOutlined,
  ToolOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  InboxOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import CrearSucursal from "../components/inventario/modalSucursal/CrearSucursal";
import EditarSucursal from "../components/inventario/modalSucursal/EditarSucursal";

import obtenerSucursales, {
  eliminarSucursal,
} from "../services/inventario/Sucursal.service";

export default function Sucursal() {
  const navigate = useNavigate();
  const { Title, Text } = Typography;
  const [sucursales, setSucursales] = useState([]);
  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const [sucursalSelect, setSucursalSelect] = useState(null);

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [filterEstado, setFilterEstado] = useState(null);

  const buscarSucursales = async () => {
    try {
      setLoading(true);
      setError(false);
      setMensaje("");
      const respuesta = await obtenerSucursales();
      if (respuesta.status == 204) {
        setMensaje(
          "No hay sucursales disponibles, por favor crea una sucursal"
        );
      } else {
        if (respuesta.status === 200) {
          setMensaje("");
          setSucursales(respuesta.data);
        }
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
    buscarSucursales();
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

  const handleEditar = (sucursal) => {
    setSucursalSelect(sucursal);
    setError(false);
    setMensaje("");
    setModalEditar(true);
  };

  const handleEliminar = async (sucursal) => {
    setLoading(true);
    setError(false);
    setMensaje("");
    try {
      const respuesta = await eliminarSucursal(sucursal.idSucursal);
      if (respuesta.status === 200) {
        setMensaje("Sucursal eliminada exitosamente");
        setError(false);
        setSucursalSelect(null);
        await buscarSucursales();
      } else {
        setError(true);
        setMensaje(respuesta.error || "Error al eliminar la sucursal.");
      }
    } catch (error) {
      setError(true);
      setMensaje("Error de conexión al eliminar la sucursal.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarCard = (record) => {
    navigate("/admin/sucursal/" + record.idSucursal);
    // if (sucursalSelect?.idSucursal === record.idSucursal) {
    //   setSucursalSelect(null);
    // } else {
    //   setSucursalSelect(record);
    //   //console.log("Navegando a detalles de sucursal:", record);
    //   navigate("/admin/sucursal/" + record.idSucursal);
    // }
  };

  const handleVerBodegas = (idSucursal, e) => {
    if (e) e.stopPropagation();

    navigate("/admin/bodega/" + idSucursal);
  };

  // const getEstadoColor = (estado) => {
  //   const colores = {
  //     Abierta: "success",
  //     Cerrada: "error",
  //     Mantencion: "warning",
  //     Eliminada: "default",
  //   };
  //   return colores[estado] || "default";
  // };
  const getEstadoConfig = (estado) => {
    const configs = {
      Abierta: {
        color: "success",
        icon: <CheckCircleOutlined />,
        text: "Abierta",
      },
      Cerrada: {
        color: "error",
        icon: <CloseCircleOutlined />,
        text: "Cerrada",
      },
      Mantencion: {
        color: "warning",
        icon: <ToolOutlined />,
        text: "Mantenimiento",
      },
      Eliminada: {
        color: "default",
        icon: <DeleteOutlined />,
        text: "Eliminada",
      },
    };
    return configs[estado] || configs.Eliminada;
  };

  const handleLimpiarFiltros = () => {
    setSearchText("");
    setFilterEstado(null);
  };

  const sucursalesFiltradas = useMemo(() => {
    return sucursales.filter((sucursal) => {
      const matchesSearch =
        !searchText ||
        sucursal.nombre?.toLowerCase().includes(searchText.toLowerCase()) ||
        // sucursal.direccion?.toLowerCase().includes(searchText.toLowerCase()) ||
        sucursal.idSucursal?.toString().includes(searchText);

      const matchesEstado = !filterEstado || sucursal.estado === filterEstado;

      return matchesSearch && matchesEstado;
    });
  }, [sucursales, searchText, filterEstado]);

  return (
    <div style={{ padding: "24px" }}>
      <Row justify="center" align="top" style={{ marginBottom: 24 }}>
        {/* Título y descripción */}
        <Col span={12}>
          <Title>Gestión de Sucursales</Title>
          {/* <Title level={5} style={{ color: "#8c8c8c", fontWeight: 400 }}>
            Aquí puedes gestionar tus sucursales
          </Title> */}
        </Col>
        <Col span={12}>
          {/* Estadísticas generales */}
          {sucursales.length > 0 && (
            <Row
              gutter={16}
              justify="end"
              align="middle"
              style={{ textAlign: "center" }}
            >
              <Col xs={24} sm={6}>
                <Card style={{ height: 140, width: 150 }}>
                  <Statistic
                    title="Total De Sucursales"
                    value={sucursales.length}
                    prefix={<ShopOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card style={{ height: 140, width: 150 }}>
                  <Statistic
                    title="Sucursales Abiertas"
                    value={
                      sucursales.filter((s) => s.estado === "Abierta").length
                    }
                    prefix={<ShopOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card style={{ height: 140, width: 150 }}>
                  <Statistic
                    title="Sucursales Cerradas"
                    value={
                      sucursales.filter((s) => s.estado === "Cerrada").length
                    }
                    prefix={<ShopOutlined />}
                    valueStyle={{ color: "#ff491bff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card style={{ height: 140, width: 150 }}>
                  <Statistic
                    title="En Mantenimiento"
                    value={
                      sucursales.filter((s) => s.estado === "Mantencion").length
                    }
                    prefix={<ShopOutlined />}
                    valueStyle={{ color: "#faad14" }}
                  />
                </Card>
              </Col>
            </Row>
          )}
        </Col>
      </Row>

      {/* {mensaje && (
        <Row style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Alert
              type={error ? "error" : "success"}
              showIcon
              message={mensaje}
              closable
              onClose={() => setMensaje("")}
            />
          </Col>
        </Row>
      )} */}

      {sucursales.length === 0 && !loading ? (
        <Row justify="center" style={{ marginTop: 48 }}>
          <Col span={24}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Space direction="vertical" size="large">
                  <div>
                    <Title level={4}>No hay sucursales disponibles</Title>
                    <p style={{ color: "#8c8c8c" }}>
                      Crea tu primera sucursal para comenzar
                    </p>
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => handleCrear()}
                  >
                    Crear Primera Sucursal
                  </Button>
                </Space>
              }
            />
          </Col>
        </Row>
      ) : (
        <>
          {/* Tabla de Sucursales */}
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            }}
          >
            {/*botones de la tabla */}
            <Row
              justify="end"
              align="middle"
              gutter={16}
              style={{ marginBottom: 16 }}
            >
              {/* <Col>
              {sucursalSelect && (
                <Alert
                  message={`Sucursal seleccionada: ${sucursalSelect.nombre}`}
                  type="info"
                  showIcon
                  closable
                  onClose={() => setSucursalSelect(null)}
                  style={{ marginBottom: 0 }}
                />
              )}
            </Col> */}
              <Col>
                <Space>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCrear}
                    disabled={loading}
                  >
                    Crear Sucursal
                  </Button>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button
                    icon={<PlusOutlined />}
                    disabled={loading}
                    type="primary"
                    onClick={() => navigate("/admin/proveedores")}
                  >
                    Proveedores
                  </Button>
                </Space>
              </Col>
            </Row>
            {/*filtro de la tabla */}
            <Row
              justify="start"
              align="middle"
              gutter={16}
              style={{ marginBottom: 16 }}
            >
              <Col span={7}>
                <Input
                  placeholder="Buscar sucursal por nombre, dirección o ID"
                  prefix={<SearchOutlined />}
                  allowClear
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Col>
              <Col span={3}>
                <Select
                  placeholder="Estado"
                  style={{ width: "100%" }}
                  allowClear
                  options={[
                    { value: "Abierta", label: "Abierta" },
                    { value: "Cerrada", label: "Cerrada" },
                    { value: "Mantencion", label: "Mantenimiento" },
                  ]}
                  onChange={setFilterEstado}
                />
              </Col>
              <Col span={3}>
                <Button
                  icon={<FilterOutlined />}
                  onClick={handleLimpiarFiltros}
                  block
                >
                  Limpiar Filtros
                </Button>
              </Col>
            </Row>

            <Table
              dataSource={sucursalesFiltradas}
              rowKey="idSucursal"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} sucursales`,
              }}
              onRow={(record) => ({
                onClick: () => handleSeleccionarCard(record),
                style: {
                  cursor: "pointer",
                  background:
                    sucursalSelect?.idSucursal === record.idSucursal
                      ? "#e6f7ff"
                      : "white",
                },
              })}
              columns={[
                {
                  title: "Sucursal",
                  dataIndex: "nombre",
                  key: "nombre",
                  width: "25%",
                  render: (text, record) => (
                    <Space direction="vertical" size={0}>
                      <Text strong style={{ fontSize: "15px" }}>
                        {text}
                      </Text>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        ID: {record.idSucursal}
                      </Text>
                    </Space>
                  ),
                },
                {
                  title: "Dirección",
                  dataIndex: "direccion",
                  key: "direccion",
                  width: "30%",
                  render: (text) => (
                    <Space>
                      <EnvironmentOutlined style={{ color: "#8c8c8c" }} />
                      <Text>{text}</Text>
                    </Space>
                  ),
                },
                {
                  title: "Estado",
                  dataIndex: "estado",
                  key: "estado",
                  width: "15%",
                  align: "center",
                  render: (estado) => {
                    const estadoConfig = getEstadoConfig(estado);
                    return (
                      <Tag
                        icon={estadoConfig.icon}
                        color={estadoConfig.color}
                        style={{ fontWeight: 600 }}
                      >
                        {estadoConfig.text}
                      </Tag>
                    );
                  },
                },
                {
                  title: "Bodegas",
                  key: "bodegas",
                  width: "15%",
                  align: "center",
                  render: (_, record) => (
                    <Button
                      type="link"
                      icon={<InboxOutlined />}
                      onClick={(e) => handleVerBodegas(record.idSucursal, e)}
                    >
                      Ver Bodegas
                    </Button>
                  ),
                },
                {
                  title: "Acciones",
                  key: "acciones",
                  width: "15%",
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
                        title="¿Está seguro de eliminar esta sucursal?"
                        description={`Se eliminará la sucursal: ${record.nombre}`}
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

      <CrearSucursal
        show={modalCrear}
        handleClose={handleCerrarModal}
        buscarSucursales={buscarSucursales}
      />
      <EditarSucursal
        show={modalEditar}
        handleClose={handleCerrarModal}
        sucursal={sucursalSelect}
        funcionBuscarSucursales={buscarSucursales}
      />
    </div>
  );
}
