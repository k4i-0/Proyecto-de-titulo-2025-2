import { useEffect, useState } from "react";
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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  InboxOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import CrearSucursal from "../components/inventario/modalSucursal/CrearSucursal";
import EditarSucursal from "../components/inventario/modalSucursal/EditarSucursal";

import obtenerSucursales, {
  eliminarSucursal,
} from "../services/inventario/Sucursal.service";

export default function Sucursal() {
  const navigate = useNavigate();
  const { Title } = Typography;
  const [sucursales, setSucursales] = useState([]);
  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const [sucursalSelect, setSucursalSelect] = useState(null);

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);

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
    if (sucursalSelect?.idSucursal === record.idSucursal) {
      setSucursalSelect(null);
    } else {
      setSucursalSelect(record);
      //console.log("Navegando a detalles de sucursal:", record);
      navigate("/admin/sucursal/" + record.idSucursal);
    }
  };

  const handleVerBodegas = (idSucursal, e) => {
    if (e) e.stopPropagation();

    navigate("/admin/bodega/" + idSucursal);
  };

  const getEstadoColor = (estado) => {
    const colores = {
      Abierta: "success",
      Cerrada: "error",
      Mantencion: "warning",
      Eliminada: "default",
    };
    return colores[estado] || "default";
  };

  return (
    <>
      <Row justify="center" style={{ marginBottom: 24 }}>
        <Col span={24} style={{ textAlign: "center" }}>
          <Title>Gestión de Sucursales</Title>
          <Title level={5} style={{ color: "#8c8c8c", fontWeight: 400 }}>
            Aquí puedes gestionar tus sucursales
          </Title>
        </Col>
      </Row>

      {/* Estadísticas generales */}
      {sucursales.length > 0 && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Sucursales"
                value={sucursales.length}
                prefix={<ShopOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Sucursales Abiertas"
                value={sucursales.filter((s) => s.estado === "Abierta").length}
                prefix={<ShopOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
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

      {mensaje && (
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
      )}

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
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: 16 }}
          >
            <Col>
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
            </Col>
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
          </Row>

          {/* Grid de Cards */}
          <Row gutter={[16, 16]}>
            {sucursales.map((sucursal) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={sucursal.idSucursal}>
                <Card
                  hoverable
                  loading={loading}
                  onClick={() => handleSeleccionarCard(sucursal)}
                  style={{
                    borderColor:
                      sucursalSelect?.idSucursal === sucursal.idSucursal
                        ? "#1890ff"
                        : "#d9d9d9",
                    borderWidth:
                      sucursalSelect?.idSucursal === sucursal.idSucursal
                        ? 2
                        : 1,
                    transition: "all 0.3s ease",
                  }}
                  actions={[
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditar(sucursal);
                      }}
                      key="edit"
                    >
                      Editar
                    </Button>,
                    <Popconfirm
                      title="¿Está seguro de eliminar esta sucursal?"
                      description={`Se eliminará la sucursal: ${sucursal.nombre}`}
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        handleEliminar(sucursal);
                      }}
                      okText="Sí, eliminar"
                      cancelText="Cancelar"
                      okButtonProps={{ danger: true }}
                      key="delete"
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Eliminar
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="middle"
                  >
                    {/* Header con estado */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <ShopOutlined
                        style={{ fontSize: "24px", color: "#1890ff" }}
                      />
                      <Tag color={getEstadoColor(sucursal.estado)}>
                        {sucursal.estado}
                      </Tag>
                    </div>

                    {/* Nombre y código */}
                    <div>
                      <Title level={4} style={{ margin: 0 }}>
                        {sucursal.nombre}
                      </Title>
                      <span style={{ color: "#8c8c8c", fontSize: "12px" }}>
                        Código: {sucursal.idSucursal}
                      </span>
                    </div>

                    {/* Dirección */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                      }}
                    >
                      <EnvironmentOutlined
                        style={{ color: "#8c8c8c", marginTop: "4px" }}
                      />
                      <span style={{ color: "#595959", fontSize: "14px" }}>
                        {sucursal.direccion}
                      </span>
                    </div>

                    {/* Botón ver bodegas */}
                    <Button
                      type="link"
                      icon={<InboxOutlined />}
                      onClick={(e) => handleVerBodegas(sucursal.idSucursal, e)}
                      style={{ padding: 0 }}
                    >
                      Ver Bodegas
                    </Button>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
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
    </>
  );
}
