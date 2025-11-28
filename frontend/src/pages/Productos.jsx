import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Popconfirm, // Importar Popconfirm
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  LoadingOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

import Agregar from "../components/inventario/modalProductos/Agregar";
import Editar from "../components/inventario/modalProductos/Editar";
// El modal Eliminar ya no es necesario
// import Eliminar from "../components/inventario/modalProductos/Eliminar";

import obtenerProductos, {
  eliminarProducto, // Importar el servicio de eliminar
} from "../services/inventario/Productos.service";
import obtenerCategoria from "../services/inventario/Categorias.service";

export default function Productos({ onCambiarVista }) {
  const { Title, Text } = Typography;
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  // const [modalEliminar, setModalEliminar] = useState(false); // Ya no se usa
  const [productosSelect, setProductoSelect] = useState(null); // Estado para la fila seleccionada
  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Lógica de Búsqueda (sin cambios) ---
  const buscarProducto = async () => {
    try {
      setLoading(true);
      setError(false);
      setMensaje("");

      const respuesta = await obtenerProductos();
      const respuesta2 = await obtenerCategoria();

      if (respuesta.status === 500 || respuesta2.status === 500) {
        // ... (manejo de errores sin cambios)
        setError(true);
        setMensaje("Error en el servidor");
        setProductos([]);
        setCategorias([]);
        return;
      }
      if (respuesta.status === 204) {
        setProductos([]);
      } else if (respuesta.data) {
        setProductos(respuesta.data);
      }
      if (respuesta2.status === 204) {
        setCategorias([]);
      } else if (respuesta2.data) {
        setCategorias(respuesta2.data);
      }
    } catch (error) {
      setError(true);
      setMensaje("Error al cargar datos");
      console.error(error);
      setProductos([]);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarProducto();
  }, []);

  // --- Handlers (Modificados) ---
  const handleCrear = () => {
    if (categorias.length === 0) {
      setError(true);
      setMensaje("No hay categorías disponibles. Redirigiendo a Categorías...");
      setTimeout(() => {
        navigate("/admin/categorias");
      }, 2000);
      return;
    }
    setError(false);
    setMensaje("");
    setProductoSelect(null); // Deseleccionar al crear
    setModalCrear(true);
  };

  // Modificado: ya no recibe 'producto', usa 'productosSelect'
  const handleEditar = () => {
    if (!productosSelect) {
      setError(true);
      setMensaje("Por favor seleccione un producto de la tabla");
      return;
    }
    setError(false);
    setMensaje("");
    setModalEditar(true); // El modal <Editar> ya usa 'productosSelect'
  };

  // NUEVO: Manejador de eliminación en línea (como en Sucursal)
  const handleEliminar = async () => {
    if (!productosSelect) {
      setError(true);
      setMensaje("Por favor seleccione un producto de la tabla");
      return;
    }
    setLoading(true);
    setError(false);
    setMensaje("");
    try {
      const respuesta = await eliminarProducto(productosSelect.idProducto);
      if (respuesta.status === 200) {
        setMensaje("Producto eliminado exitosamente");
        setError(false);
        setProductoSelect(null); // Deseleccionar
        await buscarProducto(); // Recargar
      } else {
        setError(true);
        setMensaje(respuesta.error || "Error al eliminar el producto.");
      }
    } catch (error) {
      setError(true);
      setMensaje("Error de conexión al eliminar el producto.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarModal = () => {
    setModalCrear(false);
    setModalEditar(false);
    productosSelect && setProductoSelect(null);
    // setModalEliminar(false); // Ya no se usa
  };

  // NUEVO: Manejador para la selección de fila (como en Sucursal)
  const handleSeleccionarFila = (record) => {
    if (productosSelect?.idProducto === record.idProducto) {
      setProductoSelect(null); // Deseleccionar si se hace clic de nuevo
    } else {
      setProductoSelect(record); // Seleccionar nueva fila
    }
  };

  // --- getEstadoColor (Sin cambios) ---
  const getEstadoColor = (estado) => {
    const estadoLower = estado?.toLowerCase() || "";
    switch (estadoLower) {
      case "disponible":
      case "activo":
      case "bueno":
        return "success";
      case "inactivo":
      case "malo":
        return "warning";
      case "depreciado":
      case "dañado":
        return "error";
      default:
        return "default";
    }
  };

  // --- Definición de Columnas (Modificada) ---
  const columns = [
    // ... (todas las columnas NPI, Código, Nombre, etc. se mantienen igual)
    {
      title: "NPI",
      dataIndex: "idProducto",
      key: "idProducto",
      width: 100,
    },
    {
      title: "Código",
      dataIndex: "codigo",
      key: "codigo",
      width: 100,
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
      fixed: "left",
      width: 150,
    },
    {
      title: "Marca",
      dataIndex: "marca",
      key: "marca",
      sorter: (a, b) => a.marca.localeCompare(b.marca),
      width: 120,
    },
    {
      title: "Categoría",
      dataIndex: ["categoria", "nombreCategoria"],
      key: "categoria",
      filters: [
        { text: "Abarrotes", value: "Abarrotes" },
        { text: "Bebidas", value: "Bebidas" },
        { text: "Licores", value: "Licores" },
        { text: "Lácteos", value: "Lácteos" },
        { text: "Congelados", value: "Congelados" },
        { text: "Carnes", value: "Carnes" },
        { text: "Embutidos", value: "Embutidos" },
        { text: "Frutas y Vegetales", value: "Frutas y Vegetales" },
        { text: "Mascotas", value: "Mascotas" },
        { text: "Panadería", value: "Panadería" },
        { text: "Higiene Personal", value: "Higiene Personal" },
        { text: "Limpieza del Hogar", value: "Limpieza del Hogar" },
        { text: "Farmacéuticos", value: "Farmacéuticos" },
        { text: "Otros", value: "Otros" },
      ],
      onFilter: (value, record) => {
        return record.categoria?.nombreCategoria === value;
      },
      sorter: (a, b) => {
        const catA = a.categoria?.nombreCategoria || "";
        const catB = b.categoria?.nombreCategoria || "";
        return catA.localeCompare(catB);
      },
      render: (categoriaNombre) =>
        categoriaNombre ? (
          <Tag color="blue">{categoriaNombre}</Tag>
        ) : (
          <Text type="secondary">-</Text>
        ),
      width: 150,
    },
    {
      title: "Precio Venta",
      dataIndex: "precioVenta",
      key: "precioVenta",
      align: "right",
      render: (precio) => (
        <Text strong style={{ color: "#52c41a" }}>
          {new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
          }).format(precio || 0)}
        </Text>
      ),
      sorter: (a, b) => a.precioVenta - b.precioVenta,
      width: 130,
    },
    {
      title: "Precio Compra",
      dataIndex: "precioCompra",
      key: "precioCompra",
      align: "right",
      render: (precio) => (
        <Text type="secondary">
          {new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
          }).format(precio || 0)}
        </Text>
      ),
      width: 130,
    },
    {
      title: "Peso (kg)",
      dataIndex: "peso",
      key: "peso",
      align: "right",
      render: (peso) => (peso ? `${peso} kg` : "-"),
      width: 100,
    },
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
      ellipsis: true,
      width: 100,
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      align: "center",
      render: (estado) => (
        <Tag color={getEstadoColor(estado)}>{estado || "N/A"}</Tag>
      ),
      width: 100,
    },
  ];

  const renderContenido = () => {
    if (loading && productos.length === 0) {
      return (
        <Col span={24} style={{ textAlign: "center", margin: "60px 0" }}>
          <Spin
            spinning={loading}
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            tip="Cargando productos..."
            size="large"
          >
            <div style={{ minHeight: 200 }}></div>
          </Spin>
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
                  <Title level={4}>No hay productos disponibles</Title>
                  <Text type="secondary">
                    Primero debe crear una categoría antes de agregar productos
                  </Text>
                </div>
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/admin/categorias")}
                >
                  Ir a Crear Categoría
                </Button>
              </Space>
            }
          />
        </Col>
      );
    }

    if (productos.length === 0 && !loading) {
      return (
        <Col span={24}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size="large">
                <div>
                  <Title level={4}>No hay productos disponibles</Title>
                  <Text type="secondary">
                    Comienza agregando tu primer producto
                  </Text>
                </div>
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => handleCrear(true)}
                >
                  Crear Productos
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
          dataSource={productos}
          rowKey="idProducto"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            defaultPageSize: 10,
          }}
          scroll={{ x: "max-content" }}
          onRow={(record) => ({
            onClick: () => handleSeleccionarFila(record),
            style: {
              cursor: "pointer",
              backgroundColor:
                productosSelect?.idProducto === record.idProducto
                  ? "#e6f4ff"
                  : "transparent",
              transition: "background-color 0.3s ease",
            },
          })}
          locale={{
            emptyText: "No hay productos disponibles",
          }}
        />
      </Col>
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      <Row justify="center" style={{ marginBottom: 24 }}>
        <Col span={24} style={{ textAlign: "center" }}>
          <div style={{ textAlign: "left" }}>
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            >
              Volver
            </Button>
          </div>
          <Title level={2} style={{ marginBottom: 8 }}>
            <ShoppingOutlined style={{ marginRight: 8 }} />
            Gestión de Productos
          </Title>
          <Text type="secondary">
            Aquí puedes gestionar los productos de tu inventario
          </Text>
        </Col>
      </Row>

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
        <Row justify="end" gutter={16} style={{ marginBottom: 16 }}>
          <Col flex="auto">
            {productosSelect && (
              <Alert
                message={`Producto seleccionado: ${productosSelect.nombre}`}
                type="info"
                showIcon
                closable
                onClose={() => setProductoSelect(null)}
              />
            )}
          </Col>

          <Col>
            <Space wrap>
              <Button
                type="default"
                icon={<EditOutlined />}
                onClick={() => navigate("/admin/categorias")}
                disabled={loading}
              >
                Gestionar Categorias
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCrear}
                disabled={loading}
              >
                Agregar Producto
              </Button>
              <Button
                icon={<EditOutlined />}
                onClick={handleEditar}
                disabled={loading || !productosSelect}
              >
                Editar
              </Button>
              <Popconfirm
                title="¿Está seguro de eliminar este producto?"
                description={`Se eliminará el producto: ${
                  productosSelect?.nombre || ""
                }`}
                onConfirm={handleEliminar}
                okText="Sí, eliminar"
                cancelText="Cancelar"
                okButtonProps={{ danger: true }}
                disabled={!productosSelect || loading}
              >
                <Button
                  icon={<DeleteOutlined />}
                  disabled={loading || !productosSelect}
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

      <Agregar
        modalCrear={modalCrear}
        handleCerrarModal={handleCerrarModal}
        categorias={categorias}
        loading={loading}
        cambiarVista={onCambiarVista}
        funcionBuscarProductos={buscarProducto}
      />
      <Editar
        Producto={productosSelect}
        categorias={categorias}
        modalEditar={modalEditar}
        handleCerrarModal={handleCerrarModal}
        funcionBuscarProductos={buscarProducto}
      />
    </div>
  );
}
