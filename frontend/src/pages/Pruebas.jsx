import React, { useState } from "react";
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
  Card,
  Row,
  Col,
  Modal,
  Descriptions,
  Badge,
  Divider,
  message,
  Popconfirm,
  Tooltip,
  Typography,
  Timeline,
  Alert,
  Radio,
  InputNumber,
  Avatar,
  Statistic,
  Upload,
} from "antd";
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileExcelOutlined,
  FilterOutlined,
  SwapOutlined,
  CloseCircleOutlined,
  PauseCircleOutlined,
  FileTextOutlined,
  HistoryOutlined,
  DownloadOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  BankOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
// import * as XLSX from "xlsx";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const GestionContratos = () => {
  const [form] = Form.useForm();
  // const [drawerVisible, setDrawerVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [historialDrawerVisible, setHistorialDrawerVisible] = useState(false);
  const [modalType, setModalType] = useState(null); // 'cambio', 'suspension', 'despido', 'renovacion'
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    sucursal: null,
    tipoContrato: null,
    estado: null,
    cargo: null,
  });

  // Datos de ejemplo
  const [empleados, setEmpleados] = useState([
    {
      id: 1,
      nombre: "Juan",
      apellido: "Pérez García",
      rut: "12.345.678-9",
      email: "juan.perez@minimarket.cl",
      telefono: "+56 9 8765 4321",
      cargo: "Cajero",
      sucursal: "Sucursal Centro",
      tipoContrato: "Indefinido",
      fechaInicio: "2023-01-15",
      fechaTermino: null,
      salario: 450000,
      estado: "Activo",
      jornada: "Completa",
      motivoEstado: null,
      historial: [
        {
          fecha: "2023-01-15",
          tipo: "Contratación",
          descripcion: "Inicio de contrato indefinido",
          sucursal: "Sucursal Centro",
        },
      ],
    },
    {
      id: 2,
      nombre: "María",
      apellido: "González López",
      rut: "23.456.789-0",
      email: "maria.gonzalez@minimarket.cl",
      telefono: "+56 9 7654 3210",
      cargo: "Supervisor",
      sucursal: "Sucursal Mall",
      tipoContrato: "Indefinido",
      fechaInicio: "2022-06-20",
      fechaTermino: null,
      salario: 650000,
      estado: "Activo",
      jornada: "Completa",
      motivoEstado: null,
      historial: [
        {
          fecha: "2022-06-20",
          tipo: "Contratación",
          descripcion: "Inicio de contrato indefinido",
          sucursal: "Sucursal Centro",
        },
        {
          fecha: "2023-03-15",
          tipo: "Cambio de Sucursal",
          descripcion: "Transferido de Sucursal Centro a Sucursal Mall",
          sucursal: "Sucursal Mall",
        },
        {
          fecha: "2023-08-10",
          tipo: "Promoción",
          descripcion: "Ascendido a Supervisor",
          sucursal: "Sucursal Mall",
        },
      ],
    },
    {
      id: 3,
      nombre: "Carlos",
      apellido: "Ramírez Silva",
      rut: "34.567.890-1",
      email: "carlos.ramirez@minimarket.cl",
      telefono: "+56 9 6543 2109",
      cargo: "Repositor",
      sucursal: "Sucursal Centro",
      tipoContrato: "Plazo Fijo",
      fechaInicio: "2023-09-10",
      fechaTermino: "2024-09-10",
      salario: 420000,
      estado: "Activo",
      jornada: "Completa",
      motivoEstado: null,
      historial: [
        {
          fecha: "2023-09-10",
          tipo: "Contratación",
          descripcion: "Inicio de contrato a plazo fijo por 1 año",
          sucursal: "Sucursal Centro",
        },
      ],
    },
    {
      id: 4,
      nombre: "Ana",
      apellido: "Martínez Torres",
      rut: "45.678.901-2",
      email: "ana.martinez@minimarket.cl",
      telefono: "+56 9 5432 1098",
      cargo: "Cajero",
      sucursal: "Sucursal Plaza",
      tipoContrato: "Indefinido",
      fechaInicio: "2021-03-05",
      fechaTermino: null,
      salario: 450000,
      estado: "Suspendido",
      jornada: "Completa",
      motivoEstado: "Licencia médica por 30 días",
      historial: [
        {
          fecha: "2021-03-05",
          tipo: "Contratación",
          descripcion: "Inicio de contrato indefinido",
          sucursal: "Sucursal Plaza",
        },
        {
          fecha: "2024-12-01",
          tipo: "Suspensión",
          descripcion: "Licencia médica por 30 días",
          sucursal: "Sucursal Plaza",
        },
      ],
    },
    {
      id: 5,
      nombre: "Pedro",
      apellido: "Fernández Rojas",
      rut: "56.789.012-3",
      email: "pedro.fernandez@minimarket.cl",
      telefono: "+56 9 4321 0987",
      cargo: "Cajero",
      sucursal: "Sucursal Mall",
      tipoContrato: "Plazo Fijo",
      fechaInicio: "2023-01-15",
      fechaTermino: "2023-11-15",
      salario: 450000,
      estado: "Terminado",
      jornada: "Completa",
      motivoEstado: "Término de contrato",
      historial: [
        {
          fecha: "2023-01-15",
          tipo: "Contratación",
          descripcion: "Inicio de contrato a plazo fijo",
          sucursal: "Sucursal Mall",
        },
        {
          fecha: "2023-11-15",
          tipo: "Término",
          descripcion: "Término de contrato plazo fijo",
          sucursal: "Sucursal Mall",
        },
      ],
    },
  ]);

  // Filtrado de datos
  const filteredData = empleados.filter((item) => {
    const matchesSearch = searchText
      ? Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchText.toLowerCase())
        )
      : true;

    const matchesSucursal = filters.sucursal
      ? item.sucursal === filters.sucursal
      : true;
    const matchesTipoContrato = filters.tipoContrato
      ? item.tipoContrato === filters.tipoContrato
      : true;
    const matchesEstado = filters.estado
      ? item.estado === filters.estado
      : true;
    const matchesCargo = filters.cargo ? item.cargo === filters.cargo : true;

    return (
      matchesSearch &&
      matchesSucursal &&
      matchesTipoContrato &&
      matchesEstado &&
      matchesCargo
    );
  });

  const handleResetFilters = () => {
    setSearchText("");
    setFilters({
      sucursal: null,
      tipoContrato: null,
      estado: null,
      cargo: null,
    });
  };

  // Exportar a Excel
  const exportToExcel = () => {
    // const dataToExport = filteredData.map((emp) => ({
    //   RUT: emp.rut,
    //   Nombre: `${emp.nombre} ${emp.apellido}`,
    //   Cargo: emp.cargo,
    //   Sucursal: emp.sucursal,
    //   "Tipo Contrato": emp.tipoContrato,
    //   "Fecha Inicio": emp.fechaInicio,
    //   "Fecha Término": emp.fechaTermino || "N/A",
    //   Salario: emp.salario,
    //   Estado: emp.estado,
    //   Jornada: emp.jornada,
    //   Email: emp.email,
    //   Teléfono: emp.telefono,
    // }));

    // const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    // const workbook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(workbook, worksheet, "Contratos");

    // Ajustar ancho de columnas
    const wscols = [
      { wch: 15 }, // RUT
      { wch: 25 }, // Nombre
      { wch: 15 }, // Cargo
      { wch: 20 }, // Sucursal
      { wch: 15 }, // Tipo Contrato
      { wch: 12 }, // Fecha Inicio
      { wch: 12 }, // Fecha Término
      { wch: 12 }, // Salario
      { wch: 12 }, // Estado
      { wch: 12 }, // Jornada
      { wch: 25 }, // Email
      { wch: 15 }, // Teléfono
    ];
    worksheet["!cols"] = wscols;

    XLSX.writeFile(workbook, `Contratos_${dayjs().format("YYYY-MM-DD")}.xlsx`);
    message.success("Archivo Excel generado exitosamente");
  };

  // Ver detalles
  const handleViewDetails = (record) => {
    setSelectedEmpleado(record);
    setDetailDrawerVisible(true);
  };

  // Ver historial
  const handleViewHistorial = (record) => {
    setSelectedEmpleado(record);
    setHistorialDrawerVisible(true);
  };

  // Abrir modal según acción
  const handleOpenModal = (type, record) => {
    setModalType(type);
    setSelectedEmpleado(record);
    form.resetFields();

    if (type === "cambio") {
      form.setFieldsValue({
        sucursalActual: record.sucursal,
      });
    } else if (type === "renovacion") {
      form.setFieldsValue({
        tipoContratoActual: record.tipoContrato,
        salarioActual: record.salario,
      });
    }
  };

  // Procesar acciones
  const handleSubmitAction = async (values) => {
    setLoading(true);

    setTimeout(() => {
      const updatedEmpleados = empleados.map((emp) => {
        if (emp.id === selectedEmpleado.id) {
          const historialEntry = {
            fecha: dayjs().format("YYYY-MM-DD"),
            tipo: "",
            descripcion: "",
            sucursal: emp.sucursal,
          };

          if (modalType === "cambio") {
            historialEntry.tipo = "Cambio de Sucursal";
            historialEntry.descripcion = `Transferido de ${emp.sucursal} a ${values.nuevaSucursal}. Motivo: ${values.motivo}`;
            historialEntry.sucursal = values.nuevaSucursal;

            return {
              ...emp,
              sucursal: values.nuevaSucursal,
              historial: [...emp.historial, historialEntry],
            };
          } else if (modalType === "suspension") {
            historialEntry.tipo = "Suspensión";
            historialEntry.descripcion = `${values.tipoSuspension}. Motivo: ${
              values.motivo
            }. Desde ${dayjs(values.fechaInicio).format(
              "DD/MM/YYYY"
            )} hasta ${dayjs(values.fechaFin).format("DD/MM/YYYY")}`;

            return {
              ...emp,
              estado: "Suspendido",
              motivoEstado: values.motivo,
              historial: [...emp.historial, historialEntry],
            };
          } else if (modalType === "despido") {
            historialEntry.tipo = "Término de Contrato";
            historialEntry.descripcion = `${values.tipoDespido}. Motivo: ${
              values.motivo
            }. Fecha: ${dayjs(values.fechaDespido).format("DD/MM/YYYY")}`;

            return {
              ...emp,
              estado: "Terminado",
              motivoEstado: values.motivo,
              fechaTermino: dayjs(values.fechaDespido).format("YYYY-MM-DD"),
              historial: [...emp.historial, historialEntry],
            };
          } else if (modalType === "renovacion") {
            historialEntry.tipo = "Renovación de Contrato";
            historialEntry.descripcion = `Contrato renovado: ${
              values.nuevoTipoContrato
            }. Nuevo salario: $${values.nuevoSalario.toLocaleString(
              "es-CL"
            )}. Vigencia desde ${dayjs(values.fechaInicio).format(
              "DD/MM/YYYY"
            )}`;

            return {
              ...emp,
              tipoContrato: values.nuevoTipoContrato,
              salario: values.nuevoSalario,
              fechaTermino: values.fechaTermino
                ? dayjs(values.fechaTermino).format("YYYY-MM-DD")
                : null,
              historial: [...emp.historial, historialEntry],
            };
          }
        }
        return emp;
      });

      setEmpleados(updatedEmpleados);
      setLoading(false);
      setModalType(null);
      form.resetFields();

      const actionMessages = {
        cambio: "Cambio de sucursal registrado exitosamente",
        suspension: "Suspensión registrada exitosamente",
        despido: "Término de contrato registrado exitosamente",
        renovacion: "Renovación de contrato registrada exitosamente",
      };

      message.success(actionMessages[modalType]);
    }, 1000);
  };

  const columns = [
    {
      title: "Empleado",
      key: "empleado",
      width: 250,
      fixed: "left",
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
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.rut}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Cargo",
      dataIndex: "cargo",
      key: "cargo",
      width: 120,
    },
    {
      title: "Sucursal",
      dataIndex: "sucursal",
      key: "sucursal",
      width: 150,
      render: (text) => (
        <Space>
          <BankOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: "Tipo Contrato",
      dataIndex: "tipoContrato",
      key: "tipoContrato",
      width: 130,
      render: (tipo) => {
        const colors = {
          Indefinido: "blue",
          "Plazo Fijo": "orange",
          "Por Obra": "purple",
          Honorarios: "green",
        };
        return <Tag color={colors[tipo]}>{tipo}</Tag>;
      },
    },
    {
      title: "Vigencia",
      key: "vigencia",
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: "12px" }}>
            <CalendarOutlined style={{ marginRight: 4 }} />
            Inicio: {dayjs(record.fechaInicio).format("DD/MM/YYYY")}
          </div>
          {record.fechaTermino && (
            <div style={{ fontSize: "12px", marginTop: 4 }}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              Término: {dayjs(record.fechaTermino).format("DD/MM/YYYY")}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Salario",
      dataIndex: "salario",
      key: "salario",
      width: 120,
      render: (value) => (
        <Text strong style={{ color: "#52c41a" }}>
          ${value.toLocaleString("es-CL")}
        </Text>
      ),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 120,
      render: (estado, record) => {
        const statusConfig = {
          Activo: { color: "success", icon: <CheckCircleOutlined /> },
          Suspendido: { color: "warning", icon: <PauseCircleOutlined /> },
          Terminado: { color: "error", icon: <CloseCircleOutlined /> },
        };
        const config = statusConfig[estado] || { color: "default", icon: null };

        return (
          <Tooltip title={record.motivoEstado}>
            <Badge status={config.color} text={estado} />
          </Tooltip>
        );
      },
    },
    {
      title: "Acciones",
      key: "acciones",
      fixed: "right",
      width: 280,
      render: (_, record) => (
        <Space wrap>
          <Tooltip title="Ver Detalles">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Historial">
            <Button
              type="link"
              size="small"
              icon={<HistoryOutlined />}
              onClick={() => handleViewHistorial(record)}
            />
          </Tooltip>
          {record.estado === "Activo" && (
            <>
              <Tooltip title="Cambio de Sucursal">
                <Button
                  type="link"
                  size="small"
                  icon={<SwapOutlined />}
                  onClick={() => handleOpenModal("cambio", record)}
                />
              </Tooltip>
              <Tooltip title="Suspender">
                <Button
                  type="link"
                  size="small"
                  icon={<PauseCircleOutlined />}
                  onClick={() => handleOpenModal("suspension", record)}
                />
              </Tooltip>
              <Tooltip title="Renovar Contrato">
                <Button
                  type="link"
                  size="small"
                  icon={<SyncOutlined />}
                  onClick={() => handleOpenModal("renovacion", record)}
                />
              </Tooltip>
              <Tooltip title="Terminar Contrato">
                <Popconfirm
                  title="¿Continuar con el término de contrato?"
                  onConfirm={() => handleOpenModal("despido", record)}
                  okText="Continuar"
                  cancelText="Cancelar"
                >
                  <Button
                    type="link"
                    size="small"
                    danger
                    icon={<CloseCircleOutlined />}
                  />
                </Popconfirm>
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  // Estadísticas
  const stats = {
    total: empleados.length,
    activos: empleados.filter((e) => e.estado === "Activo").length,
    suspendidos: empleados.filter((e) => e.estado === "Suspendido").length,
    terminados: empleados.filter((e) => e.estado === "Terminado").length,
    indefinidos: empleados.filter((e) => e.tipoContrato === "Indefinido")
      .length,
    plazoFijo: empleados.filter((e) => e.tipoContrato === "Plazo Fijo").length,
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Title level={2} style={{ margin: 0 }}>
              <FileTextOutlined style={{ marginRight: 12 }} />
              Gestión de Contratos
            </Title>
            <Text type="secondary">
              Administra contratos, cambios de sucursal, suspensiones y términos
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<FileExcelOutlined />}
              onClick={exportToExcel}
            >
              Exportar Excel
            </Button>
          </Col>
        </Row>

        <Divider />

        {/* Estadísticas */}
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Card>
              <Statistic
                title="Total Empleados"
                value={stats.total}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#1890ff", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Card>
              <Statistic
                title="Activos"
                value={stats.activos}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Card>
              <Statistic
                title="Suspendidos"
                value={stats.suspendidos}
                prefix={<PauseCircleOutlined />}
                valueStyle={{ color: "#faad14", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Card>
              <Statistic
                title="Terminados"
                value={stats.terminados}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: "#ff4d4f", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Card>
              <Statistic
                title="Indefinidos"
                value={stats.indefinidos}
                valueStyle={{ color: "#722ed1", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Card>
              <Statistic
                title="Plazo Fijo"
                value={stats.plazoFijo}
                valueStyle={{ color: "#fa8c16", fontSize: "24px" }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Filtros */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={8} lg={6}>
            <Input
              placeholder="Buscar por nombre, RUT, email..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              size="large"
            />
          </Col>
          <Col xs={12} sm={12} md={8} lg={4}>
            <Select
              placeholder="Sucursal"
              style={{ width: "100%" }}
              value={filters.sucursal}
              onChange={(value) => setFilters({ ...filters, sucursal: value })}
              allowClear
              size="large"
            >
              <Option value="Sucursal Centro">Sucursal Centro</Option>
              <Option value="Sucursal Mall">Sucursal Mall</Option>
              <Option value="Sucursal Plaza">Sucursal Plaza</Option>
              <Option value="Sucursal Norte">Sucursal Norte</Option>
            </Select>
          </Col>
          <Col xs={12} sm={12} md={8} lg={4}>
            <Select
              placeholder="Tipo Contrato"
              style={{ width: "100%" }}
              value={filters.tipoContrato}
              onChange={(value) =>
                setFilters({ ...filters, tipoContrato: value })
              }
              allowClear
              size="large"
            >
              <Option value="Indefinido">Indefinido</Option>
              <Option value="Plazo Fijo">Plazo Fijo</Option>
              <Option value="Por Obra">Por Obra</Option>
              <Option value="Honorarios">Honorarios</Option>
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
              <Option value="Suspendido">Suspendido</Option>
              <Option value="Terminado">Terminado</Option>
            </Select>
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
              <Option value="Gerente">Gerente</Option>
              <Option value="Supervisor">Supervisor</Option>
              <Option value="Cajero">Cajero</Option>
              <Option value="Repositor">Repositor</Option>
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
          filters.sucursal ||
          filters.tipoContrato ||
          filters.estado ||
          filters.cargo) && (
          <div style={{ marginTop: 12 }}>
            <Space wrap>
              <Text type="secondary">Filtros activos:</Text>
              {searchText && (
                <Tag closable onClose={() => setSearchText("")} color="blue">
                  Búsqueda: {searchText}
                </Tag>
              )}
              {filters.sucursal && (
                <Tag
                  closable
                  onClose={() => setFilters({ ...filters, sucursal: null })}
                  color="green"
                >
                  Sucursal: {filters.sucursal}
                </Tag>
              )}
              {filters.tipoContrato && (
                <Tag
                  closable
                  onClose={() => setFilters({ ...filters, tipoContrato: null })}
                  color="orange"
                >
                  Contrato: {filters.tipoContrato}
                </Tag>
              )}
              {filters.estado && (
                <Tag
                  closable
                  onClose={() => setFilters({ ...filters, estado: null })}
                  color="red"
                >
                  Estado: {filters.estado}
                </Tag>
              )}
              {filters.cargo && (
                <Tag
                  closable
                  onClose={() => setFilters({ ...filters, cargo: null })}
                  color="purple"
                >
                  Cargo: {filters.cargo}
                </Tag>
              )}
              <Text type="secondary">
                ({filteredData.length} resultado
                {filteredData.length !== 1 ? "s" : ""})
              </Text>
            </Space>
          </div>
        )}
      </Card>

      {/* Tabla */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} empleados`,
          }}
        />
      </Card>

      {/* Drawer de Detalles */}
      <Drawer
        title="Detalles del Empleado"
        width={640}
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
      >
        {selectedEmpleado && (
          <>
            <Card style={{ marginBottom: 16, textAlign: "center" }}>
              <Avatar
                size={100}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#1890ff", marginBottom: 16 }}
              >
                {selectedEmpleado.nombre[0]}
                {selectedEmpleado.apellido[0]}
              </Avatar>
              <Title level={3} style={{ marginBottom: 4 }}>
                {selectedEmpleado.nombre} {selectedEmpleado.apellido}
              </Title>
              <Text type="secondary">{selectedEmpleado.cargo}</Text>
              <div style={{ marginTop: 12 }}>
                <Badge
                  status={
                    selectedEmpleado.estado === "Activo"
                      ? "success"
                      : selectedEmpleado.estado === "Suspendido"
                      ? "warning"
                      : "error"
                  }
                  text={selectedEmpleado.estado}
                  style={{ fontSize: "14px" }}
                />
              </div>
            </Card>

            <Card title="Información del Contrato" style={{ marginBottom: 16 }}>
              <Descriptions column={1}>
                <Descriptions.Item label="Tipo de Contrato">
                  <Tag color="blue">{selectedEmpleado.tipoContrato}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Sucursal">
                  {selectedEmpleado.sucursal}
                </Descriptions.Item>
                <Descriptions.Item label="Fecha de Inicio">
                  {dayjs(selectedEmpleado.fechaInicio).format("DD/MM/YYYY")}
                </Descriptions.Item>
                {selectedEmpleado.fechaTermino && (
                  <Descriptions.Item label="Fecha de Término">
                    {dayjs(selectedEmpleado.fechaTermino).format("DD/MM/YYYY")}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Salario">
                  <Text strong style={{ color: "#52c41a", fontSize: "16px" }}>
                    ${selectedEmpleado.salario.toLocaleString("es-CL")}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Jornada">
                  {selectedEmpleado.jornada}
                </Descriptions.Item>
                {selectedEmpleado.motivoEstado && (
                  <Descriptions.Item label="Observaciones">
                    <Alert
                      message={selectedEmpleado.motivoEstado}
                      type="warning"
                    />
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            <Card title="Información de Contacto">
              <Descriptions column={1}>
                <Descriptions.Item label="RUT">
                  {selectedEmpleado.rut}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedEmpleado.email}
                </Descriptions.Item>
                <Descriptions.Item label="Teléfono">
                  {selectedEmpleado.telefono}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </>
        )}
      </Drawer>

      {/* Drawer de Historial */}
      <Drawer
        title="Historial Laboral"
        width={640}
        onClose={() => setHistorialDrawerVisible(false)}
        open={historialDrawerVisible}
      >
        {selectedEmpleado && (
          <>
            <Card style={{ marginBottom: 16, textAlign: "center" }}>
              <Title level={4}>
                {selectedEmpleado.nombre} {selectedEmpleado.apellido}
              </Title>
              <Text type="secondary">{selectedEmpleado.rut}</Text>
            </Card>

            <Timeline
              items={selectedEmpleado.historial.map((evento) => ({
                color:
                  evento.tipo === "Contratación"
                    ? "green"
                    : evento.tipo === "Término de Contrato"
                    ? "red"
                    : evento.tipo === "Suspensión"
                    ? "orange"
                    : "blue",
                children: (
                  <div>
                    <Text strong style={{ display: "block", fontSize: "16px" }}>
                      {evento.tipo}
                    </Text>
                    <Text style={{ display: "block", marginTop: 4 }}>
                      {evento.descripcion}
                    </Text>
                    <Space style={{ marginTop: 8 }}>
                      <Tag icon={<CalendarOutlined />}>
                        {dayjs(evento.fecha).format("DD/MM/YYYY")}
                      </Tag>
                      <Tag icon={<BankOutlined />}>{evento.sucursal}</Tag>
                    </Space>
                  </div>
                ),
              }))}
            />
          </>
        )}
      </Drawer>

      {/* Modal de Cambio de Sucursal */}
      <Modal
        title={
          <Space>
            <SwapOutlined />
            <span>Cambio de Sucursal</span>
          </Space>
        }
        open={modalType === "cambio"}
        onCancel={() => setModalType(null)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitAction}>
          <Alert
            message="Información del Empleado"
            description={`${selectedEmpleado?.nombre} ${selectedEmpleado?.apellido} - ${selectedEmpleado?.cargo}`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item name="sucursalActual" label="Sucursal Actual">
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="nuevaSucursal"
            label="Nueva Sucursal"
            rules={[
              { required: true, message: "Seleccione la nueva sucursal" },
            ]}
          >
            <Select placeholder="Seleccione la nueva sucursal">
              <Option value="Sucursal Centro">Sucursal Centro</Option>
              <Option value="Sucursal Mall">Sucursal Mall</Option>
              <Option value="Sucursal Plaza">Sucursal Plaza</Option>
              <Option value="Sucursal Norte">Sucursal Norte</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="fechaCambio"
            label="Fecha Efectiva del Cambio"
            rules={[{ required: true, message: "Seleccione la fecha" }]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="motivo"
            label="Motivo del Cambio"
            rules={[{ required: true, message: "Ingrese el motivo" }]}
          >
            <TextArea
              rows={3}
              placeholder="Describa el motivo del cambio de sucursal"
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setModalType(null)}>Cancelar</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Confirmar Cambio
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Suspensión */}
      <Modal
        title={
          <Space>
            <PauseCircleOutlined />
            <span>Suspensión Temporal</span>
          </Space>
        }
        open={modalType === "suspension"}
        onCancel={() => setModalType(null)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitAction}>
          <Alert
            message="Información del Empleado"
            description={`${selectedEmpleado?.nombre} ${selectedEmpleado?.apellido} - ${selectedEmpleado?.cargo}`}
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            name="tipoSuspension"
            label="Tipo de Suspensión"
            rules={[{ required: true, message: "Seleccione el tipo" }]}
          >
            <Select placeholder="Seleccione el tipo de suspensión">
              <Option value="Licencia Médica">Licencia Médica</Option>
              <Option value="Permiso Sin Goce de Sueldo">
                Permiso Sin Goce de Sueldo
              </Option>
              <Option value="Suspensión Administrativa">
                Suspensión Administrativa
              </Option>
              <Option value="Vacaciones">Vacaciones</Option>
              <Option value="Otro">Otro</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fechaInicio"
                label="Fecha de Inicio"
                rules={[{ required: true, message: "Seleccione la fecha" }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="fechaFin"
                label="Fecha de Término"
                rules={[{ required: true, message: "Seleccione la fecha" }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="motivo"
            label="Observaciones"
            rules={[{ required: true, message: "Ingrese las observaciones" }]}
          >
            <TextArea
              rows={3}
              placeholder="Describa las observaciones o motivo de la suspensión"
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setModalType(null)}>Cancelar</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Registrar Suspensión
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Término de Contrato / Despido */}
      <Modal
        title={
          <Space>
            <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
            <span>Término de Contrato</span>
          </Space>
        }
        open={modalType === "despido"}
        onCancel={() => setModalType(null)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitAction}>
          <Alert
            message="Advertencia"
            description="Esta acción registrará el término del contrato del empleado. Asegúrese de completar toda la información correctamente."
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Alert
            message="Información del Empleado"
            description={`${selectedEmpleado?.nombre} ${selectedEmpleado?.apellido} - ${selectedEmpleado?.cargo} - ${selectedEmpleado?.sucursal}`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            name="tipoDespido"
            label="Tipo de Término"
            rules={[{ required: true, message: "Seleccione el tipo" }]}
          >
            <Select placeholder="Seleccione el tipo de término">
              <Option value="Renuncia Voluntaria">Renuncia Voluntaria</Option>
              <Option value="Término de Plazo Fijo">
                Término de Plazo Fijo
              </Option>
              <Option value="Despido Justificado">Despido Justificado</Option>
              <Option value="Mutuo Acuerdo">Mutuo Acuerdo</Option>
              <Option value="Necesidades de la Empresa">
                Necesidades de la Empresa
              </Option>
              <Option value="Otro">Otro</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="fechaDespido"
            label="Fecha de Término"
            rules={[{ required: true, message: "Seleccione la fecha" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="motivo"
            label="Motivo / Observaciones"
            rules={[{ required: true, message: "Ingrese el motivo" }]}
          >
            <TextArea
              rows={4}
              placeholder="Describa el motivo del término del contrato"
            />
          </Form.Item>

          <Form.Item name="indemnizacion" label="Indemnización">
            <Radio.Group>
              <Radio value="si">Con Indemnización</Radio>
              <Radio value="no">Sin Indemnización</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setModalType(null)}>Cancelar</Button>
              <Button type="primary" danger htmlType="submit" loading={loading}>
                Confirmar Término
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Renovación */}
      <Modal
        title={
          <Space>
            <SyncOutlined />
            <span>Renovación de Contrato</span>
          </Space>
        }
        open={modalType === "renovacion"}
        onCancel={() => setModalType(null)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitAction}>
          <Alert
            message="Información del Empleado"
            description={`${selectedEmpleado?.nombre} ${selectedEmpleado?.apellido} - ${selectedEmpleado?.cargo}`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Divider>Contrato Actual</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="tipoContratoActual" label="Tipo Actual">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="salarioActual" label="Salario Actual">
                <InputNumber
                  disabled
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Nuevo Contrato</Divider>

          <Form.Item
            name="nuevoTipoContrato"
            label="Nuevo Tipo de Contrato"
            rules={[{ required: true, message: "Seleccione el tipo" }]}
          >
            <Select placeholder="Seleccione el tipo de contrato">
              <Option value="Indefinido">Indefinido</Option>
              <Option value="Plazo Fijo">Plazo Fijo</Option>
              <Option value="Por Obra">Por Obra</Option>
              <Option value="Honorarios">Honorarios</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fechaInicio"
                label="Fecha de Inicio"
                rules={[{ required: true, message: "Seleccione la fecha" }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="fechaTermino"
                label="Fecha de Término"
                tooltip="Solo si es plazo fijo"
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="nuevoSalario"
            label="Nuevo Salario"
            rules={[{ required: true, message: "Ingrese el salario" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
              }
              parser={(value) => value.replace(/\$\s?|(\.*)/g, "")}
              min={0}
            />
          </Form.Item>

          <Form.Item name="observaciones" label="Observaciones">
            <TextArea
              rows={3}
              placeholder="Observaciones adicionales sobre la renovación"
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setModalType(null)}>Cancelar</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Renovar Contrato
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GestionContratos;
