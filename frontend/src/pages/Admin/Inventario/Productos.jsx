import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Space,
  Empty,
  Spin,
  Tag,
  Popconfirm,
  notification,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  LoadingOutlined,
  TagsOutlined,
} from "@ant-design/icons";

import DataTable from "../../../components/Tabla";
import Agregar from "../modales/modalProductos/Agregar";
import Editar from "../modales/modalProductos/Editar";
import KPIStats from "../../../components/Kpis";

import obtenerProductos, {
  eliminarProducto,
} from "../../../services/inventario/Productos.service";
import obtenerCategoria from "../../../services/inventario/Categorias.service";

export default function Productos({ onCambiarVista }) {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [productosSelect, setProductoSelect] = useState(null);
  const [loading, setLoading] = useState(false);
  const buscarProducto = async () => {
    try {
      setLoading(true);
      const respuesta = await obtenerProductos();
      const respuesta2 = await obtenerCategoria();

      if (respuesta.status === 500 || respuesta2.status === 500) {
        notification.error({
          message: "Error",
          description: "Error en el servidor",
        });
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
      notification.error({
        message: "Error",
        description: "Error al cargar datos",
      });
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

  const handleCrear = () => {
    if (categorias.length === 0) {
      notification.warning({
        message: "Advertencia",
        description:
          "No hay categorías disponibles. Redirigiendo a Categorías...",
      });
      setTimeout(() => {
        navigate("/admin/categorias");
      }, 2000);
      return;
    }
    setProductoSelect(null);
    setModalCrear(true);
  };

  const handleEditar = (producto) => {
    setProductoSelect(producto);
    setModalEditar(true);
  };

  const handleEliminar = async (producto) => {
    setLoading(true);
    try {
      const respuesta = await eliminarProducto(producto.idProducto);
      if (respuesta.status === 200) {
        notification.success({
          message: "Éxito",
          description: "Producto eliminado exitosamente",
        });
        setProductoSelect(null);
        await buscarProducto();
      } else {
        notification.error({
          message: "Error",
          description: respuesta.error || "Error al eliminar el producto.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Error de conexión al eliminar el producto.",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarModal = () => {
    setModalCrear(false);
    setModalEditar(false);
    productosSelect && setProductoSelect(null);
  };

  const columns = [
    {
      title: "NPI",
      dataIndex: "idProducto",
      key: "idProducto",
      width: "8%",
      align: "center",
    },
    {
      title: "Código",
      dataIndex: "codigo",
      key: "codigo",
      width: "10%",
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      width: "18%",
    },
    {
      title: "Marca",
      dataIndex: "marca",
      key: "marca",
      width: "12%",
    },
    {
      title: "Categoría",
      dataIndex: ["categoria", "nombreCategoria"],
      key: "categoria",
      width: "12%",
      render: (categoriaNombre) =>
        categoriaNombre ? (
          <Tag color="blue" style={{ fontSize: "13px" }}>
            {categoriaNombre}
          </Tag>
        ) : (
          <Typography.Text type="secondary">-</Typography.Text>
        ),
    },
    {
      title: "Precio Venta",
      dataIndex: "precioVenta",
      key: "precioVenta",
      width: "12%",
      align: "right",
      render: (precio) => (
        <Typography.Text strong style={{ color: "#52c41a" }}>
          {new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
          }).format(precio || 0)}
        </Typography.Text>
      ),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: "10%",
      align: "center",
      render: (estado) => {
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
        return (
          <Tag color={getEstadoColor(estado)} style={{ fontSize: "13px" }}>
            {estado || "N/A"}
          </Tag>
        );
      },
    },
    {
      title: "Acciones",
      key: "acciones",
      width: "12%",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleEditar(record);
            }}
          />
          <Popconfirm
            title="¿Está seguro de eliminar este producto?"
            description={`Se eliminará el producto: ${record.nombre}`}
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
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Renderizado condicional para estados vacíos
  if (loading && productos.length === 0) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          tip="Cargando productos..."
          size="large"
        />
      </div>
    );
  }

  if (categorias.length === 0 && !loading) {
    return (
      <div style={{ padding: "24px" }}>
        <Typography.Title>Gestión de Productos</Typography.Title>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical" size="large">
              <div>
                <Typography.Title level={4}>
                  No hay productos disponibles
                </Typography.Title>
                <Typography.Text type="secondary">
                  Primero debe crear una categoría antes de agregar productos
                </Typography.Text>
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
      </div>
    );
  }

  if (productos.length === 0 && !loading) {
    return (
      <div style={{ padding: "24px" }}>
        <Typography.Title>Gestión de Productos</Typography.Title>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical" size="large">
              <div>
                <Typography.Title level={4}>
                  No hay productos disponibles
                </Typography.Title>
                <Typography.Text type="secondary">
                  Comienza agregando tu primer producto
                </Typography.Text>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={handleCrear}
              >
                Crear Productos
              </Button>
            </Space>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* KPIs */}
      {productos.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <KPIStats
            datos={[
              {
                titulo: "Total de Productos",
                valor: productos.length,
                prefijo: <ShoppingOutlined />,
                estiloValor: { color: "#1890ff" },
              },
              {
                titulo: "Total de Categorías",
                valor: categorias.length,
                prefijo: <TagsOutlined />,
                estiloValor: { color: "#722ed1" },
              },
              {
                titulo: "Productos Activos",
                valor: productos.filter(
                  (prod) =>
                    prod.estado && prod.estado.toLowerCase() === "activo",
                ).length,
                prefijo: <ShoppingOutlined />,
                estiloValor: { color: "#52c41a" },
              },
            ]}
          />
        </div>
      )}

      {/* Tabla con DataTable */}
      <DataTable
        title="Gestión de Productos"
        description="Administra el catálogo de productos de tu empresa"
        data={productos}
        columns={columns}
        rowKey="idProducto"
        loading={loading}
        searchableFields={["nombre", "codigo", "marca", "idProducto"]}
        filterConfig={[
          {
            key: "estado",
            placeholder: "Filtrar por estado",
            options: [
              { value: "Activo", label: "Activo" },
              { value: "Inactivo", label: "Inactivo" },
              { value: "Disponible", label: "Disponible" },
            ],
          },
        ]}
        onRowClick={(record) => setProductoSelect(record)}
        selectedRow={productosSelect}
        headerButtons={
          <Space size="middle">
            <Button
              size="large"
              icon={<TagsOutlined />}
              onClick={() => navigate("/admin/categorias")}
              disabled={loading}
              style={{ borderRadius: "8px" }}
            >
              Gestionar Categorías
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCrear}
              disabled={loading}
              style={{ borderRadius: "8px" }}
            >
              Nuevo Producto
            </Button>
          </Space>
        }
      />

      {/* Modales */}
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
