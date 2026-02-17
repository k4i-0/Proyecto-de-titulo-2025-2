import { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Alert,
  Space,
  Empty,
  Spin,
  Tag,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

import DataTable from "../components/Tabla";
import AgregarCategoria from "./inventario/modalCategoria/AgregarCategoria";
import EditarCategoria from "./inventario/modalCategoria/EditarCategoria";

import obtenerCategoria, {
  eliminarCategoria,
} from "../services/inventario/Categorias.service";

export default function Categoria() {
  const { Title, Text } = Typography;
  // const navigate = useNavigate();

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
      width: "15%",
      align: "center",
    },
    {
      title: "Nombre",
      dataIndex: "nombreCategoria",
      key: "nombreCategoria",
      sorter: (a, b) => a.nombreCategoria.localeCompare(b.nombreCategoria),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: "20%",
      align: "center",
      render: (estado) => (
        <Tag color={getEstadoColor(estado)} style={{ fontSize: "13px" }}>
          {estado || "N/A"}
        </Tag>
      ),
    },
  ];

  // Renderizado condicional para estados de carga y vacío
  if (loading && categorias.length === 0) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          tip="Cargando categorías..."
          size="large"
        />
      </div>
    );
  }

  if (categorias.length === 0 && !loading) {
    return (
      <div style={{ padding: "24px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical" size="large">
              <div>
                <Typography.Title level={4}>
                  No hay categorías disponibles
                </Typography.Title>
                <Typography.Text type="secondary">
                  Las categorías son necesarias para organizar tus productos
                </Typography.Text>
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
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Alerta de Mensajes */}
      {mensaje && (
        <Alert
          message={mensaje}
          type={error ? "error" : "success"}
          showIcon
          closable
          onClose={() => setMensaje("")}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Alerta de Selección */}
      {categoriaSelect && (
        <Alert
          message={`Categoría seleccionada: ${categoriaSelect.nombreCategoria}`}
          type="info"
          showIcon
          closable
          onClose={() => setCategoriaSelect(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Tabla con DataTable Component */}
      <DataTable
        title="Gestión de Categorías"
        description="Administra las categorías de productos del inventario"
        data={categorias}
        columns={columns}
        rowKey="idCategoria"
        loading={loading}
        searchableFields={["nombreCategoria"]}
        filterConfig={[
          {
            key: "estado",
            placeholder: "Filtrar por estado",
            options: [
              { value: "Activo", label: "Activo" },
              { value: "Inactivo", label: "Inactivo" },
              { value: "Suspendido", label: "Suspendido" },
            ],
          },
        ]}
        onRowClick={handleSeleccionarFila}
        selectedRow={categoriaSelect}
        headerButtons={
          <Space size="middle">
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCrear}
              disabled={loading}
              style={{ borderRadius: "8px" }}
            >
              Nueva Categoría
            </Button>
            <Button
              size="large"
              icon={<EditOutlined />}
              onClick={handleAbrirModalEditar}
              disabled={loading || !categoriaSelect}
              style={{ borderRadius: "8px" }}
            >
              Editar
            </Button>
            <Popconfirm
              title="¿Eliminar categoría?"
              description={`Se eliminará: ${categoriaSelect?.nombreCategoria || ""}`}
              onConfirm={handleEliminarConfirmado}
              okText="Sí, eliminar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
              disabled={!categoriaSelect || loading}
            >
              <Button
                size="large"
                icon={<DeleteOutlined />}
                disabled={loading || !categoriaSelect}
                danger
                style={{ borderRadius: "8px" }}
              >
                Eliminar
              </Button>
            </Popconfirm>
          </Space>
        }
      />

      {/* Modales */}
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
