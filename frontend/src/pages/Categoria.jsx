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
  TagsOutlined,
  LoadingOutlined,
  RollbackOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import AgregarCategoria from "../components/inventario/modalCategoria/AgregarCategoria";
import EditarCategoria from "../components/inventario/modalCategoria/EditarCategoria";

import obtenerCategoria, {
  eliminarCategoria,
} from "../services/inventario/Categorias.service";

export default function Categoria() {
  const { Title, Text } = Typography;
  const navigate = useNavigate(); // Cambiado de 'navigator' a 'navigate'

  const [categorias, setCategorias] = useState([]);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [categoriaSelect, setCategoriaSelect] = useState(null);

  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const buscarCategorias = async () => {
    try {
      setLoading(true);
      setError(false);
      setMensaje("");
      const respuesta = await obtenerCategoria();

      if (respuesta.status === 500) {
        setError(true);
        setMensaje("Error en el servidor");
        setCategorias([]);
        return;
      }
      if (respuesta.status === 204) {
        setCategorias([]);
      } else if (respuesta.data) {
        setCategorias(respuesta.data);
      } else if (Array.isArray(respuesta)) {
        setCategorias(respuesta);
      }
    } catch (err) {
      setError(true);
      setMensaje("Error de conexión al cargar las categorías.");
      console.error(err);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarCategorias();
  }, []);

  const handleCrear = () => {
    setError(false);
    setMensaje("");
    setCategoriaSelect(null);
    setModalCrear(true);
  };

  const handleAbrirModalEditar = () => {
    if (!categoriaSelect) {
      setError(true);
      setMensaje("Por favor seleccione una categoría de la tabla");
      return;
    }
    setError(false);
    setMensaje("");
    setModalEditar(true);
  };

  const handleEliminarConfirmado = async () => {
    if (!categoriaSelect) {
      setError(true);
      setMensaje("Por favor seleccione una categoría para eliminar");
      return;
    }

    setLoading(true);
    setError(false);
    setMensaje("");

    try {
      const respuesta = await eliminarCategoria(categoriaSelect.idCategoria);
      if (respuesta.status === 200) {
        setMensaje("Categoría eliminada exitosamente");
        setError(false);
        setCategoriaSelect(null);
        await buscarCategorias();
      } else {
        setError(true);
        setMensaje(respuesta.error || "Error al eliminar la categoría.");
      }
    } catch (error) {
      setError(true);
      setMensaje("Error de conexión al eliminar la categoría.");
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
    if (categoriaSelect?.idCategoria === record.idCategoria) {
      setCategoriaSelect(null);
    } else {
      setCategoriaSelect(record);
    }
  };

  const getEstadoColor = (estado) => {
    const estadoLower = estado?.toLowerCase() || "";
    switch (estadoLower) {
      case "activo":
      case "disponible":
        return "success";
      case "inactivo":
        return "warning";
      case "eliminado":
        return "error";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "idCategoria",
      key: "idCategoria",
      width: 100,
      align: "center",
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: "Subcategoría",
      dataIndex: "subcategoria",
      key: "subcategoria",
      render: (sub) => sub || <Text type="secondary">N/A</Text>,
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      align: "center",
      width: 120,
      render: (estado) => (
        <Tag color={getEstadoColor(estado)}>{estado || "N/A"}</Tag>
      ),
    },
  ];

  const renderContenido = () => {
    if (loading && categorias.length === 0) {
      return (
        <Col span={24} style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            tip="Cargando categorías..."
            size="large"
          />
        </Col>
      );
    }

    if (categorias.length === 0 && !loading) {
      return (
        <Col span={24}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size="large">
                <div>
                  <Title level={4}>No hay categorías disponibles</Title>
                  <Text type="secondary">
                    Las categorías son necesarias para organizar tus productos
                  </Text>
                </div>
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={handleCrear}
                >
                  Crear Primera Categoría
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
          dataSource={categorias}
          rowKey="idCategoria"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          onRow={(record) => ({
            onClick: () => handleSeleccionarFila(record),
            style: {
              cursor: "pointer",
              backgroundColor:
                categoriaSelect?.idCategoria === record.idCategoria
                  ? "#e6f4ff"
                  : "transparent",
              transition: "background-color 0.3s ease",
            },
          })}
          locale={{
            emptyText: "No hay categorías disponibles",
          }}
        />
      </Col>
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Encabezado */}
      <Row justify="center" style={{ marginBottom: 24 }}>
        <Col span={18} style={{ textAlign: "center" }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            <TagsOutlined style={{ marginRight: 8 }} />
            Gestión de Categorías
          </Title>
          <Text type="secondary">
            Aquí puedes gestionar las categorías de tu inventario
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

      {!loading && categorias.length > 0 && (
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <Button
              type="default"
              icon={<RollbackOutlined />}
              onClick={() => navigate("/productos")}
            >
              Volver a Productos
            </Button>
          </Col>

          <Col>
            <Space wrap>
              {categoriaSelect && (
                <Alert
                  message={`Seleccionada: ${categoriaSelect.nombre}`}
                  type="info"
                  showIcon
                  closable
                  onClose={() => setCategoriaSelect(null)}
                />
              )}
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCrear}
                disabled={loading}
              >
                Agregar Categoría
              </Button>
              <Button
                icon={<EditOutlined />}
                onClick={handleAbrirModalEditar}
                disabled={loading || !categoriaSelect}
              >
                Editar
              </Button>
              <Popconfirm
                title="¿Eliminar categoría?"
                description={`Se eliminará: ${categoriaSelect?.nombre || ""}`}
                onConfirm={handleEliminarConfirmado}
                okText="Sí, eliminar"
                cancelText="Cancelar"
                okButtonProps={{ danger: true }}
                disabled={!categoriaSelect || loading}
              >
                <Button
                  icon={<DeleteOutlined />}
                  disabled={loading || !categoriaSelect}
                  danger
                >
                  Eliminar
                </Button>
              </Popconfirm>
            </Space>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]}>{renderContenido()}</Row>

      <AgregarCategoria
        show={modalCrear}
        handleClose={handleCerrarModal}
        funcionBuscarCategorias={buscarCategorias}
      />
      <EditarCategoria
        Categoria={categoriaSelect}
        modalEditar={modalEditar}
        handleCerrarModal={handleCerrarModal}
        funcionBuscarCategorias={buscarCategorias}
      />
    </div>
  );
}
