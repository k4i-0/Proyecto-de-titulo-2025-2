import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Avatar,
  Card,
  Row,
  Col,
  Statistic,
  Modal,
  Descriptions,
  Badge,
  Divider,
  Popconfirm,
  Tooltip,
  Typography,
  InputNumber,
  notification,
} from "antd";
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  IdcardOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

import obtenerTodosFuncionarios, {
  crearFuncionario,
  editarFuncionario,
  eliminarFuncionario,
} from "../../services/usuario/funcionario.service";
import obtenerSucursales from "../../services/inventario/Sucursal.service";

const GestionColaborador = () => {
  const [form] = Form.useForm();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    cargo: null,
    sucursal: null,
    estado: null,
    turno: null,
  });
  const [colaboradores, setColaboradores] = useState([]);

  const [sucursales, setSucursales] = useState([]);

  //obtener sucursales
  useEffect(() => {
    const todasSucursales = async () => {
      try {
        setLoading(true);
        const response = await obtenerSucursales();
        if (response.status === 200) {
          setSucursales(response.data);
          setLoading(false);
          notification.success({
            message: "Sucursales cargadas",
            description: "Las sucursales se han cargado correctamente.",
            duration: 2,
          });
          return;
        }
        if (response.status === 204) {
          setSucursales([]);
          setLoading(false);
          notification.info({
            message: "No hay sucursales",
            description: "No se encontraron sucursales registradas.",
            duration: 2,
          });
          return;
        }
        notification.error({
          message: response.error || "Error al cargar sucursales",
          description: "Hubo un problema al obtener las sucursales.",
          duration: 5,
        });
      } catch (error) {
        notification.error({
          message: error.message || "Error de servidor",
          description: "No se pudo conectar al servidor.",
          duration: 5,
        });
      } finally {
        setLoading(false);
      }
    };
    todasSucursales();
  }, []);

  //obtener colaboradores
  const obtenerColaboradores = async () => {
    setLoading(true);
    try {
      const response = await obtenerTodosFuncionarios();
      console.log("Respuesta colaboradores:", response.data);
      if (response.status === 200) {
        setColaboradores(response.data);
        setLoading(false);
        notification.success({
          message: "Colaboradores cargados",
          description: "Los colaboradores se han cargado correctamente.",
          duration: 3,
        });
        return;
      }
      if (response.status === 204) {
        setColaboradores([]);
        setLoading(false);
        notification.info({
          message: "No hay colaboradores",
          description: "No se encontraron colaboradores registrados.",
          duration: 3,
        });
        return;
      }
      notification.error({
        message: response.error || "Error al cargar colaboradores",
        description: "Hubo un problema al obtener los colaboradores.",
        duration: 5,
      });
    } catch (error) {
      notification.error({
        message: error.message || "Error de servidor",
        description: "No se pudo conectar al servidor.",
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    obtenerColaboradores();
  }, []);

  // Estadísticas
  const stats = {
    total: colaboradores.length,
    activos: colaboradores.filter((c) => c.estado === "Activo").length,
    inactivos: colaboradores.filter((c) => c.estado === "Inactivo").length,
  };

  // Filtrado de datos

  const filteredData = useMemo(() => {
    return colaboradores.filter((item) => {
      const matchesSearch =
        !searchText ||
        (() => {
          const searchLower = searchText.toLowerCase().trim();
          const searchSinFormato = searchText
            .replace(/[.-]/g, "")
            .toLowerCase();
          const rutSinFormato = item.rut?.replace(/[.-]/g, "").toLowerCase();

          return (
            item.nombre?.toLowerCase().includes(searchLower) ||
            item.apellido?.toLowerCase().includes(searchLower) ||
            item.rut?.toLowerCase().includes(searchLower) ||
            rutSinFormato?.includes(searchSinFormato) ||
            `${item.nombre} ${item.apellido}`
              .toLowerCase()
              .includes(searchLower)
          );
        })();

      const matchesCargo = !filters.cargo || item.cargo === filters.cargo;
      const matchesSucursal =
        !filters.sucursal || item.sucursal === filters.sucursal;
      const matchesEstado = !filters.estado || item.estado === filters.estado;
      const matchesTurno = !filters.turno || item.turno === filters.turno;

      return (
        matchesSearch &&
        matchesCargo &&
        matchesSucursal &&
        matchesEstado &&
        matchesTurno
      );
    });
  }, [colaboradores, searchText, filters]);

  const handleResetFilters = () => {
    setSearchText("");
    setFilters({
      cargo: null,
      sucursal: null,
      estado: null,
      turno: null,
    });
  };

  const columns = [
    {
      title: "Colaborador",
      key: "colaborador",

      render: (_, record) => (
        <Space>
          <Avatar
            size={40}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#1890ff" }}
          >
            {record.nombre[0]}
            {record.apellido[0]}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.nombre} {record.apellido}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Rut",
      dataIndex: "rut",
      key: "rut",
      width: 150,
    },
    {
      title: "Cargo",
      dataIndex: "cargo",
      key: "cargo",
      width: 150,
      render: (cargo) => {
        const colors = {
          Administrador: "purple",
          Vendedor: "blue",
          Cajero: "green",
          Otro: "orange",
        };
        return <Tag color={colors[cargo] || "default"}>{cargo}</Tag>;
      },
    },
    {
      title: "Sucursal",
      dataIndex: "sucursal",
      key: "sucursal",
      width: 150,
      render: (sucursal) => (
        <Tag color="green">{sucursal || "Sin Información"}</Tag>
      ),
    },
    {
      title: "Contacto",
      key: "contacto",
      width: 250,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: "12px" }}>
            <PhoneOutlined style={{ marginRight: 4 }} />
            {record.telefono}
          </div>
          <div style={{ fontSize: "12px", marginTop: 4 }}>
            <MailOutlined style={{ marginRight: 4 }} />
            {record.email}
          </div>
        </div>
      ),
    },

    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 100,
      render: (estado) => (
        <Badge
          status={estado === "Activo" ? "success" : "error"}
          text={estado}
        />
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver Detalles">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Popconfirm
              title="¿Está seguro de eliminar este colaborador?"
              description="Esta acción no se puede deshacer."
              onConfirm={() => handleDelete(record.id)}
              okText="Sí, eliminar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
            >
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditMode(false);
    setSelectedColaborador(null);
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleEdit = (record) => {
    setEditMode(true);
    setSelectedColaborador(record);
    form.setFieldsValue({
      ...record,
      fechaIngreso: record.fechaIngreso ? dayjs(record.fechaIngreso) : null,
    });
    setDrawerVisible(true);
  };

  const handleViewDetails = (record) => {
    console.log("Ver detalles de:", record);
    setSelectedColaborador(record);
    setDetailDrawerVisible(true);
  };

  const handleDelete = async (id) => {
    console.log("Eliminar colaborador con ID:", id);
    try {
      const response = await eliminarFuncionario(id);
      if (response.status === 200) {
        notification.success({
          message: response.data.message || "Colaborador eliminado",
          description: "El colaborador se ha eliminado correctamente.",
          duration: 3,
        });
        obtenerColaboradores();
        return;
      }
      notification.error({
        message: response.error || "Error al eliminar colaborador",
        description: "Hubo un problema al eliminar el colaborador.",
        duration: 5,
      });
    } catch (error) {
      notification.error({
        message: error.message || "Error de servidor",
        description: "No se pudo conectar al servidor.",
        duration: 5,
      });
    }
  };
  //envio editar crear
  const handleSubmit = async (values) => {
    setLoading(true);
    if (editMode) {
      console.log("Valores del formulario edit:", values);
      setLoading(true);
      const response = await editarFuncionario(values);
      try {
        if (response.status === 200) {
          notification.success({
            message: response.data.message || "Colaborador actualizado",
            description: "El colaborador se ha actualizado correctamente.",
            duration: 3,
          });
          setEditMode(false);
          setDrawerVisible(false);
          obtenerColaboradores();
          setLoading(false);
          return;
        }
        notification.error({
          message: response.error || "Error al actualizar colaborador",
          description: "Hubo un problema al actualizar el colaborador.",
          duration: 5,
        });
      } catch (error) {
        notification.error({
          message: error.message || "Error de servidor",
          description: "No se pudo conectar al servidor.",
          duration: 5,
        });
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const response = await crearFuncionario(values);
        if (response.status === 201) {
          notification.success({
            message: "Colaborador creado",
            description: "El colaborador se ha creado correctamente.",
            duration: 3,
          });
          setColaboradores([...colaboradores, response.data]);
          setDrawerVisible(false);
          form.resetFields();
          setLoading(false);
          return;
        }
        notification.error({
          message: response.error || "Error al crear colaborador",
          description: "Hubo un problema al crear el colaborador.",
          duration: 5,
        });
      } catch (error) {
        notification.error({
          message: error.message || "Error de servidor",
          description: "No se pudo conectar al servidor.",
          duration: 5,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Header con estadísticas */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Title level={2} style={{ margin: 0 }}>
              <TeamOutlined style={{ marginRight: 12 }} />
              Gestión de Colaboradores
            </Title>
            <Text type="secondary">
              Administra el personal de tus sucursales
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<UserAddOutlined />}
              onClick={handleAdd}
            >
              Nuevo Colaborador
            </Button>
          </Col>
        </Row>

        <Divider />

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Colaboradores"
                value={stats.total}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Colaboradores Activos"
                value={stats.activos}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Colaboradores Inactivos"
                value={stats.inactivos}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Tabla */}
      <Card>
        {/* Sección de Filtros */}
        <div style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={8} lg={6}>
              <Input
                placeholder="Nombre, apellido o RUT"
                prefix={<UserOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                size="large"
              />
            </Col>
            <Col xs={12} sm={12} md={8} lg={4}>
              <Select
                placeholder="Cargo"
                style={{ width: "100%" }}
                value={filters.cargo}
                onChange={(value) => setFilters({ ...filters, cargo: value })}
                allowClear
                size="large"
              >
                <Option value="Administrador">Administrador</Option>
                <Option value="Cajero">Cajero</Option>
                <Option value="Vendedor">Vendedor</Option>
              </Select>
            </Col>

            <Col xs={12} sm={12} md={8} lg={4}>
              <Select
                placeholder="Turno"
                style={{ width: "100%" }}
                value={filters.turno}
                onChange={(value) => setFilters({ ...filters, turno: value })}
                allowClear
                size="large"
              >
                <Option value="Mañana">Mañana</Option>
                <Option value="Tarde">Tarde</Option>
                <Option value="Noche">Noche</Option>
                <Option value="Rotativo">Rotativo</Option>
              </Select>
            </Col>
            <Col xs={12} sm={12} md={8} lg={4}>
              <Select
                placeholder="Estado"
                style={{ width: "100%" }}
                value={filters.estado}
                onChange={(value) => setFilters({ ...filters, estado: value })}
                allowClear
                size="large"
              >
                <Option value="Activo">Activo</Option>
                <Option value="Inactivo">Inactivo</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={8} lg={2}>
              <Button
                onClick={handleResetFilters}
                block
                size="large"
                icon={<DeleteOutlined />}
              >
                Limpiar
              </Button>
            </Col>
          </Row>

          {/* Indicador de filtros activos */}
          {(searchText ||
            filters.cargo ||
            filters.sucursal ||
            filters.estado ||
            filters.turno) && (
            <div style={{ marginTop: 12 }}>
              <Space wrap>
                <Text type="secondary">Filtros activos:</Text>
                {searchText && (
                  <Tag closable onClose={() => setSearchText("")} color="blue">
                    Búsqueda: {searchText}
                  </Tag>
                )}
                {filters.cargo && (
                  <Tag
                    key="cargo"
                    closable
                    onClose={() => setFilters({ ...filters, cargo: null })}
                    color="purple"
                  >
                    Cargo: {filters.cargo}
                  </Tag>
                )}
                {filters.sucursal && (
                  <Tag
                    key="sucursal"
                    closable
                    onClose={() => setFilters({ ...filters, sucursal: null })}
                    color="green"
                  >
                    Sucursal: {filters.sucursal}
                  </Tag>
                )}
                {filters.turno && (
                  <Tag
                    key="turno"
                    closable
                    onClose={() => setFilters({ ...filters, turno: null })}
                    color="orange"
                  >
                    Turno: {filters.turno}
                  </Tag>
                )}
                {filters.estado && (
                  <Tag
                    key="estado"
                    closable
                    onClose={() => setFilters({ ...filters, estado: null })}
                    color="red"
                  >
                    Estado: {filters.estado}
                  </Tag>
                )}
                <Text type="secondary">
                  ({filteredData.length} resultado
                  {filteredData.length !== 1 ? "s" : ""})
                </Text>
              </Space>
            </div>
          )}
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} colaboradores`,
          }}
        />
      </Card>

      {/* Drawer para Crear/Editar */}
      <Drawer
        title={
          <Space>
            {editMode ? <EditOutlined /> : <UserAddOutlined />}
            <span>{editMode ? "Editar Colaborador" : "Nuevo Colaborador"}</span>
          </Space>
        }
        width={720}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        extra={
          <Space>
            <Button onClick={() => setDrawerVisible(false)}>Cancelar</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={loading}
            >
              {editMode ? "Actualizar" : "Guardar"}
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            estadoContrato: "Activo",
            turno: "Mañana",
            contrato: "Plazo Fijo",
          }}
        >
          <Title level={5}>Información Personal</Title>
          <Divider style={{ marginTop: 8, marginBottom: 16 }} />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nombre"
                label="Nombre"
                rules={[
                  { required: true, message: "Por favor ingrese el nombre" },
                ]}
              >
                <Input
                  placeholder="Ingrese el nombre"
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="apellido"
                label="Apellido"
                rules={[
                  { required: true, message: "Por favor ingrese el apellido" },
                ]}
              >
                <Input
                  placeholder="Ingrese el apellido"
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="rut"
                label="RUT"
                rules={[
                  { required: true, message: "Por favor ingrese el RUT" },
                  {
                    pattern: /^[0-9]{7,8}-[0-9kK]$/,
                    message: "Formato de RUT inválido",
                  },
                  {
                    min: 10,
                    max: 10,
                    message: "RUT debe tener formato 12345678-9",
                  },
                ]}
                normalize={(value) => {
                  if (!value) return value;

                  const cleaned = value.replace(/[^0-9kK]/g, "");

                  const limited = cleaned.slice(0, 9);

                  if (limited.length <= 1) return limited;

                  const number = limited.slice(0, -1);
                  const verifier = limited.slice(-1).toUpperCase();

                  return `${number}-${verifier}`;
                }}
              >
                <Input
                  disabled={editMode}
                  placeholder="12345678-9"
                  prefix={<IdcardOutlined />}
                  min={10}
                  maxLength={10}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                hidden={editMode}
                name="fechaIngreso"
                label="Fecha de Ingreso"
                initialValue={dayjs()}
              >
                <DatePicker
                  disabled
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Seleccione fecha"
                />
              </Form.Item>
              <Form.Item name="estado" label="Estado" hidden={!editMode}>
                <Select style={{ width: "100%" }}>
                  <Option value="Activo">Activo</Option>
                  <Option value="Inactivo">Inactivo</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Title level={5} style={{ marginTop: 24 }}>
            Información de Contacto
          </Title>
          <Divider style={{ marginTop: 8, marginBottom: 16 }} />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Correo Electrónico"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "Por favor ingrese un correo válido",
                  },
                ]}
              >
                <Input
                  placeholder="correo@ejemplo.cl"
                  prefix={<MailOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="telefono"
                label="Teléfono"
                rules={[
                  { required: true, message: "Por favor ingrese el teléfono" },
                ]}
              >
                <Input
                  addonBefore="+56"
                  placeholder="9 1234 5678"
                  maxLength={9}
                  prefix={<PhoneOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="direccion" label="Dirección">
            <TextArea
              rows={2}
              placeholder="Ingrese la dirección completa"
              prefix={<HomeOutlined />}
            />
          </Form.Item>

          <Title level={5} style={{ marginTop: 24 }}>
            Información Laboral
          </Title>
          <Divider style={{ marginTop: 8, marginBottom: 16 }} />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="cargo"
                label="Cargo"
                rules={[
                  { required: true, message: "Por favor seleccione el cargo" },
                ]}
              >
                <Select placeholder="Seleccione un cargo">
                  <Option value="Administrador">Administrador</Option>
                  <Option value="Vendedor">Vendedor</Option>
                  <Option value="Cajero">Cajero</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sucursal"
                label="Sucursal"
                rules={[
                  {
                    required: true,
                    message: "Por favor seleccione la sucursal",
                  },
                ]}
              >
                <Select placeholder="Seleccione una sucursal">
                  {sucursales.map((sucursal) => (
                    <Option key={sucursal.id} value={sucursal.nombre}>
                      {sucursal.nombre}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="turno"
                label="Turno"
                rules={[
                  { required: true, message: "Por favor seleccione el turno" },
                ]}
              >
                <Select placeholder="Seleccione un turno">
                  <Option value="Mañana">Mañana </Option>
                  <Option value="Tarde">Tarde</Option>
                  <Option value="Noche">Noche</Option>
                  <Option value="Completo">Jornada Completa</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contrato"
                label="Tipo de Contrato"
                rules={[
                  {
                    required: true,
                    message: "Por favor seleccione el tipo de contrato",
                  },
                ]}
              >
                <Select placeholder="Seleccione tipo de contrato">
                  <Option value="Indefinido">Indefinido</Option>
                  <Option value="Plazo Fijo">Plazo Fijo</Option>

                  <Option value="Honorarios">Honorarios</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="estadoContrato"
                label="Estado Del Contrato"
                rules={[
                  { required: true, message: "Por favor seleccione el estado" },
                ]}
              >
                <Select placeholder="Seleccione el estado">
                  <Option value="Activo">Activo</Option>
                  <Option value="Inactivo">Inactivo</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>

      {/* Drawer de Detalles */}
      <Drawer
        title={
          <Space>
            <Avatar
              size={40}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#1890ff" }}
            >
              {selectedColaborador?.nombre}
              {selectedColaborador?.apellido}
            </Avatar>
            <span>
              {selectedColaborador?.nombre} {selectedColaborador?.apellido}
            </span>
          </Space>
        }
        width={640}
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
        extra={
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setDetailDrawerVisible(false);
                handleEdit(selectedColaborador);
              }}
            >
              Editar
            </Button>
            <Popconfirm
              title="¿Está seguro de eliminar este colaborador?"
              onConfirm={() => {
                handleDelete(selectedColaborador?.id);
                setDetailDrawerVisible(false);
              }}
              okText="Sí"
              cancelText="No"
            >
              <Button danger icon={<DeleteOutlined />}>
                Eliminar
              </Button>
            </Popconfirm>
          </Space>
        }
      >
        {selectedColaborador && (
          <>
            <Card style={{ marginBottom: 16 }}>
              <div style={{ textAlign: "center" }}>
                <Avatar
                  size={100}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#1890ff", marginBottom: 16 }}
                >
                  {selectedColaborador.nombre[0]}
                  {selectedColaborador.apellido[0]}
                </Avatar>
                <Title level={3} style={{ marginBottom: 4 }}>
                  {selectedColaborador.nombre} {selectedColaborador.apellido}
                </Title>
                <Tag color="blue" style={{ fontSize: "14px" }}>
                  {selectedColaborador.cargo}
                </Tag>
                <div style={{ marginTop: 12 }}>
                  <Badge
                    status={
                      selectedColaborador.estado === "Activo"
                        ? "success"
                        : "error"
                    }
                    text={selectedColaborador.estado}
                    style={{ fontSize: "14px" }}
                  />
                </div>
              </div>
            </Card>

            <Card title="Información Personal" style={{ marginBottom: 16 }}>
              <Descriptions column={1}>
                <Descriptions.Item
                  label={
                    <span>
                      <IdcardOutlined style={{ marginRight: 8 }} />
                      RUT
                    </span>
                  }
                >
                  {selectedColaborador.rut}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span>
                      <MailOutlined style={{ marginRight: 8 }} />
                      Email
                    </span>
                  }
                >
                  {selectedColaborador.email}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span>
                      <PhoneOutlined style={{ marginRight: 8 }} />
                      Teléfono
                    </span>
                  }
                >
                  {selectedColaborador.telefono}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span>
                      <HomeOutlined style={{ marginRight: 8 }} />
                      Dirección
                    </span>
                  }
                >
                  {selectedColaborador.direccion}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Información Laboral" style={{ marginBottom: 16 }}>
              <Descriptions column={1}>
                <Descriptions.Item label="Sucursal">
                  {selectedColaborador.sucursal}
                </Descriptions.Item>
                <Descriptions.Item label="Cargo">
                  <Tag color="blue">{selectedColaborador.cargo}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Turno">
                  <Tag color="orange">{selectedColaborador.turno}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tipo de Contrato">
                  {selectedColaborador.tipoContrato}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span>
                      <CalendarOutlined style={{ marginRight: 8 }} />
                      Fecha de Ingreso
                    </span>
                  }
                >
                  {dayjs(selectedColaborador.fechaIngreso).format("DD/MM/YYYY")}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Estadísticas">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Días Trabajando"
                    value={dayjs().diff(
                      dayjs(selectedColaborador.fechaIngreso),
                      "day"
                    )}
                    suffix="días"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Antigüedad"
                    value={dayjs().diff(
                      dayjs(selectedColaborador.fechaIngreso),
                      "month"
                    )}
                    suffix="meses"
                  />
                </Col>
              </Row>
            </Card>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default GestionColaborador;
