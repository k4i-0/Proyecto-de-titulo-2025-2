import React, { useState, useEffect, useMemo, Children } from "react";
import {
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
  notification,
  Tabs,
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
  FileTextOutlined,
  FileAddOutlined,
  NotificationFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

import DataTable from "../../../components/Tabla";

import obtenerTodosFuncionarios, {
  crearFuncionario,
  editarFuncionario,
  eliminarFuncionario,
  obtenerContratosFuncionarios,
  obtenerFuncionariosSinContrato,
  asignarContratoAFuncionarioSinContrato,
  cambiarTurnoFuncionario,
  cambiarTipoContratoFuncionario,
} from "../../../services/usuario/funcionario.service";
import obtenerSucursales from "../../../services/inventario/Sucursal.service";

const GestionColaborador = () => {
  const [form] = Form.useForm();
  const [formContrato] = Form.useForm();
  const [formEditarTurno] = Form.useForm();
  const [formEditarContrato] = Form.useForm();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState(null);
  const [loading, setLoading] = useState(false);
  const [colaboradores, setColaboradores] = useState([]);

  const [contratos, setContratos] = useState([]);
  const [sucursales, setSucursales] = useState([]);

  const [modalContratoVisible, setModalContratoVisible] = useState(false);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);

  const [modalCrearContrato, setModalCrearContrato] = useState(false);
  const [funcionariosSinContrato, setFuncionariosSinContrato] = useState([]);
  const [modalEditarTurnoVisible, setModalEditarTurnoVisible] = useState(false);
  const [contratoTurnoEditando, setContratoTurnoEditando] = useState(null);
  const [modalEditarContratoVisible, setModalEditarContratoVisible] =
    useState(false);
  const [contratoEditando, setContratoEditando] = useState(null);
  const [funcionarioBuscado, setFuncionarioBuscado] = useState(null);

  //obtener sucursales
  useEffect(() => {
    const todasSucursales = async () => {
      try {
        setLoading(true);
        const response = await obtenerSucursales();
        console.log("respuesta sucursales", response);
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

  //obtener contratos
  const obtenerContratos = async () => {
    try {
      const respuesta = await obtenerContratosFuncionarios();
      console.log("respuesta de contratos funcionario", respuesta.data);
      if (respuesta.status === 200) {
        setContratos(respuesta.data);
        return;
      }
      notification.error({
        message: respuesta.error || "Error al cargar contratos",
        description: "Hubo un problema al obtener los contratos.",
      });
    } catch (error) {
      console.log(error);
      notification.error({
        message: error.message || "Error de servidor",
        description: "No se pudo conectar al servidor.",
        duration: 5,
      });
    }
  };

  //columnas de contratos
  const columnasContratos = [
    {
      title: "Colaborador",
      key: "colaborador",
      width: 200,
      render: (_, record) => {
        const nombre = record?.funcionario?.nombre || "N";
        const apellido = record?.funcionario?.apellido || "A";

        return (
          <Space key={`colaborador-contrato-${record?.idContratoFuncionario}`}>
            <Avatar
              key="avatar"
              size={40}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#1890ff" }}
            >
              {nombre.charAt(0).toUpperCase()}
              {apellido.charAt(0).toUpperCase()}
            </Avatar>
            <div key="info">
              <div style={{ fontWeight: 500 }}>
                {nombre} {apellido}
              </div>
              <div style={{ fontSize: "12px", color: "#999" }}>
                {record?.funcionario?.rut || "S/R"}
              </div>
            </div>
          </Space>
        );
      },
    },
    {
      title: "Sucursal",
      dataIndex: ["sucursal", "nombre"],
      key: "sucursal",
      width: 120,
      render: (sucursal) => (
        <Tag color="green">{sucursal || "Casa Matriz"}</Tag>
      ),
    },
    {
      title: "Tipo de Contrato",
      dataIndex: "tipoContrato",
      key: "tipoContrato",
      width: 120,
      render: (tipoContrato) => {
        const colors = {
          Indefinido: "blue",
          "Plazo Fijo": "orange",
          Honorarios: "purple",
        };
        return (
          <Tag color={colors[tipoContrato] || "default"}>
            {tipoContrato || "No asignado"}
          </Tag>
        );
      },
    },
    {
      title: "Turno",
      dataIndex: "turno",
      key: "turno",
      width: 100,
      render: (turno) => {
        const colors = {
          Mañana: "blue",
          Tarde: "orange",
          Noche: "purple",
          Rotativo: "green",
        };
        return (
          <Tag color={colors[turno] || "default"}>{turno || "No asignado"}</Tag>
        );
      },
    },
    {
      title: "Fecha de Ingreso",
      dataIndex: "fechaIngreso",
      key: "fechaIngreso",
      width: 120,
      render: (fechaIngreso) =>
        fechaIngreso ? dayjs(fechaIngreso).format("DD/MM/YYYY") : "N/A",
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 110,
      render: (estado) => (
        <Badge
          status={estado === "Activo" ? "success" : "error"}
          text={estado || "Desconocido"}
        />
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 80,
      fixed: "right",
      render: (_, record) => (
        <Space key={`acciones-contrato-${record.idContratoFuncionario}`}>
          <Tooltip key="view" title="Ver Detalles">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => abrirModalContrato(record)}
            />
          </Tooltip>
          <Tooltip key="edit-turno" title="Editar turno">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => abrirModalEditarTurno(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  //obtener funcionarios sin contrato para el select del formulario de contrato
  const obtenerFuncionarioSC = async () => {
    try {
      const respuesta = await obtenerFuncionariosSinContrato();
      console.log("respuesta funcionarios sin contrato", respuesta.data);
      if (respuesta.status === 200) {
        setFuncionariosSinContrato(respuesta.data);
        return;
      }
      if (respuesta.status === 204) {
        setFuncionariosSinContrato([]);
        notification.info({
          message: "No hay funcionarios sin contrato",
          description:
            "Todos los funcionarios activos tienen contrato asignado.",
        });
      }
      notification.error({
        message: respuesta.error || "Error al cargar funcionarios sin contrato",
        description:
          "Hubo un problema al obtener los funcionarios sin contrato.",
      });
    } catch (error) {
      console.log(error);
      notification.error({
        message: error.message || "Error de servidor",
        description: "No se pudo conectar al servidor.",
      });
    }
  };

  const abrirModalContrato = (record) => {
    setContratoSeleccionado(record);
    setModalContratoVisible(true);
  };

  const abrirModalEditarTurno = (record) => {
    setContratoTurnoEditando(record);
    formEditarTurno.setFieldsValue({
      idContratoFuncionario: record.idContratoFuncionario,
      turno: record?.turno,
    });
    setModalEditarTurnoVisible(true);
  };

  const cerrarModalContrato = () => {
    setContratoSeleccionado(null);
    setModalContratoVisible(false);
  };

  const cerrarModalEditarTurno = () => {
    setContratoTurnoEditando(null);
    setModalEditarTurnoVisible(false);
    formEditarTurno.resetFields();
  };

  const handleSubmitEditarTurno = async (values) => {
    console.log("Datos en Enviar cambio turno", values);
    try {
      const respuesta = await cambiarTurnoFuncionario(values);
      console.log("Respuesta del cambio de turno", respuesta);
      if (respuesta.status === 200) {
        notification.success({
          message: respuesta.data.message || "Turno actualizado",
        });
        formEditarTurno.resetFields();
        cerrarModalEditarTurno();
        obtenerContratos();
        obtenerColaboradores();
        return;
      }
      notification.error({
        message: respuesta.error || "Error al actualizar turno",
      });
    } catch (error) {
      console.log(error);
      notification.error({
        message: error.message || "Error de servidor",
        description: "No se pudo conectar al servidor.",
      });
    } finally {
      cerrarModalEditarTurno();
    }
  };

  // ABRIR/CERRAR Modal Editar Contrato (frontend-only)
  const abrirModalEditarContrato = (record) => {
    setContratoEditando(record);
    // intentar precargar funcionario
    setFuncionarioBuscado(record?.funcionario || null);
    formEditarContrato.setFieldsValue({
      rutBuscar: record?.funcionario?.rut || "",
      turno: record?.turno || undefined,
      motivo: "",
    });
    setModalEditarContratoVisible(true);
  };

  const cerrarModalEditarContrato = () => {
    setContratoEditando(null);
    setFuncionarioBuscado(null);
    setModalEditarContratoVisible(false);
    formEditarContrato.resetFields();
  };

  const handleBuscarFuncionarioPorRut = (rut) => {
    if (!rut) {
      notification.error({ message: "Ingrese RUT para buscar" });
      return;
    }
    const encontrado =
      colaboradores.find((c) => c.rut === rut) ||
      funcionariosSinContrato.find((f) => f.rut === rut);
    if (!encontrado) {
      setFuncionarioBuscado(null);
      notification.error({ message: "Funcionario no encontrado" });
      return;
    }
    console.log("encontrado", encontrado);
    setFuncionarioBuscado(encontrado);
    notification.success({ message: "Funcionario cargado" });
  };

  const handleSubmitEditarContrato = async (values) => {
    console.log("Datos en Editar Contrato", values);
    if (funcionarioBuscado.tipoContrato === values.nuevoContrato) {
      notification.info({ message: "El nuevo contrato es igual al actual" });
      return;
    }
    try {
      const respuesta = await cambiarTipoContratoFuncionario(values);
      console.log("Respuesta del cambio de contrato", respuesta);
      if (respuesta.status === 200) {
        notification.success({
          message: respuesta.data.message || "Contrato actualizado",
        });
        formEditarContrato.resetFields();
        obtenerContratos();
        obtenerColaboradores();
        return;
      }
      notification.error({
        message: respuesta.error || "Error al actualizar contrato",
      });
    } catch (error) {
      console.log("Error al editar contrato", error);
      notification.error({
        message: error.message || "Error de servidor",
      });
    } finally {
      cerrarModalEditarContrato();
    }
  };

  // Estadísticas
  const stats = {
    total: colaboradores.length,
    activos: colaboradores.filter((c) => c.estado === "Activo").length,
    inactivos: colaboradores.filter((c) => c.estado === "Inactivo").length,
  };

  const dataTableFilters = useMemo(() => {
    const uniqueValues = (field) => {
      return [
        ...new Set(colaboradores.map((item) => item[field]).filter(Boolean)),
      ]
        .map((value) => String(value))
        .sort((a, b) => a.localeCompare(b, "es"))
        .map((value) => ({ value, label: value }));
    };

    const sucursalOptions = [
      ...new Set(sucursales.map((item) => item.nombre).filter(Boolean)),
    ]
      .map((value) => String(value))
      .sort((a, b) => a.localeCompare(b, "es"))
      .map((value) => ({ value, label: value }));

    return [
      {
        key: "cargo",
        placeholder: "Cargo",
        options: uniqueValues("cargo"),
      },
      {
        key: "sucursal",
        placeholder: "Sucursal",
        options:
          sucursalOptions.length > 0
            ? sucursalOptions
            : uniqueValues("sucursal"),
      },
      {
        key: "turno",
        placeholder: "Turno",
        options: uniqueValues("turno"),
      },
      {
        key: "estado",
        placeholder: "Estado",
        options: uniqueValues("estado"),
      },
    ];
  }, [colaboradores, sucursales]);

  const columns = [
    {
      title: "Colaborador",
      key: "colaborador",
      render: (_, record) => {
        // Extraemos con valores por defecto para evitar errores de [0]
        const nombre = record?.nombre || "N";
        const apellido = record?.apellido || "A";

        return (
          <Space key={`colaborador-${record?.id || record?.idFuncionario}`}>
            <Avatar
              key="avatar"
              size={40}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#1890ff" }}
            >
              {/* Usamos el primer caracter de forma segura */}
              {nombre.charAt(0).toUpperCase()}
              {apellido.charAt(0).toUpperCase()}
            </Avatar>
            <div key="info">
              <div style={{ fontWeight: 500 }}>
                {nombre} {apellido}
              </div>
            </div>
          </Space>
        );
      },
    },
    {
      title: "Rut",
      dataIndex: "rut",
      key: "rut",
      width: 150,
      render: (rut) => rut || "S/R", // Maneja si el rut viene nulo
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
        };
        // Si no viene cargo en el objeto aplanado, ponemos "No asignado"
        return (
          <Tag color={colors[cargo] || "default"}>{cargo || "No asignado"}</Tag>
        );
      },
    },
    {
      title: "Sucursal",
      dataIndex: "sucursal",
      key: "sucursal",
      width: 150,
      render: (sucursal) => (
        <Tag color="green">{sucursal || "Casa Matriz"}</Tag>
      ),
    },
    {
      title: "Contacto",
      key: "contacto",
      width: 250,
      render: (_, record) => (
        <div key={`contacto-${record?.id || record?.idFuncionario}`}>
          <div key="phone" style={{ fontSize: "12px" }}>
            <PhoneOutlined style={{ marginRight: 4 }} />
            {record?.telefono || "N/A"}
          </div>
          <div key="email" style={{ fontSize: "12px", marginTop: 4 }}>
            <MailOutlined style={{ marginRight: 4 }} />
            {record?.email || "N/A"}
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
          text={estado || "Desconocido"}
        />
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space key={`acciones-${record?.id || record?.idFuncionario}`}>
          <Tooltip key="view" title="Ver Detalles">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip key="edit" title="Editar">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip key="delete" title="Eliminar">
            <Popconfirm
              title="¿Está seguro de eliminar este colaborador?"
              description="Esta acción no se puede deshacer."
              // IMPORTANTE: Asegúrate de que el ID que pasas aquí
              // coincida con el que viene del backend (idFuncionario)
              onConfirm={() => handleDelete(record.id || record.idFuncionario)}
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
    console.log("Editar", record);
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
      try {
        const response = await editarFuncionario(values);
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
          message: error || "Error de servidor",
          description: "No se pudo conectar al servidor.",
          duration: 5,
        });
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const response = await crearFuncionario(values);
        console.log("respuesta", response);
        if (response.status === 201) {
          notification.success({
            message: "Colaborador creado",
            description: "El colaborador se ha creado correctamente.",
            duration: 3,
          });
          //setColaboradores([...colaboradores, response.data]);
          obtenerColaboradores();
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

  const handleCerrarModal = () => {
    setDetailDrawerVisible(false);
    setDrawerVisible(false);
    obtenerColaboradores();
  };

  //contratos
  const abrirModalCrearContrato = () => {
    obtenerFuncionarioSC();
    setModalCrearContrato(true);
  };

  const cerrarModalCrearContrato = () => {
    setModalCrearContrato(false);
  };

  const handleSubmitContrato = async (values) => {
    console.log("Valores del formulario contrato:", values);
    try {
      const response = await asignarContratoAFuncionarioSinContrato(values);
      console.log("respuesta asignar contrato", response);
      if (response.status === 201) {
        notification.success({
          message: response.data.message || "Contrato asignado",
          description: "El contrato se ha asignado correctamente.",
          duration: 3,
        });
        cerrarModalCrearContrato();
        obtenerContratos();
        obtenerColaboradores();
        return;
      }
      notification.error({
        message: response.error || "Error al asignar contrato",
        description: "Hubo un problema al asignar el contrato.",
        duration: 5,
      });
    } catch (error) {
      console.log(error);
      notification.error({
        message: error.message || "Error de servidor",
        description: "No se pudo conectar al servidor.",
        duration: 5,
      });
    }
  };

  return (
    <div>
      <Tabs
        tabPosition="left"
        onChange={(key) => {
          console.log("key de tab", key);
          if (key === "contratos") {
            obtenerContratos();
          }
        }}
        items={[
          {
            key: "gestion_empleados",
            label: "Gestion Colaboradores",
            children: (
              <>
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
                  <DataTable
                    columns={columns}
                    data={colaboradores}
                    rowKey="id"
                    loading={loading}
                    searchPlaceholder="Buscar por nombre, RUT o sucursal..."
                    searchableFields={["nombre", "apellido", "rut", "sucursal"]}
                    filterConfig={dataTableFilters}
                  />
                </Card>
              </>
            ),
          },
          {
            key: "contratos",
            label: "Contratos",
            children: (
              <>
                <DataTable
                  title="Contratos de Colaboradores"
                  description="Revisa los contratos de tus colaboradores"
                  columns={columnasContratos}
                  data={contratos}
                  rowKey="idContratoFuncionario"
                  searchPlaceholder="Buscar por nombre, RUT o sucursal..."
                  searchableFields={[
                    "funcionario.nombre",
                    "funcionario.rut",
                    "sucursal.nombre",
                  ]}
                  headerButtons={
                    <Space>
                      <Button
                        type="primary"
                        icon={<FileAddOutlined />}
                        onClick={() => abrirModalCrearContrato({})}
                      >
                        Nuevo Contrato
                      </Button>

                      <Button
                        type="primary"
                        icon={<FileTextOutlined />}
                        onClick={() => abrirModalEditarContrato()}
                      >
                        Editar Contrato
                      </Button>
                    </Space>
                  }
                />
              </>
            ),
          },
        ]}
      />

      {/* Drawer para Crear/Editar */}
      <Drawer
        title={
          <Space>
            {editMode ? <EditOutlined /> : <UserAddOutlined />}
            <span>{editMode ? "Editar Colaborador" : "Nuevo Colaborador"}</span>
          </Space>
        }
        width={720}
        onClose={handleCerrarModal}
        open={drawerVisible}
        extra={
          <Space>
            <Button onClick={handleCerrarModal}>Cancelar</Button>
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
          // initialValues={{
          //   estadoContrato: "Activo",
          //   turno: "Mañana",
          //   contrato: "Plazo Fijo",
          // }}
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
              <Form.Item label="Rol" name="nombreRol">
                <Select placeholder="Seleccione un rol">
                  <Option value="Administrador">Administrador</Option>
                  <Option value="Vendedor">Vendedor</Option>
                  <Option value="Cajero">Cajero</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* 
          

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
                  <Option value="Rotativo">Rotativo</Option>
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
                label="Estado Relacion Laboral"
                rules={[
                  { required: true, message: "Por favor seleccione el estado" },
                ]}
                initialValue="Activo"
              >
                <Select placeholder="Seleccione el estado">
                  <Option value="Activo">Activo</Option>
                  <Option value="Inactivo">Inactivo</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row> */}
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
        onClose={handleCerrarModal}
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
                  {selectedColaborador.sucursal || "Sin Informacion"}
                </Descriptions.Item>
                <Descriptions.Item label="Cargo">
                  <Tag color="blue">
                    {selectedColaborador.cargo || "Sin Informacion"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Turno">
                  <Tag color="orange">
                    {selectedColaborador.turno || "Sin Informacion"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tipo de Contrato">
                  {selectedColaborador.tipoContrato || "Sin Informacion"}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span>
                      <CalendarOutlined style={{ marginRight: 8 }} />
                      Fecha de Ingreso
                    </span>
                  }
                >
                  {selectedColaborador?.fechaIngreso
                    ? dayjs(selectedColaborador?.fechaIngreso).format(
                        "DD/MM/YYYY",
                      )
                    : "Sin Informacion"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Estadísticas">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Días Trabajando"
                    value={
                      selectedColaborador.fechaIngreso
                        ? dayjs().diff(
                            dayjs(selectedColaborador.fechaIngreso),
                            "day",
                          )
                        : "N/A"
                    }
                    suffix="días"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Antigüedad"
                    value={
                      selectedColaborador.fechaIngreso
                        ? dayjs().diff(
                            dayjs(selectedColaborador.fechaIngreso),
                            "month",
                          )
                        : "N/A"
                    }
                    suffix="meses"
                  />
                </Col>
              </Row>
            </Card>
          </>
        )}
      </Drawer>

      {/**Modal Contrato funcionario */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ fontSize: 18 }} />
            <span>Contrato - {contratoSeleccionado?.funcionario?.nombre}</span>
          </Space>
        }
        open={modalContratoVisible}
        onCancel={cerrarModalContrato}
        width={800}
        footer={[
          <Button key="cerrar" onClick={cerrarModalContrato}>
            Cerrar
          </Button>,
        ]}
      >
        {contratoSeleccionado && (
          <>
            {/* Card Colaborador */}
            <Card style={{ marginBottom: 16 }}>
              <Row gutter={24} align="middle">
                <Col xs={24} sm={6} style={{ textAlign: "center" }}>
                  <Avatar
                    size={80}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#1890ff" }}
                  >
                    {contratoSeleccionado?.funcionario?.nombre?.charAt(0)}
                    {contratoSeleccionado?.funcionario?.apellido?.charAt(0)}
                  </Avatar>
                </Col>
                <Col xs={24} sm={18}>
                  <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
                    {contratoSeleccionado?.funcionario?.nombre}{" "}
                    {contratoSeleccionado?.funcionario?.apellido}
                  </Title>
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">
                      RUT: {contratoSeleccionado?.funcionario?.rut}
                    </Text>
                    <Text type="secondary">
                      Sucursal: {contratoSeleccionado?.sucursal?.nombre}
                    </Text>
                  </Space>
                  <div style={{ marginTop: 12 }}>
                    <Badge
                      status={
                        contratoSeleccionado?.estado === "Activo"
                          ? "success"
                          : "error"
                      }
                      text={contratoSeleccionado?.estado}
                    />
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Información Personal */}
            <Card title="Información Personal" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Fecha Ingreso">
                  {contratoSeleccionado?.fechaIngreso
                    ? dayjs(contratoSeleccionado.fechaIngreso).format(
                        "DD/MM/YYYY",
                      )
                    : "Sin información"}
                </Descriptions.Item>
                <Descriptions.Item label="Dirección">
                  {contratoSeleccionado?.sucursal?.direccion || "No informado"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Información Contractual */}
            <Card title="Información Contractual" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                      Tipo de Contrato
                    </Text>
                    <Tag
                      color={
                        contratoSeleccionado?.tipoContrato === "Indefinido"
                          ? "blue"
                          : contratoSeleccionado?.tipoContrato === "Plazo Fijo"
                            ? "orange"
                            : "purple"
                      }
                    >
                      {contratoSeleccionado?.tipoContrato || "No informado"}
                    </Tag>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                      Turno
                    </Text>
                    <Tag
                      color={
                        contratoSeleccionado?.turno === "Mañana"
                          ? "blue"
                          : contratoSeleccionado?.turno === "Tarde"
                            ? "orange"
                            : contratoSeleccionado?.turno === "Noche"
                              ? "purple"
                              : "green"
                      }
                    >
                      {contratoSeleccionado?.turno || "No informado"}
                    </Tag>
                  </div>
                </Col>
              </Row>

              <Descriptions column={1} size="small">
                <Descriptions.Item label="Sucursal">
                  {contratoSeleccionado?.sucursal?.nombre || "No informado"}
                </Descriptions.Item>
                <Descriptions.Item label="Estado Sucursal">
                  <Badge
                    status={
                      contratoSeleccionado?.sucursal?.estado === "Activo"
                        ? "success"
                        : "error"
                    }
                    text={contratoSeleccionado?.sucursal?.estado}
                  />
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </>
        )}
      </Modal>

      {/**Modal Editar Turno */}
      <Modal
        title="Editar turno"
        open={modalEditarTurnoVisible}
        onOk={() => formEditarTurno.submit()}
        onCancel={cerrarModalEditarTurno}
        okText="Guardar cambios"
        cancelText="Cancelar"
      >
        <Form
          form={formEditarTurno}
          layout="vertical"
          onFinish={handleSubmitEditarTurno}
        >
          <Card style={{ marginBottom: 16 }}>
            <Space direction="vertical" size={0}>
              <Text strong>
                {contratoTurnoEditando?.funcionario?.nombre || "-"}{" "}
                {contratoTurnoEditando?.funcionario?.apellido || ""}
              </Text>
              <Text type="secondary">
                RUT: {contratoTurnoEditando?.funcionario?.rut || "-"}
              </Text>
              <Text type="secondary">
                Sucursal: {contratoTurnoEditando?.sucursal?.nombre || "-"}
              </Text>
            </Space>
          </Card>
          <Form.Item
            name="idContratoFuncionario"
            hidden
            initialValue={contratoTurnoEditando?.idContratoFuncionario}
          >
            <Input type="hidden" />
          </Form.Item>

          <Form.Item
            name="turno"
            label="Turno"
            rules={[{ required: true, message: "Seleccione el turno" }]}
          >
            <Select placeholder="Seleccione un turno">
              <Option value="Mañana">Mañana</Option>
              <Option value="Tarde">Tarde</Option>
              <Option value="Noche">Noche</Option>
              <Option value="Rotativo">Rotativo</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/**Modal Editar Contrato (frontend-only) */}
      <Modal
        title="Editar Contrato"
        open={modalEditarContratoVisible}
        onOk={() => formEditarContrato.submit()}
        onCancel={cerrarModalEditarContrato}
        okText="Guardar cambios"
        cancelText="Cancelar"
        width={700}
      >
        <Form
          form={formEditarContrato}
          layout="vertical"
          onFinish={handleSubmitEditarContrato}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="rutBuscar" label="Buscar funcionario por RUT">
                <Input.Search
                  placeholder="Ej: 12345678-9"
                  enterButton="Buscar"
                  onSearch={handleBuscarFuncionarioPorRut}
                />
              </Form.Item>

              <Form.Item label="Funcionario" shouldUpdate>
                <Input
                  value={
                    funcionarioBuscado
                      ? `${funcionarioBuscado.nombre} ${funcionarioBuscado.apellido} - ${funcionarioBuscado.rut}`
                      : "Ninguno seleccionado"
                  }
                  disabled
                />
              </Form.Item>

              <Form.Item
                name="nuevoContrato"
                label="Modalidad de Contrato"
                rules={[
                  {
                    required: true,
                    message: "Seleccione la modalidad de contrato",
                  },
                ]}
              >
                <Select placeholder="Seleccione un nuevo contrato">
                  <Option value="Indefinido">Indefinido</Option>
                  <Option value="Plazo Fijo">Plazo Fijo</Option>
                  <Option value="Honorarios">Honorarios</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="motivo"
                label="Motivo"
                rules={[{ required: true, message: "Ingrese motivo" }]}
              >
                <TextArea rows={3} placeholder="Motivo del cambio" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Text strong>Resumen</Text>
                <div style={{ marginTop: 12 }}>
                  <div>
                    <Text type="secondary">Contrato: </Text>
                    <div>{funcionarioBuscado?.tipoContrato || "-"}</div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">Sucursal: </Text>
                    <div>{funcionarioBuscado?.sucursal || "-"}</div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/**Modal Nuevo Contrato */}
      <Modal
        title="Nuevo Contrato"
        open={modalCrearContrato}
        okText="Crear Contrato"
        onOk={() => formContrato.submit()}
        onCancel={() => cerrarModalCrearContrato()}
        width={600}
      >
        <Form
          form={formContrato}
          layout="vertical"
          onFinish={handleSubmitContrato}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="estadoContrato"
                label="Estado del Contrato"
                rules={[
                  {
                    required: true,
                    message: "Seleccione el estado del contrato",
                  },
                ]}
                initialValue="Activo"
              >
                <Select placeholder="Seleccione el estado" disabled>
                  <Option value="Activo">Activo</Option>
                  <Option value="Inactivo">Inactivo</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="fechaIngreso"
                label="Fecha de Ingreso"
                rules={[
                  { required: true, message: "Seleccione la fecha de ingreso" },
                ]}
                initialValue={dayjs()}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder={dayjs().format("DD/MM/YYYY")}
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="rutFuncionario"
                label="Funcionario"
                initialValue={contratoSeleccionado?.funcionario?.rut}
              >
                <Select placeholder="Seleccione un funcionario">
                  {funcionariosSinContrato.map((funcionario) => (
                    <Option
                      key={funcionario.idFuncionario}
                      value={funcionario.rut}
                    >
                      {funcionario.nombre} {funcionario.apellido} -{" "}
                      {funcionario.rut}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="idSucursal"
                label="Sucursal"
                rules={[{ required: true, message: "Seleccione la sucursal" }]}
              >
                <Select placeholder="Seleccione una sucursal">
                  {sucursales.map((sucursal) => (
                    <Option
                      key={sucursal.idSucursal}
                      value={sucursal.idSucursal}
                    >
                      {sucursal.nombre}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="tipoContrato"
            label="Tipo de Contrato"
            rules={[
              { required: true, message: "Seleccione el tipo de contrato" },
            ]}
          >
            <Select placeholder="Seleccione tipo de contrato">
              <Option value="Indefinido">Indefinido</Option>
              <Option value="Plazo Fijo">Plazo Fijo</Option>
              <Option value="Honorarios">Honorarios</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="turno"
            label="Turno"
            rules={[{ required: true, message: "Seleccione el turno" }]}
          >
            <Select placeholder="Seleccione un turno">
              <Option value="Mañana">Mañana </Option>
              <Option value="Tarde">Tarde</Option>
              <Option value="Noche">Noche</Option>
              <Option value="Rotativo">Rotativo</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GestionColaborador;
