// import React, { useState, useEffect } from "react";

// import { useParams } from "react-router-dom";

// import {
//   Typography,
//   Table,
//   Card,
//   Row,
//   Col,
//   Button,
//   Drawer,
//   notification,
//   Spin,
//   List,
//   Avatar,
//   Tag,
//   Space,
// } from "antd";
// const { Title } = Typography;

// //importaciones
// import obtenerTodosFuncionarios, {
//   crearFuncionario,
//   obtenerColaboradoresSucursal,
// } from "../../services/usuario/funcionario.service.js";

// export default function GestionColaborador() {
//   const { idSucursal } = useParams();
//   const [colaboradores, setColaboradores] = useState([]); // Lista de colaboradores
//   const [funcionarios, setFuncionarios] = useState([]); // Lista de funcionarios disponibles para agregar

//   //Componentes de estado
//   const [loading, setLoading] = useState(false);
//   //Drawer Estados
//   const [drawerAgregarFuncionario, setDrawerAgregarFuncionario] =
//     useState(false);

//   //Funciones para obtener datos (colaboradores y funcionarios)

//   const obtenerFuncionarios = async () => {
//     try {
//       setLoading(true);
//       const respuesta = await obtenerTodosFuncionarios();
//       if (respuesta.status === 200) {
//         console.log("Funcionarios obtenidos:", respuesta.data);
//         setFuncionarios(respuesta.data);
//         notification.success({
//           message: "Éxito",
//           description: "Funcionarios obtenidos correctamente.",
//           placement: "topRight",
//         });
//         setLoading(false);
//         return;
//       }
//       if (respuesta.status === 204) {
//         setFuncionarios([]);
//         notification.info({
//           message: "Información",
//           description: "No hay funcionarios disponibles para mostrar.",
//           placement: "topRight",
//         });
//         setLoading(false);
//         return;
//       }
//       notification.error({
//         message: "Error",
//         description: respuesta.error || "Error al obtener los funcionarios.",
//         placement: "topRight",
//       });
//     } catch (error) {
//       console.error("Error al obtener los funcionarios:", error);
//       notification.error({
//         message: "Error",
//         description: error.message || "Error al obtener los funcionarios.",
//         placement: "topRight",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const crearContratoFuncionario = async (datos) => {
//     try {
//       setLoading(true);
//       const respuesta = await crearFuncionario(datos);
//       if (respuesta.status === 200) {
//         notification.success({
//           message: "Éxito",
//           description: "Funcionario creado correctamente.",
//           placement: "topRight",
//         });
//         setLoading(false);
//         return;
//       }
//       if (respuesta.status === 422) {
//         notification.warning({
//           message: "Advertencia",
//           description:
//             respuesta.error || "Datos incompletos para crear el funcionario.",
//           placement: "topRight",
//         });
//         setLoading(false);
//         return;
//       }
//       if (respuesta.status === 409) {
//         notification.warning({
//           message: "Advertencia",
//           description:
//             respuesta.error ||
//             "El funcionario ya existe y no se puede crear duplicado.",
//           placement: "topRight",
//         });
//         setLoading(false);
//         return;
//       }
//       notification.error({
//         message: "Error",
//         description: respuesta.error || "Error al crear el funcionario.",
//         placement: "topRight",
//       });
//     } catch (error) {
//       console.error("Error al crear el funcionario:", error);
//       notification.error({
//         message: "Error",
//         description: error.message || "Error al crear el funcionario.",
//         placement: "topRight",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const obtenerColaboradores = async (idSucursal) => {
//     try {
//       setLoading(true);
//       const respuesta = await obtenerColaboradoresSucursal(idSucursal);
//       if (respuesta.status === 200) {
//         console.log("Colaboradores obtenidos:", respuesta.data);
//         notification.success({
//           message: "Éxito",
//           description: "Colaboradores obtenidos correctamente.",
//           placement: "topRight",
//         });
//         setColaboradores(respuesta.data);
//         setLoading(false);
//         return;
//       }
//       if (respuesta.status === 204) {
//         notification.info({
//           message: "Información",
//           description: "No hay colaboradores registrados para esta sucursal.",
//           placement: "topRight",
//         });
//         setColaboradores([]);
//         setLoading(false);
//         return;
//       }
//       if (respuesta.status === 422) {
//         notification.warning({
//           message: "Advertencia",
//           description: respuesta.error || "Falta el ID de la sucursal.",
//           placement: "topRight",
//         });
//         setLoading(false);
//         return;
//       }
//       notification.error({
//         message: "Error",
//         description: respuesta.error || "Error al obtener los colaboradores.",
//         placement: "topRight",
//       });
//     } catch (error) {
//       console.error("Error al obtener los colaboradores:", error);
//       notification.error({
//         message: "Error",
//         description: error.message || "Error al obtener los colaboradores.",
//         placement: "topRight",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     obtenerColaboradores(idSucursal);
//   }, [idSucursal]);

//   //Funciones para manejar acciones
//   const handleOpenDrawerAgregarFuncionario = async () => {
//     await obtenerFuncionarios();
//     setDrawerAgregarFuncionario(true);
//   };

//   const handleCloseDrawerAgregarFuncionario = () => {
//     setDrawerAgregarFuncionario(false);
//   };

//   const handleAgregarFuncionario = async (funcionario) => {
//     const datosContrato = {
//       idSucursal: idSucursal,
//       idFuncionario: funcionario.idFuncionario,
//     };
//     await crearContratoFuncionario(datosContrato);
//     setDrawerAgregarFuncionario(false);
//     await obtenerColaboradores(idSucursal);
//   };

//   const columns = [
//     {
//       title: "Nombre",
//       dataIndex: ["funcionario", "nombre"],
//       key: "nombre",
//     },

//     {
//       title: "RUT",
//       dataIndex: ["funcionario", "rut"],
//       key: "rut",
//     },
//     {
//       title: "Cargo",
//       dataIndex: ["funcionario", "role", "nombreRol"],
//       key: "cargo",
//     },
//     {
//       title: "Tipo Contrato",
//       dataIndex: "tipoContrato",
//       key: "tipoContrato",
//     },
//     {
//       title: "Fecha Ingreso",
//       dataIndex: "fechaIngreso",
//       key: "fechaIngreso",
//       render: (fecha) => new Date(fecha).toLocaleDateString("es-CL"),
//     },
//     {
//       title: "Fecha Término",
//       dataIndex: "fechaTermino",
//       key: "fechaTermino",
//       render: (fecha) => new Date(fecha).toLocaleDateString("es-CL"),
//     },
//     {
//       title: "Estado",
//       dataIndex: "estado",
//       key: "estado",
//       render: (estado) => (
//         <Tag color={estado === "Activo" ? "green" : "red"}>{estado}</Tag>
//       ),
//     },
//     {
//       title: "Acciones",
//       key: "acciones",
//       render: () => (
//         <Space>
//           <Button type="primary" size="small">
//             Ver
//           </Button>
//           <Button danger size="small">
//             Eliminar
//           </Button>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <>
//       <Spin spinning={loading} size="large" tip="Cargando..." fullscreen />
//       <Row>
//         <Col style={{ textAlign: "left" }}>
//           <Button onClick={() => navigator("/admin/sucursal/" + idSucursal)}>

//             Volver
//           </Button>
//         </Col>
//       </Row>
//       <Row>
//         <Col style={{ textAlign: "center", width: "100%", marginTop: 20 }}>
//           <Title level={2}>Gestión de Colaboradores</Title>
//         </Col>
//       </Row>
//       <Card
//         style={{ marginBottom: 20 }}
//         title={`Colaboradores sucursal ${idSucursal}`}
//       >
//         <Row gutter={16} justify="end" style={{ marginBottom: 16 }}>
//           <Col>
//             <Button onClick={handleOpenDrawerAgregarFuncionario}>
//               Agregar Funcionario
//             </Button>
//           </Col>
//           <Col>
//             <Button>Ver Funcionarios</Button>
//           </Col>
//         </Row>
//         <Table
//           dataSource={colaboradores}
//           columns={columns}
//           scroll={{ x: 600 }}
//           rowKey="idContratoFuncionario"
//         />
//       </Card>

//       {/* Drawer para agregar funcionarios */}
//       <Drawer
//         title="Agregar Funcionario"
//         width={500}
//         onClose={handleCloseDrawerAgregarFuncionario}
//         open={drawerAgregarFuncionario}
//       >
//         {funcionarios.length === 0 ? (
//           <p>No hay funcionarios disponibles para agregar.</p>
//         ) : (
//           <>
//             {/* {funcionarios.map((funcionario) => (
//               <Card
//                 key={funcionario.idFuncionario}
//                 type="inner"
//                 title={`Nombre: ${funcionario.nombre} ${funcionario.apellido}`}
//                 width="100%"
//                 style={{ marginBottom: 16 }}
//               > */}
//             <List
//               dataSource={funcionarios}
//               renderItem={(funcionario) => (
//                 <List.Item>
//                   <List.Item.Meta
//                     avatar={<Avatar>{funcionario.nombre[0]}</Avatar>}
//                     title={funcionario.nombre}
//                     description={`${funcionario.rut || "Sin RUT"} - ${
//                       funcionario.role?.nombreRol || "Sin rol"
//                     }`}
//                   />
//                   <Button onClick={() => handleAgregarFuncionario(funcionario)}>
//                     Agregar
//                   </Button>
//                 </List.Item>
//               )}
//             />

//             {/* </Card> */}
//             {/* ))} */}
//           </>
//         )}
//       </Drawer>
//     </>
//   );
// }

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Table,
  Card,
  Row,
  Col,
  Button,
  Drawer,
  notification,
  Spin,
  List,
  Avatar,
  Tag,
  Space,
  Input,
  Empty,
  Popconfirm,
  Modal,
  Descriptions,
  Select,
  Form,
  DatePicker,
} from "antd";
import {
  ArrowLeftOutlined,
  UserAddOutlined,
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  FilterOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Search } = Input;

// Importaciones de servicios
import obtenerTodosFuncionarios, {
  crearFuncionario,
  obtenerColaboradoresSucursal,
  desvincularFuncionario,
} from "../../services/usuario/funcionario.service.js";

export default function GestionColaborador() {
  const { idSucursal } = useParams();
  const navigate = useNavigate();

  // Estados principales
  const [colaboradores, setColaboradores] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionariosFiltrados, setFuncionariosFiltrados] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados de UI
  const [drawerAgregarFuncionario, setDrawerAgregarFuncionario] =
    useState(false);
  const [modalDetalle, setModalDetalle] = useState({
    visible: false,
    colaborador: null,
  });
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  // Formulario para agregar contrato
  const [formContrato] = Form.useForm();

  // ========== FUNCIONES DE OBTENCIÓN DE DATOS ==========

  const obtenerColaboradores = useCallback(async () => {
    if (!idSucursal) return;

    try {
      setLoading(true);
      const respuesta = await obtenerColaboradoresSucursal(idSucursal);

      if (respuesta.status === 200) {
        setColaboradores(respuesta.data);
        notification.success({
          message: "Éxito",
          description: `${respuesta.data.length} colaboradores cargados`,
          placement: "topRight",
          duration: 2,
        });
      } else if (respuesta.status === 204) {
        setColaboradores([]);
        notification.info({
          message: "Sin colaboradores",
          description: "No hay colaboradores en esta sucursal",
          placement: "topRight",
          duration: 2,
        });
      } else {
        throw new Error(respuesta.error || "Error al obtener colaboradores");
      }
    } catch (error) {
      console.error("Error al obtener colaboradores:", error);
      notification.error({
        message: "Error",
        description: error.message,
        placement: "topRight",
      });
      setColaboradores([]);
    } finally {
      setLoading(false);
    }
  }, [idSucursal]);

  const obtenerFuncionarios = async () => {
    try {
      setLoading(true);
      const respuesta = await obtenerTodosFuncionarios();

      if (respuesta.status === 200) {
        // Filtrar funcionarios que NO están en la sucursal actual
        const idsColaboradores = colaboradores.map((c) => c.idFuncionario);
        const disponibles = respuesta.data.filter(
          (f) =>
            !idsColaboradores.includes(f.idFuncionario) && f.estado === "Activo"
        );

        setFuncionarios(disponibles);
        setFuncionariosFiltrados(disponibles);

        if (disponibles.length === 0) {
          notification.info({
            message: "Sin funcionarios disponibles",
            description: "Todos los funcionarios activos ya están asignados",
            placement: "topRight",
          });
        }
      } else if (respuesta.status === 204) {
        setFuncionarios([]);
        setFuncionariosFiltrados([]);
      } else {
        throw new Error(respuesta.error || "Error al obtener funcionarios");
      }
    } catch (error) {
      console.error("Error al obtener funcionarios:", error);
      notification.error({
        message: "Error",
        description: error.message,
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  // ========== FUNCIONES DE ACCIÓN ==========

  const crearContratoFuncionario = async (valores) => {
    try {
      setLoading(true);
      const datos = {
        idSucursal: parseInt(idSucursal),
        idFuncionario: valores.idFuncionario,
        tipoContrato: valores.tipoContrato,
        fechaIngreso: valores.fechaIngreso?.toISOString(),
        fechaTermino: valores.fechaTermino?.toISOString(),
        salario: valores.salario,
      };

      const respuesta = await crearFuncionario(datos);

      if (respuesta.status === 200 || respuesta.status === 201) {
        notification.success({
          message: "Éxito",
          description: "Contrato creado correctamente",
          placement: "topRight",
        });
        formContrato.resetFields();
        setDrawerAgregarFuncionario(false);
        await obtenerColaboradores();
      } else if (respuesta.status === 409) {
        notification.warning({
          message: "Contrato existente",
          description: "El funcionario ya tiene un contrato en esta sucursal",
          placement: "topRight",
        });
      } else {
        throw new Error(respuesta.error || "Error al crear contrato");
      }
    } catch (error) {
      console.error("Error al crear contrato:", error);
      notification.error({
        message: "Error",
        description: error.message,
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarContrato = async (idContratoFuncionario) => {
    try {
      setLoading(true);
      const respuesta = await desvincularFuncionario(idContratoFuncionario);

      if (respuesta.status === 200) {
        notification.success({
          message: "Éxito",
          description: "Contrato finalizado correctamente",
          placement: "topRight",
        });
        await obtenerColaboradores();
      } else {
        throw new Error(respuesta.error || "Error al finalizar contrato");
      }
    } catch (error) {
      console.error("Error al eliminar contrato:", error);
      notification.error({
        message: "Error",
        description: error.message,
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  // ========== FUNCIONES DE UI ==========

  const handleOpenDrawer = async () => {
    await obtenerFuncionarios();
    setDrawerAgregarFuncionario(true);
  };

  const handleCloseDrawer = () => {
    setDrawerAgregarFuncionario(false);
    formContrato.resetFields();
    setBusqueda("");
    setFuncionariosFiltrados(funcionarios);
  };

  const handleBuscarFuncionario = (valor) => {
    setBusqueda(valor);
    const filtrados = funcionarios.filter(
      (f) =>
        f.nombre.toLowerCase().includes(valor.toLowerCase()) ||
        f.rut?.toLowerCase().includes(valor.toLowerCase()) ||
        f.role?.nombreRol?.toLowerCase().includes(valor.toLowerCase())
    );
    setFuncionariosFiltrados(filtrados);
  };

  const handleVerDetalle = (colaborador) => {
    setModalDetalle({ visible: true, colaborador });
  };

  const handleCloseModal = () => {
    setModalDetalle({ visible: false, colaborador: null });
  };

  const colaboradoresFiltrados = colaboradores.filter((c) => {
    if (filtroEstado === "todos") return true;
    return c.estado === filtroEstado;
  });

  // ========== EFECTOS ==========

  useEffect(() => {
    obtenerColaboradores();
  }, [obtenerColaboradores]);

  // ========== CONFIGURACIÓN DE TABLA ==========

  const columns = [
    {
      title: "Nombre",
      dataIndex: ["funcionario", "nombre"],
      key: "nombre",
      sorter: (a, b) =>
        a.funcionario.nombre.localeCompare(b.funcionario.nombre),
    },
    {
      title: "RUT",
      dataIndex: ["funcionario", "rut"],
      key: "rut",
    },
    {
      title: "Cargo",
      dataIndex: ["funcionario", "role", "nombreRol"],
      key: "cargo",
      render: (rol) => <Tag color="blue">{rol || "Sin cargo"}</Tag>,
    },
    {
      title: "Tipo Contrato",
      dataIndex: "tipoContrato",
      key: "tipoContrato",
    },
    {
      title: "Fecha Ingreso",
      dataIndex: "fechaIngreso",
      key: "fechaIngreso",
      render: (fecha) =>
        fecha ? new Date(fecha).toLocaleDateString("es-CL") : "N/A",
      sorter: (a, b) => new Date(a.fechaIngreso) - new Date(b.fechaIngreso),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado) => (
        <Tag
          color={
            estado === "Activo"
              ? "green"
              : estado === "Inactivo"
              ? "red"
              : "orange"
          }
        >
          {estado}
        </Tag>
      ),
      filters: [
        { text: "Activo", value: "Activo" },
        { text: "Inactivo", value: "Inactivo" },
      ],
      onFilter: (value, record) => record.estado === value,
    },
    {
      title: "Acciones",
      key: "acciones",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleVerDetalle(record)}
          >
            Ver
          </Button>
          <Popconfirm
            title="¿Finalizar contrato?"
            description="Esta acción cambiará el estado del contrato"
            onConfirm={() =>
              handleEliminarContrato(record.idContratoFuncionario)
            }
            okText="Sí"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ========== RENDER ==========

  return (
    <>
      <Spin spinning={loading} size="large" tip="Cargando..." fullscreen />

      {/* Header */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/admin/sucursal/${idSucursal}`)}
            >
              Volver
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              Gestión de Colaboradores - Sucursal {idSucursal}
            </Title>
          </Space>
        </Col>
      </Row>

      {/* Card Principal */}
      <Card
        title={
          <Space>
            <Text strong>Colaboradores</Text>
            <Tag color="blue">{colaboradoresFiltrados.length} total</Tag>
          </Space>
        }
        extra={
          <Space>
            <Select
              value={filtroEstado}
              onChange={setFiltroEstado}
              style={{ width: 120 }}
              options={[
                { label: "Todos", value: "todos" },
                { label: "Activos", value: "Activo" },
                { label: "Inactivos", value: "Inactivo" },
              ]}
            />
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={handleOpenDrawer}
            >
              Agregar Funcionario
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={colaboradoresFiltrados}
          columns={columns}
          scroll={{ x: 1000 }}
          rowKey="idContratoFuncionario"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} colaboradores`,
          }}
        />
      </Card>

      {/* Drawer: Agregar Funcionario */}
      <Drawer
        title="Agregar Funcionario a la Sucursal"
        width={600}
        onClose={handleCloseDrawer}
        open={drawerAgregarFuncionario}
      >
        <Search
          placeholder="Buscar por nombre, RUT o cargo"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          value={busqueda}
          onChange={(e) => handleBuscarFuncionario(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        {funcionariosFiltrados.length === 0 ? (
          <Empty
            description="No hay funcionarios disponibles"
            style={{ marginTop: 50 }}
          />
        ) : (
          <List
            dataSource={funcionariosFiltrados}
            renderItem={(funcionario) => (
              <List.Item
                actions={[
                  <Button
                    type="primary"
                    onClick={() => {
                      formContrato.setFieldsValue({
                        idFuncionario: funcionario.idFuncionario,
                      });
                      Modal.confirm({
                        title: `Agregar ${funcionario.nombre}`,
                        content: (
                          <Form
                            form={formContrato}
                            layout="vertical"
                            initialValues={{
                              idFuncionario: funcionario.idFuncionario,
                              tipoContrato: "Indefinido",
                            }}
                          >
                            <Form.Item name="idFuncionario" hidden>
                              <Input />
                            </Form.Item>
                            <Form.Item
                              label="Tipo de Contrato"
                              name="tipoContrato"
                              rules={[
                                {
                                  required: true,
                                  message: "Seleccione tipo de contrato",
                                },
                              ]}
                            >
                              <Select
                                options={[
                                  { label: "Indefinido", value: "Indefinido" },
                                  { label: "Plazo Fijo", value: "Plazo Fijo" },
                                  { label: "Honorarios", value: "Honorarios" },
                                ]}
                              />
                            </Form.Item>
                            <Form.Item
                              label="Fecha de Ingreso"
                              name="fechaIngreso"
                              rules={[
                                {
                                  required: true,
                                  message: "Seleccione fecha de ingreso",
                                },
                              ]}
                            >
                              <DatePicker
                                style={{ width: "100%" }}
                                format="DD/MM/YYYY"
                              />
                            </Form.Item>
                            <Form.Item
                              label="Fecha de Término"
                              name="fechaTermino"
                            >
                              <DatePicker
                                style={{ width: "100%" }}
                                format="DD/MM/YYYY"
                              />
                            </Form.Item>
                            <Form.Item
                              label="Salario"
                              name="salario"
                              rules={[
                                { required: true, message: "Ingrese salario" },
                              ]}
                            >
                              <Input type="number" prefix="$" />
                            </Form.Item>
                          </Form>
                        ),
                        width: 500,
                        okText: "Agregar",
                        cancelText: "Cancelar",
                        onOk: async () => {
                          try {
                            const valores = await formContrato.validateFields();
                            await crearContratoFuncionario(valores);
                          } catch (error) {
                            console.error("Error de validación:", error);
                          }
                        },
                      });
                    }}
                  >
                    Agregar
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar size={48} style={{ backgroundColor: "#1890ff" }}>
                      {funcionario.nombre?.[0]?.toUpperCase()}
                    </Avatar>
                  }
                  title={<Text strong>{funcionario.nombre}</Text>}
                  description={
                    <Space direction="vertical" size={0}>
                      <Text type="secondary">
                        {funcionario.rut || "Sin RUT"}
                      </Text>
                      <Tag color="blue">
                        {funcionario.role?.nombreRol || "Sin cargo"}
                      </Tag>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Drawer>

      {/* Modal: Detalle Colaborador */}
      <Modal
        title="Detalle del Colaborador"
        open={modalDetalle.visible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Cerrar
          </Button>,
        ]}
        width={700}
      >
        {modalDetalle.colaborador && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Nombre" span={2}>
              {modalDetalle.colaborador.funcionario?.nombre}
            </Descriptions.Item>
            <Descriptions.Item label="RUT">
              {modalDetalle.colaborador.funcionario?.rut}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {modalDetalle.colaborador.funcionario?.email}
            </Descriptions.Item>
            <Descriptions.Item label="Cargo">
              {modalDetalle.colaborador.funcionario?.role?.nombreRol}
            </Descriptions.Item>
            <Descriptions.Item label="Tipo Contrato">
              {modalDetalle.colaborador.tipoContrato}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha Ingreso">
              {new Date(
                modalDetalle.colaborador.fechaIngreso
              ).toLocaleDateString("es-CL")}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha Término">
              {modalDetalle.colaborador.fechaTermino
                ? new Date(
                    modalDetalle.colaborador.fechaTermino
                  ).toLocaleDateString("es-CL")
                : "Indefinido"}
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag
                color={
                  modalDetalle.colaborador.estado === "Activo" ? "green" : "red"
                }
              >
                {modalDetalle.colaborador.estado}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
}
