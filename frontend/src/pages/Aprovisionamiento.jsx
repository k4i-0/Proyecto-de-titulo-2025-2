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

export default function Aprovisionamiento() {
  // const navigate = useNavigate();
  // const { idSucursal } = useParams();

  const [proveedores, setProveedores] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verModalCrear, setVerModalCrear] = useState(false);
  const [verModalEditar, setVerModalEditar] = useState(false);
  const [verDrawerVendedores, setVerDrawerVendedores] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [proveedorEditar, setProveedorEditar] = useState(null);
  const [modalEditarVendedorProveedor, setModalEditarVendedorProveedor] =
    useState(false);
  const [vendedorEditarProveedor, setVendedorEditarProveedor] = useState({});

  // Estados para filtros
  const [searchText, setSearchText] = useState("");
  const [filterEstado, setFilterEstado] = useState(null);
  const [filterRubro, setFilterRubro] = useState(null);

  const [form] = Form.useForm();
  const [formEditar] = Form.useForm();
  const [formVendedor] = Form.useForm();
  const [formVendedorEditar] = Form.useForm();
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
        message.info("No hay proveedores registrados");
        setProveedores([]);
        setLoading(false);
        return;
      }
      message.error("Error en el servidor al obtener los proveedores");
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
        message.success("Vendedores obtenidos correctamente");
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
      message.error("Error en el servidor al obtener los vendedores");
      setLoading(false);
    } catch (error) {
      message.error("Error al obtener los vendedores");
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
        message.success("Proveedor editado exitosamente");
        setVerModalEditar(false);
        formEditar.resetFields();
        obtenerProveedores();
        setLoading(false);
        return;
      }
      if (respuesta.status === 422) {
        message.info("Faltan datos obligatorios para editar el proveedor");
        setLoading(false);
        return;
      }
      message.error(
        respuesta.error || "Error en el servidor al editar el proveedor"
      );
    } catch (error) {
      message.error("Error al editar el proveedor");
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
        message.success("Vendedor creado exitosamente");
        formVendedor.resetFields();
        buscarVendedoresSucursal(proveedorSeleccionado.rut);
        setChildrenDrawer(false);
        return;
      }
      if (respuesta.status === 422) {
        message.error("Faltan datos obligatorios para crear el vendedor");
      }
      message.error(
        respuesta.error || "Error en el servidor al crear el vendedor"
      );
      setLoading(false);
    } catch (error) {
      message.error("Error al crear el vendedor");
      console.error("Error al crear el vendedor:", error);
      setLoading(false);
    }
  };

  const handelEliminarVendedor = async (idVendedorProveedor) => {
    try {
      setLoading(true);
      const respuesta = await eliminarVendedor(idVendedorProveedor);
      if (respuesta.status === 200) {
        message.success("Vendedor eliminado exitosamente");
        buscarVendedoresSucursal(proveedorSeleccionado.rut);
        return;
      }
      if (respuesta.status === 404) {
        message.error("Vendedor no encontrado");
        return;
      }
      message.error(
        respuesta.message || "Error en el servidor al eliminar el vendedor"
      );
      setLoading(false);
    } catch (error) {
      message.error("Error al eliminar el vendedor");
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
        setVendedorEditarProveedor({});
        setModalEditarVendedorProveedor(false);
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
                        type="text"
                        icon={<EditOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditarProveedor(record);
                        }}
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
    </div>
  );
}
