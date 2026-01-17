// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { Typography, Row, Col, Button } from "antd";

// const { Title } = Typography;

// export default function OrdenesCompra() {
//   const navigate = useNavigate();

//   return (
//     <>
//       {/* Navegacion y titulo */}
//       <Row>
//         <Col>
//           <Button
//             type="default"
//             style={{ marginBottom: 16 }}
//             onClick={() => navigate(-1)}
//           >
//             Volver
//           </Button>
//         </Col>
//         <Col flex="auto" style={{ textAlign: "center" }}>
//           <Title>Ordenes de Compra</Title>
//         </Col>
//       </Row>

//     </>
//   );
// }
import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Card,
  Row,
  Col,
  notification,
  Popconfirm,
  Empty,
  Spin,
  Typography,
  Modal,
  Form,
  Input,
  Divider,
  Descriptions,
  Badge,
  Statistic,
  Select,
  InputNumber,
  Tooltip,
  Alert,
} from "antd";

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Simulación de datos - Reemplazar con tus servicios reales
const ordenesSimuladas = [
  {
    idCompraProveedor: 1,
    nombreOrden: "OC-20241209-001",
    fechaCompra: new Date().toISOString(),
    estado: "pendiente",
    total: 250000,
    observaciones: "Entrega urgente",
    idSucursal: 100,
    idFuncionario: 4,
    idProveedor: 1,
    proveedor: {
      nombre: "Proveedor ABC",
      rut: "12345678-9",
      email: "contacto@abc.com",
    },
    funcionario: { nombre: "Juan Pérez", email: "juan@empresa.com" },
    sucursal: { nombre: "Sucursal Centro", direccion: "Calle Principal 123" },
    compraproveedordetalles: [
      {
        idCompraProveedorDetalle: 1,
        cantidad: 10,
        precioUnitario: 15000,
        total: 150000,
        producto: {
          nombre: "Producto A",
          marca: "Marca X",
          descripcion: "Descripción del producto A",
        },
      },
      {
        idCompraProveedorDetalle: 2,
        cantidad: 5,
        precioUnitario: 20000,
        total: 100000,
        producto: {
          nombre: "Producto B",
          marca: "Marca Y",
          descripcion: "Descripción del producto B",
        },
      },
    ],
  },
  {
    idCompraProveedor: 2,
    nombreOrden: "OC-20241209-002",
    fechaCompra: new Date(Date.now() - 86400000).toISOString(),
    estado: "aprobada",
    total: 180000,
    observaciones: "Confirmar disponibilidad",
    proveedor: { nombre: "Proveedor XYZ", rut: "98765432-1" },
    funcionario: { nombre: "María González", email: "maria@empresa.com" },
    sucursal: { nombre: "Sucursal Norte", direccion: "Av. Norte 456" },
    compraproveedordetalles: [],
  },
];

const GestionOrdenesCompraAdmin = () => {
  const [ordenesCompra, setOrdenesCompra] = useState(ordenesSimuladas);
  const [loading, setLoading] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  // Modales
  const [modalDetalle, setModalDetalle] = useState({
    visible: false,
    orden: null,
  });
  const [modalEditar, setModalEditar] = useState({
    visible: false,
    orden: null,
  });
  const [modalRechazo, setModalRechazo] = useState({
    visible: false,
    orden: null,
  });

  // Formularios
  const [formEditar] = Form.useForm();
  const [formRechazo] = Form.useForm();

  // ========== ESTADÍSTICAS ==========
  const estadisticas = {
    pendientes: ordenesCompra.filter((o) => o.estado === "pendiente").length,
    aprobadas: ordenesCompra.filter((o) => o.estado === "aprobada").length,
    rechazadas: ordenesCompra.filter((o) => o.estado === "rechazada").length,
    total: ordenesCompra.length,
    montoTotal: ordenesCompra.reduce((sum, o) => sum + o.total, 0),
  };

  // ========== FUNCIONES DE APROBACIÓN/RECHAZO ==========

  const handleAprobarOrden = async (orden) => {
    try {
      setLoading(true);
      // Aquí llamarías a tu servicio: await aprobarOrdenCompra(orden.idCompraProveedor);

      // Simulación
      setOrdenesCompra((prev) =>
        prev.map((o) =>
          o.idCompraProveedor === orden.idCompraProveedor
            ? { ...o, estado: "aprobada" }
            : o
        )
      );

      notification.success({
        message: "Orden Aprobada",
        description: `La orden ${orden.nombreOrden} ha sido aprobada exitosamente`,
        placement: "topRight",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: "No se pudo aprobar la orden",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRechazarOrden = async (valores) => {
    try {
      setLoading(true);
      const { idCompraProveedor, motivoRechazo } = valores;

      // Aquí llamarías a tu servicio: await rechazarOrdenCompra(idCompraProveedor, motivoRechazo);

      setOrdenesCompra((prev) =>
        prev.map((o) =>
          o.idCompraProveedor === idCompraProveedor
            ? { ...o, estado: "rechazada", motivoRechazo }
            : o
        )
      );

      notification.warning({
        message: "Orden Rechazada",
        description: "La orden ha sido rechazada",
        placement: "topRight",
      });

      setModalRechazo({ visible: false, orden: null });
      formRechazo.resetFields();
    } catch (error) {
      notification.error({
        message: "Error",
        description: "No se pudo rechazar la orden",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditarOrden = async (valores) => {
    try {
      setLoading(true);
      // Aquí llamarías a tu servicio: await actualizarOrdenCompra(valores);

      setOrdenesCompra((prev) =>
        prev.map((o) =>
          o.idCompraProveedor === valores.idCompraProveedor
            ? { ...o, ...valores }
            : o
        )
      );

      notification.success({
        message: "Orden Actualizada",
        description: "Los cambios se guardaron correctamente",
        placement: "topRight",
      });

      setModalEditar({ visible: false, orden: null });
      formEditar.resetFields();
    } catch (error) {
      notification.error({
        message: "Error",
        description: "No se pudo actualizar la orden",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  // ========== FUNCIONES DE UI ==========

  const handleAbrirModalDetalle = (orden) => {
    setModalDetalle({ visible: true, orden });
  };

  const handleAbrirModalEditar = (orden) => {
    setModalEditar({ visible: true, orden });
    formEditar.setFieldsValue({
      idCompraProveedor: orden.idCompraProveedor,
      observaciones: orden.observaciones,
      total: orden.total,
    });
  };

  const handleAbrirModalRechazo = (orden) => {
    setModalRechazo({ visible: true, orden });
    formRechazo.setFieldsValue({
      idCompraProveedor: orden.idCompraProveedor,
    });
  };

  // ========== FILTROS ==========

  const ordenesFiltradas = ordenesCompra.filter((orden) => {
    const cumpleFiltroEstado =
      filtroEstado === "todos" || orden.estado === filtroEstado;
    const cumpleBusqueda =
      orden.nombreOrden?.toLowerCase().includes(busqueda.toLowerCase()) ||
      orden.proveedor?.nombre?.toLowerCase().includes(busqueda.toLowerCase());

    return cumpleFiltroEstado && cumpleBusqueda;
  });

  // ========== COLUMNAS DE LA TABLA ==========

  const columnas = [
    {
      title: "Orden",
      dataIndex: "nombreOrden",
      key: "nombreOrden",
      fixed: "left",
      width: 150,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Proveedor",
      dataIndex: ["proveedor", "nombre"],
      key: "proveedor",
      width: 200,
    },
    {
      title: "Sucursal",
      dataIndex: ["sucursal", "nombre"],
      key: "sucursal",
      width: 150,
    },
    {
      title: "Fecha",
      dataIndex: "fechaCompra",
      key: "fechaCompra",
      width: 120,
      render: (fecha) => new Date(fecha).toLocaleDateString("es-CL"),
      sorter: (a, b) => new Date(a.fechaCompra) - new Date(b.fechaCompra),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 120,
      render: (estado) => {
        const config = {
          pendiente: { color: "orange", icon: <ClockCircleOutlined /> },
          aprobada: { color: "green", icon: <CheckCircleOutlined /> },
          rechazada: { color: "red", icon: <CloseCircleOutlined /> },
        };
        const { color, icon } = config[estado] || {
          color: "default",
          icon: null,
        };
        return (
          <Tag color={color} icon={icon}>
            {estado?.toUpperCase()}
          </Tag>
        );
      },
      filters: [
        { text: "Pendiente", value: "pendiente" },
        { text: "Aprobada", value: "aprobada" },
        { text: "Rechazada", value: "rechazada" },
      ],
      onFilter: (value, record) => record.estado === value,
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      width: 120,
      align: "right",
      render: (total) => (
        <Text strong style={{ color: "#1890ff" }}>
          ${total?.toLocaleString("es-CL")}
        </Text>
      ),
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: "Acciones",
      key: "acciones",
      fixed: "right",
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver detalles">
            <Button
              type="default"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleAbrirModalDetalle(record)}
            />
          </Tooltip>

          {record.estado === "pendiente" && (
            <>
              <Tooltip title="Aprobar">
                <Popconfirm
                  title="¿Aprobar orden?"
                  description="Esta acción aprobará la orden de compra"
                  onConfirm={() => handleAprobarOrden(record)}
                  okText="Aprobar"
                  cancelText="Cancelar"
                  okButtonProps={{ type: "primary" }}
                >
                  <Button
                    type="primary"
                    size="small"
                    icon={<CheckCircleOutlined />}
                  >
                    Aprobar
                  </Button>
                </Popconfirm>
              </Tooltip>

              <Tooltip title="Editar">
                <Button
                  type="default"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleAbrirModalEditar(record)}
                />
              </Tooltip>

              <Tooltip title="Rechazar">
                <Button
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleAbrirModalRechazo(record)}
                >
                  Rechazar
                </Button>
              </Tooltip>
            </>
          )}

          {record.estado === "aprobada" && (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              Aprobada
            </Tag>
          )}

          {record.estado === "rechazada" && (
            <Tag color="red" icon={<CloseCircleOutlined />}>
              Rechazada
            </Tag>
          )}
        </Space>
      ),
    },
  ];

  // ========== RENDER ==========

  return (
    <>
      <Spin spinning={loading} size="large" tip="Cargando..." fullscreen />

      {/* Header con Estadísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Title level={2}>Gestión de Órdenes de Compra - Administrador</Title>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Órdenes"
              value={estadisticas.total}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pendientes"
              value={estadisticas.pendientes}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Aprobadas"
              value={estadisticas.aprobadas}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Monto Total"
              value={estadisticas.montoTotal}
              prefix="$"
              precision={0}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros y Búsqueda */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input
              placeholder="Buscar por nombre de orden o proveedor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              allowClear
              prefix={<FilterOutlined />}
              size="large"
            />
          </Col>
          <Col>
            <Select
              value={filtroEstado}
              onChange={setFiltroEstado}
              style={{ width: 150 }}
              size="large"
              options={[
                { label: "Todas", value: "todos" },
                { label: "Pendientes", value: "pendiente" },
                { label: "Aprobadas", value: "aprobada" },
                { label: "Rechazadas", value: "rechazada" },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Tabla de Órdenes */}
      <Card>
        <Table
          rowKey="idCompraProveedor"
          columns={columnas}
          dataSource={ordenesFiltradas}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} órdenes`,
          }}
          locale={{
            emptyText: <Empty description="No hay órdenes de compra" />,
          }}
        />
      </Card>

      {/* Modal: Detalle de Orden */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <Text>Detalle de Orden de Compra</Text>
          </Space>
        }
        open={modalDetalle.visible}
        onCancel={() => setModalDetalle({ visible: false, orden: null })}
        footer={[
          <Button
            key="close"
            onClick={() => setModalDetalle({ visible: false, orden: null })}
          >
            Cerrar
          </Button>,
        ]}
        width={900}
      >
        {modalDetalle.orden && (
          <>
            <Descriptions
              bordered
              column={2}
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Descriptions.Item label="Orden">
                {modalDetalle.orden.nombreOrden}
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag
                  color={
                    modalDetalle.orden.estado === "pendiente"
                      ? "orange"
                      : modalDetalle.orden.estado === "aprobada"
                      ? "green"
                      : "red"
                  }
                >
                  {modalDetalle.orden.estado?.toUpperCase()}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Proveedor">
                {modalDetalle.orden.proveedor?.nombre}
              </Descriptions.Item>
              <Descriptions.Item label="RUT">
                {modalDetalle.orden.proveedor?.rut}
              </Descriptions.Item>

              <Descriptions.Item label="Sucursal">
                {modalDetalle.orden.sucursal?.nombre}
              </Descriptions.Item>
              <Descriptions.Item label="Dirección">
                {modalDetalle.orden.sucursal?.direccion}
              </Descriptions.Item>

              <Descriptions.Item label="Funcionario">
                {modalDetalle.orden.funcionario?.nombre}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {modalDetalle.orden.funcionario?.email}
              </Descriptions.Item>

              <Descriptions.Item label="Fecha">
                {new Date(modalDetalle.orden.fechaCompra).toLocaleDateString(
                  "es-CL"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Hora">
                {new Date(modalDetalle.orden.fechaCompra).toLocaleTimeString(
                  "es-CL",
                  { hour12: false }
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Total" span={2}>
                <Text strong style={{ fontSize: 18, color: "#1890ff" }}>
                  ${modalDetalle.orden.total?.toLocaleString("es-CL")}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Observaciones" span={2}>
                {modalDetalle.orden.observaciones || "Sin observaciones"}
              </Descriptions.Item>

              {modalDetalle.orden.motivoRechazo && (
                <Descriptions.Item label="Motivo de Rechazo" span={2}>
                  <Text type="danger">{modalDetalle.orden.motivoRechazo}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider>Productos</Divider>

            {modalDetalle.orden.compraproveedordetalles?.length > 0 ? (
              <Table
                dataSource={modalDetalle.orden.compraproveedordetalles}
                rowKey="idCompraProveedorDetalle"
                pagination={false}
                size="small"
                columns={[
                  {
                    title: "Producto",
                    key: "producto",
                    render: (_, record) => (
                      <div>
                        <Text strong>{record.producto?.nombre}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {record.producto?.marca}
                        </Text>
                      </div>
                    ),
                  },
                  {
                    title: "Cantidad",
                    dataIndex: "cantidad",
                    key: "cantidad",
                    align: "center",
                  },
                  {
                    title: "Precio Unitario",
                    dataIndex: "precioUnitario",
                    key: "precioUnitario",
                    align: "right",
                    render: (precio) => `$${precio?.toLocaleString("es-CL")}`,
                  },
                  {
                    title: "Total",
                    dataIndex: "total",
                    key: "total",
                    align: "right",
                    render: (total) => (
                      <Text strong>${total?.toLocaleString("es-CL")}</Text>
                    ),
                  },
                ]}
              />
            ) : (
              <Empty description="No hay productos en esta orden" />
            )}
          </>
        )}
      </Modal>

      {/* Modal: Editar Orden */}
      <Modal
        title="Editar Orden de Compra"
        open={modalEditar.visible}
        onCancel={() => {
          setModalEditar({ visible: false, orden: null });
          formEditar.resetFields();
        }}
        onOk={() => formEditar.submit()}
        okText="Guardar Cambios"
        cancelText="Cancelar"
      >
        <Form form={formEditar} layout="vertical" onFinish={handleEditarOrden}>
          <Form.Item name="idCompraProveedor" hidden>
            <Input />
          </Form.Item>

          <Form.Item label="Total" name="total">
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item label="Observaciones" name="observaciones">
            <TextArea rows={4} placeholder="Observaciones adicionales" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Rechazar Orden */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
            <Text>Rechazar Orden de Compra</Text>
          </Space>
        }
        open={modalRechazo.visible}
        onCancel={() => {
          setModalRechazo({ visible: false, orden: null });
          formRechazo.resetFields();
        }}
        onOk={() => formRechazo.submit()}
        okText="Rechazar"
        okButtonProps={{ danger: true }}
        cancelText="Cancelar"
      >
        <Form
          form={formRechazo}
          layout="vertical"
          onFinish={handleRechazarOrden}
        >
          <Form.Item name="idCompraProveedor" hidden>
            <Input />
          </Form.Item>

          <Alert
            message="Atención"
            description={`Estás a punto de rechazar la orden ${modalRechazo.orden?.nombreOrden}. Esta acción notificará al funcionario responsable.`}
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            label="Motivo del Rechazo"
            name="motivoRechazo"
            rules={[
              {
                required: true,
                message: "Debes especificar el motivo del rechazo",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Explica por qué se rechaza esta orden..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default GestionOrdenesCompraAdmin;
