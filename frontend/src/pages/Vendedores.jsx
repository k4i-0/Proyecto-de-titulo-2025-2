import React, { useEffect, useState } from "react";
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
  Divider,
  Card,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  LoadingOutlined,
  RollbackOutlined,
} from "@ant-design/icons";

import { useNavigate, useParams } from "react-router-dom";

import AgregarVendedor from "../components/inventario/modalVendedor/AgregarVendedor";
import EditarVendedor from "../components/inventario/modalVendedor/EditarVendedor";

import {
  getAllProveedoresVendedor,
  eliminarVendedor,
} from "../services/inventario/Proveedor.service";

export default function Vendedores() {
  console.log("Renderizando componente Vendedores");
  const { Title, Text } = Typography;
  const navigate = useNavigate();
  const { rutProveedor } = useParams();

  const [vendedores, setVendedores] = useState([]);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [vendedorSelect, setVendedorSelect] = useState(null);

  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  // 3. Lógica de búsqueda adaptada
  const buscarVendedores = async () => {
    if (!rutProveedor) return;

    try {
      setLoading(true);
      setError(false);
      setMensaje("");
      // Usando el servicio de vendedor
      const respuesta = await getAllProveedoresVendedor(rutProveedor);
      console.log("Respuesta al buscar vendedores:", respuesta.data);
      if (respuesta.status === 500) {
        setError(true);
        setMensaje("Error en el servidor");
        setVendedores([]);
        return;
      }
      if (respuesta.status === 204) {
        setVendedores([]);
      } else if (respuesta.data) {
        setVendedores(respuesta.data);
      } else if (Array.isArray(respuesta)) {
        setVendedores(respuesta);
      }
    } catch (err) {
      setError(true);
      setMensaje("Error de conexión al cargar los vendedores.");
      console.error(err);
      setVendedores([]);
    } finally {
      setLoading(false);
    }
  };

  // 2. USEEFFECT CORREGIDO: Depende de 'rutProveedor'
  useEffect(() => {
    buscarVendedores();
  }, [rutProveedor]); // Se ejecutará cada vez que el RUT de la URL cambie

  // --- Handlers Adaptados ---
  const handleCrear = () => {
    setError(false);
    setMensaje("");
    setVendedorSelect(null);
    setModalCrear(true);
  };

  const handleAbrirModalEditar = () => {
    if (!vendedorSelect) {
      setError(true);
      setMensaje("Por favor seleccione un vendedor de la tabla");
      return;
    }
    setError(false);
    setMensaje("");
    setModalEditar(true);
  };

  // 3. ELIMINAR CORREGIDO: Usa 'idVendedorProveedor'
  const handleEliminarConfirmado = async () => {
    if (!vendedorSelect) {
      // ... (manejo de error)
      return;
    }
    setLoading(true);
    // ... (resto del try/catch)
    try {
      // Usa la clave correcta
      const respuesta = await eliminarVendedor(
        vendedorSelect.idVendedorProveedor
      );
      if (respuesta.status === 200) {
        setMensaje("Vendedor eliminado exitosamente");
        setError(false);
        setVendedorSelect(null);
        await buscarVendedores();
      } else {
        setError(true);
        setMensaje(respuesta.error || "Error al eliminar el vendedor.");
      }
    } catch (error) {
      // ... (manejo de error)
      setError(true);
      setMensaje("Error de conexión al eliminar el vendedor.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarModal = () => {
    setModalCrear(false);
    setModalEditar(false);
  };

  // 3. SELECCIÓN CORREGIDA: Usa 'idVendedorProveedor'
  const handleSeleccionarFila = (record) => {
    if (vendedorSelect?.idVendedorProveedor === record.idVendedorProveedor) {
      setVendedorSelect(null);
    } else {
      setVendedorSelect(record);
    }
  };

  // const getEstadoColor = (estado) => {
  //   const estadoLower = estado?.toLowerCase() || "";
  //   switch (estadoLower) {
  //     case "activo":
  //       return "success";
  //     case "inactivo":
  //       return "error";
  //     default:
  //       return "default";
  //   }
  // };

  const columns = [
    {
      title: "ID Vendedor",
      dataIndex: "idVendedorProveedor",
      key: "idVendedorProveedor",
      width: 120,
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: "Rut",
      dataIndex: "rut",
      key: "rut",
      width: 130,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Teléfono",
      dataIndex: "telefono",
      key: "telefono",
      width: 120,
    },
  ];

  const renderContenido = () => {
    if (loading && vendedores.length === 0) {
      return (
        <Col span={24} style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            tip="Cargando vendedores..."
            size="large"
          />
        </Col>
      );
    }

    if (vendedores.length === 0 && !loading) {
      return (
        <Col span={24}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              // ... (contenido de Empty)
              <Space direction="vertical" size="large">
                <div>
                  <Title level={4}>No hay vendedores disponibles</Title>
                  <Text type="secondary">
                    Agrega el primer vendedor para este proveedor
                  </Text>
                </div>
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={handleCrear}
                >
                  Crear Primer Vendedor
                </Button>
              </Space>
            }
          />
        </Col>
      );
    }

    return (
      <Col span={24}>
        <Table
          columns={columns}
          dataSource={vendedores}
          rowKey="idVendedorProveedor"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: "max-content" }}
          onRow={(record) => ({
            onClick: () => handleSeleccionarFila(record),
            style: {
              padding: 16,
              cursor: "pointer",
              backgroundColor:
                vendedorSelect?.idVendedorProveedor ===
                record.idVendedorProveedor
                  ? "#e6f4ff"
                  : "transparent",
              transition: "background-color 0.3s ease",
            },
          })}
          locale={{
            emptyText: "No hay vendedores para mostrar",
          }}
        />
      </Col>
    );
  };

  return (
    <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
      {/* Encabezado */}
      <Row justify="start" style={{ marginBottom: 16 }}>
        <Col span={18}>
          <Title level={2} style={{ marginBottom: 8 }}>
            <UserOutlined style={{ marginRight: 8 }} />
            Gestión de Vendedores
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Proveedor RUT: {rutProveedor}
          </Text>
        </Col>
      </Row>
      <Divider />
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
      <Card>
        {!loading && (
          <Row justify="space-between" align="middle" style={{ margin: 16 }}>
            {/* Botón Volver a Proveedores */}
            <Col>
              <Button
                type="default"
                icon={<RollbackOutlined />}
                onClick={() => navigate(-1)} // Vuelve a la página anterior
                size="sm"
              >
                Volver a Proveedores
              </Button>
            </Col>

            {/* Acciones */}
            <Col>
              <Space wrap>
                {vendedorSelect && (
                  <Alert
                    message={`Seleccionado: ${vendedorSelect.nombre}`}
                    type="info"
                    showIcon
                    closable
                    onClose={() => setVendedorSelect(null)}
                  />
                )}
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCrear}
                  disabled={loading}
                  size="sm"
                >
                  Agregar Vendedor
                </Button>
                <Button
                  icon={<EditOutlined />}
                  onClick={handleAbrirModalEditar}
                  disabled={loading || !vendedorSelect}
                  size="sm"
                >
                  Editar
                </Button>
                <Popconfirm
                  title="¿Eliminar vendedor?"
                  description={`Se eliminará: ${vendedorSelect?.nombre || ""}`}
                  onConfirm={handleEliminarConfirmado}
                  okText="Sí, eliminar"
                  cancelText="Cancelar"
                  okButtonProps={{ danger: true }}
                  disabled={!vendedorSelect || loading}
                >
                  <Button
                    icon={<DeleteOutlined />}
                    disabled={loading || !vendedorSelect}
                    danger
                    size="sm"
                  >
                    Eliminar
                  </Button>
                </Popconfirm>
              </Space>
            </Col>
          </Row>
        )}

        {/* Contenido (Tabla o Empty/Loading) */}
        <Row gutter={[16, 16]}>{renderContenido()}</Row>
      </Card>
      {/* Modales */}
      <AgregarVendedor
        show={modalCrear}
        handleClose={handleCerrarModal}
        funcionBuscarVendedores={buscarVendedores}
        rutProveedor={rutProveedor}
      />
      <EditarVendedor
        Vendedor={vendedorSelect}
        modalEditar={modalEditar}
        handleCerrarModal={handleCerrarModal}
        funcionBuscarVendedores={buscarVendedores}
        rutProveedor={rutProveedor}
      />
    </div>
  );
}
