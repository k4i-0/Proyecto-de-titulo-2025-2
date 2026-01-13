import React, { useState, useEffect, useMemo } from "react";
// import { useParams, useNavigate } from "react-router-dom";

import {
  Row,
  Col,
  Form,
  Input,
  Button,
  message,
  Card,
  Select,
  Typography,
  Divider,
  Spin,
  Empty,
  Modal,
  DatePicker,
  Tag,
  Space,
  Popconfirm,
  Drawer,
  Table,
  Statistic,
  notification,
  Descriptions,
} from "antd";

import {
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  TeamOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
  ArrowLeftOutlined,
  LinkOutlined,
  EyeOutlined,
  DisconnectOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

import dayjs from "dayjs";

//codigo SII
import girosSII from "../services/codigoSII.js";

import {
  getAllProveedores,
  crearProveedor,
  editarProveedor,
  eliminarProveedor,
  getAllProveedoresVendedor,
  crearVendedor,
  eliminarVendedor,
  editarVendedor,
} from "../services/inventario/Proveedor.service.js";

import obtenerProductos from "../services/inventario/Productos.service.js";

import {
  enlazarProductoProveedor,
  getProductosPorProveedor,
  desenzalarProductoProveedor,
} from "../services/inventario/Proveedor.service.js";

import { useAuth } from "../context/AuthContext.jsx";

export default function Proveedor() {
  // const navigate = useNavigate();
  // const { idSucursal } = useParams();

  const { user } = useAuth();
  const [proveedores, setProveedores] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [productos, setProductos] = useState([]);
  // const [productosEnlazados, setProductosEnlazados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verModalCrear, setVerModalCrear] = useState(false);
  const [verModalEditar, setVerModalEditar] = useState(false);
  const [verDrawerVendedores, setVerDrawerVendedores] = useState(false);
  const [openDrawerEnlazar, setOpenDrawerEnlazar] = useState(false);
  const [openDrawerTablaEnlazar, setOpenDrawerTablaEnlazar] = useState(false);
  const [drawerDetalleProveedorVisible, setDrawerDetalleProveedorVisible] =
    useState(false);

  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [proveedorEditar, setProveedorEditar] = useState(null);
  const [modalEditarVendedorProveedor, setModalEditarVendedorProveedor] =
    useState(false);
  const [vendedorEditarProveedor, setVendedorEditarProveedor] = useState({});

  const [productosEnlazadosSeleccionados, setProductosEnlazadosSeleccionados] =
    useState([]);

  const [proveedorDetalle, setProveedorDetalle] = useState(null);
  // Estados para filtros
  const [searchText, setSearchText] = useState("");
  const [filterEstado, setFilterEstado] = useState(null);
  const [filterRubro, setFilterRubro] = useState(null);

  const [form] = Form.useForm();
  const [formEditar] = Form.useForm();
  const [formVendedor] = Form.useForm();
  const [formVendedorEditar] = Form.useForm();
  const [formEnlazarProductos] = Form.useForm();
  const [formTablaEnlazarProductos] = Form.useForm();
  const [childrenDrawer, setChildrenDrawer] = useState(false);

  const obtenerProveedores = async () => {
    try {
      setLoading(true);
      const response = await getAllProveedores();
      if (response.status === 200) {
        setProveedores(response.data);
        setLoading(false);
        return;
      }
      if (response.status === 204) {
        notification.info({
          message: "Información",
          description: "No hay proveedores registrados",
          placement: "topLeft",
        });
        setProveedores([]);
        setLoading(false);
        return;
      }
      notification.error({
        message: "Error",
        description: "Error en el servidor al obtener los proveedores",
        placement: "topLeft",
      });
      setLoading(false);
    } catch (error) {
      message.error("Error al obtener los proveedores");
      console.error("Error al obtener los proveedores:", error);
      setLoading(false);
    }
  };

  const buscarVendedoresSucursal = async (rutProveedor) => {
    try {
      setLoading(true);
      const respuesta = await getAllProveedoresVendedor(rutProveedor);
      if (respuesta.status === 200) {
        notification.success({
          message: "Éxito",
          description: "Vendedores obtenidos correctamente",
          placement: "topLeft",
        });
        setVendedores(respuesta.data);
        setLoading(false);
        return;
      }
      if (respuesta.status === 204) {
        message.info("No hay vendedores registrados para este proveedor");
        setVendedores([]);
        setLoading(false);
        return;
      }
      notification.error({
        message: "Error",
        description: "Error en el servidor al obtener los vendedores",
        placement: "topLeft",
      });
      setLoading(false);
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Error al obtener los vendedores",
        placement: "topLeft",
      });
      console.error("Error al obtener los vendedores:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerProveedores();
  }, []);

  const handelSubmitEditarProveedor = async (values) => {
    try {
      setLoading(true);
      const respuesta = await editarProveedor(
        values,
        proveedorEditar.idProveedor
      );
      if (respuesta.status === 200) {
        notification.success({
          message: "Éxito",
          description: "Proveedor editado exitosamente",
          placement: "topLeft",
        });
        setVerModalEditar(false);
        buscarVendedoresSucursal(proveedorSeleccionado.rut);
        buscarDetalleProductoProveedor(proveedorSeleccionado.idProveedor);
        setVendedorEditarProveedor({});
        setProveedorEditar(null);

        setDrawerDetalleProveedorVisible(false);
        setModalEditarVendedorProveedor(false);
        formEditar.resetFields();
        formEnlazarProductos.resetFields();
        formTablaEnlazarProductos.resetFields();
        obtenerProveedores();
        setLoading(false);
        return;
      }
      if (respuesta.status === 422) {
        notification.info({
          message: "Información",
          description: "Faltan datos obligatorios para editar el proveedor",
          placement: "topLeft",
        });
        setLoading(false);
        return;
      }
      message.error(
        respuesta.error || "Error en el servidor al editar el proveedor"
      );
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Error al editar el proveedor",
        placement: "topLeft",
      });
      console.error("Error al editar el proveedor:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVendedor = async (values) => {
    try {
      setLoading(true);
      const vendedorData = {
        ...values,
        rutProveedor: proveedorSeleccionado.rut,
      };
      const respuesta = await crearVendedor(vendedorData);
      if (respuesta.status === 200) {
        notification.success({
          message: "Éxito",
          description: "Vendedor creado exitosamente",
          placement: "topLeft",
        });
        formVendedor.resetFields();
        buscarVendedoresSucursal(proveedorSeleccionado.rut);
        setChildrenDrawer(false);
        return;
      }
      if (respuesta.status === 422) {
        message.error("Faltan datos obligatorios para crear el vendedor");
      }
      notification.error({
        message: "Error",
        description:
          respuesta.error || "Error en el servidor al crear el vendedor",
        placement: "topLeft",
      });
      setLoading(false);
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Error al crear el vendedor",
        placement: "topLeft",
      });
      console.error("Error al crear el vendedor:", error);
      setLoading(false);
    }
  };

  const handelEliminarVendedor = async (idVendedorProveedor) => {
    try {
      setLoading(true);
      const respuesta = await eliminarVendedor(idVendedorProveedor);
      if (respuesta.status === 200) {
        notification.success({
          message: "Éxito",
          description: "Vendedor eliminado exitosamente",
          placement: "topLeft",
        });
        buscarVendedoresSucursal(proveedorSeleccionado.rut);
        return;
      }
      if (respuesta.status === 404) {
        message.error("Vendedor no encontrado");
        return;
      }
      notification.error({
        message: "Error",
        description:
          respuesta.message || "Error en el servidor al eliminar el vendedor",
        placement: "topLeft",
      });
      setLoading(false);
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Error al eliminar el vendedor",
        placement: "topLeft",
      });
      console.error("Error al eliminar el vendedor:", error);
      setLoading(false);
    }
  };

  const handleSubmitCrearProveedor = async (values) => {
    try {
      setLoading(true);
      const proveedorData = {
        ...values,
        fechaIngreso: values.fechaIngreso.format("YYYY-MM-DD"),
      };

      const response = await crearProveedor(proveedorData);

      if (response.status === 201) {
        message.success("Proveedor creado exitosamente");
        setVerModalCrear(false);
        form.resetFields();
        obtenerProveedores();
        return;
      }
      if (response.status === 422) {
        message.info("Faltan datos obligatorios para crear el proveedor");
        form.resetFields();
        return;
      }

      message.error(
        response.error || "Error en el servidor al crear el proveedor"
      );
      setLoading(false);
      return;
    } catch (error) {
      message.error("Error al crear el proveedor");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handelEliminarProveedor = async (proveedor) => {
    try {
      setLoading(true);
      const respuesta = await eliminarProveedor(proveedor.idProveedor);
      if (respuesta.status === 200) {
        message.success("Proveedor eliminado exitosamente");
        setProveedorSeleccionado(null);
        obtenerProveedores();
        setLoading(false);
        return;
      }
      message.error(
        respuesta.error || "Error en el servidor al eliminar el proveedor"
      );
      setLoading(false);
    } catch (error) {
      message.error("Error al eliminar el proveedor");
      console.error("Error al eliminar el proveedor:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setVerModalCrear(false);
    setVerModalEditar(false);
    setModalEditarVendedorProveedor(false);
    setVendedorEditarProveedor({});
    formVendedorEditar.resetFields();
    form.resetFields();
    formEditar.resetFields();
  };

  const handleAbrirVendedores = () => {
    buscarVendedoresSucursal(proveedorSeleccionado.rut);
    setVerDrawerVendedores(true);
  };

  const handleCrearProveedor = () => {
    setVerModalCrear(true);
  };

  const handleSeleccionarProveedor = (proveedor) => {
    if (proveedorSeleccionado?.idProveedor === proveedor.idProveedor) {
      setProveedorSeleccionado(null);
    } else {
      setProveedorSeleccionado(proveedor);
    }
  };

  const showChildrenDrawer = () => {
    setChildrenDrawer(!childrenDrawer);
  };

  const handleEditarProveedor = (recibido) => {
    console.log("Proveedor a editar:", recibido);
    setProveedorSeleccionado(recibido);
    setProveedorEditar(recibido);
    setVerModalEditar(!verModalEditar);
  };

  const handelEditarVendedorProveedor = (vendedor) => {
    setVendedorEditarProveedor(vendedor);
    setModalEditarVendedorProveedor(true);
  };

  const handelEditarVendedorProveedorSubmit = async (values) => {
    try {
      setLoading(true);
      const respuesta = await editarVendedor(
        values,
        vendedorEditarProveedor.idVendedorProveedor
      );
      if (respuesta.status === 200) {
        message.success("Vendedor editado exitosamente");
        formVendedorEditar.resetFields();
        buscarVendedoresSucursal(proveedorSeleccionado.rut);
        buscarDetalleProductoProveedor(proveedorSeleccionado.idProveedor);
        setVendedorEditarProveedor({});
        setProveedorDetalle(null);

        setDrawerDetalleProveedorVisible(false);
        setModalEditarVendedorProveedor(false);
        formEditar.resetFields();
        return;
      }
      if (respuesta.status === 422) {
        message.info("Faltan datos obligatorios para editar el vendedor");
        return;
      }
      if (respuesta.status === 404) {
        message.error("Vendedor no encontrado");
        return;
      }
    } catch (error) {
      message.error("Error al editar el vendedor");
      console.error("Error al editar el vendedor:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoConfig = (estado) => {
    const configs = {
      Activo: { color: "success", text: "Activo" },
      Inactivo: { color: "error", text: "Inactivo" },
    };
    return configs[estado] || { color: "default", text: estado };
  };

  // Función para limpiar filtros
  const handleLimpiarFiltros = () => {
    setSearchText("");
    setFilterEstado(null);
    setFilterRubro(null);
  };

  // Obtener rubros únicos
  const rubrosUnicos = useMemo(() => {
    const rubros = [
      ...new Set(proveedores.map((p) => p.rubro).filter(Boolean)),
    ];
    return rubros.map((rubro) => ({ value: rubro, label: rubro }));
  }, [proveedores]);

  // Datos filtrados
  const proveedoresFiltrados = useMemo(() => {
    return proveedores.filter((proveedor) => {
      const matchesSearch =
        !searchText ||
        proveedor.nombre?.toLowerCase().includes(searchText.toLowerCase()) ||
        proveedor.rut?.toLowerCase().includes(searchText.toLowerCase()) ||
        proveedor.email?.toLowerCase().includes(searchText.toLowerCase());

      const matchesEstado = !filterEstado || proveedor.estado === filterEstado;
      const matchesRubro = !filterRubro || proveedor.rubro === filterRubro;

      return matchesSearch && matchesEstado && matchesRubro;
    });
  }, [proveedores, searchText, filterEstado, filterRubro]);

  //Enlazar productos
  const buscarProductos = async () => {
    try {
      setLoading(true);
      const response = await obtenerProductos();
      if (response.status === 200) {
        setProductos(response.data);
        notification.success({
          message: "Éxito",
          description: "Productos obtenidos correctamente",
          placement: "topLeft",
        });
        setLoading(false);
        return;
      }
      if (response.status === 204) {
        notification.info({
          message: "Información",
          description: "No hay productos disponibles",
          placement: "topLeft",
        });
        setProductos([]);
        setLoading(false);
        return;
      }
      notification.error({
        message: "Error",
        description:
          response?.error || "Error en el servidor al buscar productos",
        placement: "topLeft",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: error?.message || "Error al buscar productos",
        placement: "topLeft",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerEnlazar = () => {
    setOpenDrawerEnlazar(true);
  };

  const handleDrawerEnlazarTabla = () => {
    setOpenDrawerTablaEnlazar(true);
    buscarProductos();
  };

  const cerrarDrawerEnlazar = () => {
    setOpenDrawerEnlazar(false);
    setProductosEnlazadosSeleccionados([]);
    formEnlazarProductos.resetFields();
    formTablaEnlazarProductos.resetFields();
  };

  const cerrarDrawerEnlazarTabla = () => {
    setOpenDrawerTablaEnlazar(false);
  };

  const productosEnlazadosTabla = () => {
    const idsSeleccionados =
      formTablaEnlazarProductos.getFieldValue("productos");

    if (!idsSeleccionados || idsSeleccionados.length === 0) {
      notification.warning({
        message: "Advertencia",
        description: "Seleccione al menos un producto",
        placement: "topLeft",
      });
      return;
    }

    // Filtrar productos seleccionados
    const productosSeleccionados = productos.filter((producto) =>
      idsSeleccionados.includes(producto.idProducto)
    );

    // Agregar solo los que NO están duplicados
    setProductosEnlazadosSeleccionados((prev) => {
      // Filtrar productos que no existen en prev
      const productosNuevos = productosSeleccionados.filter(
        (productoNuevo) =>
          !prev.some(
            (existente) => existente.idProducto === productoNuevo.idProducto
          )
      );

      if (productosNuevos.length === 0) {
        notification.info({
          message: "Información",
          description: "Todos los productos ya están enlazados",
          placement: "topLeft",
        });
        return prev;
      }

      notification.success({
        message: "Éxito",
        description: `${productosNuevos.length} producto(s) enlazado(s)`,
        placement: "topLeft",
      });
      return [...prev, ...productosNuevos];
    });
    console.log(productosEnlazadosSeleccionados);
    formTablaEnlazarProductos.resetFields();
    cerrarDrawerEnlazarTabla();
  };

  const submitProductosEnlazados = async (values) => {
    let datos = {
      ...values,
      user: user?.nombre,
      productos: productosEnlazadosSeleccionados,
    };

    setLoading(true);
    try {
      const response = await enlazarProductoProveedor(datos);
      if (response.status === 200) {
        notification.success({
          message: "Éxito",
          description: "Productos enlazados correctamente",
          placement: "topLeft",
        });
        setProductosEnlazadosSeleccionados([]);
        cerrarDrawerEnlazar();
        obtenerProveedores();
        return;
      }
      notification.error({
        message: "Error",
        description:
          response?.error || "Error en el servidor al enlazar productos",
        placement: "topLeft",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: error?.message || "Error al enlazar productos",
        placement: "topLeft",
      });
    } finally {
      cerrarDrawerEnlazar();
      setLoading(false);
    }
  };

  //funciones drawer detalle proveedor
  const buscarDetalleProductoProveedor = async (idProvedor) => {
    try {
      setLoading(true);
      const response = await getProductosPorProveedor(idProvedor);
      if (response.status === 200) {
        console.log("Detalle proveedor con productos:", response.data);
        setProveedorDetalle(response.data);
        notification.success({
          message: "Éxito",
          description: "Detalle proveedor obtenido correctamente",
          placement: "topLeft",
        });
        setLoading(false);
        return;
      }

      notification.error({
        message: "Error",
        description:
          response?.error ||
          "Error en el servidor al obtener detalle proveedor",
        placement: "topLeft",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: error?.message || "Error al obtener detalle proveedor",
        placement: "topLeft",
      });
    } finally {
      setLoading(false);
    }
  };
  const openDrawerProveedor = (idProveedor) => {
    buscarDetalleProductoProveedor(idProveedor);
    setDrawerDetalleProveedorVisible(true);
  };
  const cerrarDrawerProveedor = () => {
    setDrawerDetalleProveedorVisible(false);
    setProveedorDetalle(null);
    setProveedorEditar(null);
    setProveedorSeleccionado(null);
  };

  const desenlazarProducto = async (datos) => {
    const data = {
      idProveedor: datos.idProveedor,
      idProducto: datos.producto.idProducto,
    };

    try {
      setLoading(true);
      const respuesta = await desenzalarProductoProveedor(data);
      if (respuesta.status === 200) {
        notification.success({
          message: "Éxito",
          description: "Producto desenlazado correctamente",
          placement: "topLeft",
        });
        buscarDetalleProductoProveedor(proveedorDetalle.proveedor.idProveedor);
        return;
      }
      notification.error({
        message: "Error",
        description:
          respuesta?.error || "Error en el servidor al desenlazar producto",
        placement: "topLeft",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: error?.message || "Error al desenlazar producto",
        placement: "topLeft",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col span={12} style={{ textAlign: "start" }}>
          <Title>Gestion Proveedores</Title>
        </Col>
        <Col span={12} style={{ textAlign: "end" }}>
          {/* Estadísticas */}
          {proveedores.length > 0 && (
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Total Proveedores"
                    value={proveedores.length}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
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
                <Card>
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

      <Divider />

      {proveedores.length === 0 && !loading ? (
        <Empty
          description="No hay proveedores registrados"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCrearProveedor}
          >
            Crear Primer Proveedor
          </Button>
        </Empty>
      ) : (
        <>
          {/* Tabla de Proveedores */}
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            }}
          >
            {/* Botones */}
            <Row
              justify="space-between"
              align="middle"
              style={{ marginBottom: 16 }}
            >
              <Col>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={obtenerProveedores}
                    loading={loading}
                  >
                    Actualizar
                  </Button>
                  <Button
                    icon={<TeamOutlined />}
                    onClick={handleAbrirVendedores}
                    disabled={!proveedorSeleccionado}
                  >
                    Gestionar Vendedores
                  </Button>
                  <Button
                    disabled={!proveedorSeleccionado}
                    icon={<LinkOutlined />}
                    onClick={handleDrawerEnlazar}
                  >
                    Enzalar Productos
                  </Button>
                </Space>
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCrearProveedor}
                  disabled={loading}
                >
                  Agregar Proveedor
                </Button>
              </Col>
            </Row>

            {/* Filtros */}
            <Row
              justify="start"
              align="middle"
              gutter={16}
              style={{ marginBottom: 16 }}
            >
              <Col xs={24} sm={12} md={8}>
                <Input
                  placeholder="Buscar por nombre, RUT o email..."
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
                onClick: () => handleSeleccionarProveedor(record),
                style: {
                  cursor: "pointer",
                  background:
                    proveedorSeleccionado?.idProveedor === record.idProveedor
                      ? "#e6f7ff"
                      : "white",
                },
              })}
              columns={[
                {
                  title: "Proveedor",
                  dataIndex: "nombre",
                  key: "nombre",
                  width: "25%",
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
                  title: "Estado",
                  dataIndex: "estado",
                  key: "estado",
                  width: "10%",
                  align: "center",
                  render: (estado) => {
                    const config = getEstadoConfig(estado);
                    return (
                      <Tag color={config.color} style={{ fontWeight: 600 }}>
                        {config.text}
                      </Tag>
                    );
                  },
                },
                {
                  title: "Fecha Ingreso",
                  dataIndex: "fechaIngreso",
                  key: "fechaIngreso",
                  width: "15%",
                  render: (fecha) =>
                    new Date(fecha).toLocaleDateString("es-CL"),
                },
                {
                  title: "Acciones",
                  key: "acciones",
                  width: "10%",
                  align: "center",
                  render: (_, record) => (
                    <Space size="small">
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => openDrawerProveedor(record.idProveedor)}
                        disabled={!proveedorSeleccionado}
                      />
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditarProveedor(record);
                        }}
                        disabled={!proveedorSeleccionado}
                      />
                      <Popconfirm
                        title="¿Está seguro de eliminar este proveedor?"
                        description={`Se eliminará el proveedor: ${record.nombre}`}
                        onConfirm={(e) => {
                          e?.stopPropagation();
                          handelEliminarProveedor(record);
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

      {/* MODAL CREAR PROVEEDOR */}
      <Modal
        open={verModalCrear}
        onCancel={handleCancel}
        footer={null}
        width={600}
        title="Crear Nuevo Proveedor"
      >
        <Divider />
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitCrearProveedor}
          autoComplete="off"
        >
          <Form.Item
            label="RUT"
            name="rut"
            rules={[
              { required: true, message: "Por favor ingrese el RUT" },
              {
                pattern: /^[0-9]+-[0-9kK]{1}$/,
                message: " 12345678-9",
              },
            ]}
          >
            <Input placeholder="12345678-9" />
          </Form.Item>

          <Form.Item
            label="Nombre"
            name="nombre"
            rules={[
              { required: true, message: "Por favor ingrese el nombre" },
              {
                pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                message: "Solo se permiten letras",
              },
            ]}
          >
            <Input placeholder="Nombre del proveedor" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Teléfono"
                name="telefono"
                rules={[
                  { required: true, message: "Por favor ingrese el teléfono" },
                  { pattern: /^[0-9]{9}$/, message: "Debe tener 9 dígitos" },
                ]}
              >
                <Input placeholder="912345678" maxLength={9} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Por favor ingrese el email" },
                  { type: "email", message: "Email inválido" },
                ]}
              >
                <Input placeholder="proveedor@ejemplo.com" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            hidden
            label="Fecha de Ingreso"
            name="fechaIngreso"
            initialValue={dayjs()}
            rules={[
              { required: true, message: "Por favor seleccione la fecha" },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Rubro"
                name="rubro"
                rules={[
                  { required: true, message: "Por favor ingrese el rubro" },
                ]}
              >
                <Input placeholder="Ej: Alimentos, Tecnología, etc." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Estado"
                name="estado"
                rules={[
                  { required: true, message: "Por favor seleccione el estado" },
                ]}
                initialValue="Activo"
              >
                <Select placeholder="Seleccione el estado">
                  <Select.Option value="Activo">Activo</Select.Option>
                  <Select.Option value="Inactivo">Inactivo</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Giro"
            name="giro"
            rules={[
              { required: true, message: "Por favor seleccione el giro" },
            ]}
          >
            <Select
              placeholder="Seleccione el giro del proveedor"
              showSearch
              virtual={false}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={girosSII.map((giro) => ({
                value: giro.codigo,
                label: `${giro.codigo} - ${giro.nombre}`,
              }))}
            />
          </Form.Item>

          <Form.Item>
            <Row gutter={8} justify="end">
              <Col>
                <Button onClick={handleCancel}>Cancelar</Button>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Crear Proveedor
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL EDITAR PROVEEDOR */}
      <Modal
        open={verModalEditar}
        onCancel={handleCancel}
        footer={null}
        width={600}
        title="Editar Proveedor"
      >
        <Divider />
        <Form
          form={formEditar}
          layout="vertical"
          onFinish={handelSubmitEditarProveedor}
          autoComplete="off"
        >
          <Form.Item
            label="RUT"
            name="rut"
            initialValue={proveedorEditar?.rut}
            rules={[
              // { required: true, message: "Por favor ingrese el RUT" },
              {
                pattern: /^[0-9]+-[0-9kK]{1}$/,
                message: "Formato de RUT inválido (ej: 12345678-9)",
              },
            ]}
          >
            <Input placeholder="12345678-9" disabled />
          </Form.Item>

          <Form.Item
            label="Nombre"
            name="nombre"
            initialValue={proveedorEditar?.nombre}
            rules={[{ required: true, message: "Por favor ingrese el nombre" }]}
          >
            <Input placeholder="Nombre del proveedor" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Teléfono"
                name="telefono"
                initialValue={proveedorEditar?.telefono}
                rules={[
                  { required: true, message: "Por favor ingrese el teléfono" },
                  { pattern: /^[0-9]{9}$/, message: "Debe tener 9 dígitos" },
                ]}
              >
                <Input placeholder="912345678" maxLength={9} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                initialValue={proveedorEditar?.email}
                rules={[
                  { required: true, message: "Por favor ingrese el email" },
                  { type: "email", message: "Email inválido" },
                ]}
              >
                <Input placeholder="proveedor@ejemplo.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Rubro"
                name="rubro"
                initialValue={proveedorEditar?.rubro}
                rules={[
                  { required: true, message: "Por favor ingrese el rubro" },
                ]}
              >
                <Input placeholder="Ej: Alimentos, Tecnología, etc." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Estado"
                name="estado"
                initialValue={proveedorEditar?.estado}
                rules={[
                  { required: true, message: "Por favor seleccione el estado" },
                ]}
              >
                <Select placeholder="Seleccione el estado">
                  <Select.Option value="Activo">Activo</Select.Option>
                  <Select.Option value="Inactivo">Inactivo</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Giro"
            name="giro"
            initialValue={proveedorEditar?.giro}
            rules={[
              { required: true, message: "Por favor seleccione el giro" },
            ]}
          >
            <Select
              placeholder="Seleccione el giro del proveedor"
              showSearch
              virtual={false}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={girosSII.map((giro) => ({
                value: giro.codigo,
                label: `${giro.codigo} - ${giro.nombre}`,
              }))}
            />
          </Form.Item>

          <Form.Item>
            <Row gutter={8} justify="end">
              <Col>
                <Button onClick={handleCancel}>Cancelar</Button>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Actualizar Proveedor
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>

      {/* DRAWER VENDEDORES */}
      <Drawer
        title="Gestión de Vendedores"
        placement="right"
        onClose={() => setVerDrawerVendedores(false)}
        open={verDrawerVendedores}
        width={450}
      >
        <Button
          onClick={showChildrenDrawer}
          type="primary"
          icon={<PlusOutlined />}
          block
          style={{ marginBottom: 16 }}
        >
          Agregar Nuevo Vendedor
        </Button>

        {/* DRAWER HIJO CREAR VENDEDOR */}
        <Drawer
          title="Agregar Nuevo Vendedor"
          width={320}
          closable={false}
          onClose={showChildrenDrawer}
          open={childrenDrawer}
        >
          <Form
            form={formVendedor}
            layout="vertical"
            onFinish={handleSubmitVendedor}
            width={400}
            style={{ margin: 10 }}
          >
            <Form.Item
              label="Nombre"
              name="nombre"
              rules={[{ required: true, message: "Ingrese el nombre" }]}
            >
              <Input placeholder="Nombre del vendedor" />
            </Form.Item>
            <Form.Item
              label="Rut"
              name="rut"
              rules={[{ required: true, message: "Ingrese el rut" }]}
            >
              <Input placeholder="12345678-9" />
            </Form.Item>

            <Form.Item
              label="Teléfono"
              name="telefono"
              rules={[
                { required: true, message: "Ingrese el teléfono" },
                { pattern: /^[0-9]{9}$/, message: "Debe tener 9 dígitos" },
              ]}
            >
              <Input placeholder="912345678" maxLength={9} />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Ingrese el email" },
                { type: "email", message: "Email inválido" },
              ]}
            >
              <Input placeholder="vendedor@ejemplo.com" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<UserAddOutlined />}
                block
              >
                Agregar Vendedor
              </Button>
            </Form.Item>
          </Form>
        </Drawer>

        <Divider />

        <Title level={4}>Vendedores Actuales</Title>

        {loading ? (
          <Spin tip="Cargando..." />
        ) : vendedores.length > 0 ? (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            {vendedores.map((vendedor) => (
              <Card
                key={vendedor.idVendedorProveedor}
                style={{ width: "100%" }}
                title={
                  <>
                    <UserOutlined /> {vendedor.nombre}
                  </>
                }
                size="small"
                extra={
                  <Space>
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handelEditarVendedorProveedor(vendedor)}
                    />
                    <Popconfirm
                      title="¿Eliminar este vendedor?"
                      onConfirm={() =>
                        handelEliminarVendedor(vendedor.idVendedorProveedor)
                      }
                      okText="Sí"
                      cancelText="No"
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                      />
                    </Popconfirm>
                  </Space>
                }
              >
                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size="small"
                >
                  <div style={{ fontSize: "13px" }}>
                    <IdcardOutlined /> {vendedor.rut}
                  </div>
                  <div style={{ fontSize: "13px" }}>
                    <MailOutlined style={{ color: "#1890ff" }} />
                    <a
                      href={`mailto:${vendedor.email}`}
                      style={{ color: "#1890ff" }}
                    >
                      {vendedor.email}
                    </a>
                  </div>
                  <div style={{ fontSize: "13px" }}>
                    <PhoneOutlined style={{ color: "#52c41a" }} />
                    {vendedor.telefono}
                  </div>
                </Space>
              </Card>
            ))}
          </Space>
        ) : (
          <Empty description="No hay vendedores registrados" />
        )}
      </Drawer>

      {/* DRAWER EDITAR VENDEDOR */}
      <Drawer
        title="Editar Vendedor"
        width={450}
        closable={true}
        open={modalEditarVendedorProveedor}
        onClose={() => {
          setModalEditarVendedorProveedor(false);
          setVendedorEditarProveedor({});
          formVendedorEditar.resetFields();
        }}
      >
        <Form
          form={formVendedorEditar}
          layout="vertical"
          onFinish={handelEditarVendedorProveedorSubmit}
          width={400}
          style={{ margin: 10 }}
        >
          <Form.Item
            label="Nombre"
            name="nombre"
            initialValue={vendedorEditarProveedor?.nombre}
            rules={[{ required: true, message: "Ingrese el nombre" }]}
          >
            <Input placeholder={vendedorEditarProveedor?.nombre} />
          </Form.Item>
          <Form.Item
            label="Rut"
            name="rut"
            initialValue={vendedorEditarProveedor?.rut}
            rules={[{ required: true, message: "Ingrese el rut" }]}
          >
            <Input placeholder={vendedorEditarProveedor?.rut} />
          </Form.Item>

          <Form.Item
            label="Teléfono"
            name="telefono"
            initialValue={vendedorEditarProveedor?.telefono}
            rules={[
              { required: true, message: "Ingrese el teléfono" },
              { pattern: /^[0-9]{9}$/, message: "Debe tener 9 dígitos" },
            ]}
          >
            <Input
              placeholder={vendedorEditarProveedor?.telefono}
              maxLength={9}
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            initialValue={vendedorEditarProveedor?.email}
            rules={[
              { required: true, message: "Ingrese el email" },
              { type: "email", message: "Email inválido" },
            ]}
          >
            <Input placeholder={vendedorEditarProveedor?.email} />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<UserAddOutlined />}
              block
            >
              Guardar Cambios
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      {/* DRAWER ENLAZAR PRODUCTOS */}
      <Drawer
        title="Enlazar Productos"
        width={450}
        closable={true}
        open={openDrawerEnlazar}
        onClose={() => cerrarDrawerEnlazar()}
        footer={
          <Row gutter={16} justify="end">
            <Col>
              <Button
                type="primary"
                onClick={() => formEnlazarProductos.submit()}
              >
                Agregar
              </Button>
            </Col>
            <Col>
              <Button onClick={() => cerrarDrawerEnlazar()}>Cancelar</Button>
            </Col>
          </Row>
        }
      >
        <Form
          form={formEnlazarProductos}
          layout="vertical"
          onFinish={submitProductosEnlazados}
        >
          <Form.Item label="Proveedor Seleccionado">
            <Input disabled value={proveedorSeleccionado?.rut} />
          </Form.Item>
          <Form.Item
            name="idProveedor"
            hidden
            initialValue={proveedorSeleccionado?.idProveedor}
          >
            <Input />
          </Form.Item>
          <Button onClick={handleDrawerEnlazarTabla}>+ Enlazar Producto</Button>
          {/**Drawer Secundario */}
          <Drawer
            title="Productos Disponibles"
            width={320}
            closable={true}
            open={openDrawerTablaEnlazar}
            onClose={cerrarDrawerEnlazarTabla}
            footer={
              <Row gutter={16} justify="end">
                <Col>
                  <Button onClick={() => formTablaEnlazarProductos.submit()}>
                    {" "}
                    + Agregar
                  </Button>
                </Col>
                <Col>
                  <Button onClick={cerrarDrawerEnlazarTabla}>Cerrar</Button>
                </Col>
              </Row>
            }
          >
            <Form
              form={formTablaEnlazarProductos}
              layout="vertical"
              onFinish={productosEnlazadosTabla}
            >
              <Form.Item label="Productos a Enlazar" name="productos">
                <Select
                  placeholder="Seleccione un proveedor"
                  showSearch
                  optionFilterProp="children"
                  rules={[
                    {
                      required: true,
                      message: "Seleccione al menos un producto",
                    },
                  ]}
                  style={{ width: "100%" }}
                  mode="multiple"
                >
                  {productos.map((producto) => (
                    <Select.Option
                      key={producto.idProducto}
                      value={producto.idProducto}
                    >
                      {producto.nombre} - {producto.codigo}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Drawer>
          <Divider />

          <Table
            columns={[
              {
                title: "Cod. Producto",
                dataIndex: "idProducto",
                key: "idProducto",
              },
              {
                title: "Nombre",
                dataIndex: "nombre",
                key: "nombre",
              },
              {
                title: "Marca",
                dataIndex: "marca",
                key: "marca",
              },
            ]}
            dataSource={productosEnlazadosSeleccionados}
            rowKey="idProducto"
            pagination={false}
          />
        </Form>
      </Drawer>

      {/* Drawer Detalle Proveedor */}
      <Drawer
        title="Detalle del Proveedor"
        width={700}
        closable={true}
        open={drawerDetalleProveedorVisible}
        onClose={() => cerrarDrawerProveedor()}
        footer={
          <Row gutter={16} justify="end">
            <Col>
              <Button onClick={() => cerrarDrawerProveedor()}>Cerrar</Button>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() =>
                  handleEditarProveedor(proveedorDetalle?.proveedor)
                }
              >
                Editar Proveedor
              </Button>
            </Col>
          </Row>
        }
      >
        {proveedorDetalle && (
          <>
            {/* Información del Proveedor */}
            <Descriptions
              title="Información del Proveedor"
              bordered
              column={2}
              size="small"
            >
              <Descriptions.Item label="ID Proveedor">
                {proveedorDetalle.proveedor.idProveedor}
              </Descriptions.Item>

              <Descriptions.Item label="RUT">
                {proveedorDetalle.proveedor.rut}
              </Descriptions.Item>

              <Descriptions.Item label="Nombre" span={2}>
                <strong>{proveedorDetalle.proveedor.nombre}</strong>
              </Descriptions.Item>

              <Descriptions.Item label="Teléfono">
                {proveedorDetalle.proveedor.telefono}
              </Descriptions.Item>

              <Descriptions.Item label="Email">
                {proveedorDetalle.proveedor.email}
              </Descriptions.Item>

              <Descriptions.Item label="Rubro">
                {proveedorDetalle.proveedor.rubro}
              </Descriptions.Item>

              <Descriptions.Item label="Giro">
                {proveedorDetalle.proveedor.giro}
              </Descriptions.Item>

              <Descriptions.Item label="Fecha Ingreso">
                {new Date(
                  proveedorDetalle.proveedor.fechaIngreso
                ).toLocaleDateString("es-CL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Descriptions.Item>

              <Descriptions.Item label="Estado">
                <Tag
                  color={
                    proveedorDetalle.proveedor.estado === "Activo"
                      ? "green"
                      : "red"
                  }
                >
                  {proveedorDetalle.proveedor.estado.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider>
              Productos que Provee ({proveedorDetalle.productosProvee.length})
            </Divider>

            {/* Tabla de Productos */}
            <Table
              columns={[
                {
                  title: "Código",
                  dataIndex: ["producto", "codigo"],
                  key: "codigo",
                },
                {
                  title: "Nombre",
                  dataIndex: ["producto", "nombre"],
                  key: "nombre",
                },
                {
                  title: "Marca",
                  dataIndex: ["producto", "marca"],
                  key: "marca",
                },
                {
                  title: "Precio Compra",
                  dataIndex: ["producto", "precioCompra"],
                  key: "precioCompra",
                  align: "right",

                  render: (precio) => `$${precio.toLocaleString("es-CL")}`,
                },
                {
                  title: "Precio Venta",
                  dataIndex: ["producto", "precioVenta"],
                  key: "precioVenta",
                  align: "right",

                  render: (precio) => `$${precio.toLocaleString("es-CL")}`,
                },
                {
                  title: "Fecha Registro",
                  dataIndex: "fechaRegistro",
                  key: "fechaRegistro",

                  render: (fecha) =>
                    new Date(fecha).toLocaleDateString("es-CL"),
                },
                {
                  title: "Estado",
                  dataIndex: ["producto", "estado"],
                  key: "estado",

                  align: "center",
                  render: (estado) => (
                    <Tag color={estado === "Activo" ? "green" : "red"}>
                      {estado}
                    </Tag>
                  ),
                },
                {
                  title: "Acciones",
                  key: "acciones",

                  align: "center",
                  render: (_, record) => (
                    <Space>
                      {/* <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => verDetalleProducto(record.producto.idProducto)}
                        title="Ver detalle"
                      /> */}
                      <Popconfirm
                        title="¿Desenlazar este producto?"
                        description="El producto dejará de estar asociado a este proveedor"
                        onConfirm={() => desenlazarProducto(record)}
                        okText="Sí"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          type="link"
                          danger
                          icon={<DisconnectOutlined />}
                          title="Desenlazar"
                        />
                      </Popconfirm>
                    </Space>
                  ),
                },
              ]}
              dataSource={proveedorDetalle.productosProvee}
              pagination={false}
              rowKey="idProvee"
              size="small"
              scroll={{ x: 1000 }}
              expandable={{
                expandedRowRender: (record) => (
                  <div
                    style={{ padding: "8px 16px", backgroundColor: "#fafafa" }}
                  >
                    <Row gutter={16}>
                      <Col span={8}>
                        <strong>Descripción:</strong>{" "}
                        {record.producto.descripcion}
                      </Col>
                      <Col span={8}>
                        <strong>Peso:</strong> {record.producto.peso} kg
                      </Col>
                      <Col span={8}>
                        <strong>Registrado por:</strong> {record.registradoPor}
                      </Col>
                    </Row>
                  </div>
                ),
              }}
              locale={{
                emptyText: "No hay productos asociados a este proveedor",
              }}
            />

            {proveedorDetalle.productosProvee.length > 0 && (
              <Card
                size="small"
                style={{ marginTop: 16, backgroundColor: "#f0f2f5" }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Total de Productos"
                      value={proveedorDetalle.productosProvee.length}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Productos Activos"
                      value={
                        proveedorDetalle.productosProvee.filter(
                          (p) => p.producto.estado === "Activo"
                        ).length
                      }
                      valueStyle={{ color: "#3f8600" }}
                    />
                  </Col>
                </Row>
              </Card>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
