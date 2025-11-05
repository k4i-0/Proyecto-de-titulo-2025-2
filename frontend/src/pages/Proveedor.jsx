import { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Alert,
  Space,
  Empty,
  Spin,
  Row,
  Col,
  Tag,
  Table,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  LoadingOutlined,
  RollbackOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

// 1. Asumiendo que estos son los nombres de tus nuevos componentes y servicios
import AgregarProveedor from "../components/inventario/modalProveedor/AgregarProveedor";
import EditarProveedor from "../components/inventario/modalProveedor/EditarProveedor";

import {
  getAllProveedores,
  eliminarProveedor,
} from "../services/inventario/Proveedor.service";

export default function Proveedores() {
  const { Title, Text } = Typography;
  const navigate = useNavigate();

  // 2. Renombrar estados para 'proveedor'
  const [proveedores, setProveedores] = useState([]);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [proveedorSelect, setProveedorSelect] = useState(null); // Estado de selección

  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  // 3. Adaptar la lógica de búsqueda
  const buscarProveedores = async () => {
    try {
      setLoading(true);
      setError(false);
      setMensaje("");
      const respuesta = await getAllProveedores(); // Usar nuevo servicio
      console.log("Respuesta al cargar proveedores:", respuesta);
      if (respuesta.status === 500) {
        setError(true);
        setMensaje("Error en el servidor");
        setProveedores([]);
        return;
      }
      if (respuesta.status === 204) {
        setProveedores([]);
      } else if (respuesta.data) {
        setProveedores(respuesta.data);
      } else if (Array.isArray(respuesta)) {
        setProveedores(respuesta);
      }
    } catch (err) {
      setError(true);
      setMensaje("Error de conexión al cargar los proveedores.");
      console.error(err);
      setProveedores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarProveedores();
  }, []);

  // --- Handlers Adaptados ---
  const handleCrear = () => {
    setError(false);
    setMensaje("");
    setProveedorSelect(null); // Limpiar selección
    setModalCrear(true);
  };

  const handleAbrirModalEditar = () => {
    if (!proveedorSelect) {
      setError(true);
      setMensaje("Por favor seleccione un proveedor de la tabla");
      return;
    }
    setError(false);
    setMensaje("");
    setModalEditar(true);
  };

  const handleEliminarConfirmado = async () => {
    if (!proveedorSelect) {
      setError(true);
      setMensaje("Por favor seleccione un proveedor para eliminar");
      return;
    }

    setLoading(true);
    setError(false);
    setMensaje("");

    try {
      // Usar servicio de eliminar proveedor y el ID correcto
      const respuesta = await eliminarProveedor(proveedorSelect.idProveedor);
      if (respuesta.status === 200) {
        setMensaje("Proveedor eliminado exitosamente");
        setError(false);
        setProveedorSelect(null);
        await buscarProveedores(); // Recargar
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

  const handleCerrarModal = () => {
    setModalCrear(false);
    setModalEditar(false);
  };

  const handleSeleccionarFila = (record) => {
    // Usar el ID del proveedor
    if (proveedorSelect?.idProveedor === record.idProveedor) {
      setProveedorSelect(null);
    } else {
      setProveedorSelect(record);
    }
  };

  const getEstadoColor = (estado) => {
    // Asumiendo estados 'Activo' e 'Inactivo'
    const estadoLower = estado?.toLowerCase() || "";
    switch (estadoLower) {
      case "activo":
        return "success";
      case "inactivo":
        return "error";
      default:
        return "default";
    }
  };

  // 4. Definición de Columnas para Proveedores
  const columns = [
    {
      title: "ID",
      dataIndex: "idProveedor",
      key: "idProveedor",
      width: 80,
      align: "center",
    },
    {
      title: "RUT",
      dataIndex: "rut",
      key: "rut",
      width: 120,
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: "Teléfono",
      dataIndex: "telefono",
      key: "telefono",
      width: 130,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Rubro",
      dataIndex: "rubro",
      key: "rubro",
    },
    {
      title: "Giro",
      dataIndex: "giro",
      key: "giro",
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      align: "center",
      width: 100,
      render: (estado) => (
        <Tag color={getEstadoColor(estado)}>{estado || "N/A"}</Tag>
      ),
    },
  ];

  // 5. Lógica de Renderizado (adaptando textos)
  const renderContenido = () => {
    if (loading && proveedores.length === 0) {
      return (
        <Col span={24} style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            tip="Cargando proveedores..."
            size="large"
          />
        </Col>
      );
    }

    if (proveedores.length === 0 && !loading) {
      return (
        <Col span={24}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size="large">
                <div>
                  <Title level={4}>No hay proveedores disponibles</Title>
                  <Text type="secondary">
                    Comienza agregando tu primer proveedor
                  </Text>
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
      );
    }

    // Renderizar la TABLA
    return (
      <Col span={24}>
        <Table
          columns={columns}
          dataSource={proveedores}
          rowKey="idProveedor" // Usar el ID de proveedor
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: "max-content" }}
          onRow={(record) => ({
            onClick: () => handleSeleccionarFila(record),
            style: {
              cursor: "pointer",
              backgroundColor:
                proveedorSelect?.idProveedor === record.idProveedor
                  ? "#e6f4ff"
                  : "transparent",
              transition: "background-color 0.3s ease",
            },
          })}
          locale={{
            emptyText: "No hay proveedores para mostrar",
          }}
        />
      </Col>
    );
  };

  // 6. Renderizado del Componente (adaptando textos y acciones)
  return (
    <div style={{ padding: "24px" }}>
      {/* Encabezado */}
      <Row justify="center" style={{ marginBottom: 24 }}>
        <Col span={18} style={{ textAlign: "center" }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            <TeamOutlined style={{ marginRight: 8 }} />
            Gestión de Proveedores
          </Title>
          <Text type="secondary">
            Aquí puedes gestionar los proveedores de tu negocio
          </Text>
        </Col>
      </Row>

      {/* Alerta de Mensajes */}
      {mensaje && (
        <Row style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Alert
              message={mensaje}
              type={error ? "error" : "success"}
              showIcon
              closable
              onClose={() => setMensaje("")}
            />
          </Col>
        </Row>
      )}

      {/* Barra de Acciones */}
      {!loading && proveedores.length > 0 && (
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          {/* Botón Volver (Opcional, siguiendo tu patrón) */}
          <Col>
            <Button
              type="default"
              icon={<RollbackOutlined />}
              onClick={() => navigate("/productos")} // O a donde necesites
              size="large"
            >
              Volver a Productos
            </Button>
          </Col>

          {/* Acciones */}
          <Col>
            <Space wrap>
              {/* Alerta de Selección */}
              {proveedorSelect && (
                <Alert
                  message={`Seleccionado: ${proveedorSelect.nombre}`}
                  type="info"
                  showIcon
                  closable
                  onClose={() => setProveedorSelect(null)}
                />
              )}
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCrear}
                disabled={loading}
                size="large"
              >
                Agregar Proveedor
              </Button>
              <Button
                icon={<EditOutlined />}
                onClick={handleAbrirModalEditar}
                disabled={loading || !proveedorSelect}
                size="large"
              >
                Editar
              </Button>
              <Popconfirm
                title="¿Eliminar proveedor?"
                description={`Se eliminará: ${proveedorSelect?.nombre || ""}`}
                onConfirm={handleEliminarConfirmado}
                okText="Sí, eliminar"
                cancelText="Cancelar"
                okButtonProps={{ danger: true }}
                disabled={!proveedorSelect || loading}
              >
                <Button
                  icon={<DeleteOutlined />}
                  disabled={loading || !proveedorSelect}
                  danger
                  size="large"
                >
                  Eliminar
                </Button>
              </Popconfirm>
              <Button
                icon={<TeamOutlined />}
                disabled={loading || !proveedorSelect}
                size="large"
                onClick={() => navigate("/vendedores/" + proveedorSelect.rut)}
              >
                Gestion Vendedores
              </Button>
            </Space>
          </Col>
        </Row>
      )}

      {/* Contenido (Tabla o Empty/Loading) */}
      <Row gutter={[16, 16]}>{renderContenido()}</Row>

      {/* Modales */}
      <AgregarProveedor
        show={modalCrear}
        handleClose={handleCerrarModal}
        funcionBuscarProveedores={buscarProveedores}
      />
      <EditarProveedor
        Proveedor={proveedorSelect} // Prop 'Proveedor'
        modalEditar={modalEditar}
        handleCerrarModal={handleCerrarModal}
        funcionBuscarProveedores={buscarProveedores}
      />
    </div>
  );
}
