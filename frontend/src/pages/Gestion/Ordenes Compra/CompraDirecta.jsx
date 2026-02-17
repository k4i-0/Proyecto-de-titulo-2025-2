import React, { useState } from "react";
import {
  Row,
  Col,
  Typography,
  Button,
  Divider,
  Card,
  Form,
  Input,
  notification,
  Select,
  Table,
  Drawer,
  InputNumber,
  Popconfirm,
  Spin,
  Descriptions,
  Tag,
  Modal,
  Space,
} from "antd";

import {
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

//user context
import { useAuth } from "../../../context/AuthContext";

//services
import { getAllProveedores } from "../../../services/inventario/Proveedor.service";
import obtenerSucursales from "../../../services/inventario/Sucursal.service";
import { obtenerProductosPorProveedor } from "../../../services/inventario/Productos.service";
import {
  crearOrdenCompraDirecta,
  obtenerOrdenesCompraDirecta,
  cancelarOrdenCompra,
  cambiarEstadoOrdenCompra,
  editarOrdenCompraProveedor,
} from "../../../services/inventario/CompraProveedor.service";

export default function CompraDirecta() {
  const { user } = useAuth();

  const [ordenesDirectasFlag, setOrdenesDirectasFlag] = useState(false);
  const [verOrdenesDirectasFlag, setVerOrdenesDirectasFlag] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerVerOCVisible, setDrawerVerOCVisible] = useState(false);
  const [drawerEditarOCVisible, setDrawerEditarOCVisible] = useState(false);
  const [productosEditables, setProductosEditables] = useState([]);

  const [ModalEstadoVisible, setModalEstadoVisible] = useState(false);

  const [loading, setLoading] = useState(false);

  const [proveedores, setProveedores] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productosOrdenDirecta, setProductosOrdenDirecta] = useState([]);

  const [ordenesDirectas, setOrdenesDirectas] = useState([]);
  const [detalleOrdenSeleccionada, setDetalleOrdenSeleccionada] =
    useState(null);

  const [form] = Form.useForm();
  const [formProducto] = Form.useForm();
  const [formEstado] = Form.useForm();
  const [formEditar] = Form.useForm();

  //funciones asociadas a crear nueva orden directa

  const obtenerProveedores = async () => {
    try {
      setLoading(true);
      const response = await getAllProveedores();
      // console.log("Proveedores obtenidos en OC Directa:", response);
      if (response.status === 200) {
        setProveedores(response.data);
        notification.success({
          message: "Éxito",
          description: "Proveedores obtenidos correctamente.",
          placement: "topLeft",
        });
        setLoading(false);
        return;
      }
      if (response.status === 204) {
        setProveedores([]);
        notification.info({
          message: "Información",
          description: "No hay proveedores registrados.",
          placement: "topLeft",
        });
        setLoading(false);
        return;
      }
      notification.error({
        message: "Error",
        description:
          response.error?.message || "No se pudieron obtener los proveedores.",
        placement: "topLeft",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message || "No se pudieron obtener los proveedores.",
        placement: "topLeft",
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarSucursales = async () => {
    try {
      setLoading(true);
      const response = await obtenerSucursales();
      if (response.status === 200) {
        setSucursales(response.data);
        notification.success({
          message: "Éxito",
          description: "Sucursales obtenidas correctamente.",
          placement: "topLeft",
        });
        setLoading(false);
        return;
      }
      if (response.status === 204) {
        setSucursales([]);
        notification.info({
          message: "Información",
          description: "No hay sucursales registradas.",
          placement: "topLeft",
        });
        setLoading(false);
        return;
      }
      notification.error({
        message: "Error",
        description:
          response.error?.message || "No se pudieron obtener las sucursales.",
        placement: "topLeft",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message || "No se pudieron obtener las sucursales.",
        placement: "topLeft",
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarProductos = async (rutProveedor) => {
    try {
      setLoading(true);
      const response = await obtenerProductosPorProveedor(rutProveedor);
      // console.log("Productos obtenidos en OC Directa:", response);
      if (response.status === 304) return;
      if (response.status === 200) {
        setProductos(response.data);
        notification.success({
          message: "Éxito",
          description: "Productos obtenidos correctamente.",
          placement: "topLeft",
        });
        setLoading(false);
        return;
      }
      if (response.status === 204) {
        setProductos([]);
        notification.info({
          message: "Información",
          description: "No hay productos registrados.",
          placement: "topLeft",
        });
        setLoading(false);
        return;
      }
      notification.error({
        message: "Error",
        description:
          response.error?.message || "No se pudieron obtener los productos.",
        placement: "topLeft",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message || "No se pudieron obtener los productos.",
        placement: "topLeft",
      });
    } finally {
      setLoading(false);
    }
  };

  const handelCrearOrdenDirecta = () => {
    setVerOrdenesDirectasFlag(false);
    setOrdenesDirectasFlag(true);
    obtenerProveedores();
    cargarSucursales();
  };

  const handleAgregarProducto = () => {
    console.log("Agregar Producto:", formProducto.getFieldsValue());
    const productoAgregar = formProducto.getFieldsValue();

    if (
      !productoAgregar.idProducto ||
      !productoAgregar.cantidad ||
      !productoAgregar.precioUnitario
    ) {
      notification.error({
        message: "Error",
        description: "Por favor complete todos los campos.",
        placement: "topLeft",
      });
      return;
    }
    const productoExiste = productosOrdenDirecta.some(
      (item) => item.idProducto === productoAgregar.idProducto
    );
    if (productoExiste) {
      notification.error({
        message: "Error",
        description: "El producto ya ha sido agregado.",
        placement: "topLeft",
      });
      return;
    }

    const nuevoProducto = {
      ...productoAgregar,
      key: Date.now(),
      nombre: productos.find(
        (prod) => prod.idProducto === productoAgregar.idProducto
      )?.nombre,
      subtotal: productoAgregar.cantidad * productoAgregar.precioUnitario,
    };

    console.log("Nuevo Producto a agregar:", nuevoProducto);
    setProductosOrdenDirecta([...productosOrdenDirecta, nuevoProducto]);
    formProducto.resetFields();
    notification.success({
      message: "Éxito",
      description: "Producto agregado correctamente",
      placement: "topLeft",
    });
    setDrawerVisible(false);
  };

  const accionDrawerAgregarProducto = () => {
    setDrawerVisible(true);
    cargarProductos(form.getFieldValue("rutProveedor"));
  };
  const cerrarDrawerAgregarProducto = () => {
    setDrawerVisible(false);
    formProducto.resetFields();
  };

  const handleEliminarProducto = (key) => {
    setProductosOrdenDirecta(
      productosOrdenDirecta.filter((item) => item.key !== key)
    );
    notification.success("Producto eliminado");
  };

  const calcularTotal = () => {
    return productosOrdenDirecta.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleCrearOrdenCompraDirecta = async (values) => {
    //calcula el total de la orden
    const totalOrden = productosOrdenDirecta.reduce(
      (sum, producto) => sum + producto.cantidad * producto.precioUnitario,
      0
    );
    //verificar observaciones
    if (values.observaciones === undefined) {
      values.observaciones = "";
    }
    //junta datos del formulario y productos
    const valoresOrden = {
      ...values,
      productos: productosOrdenDirecta,
      total: totalOrden,
    };
    console.log("Valores de la orden de compra directa:", values);
    //Funcion que envia datos al servidor
    try {
      setLoading(true);
      const response = await crearOrdenCompraDirecta(valoresOrden);
      console.log("Respuesta de creación de orden directa:", response);
      if (response.status === 201) {
        notification.success({
          message: "Éxito",
          description: "Orden de compra directa creada correctamente.",
          placement: "topLeft",
        });
        //reset formulario y productos
        form.resetFields();
        formProducto.resetFields();
        setProductosOrdenDirecta([]);
        setOrdenesDirectasFlag(false);
        setLoading(false);
        return;
      }
      if (response.status === 422) {
        notification.error({
          message: response?.code || "Error",
          description: response?.error || "Error de validación de datos.",
          placement: "topLeft",
        });
        setLoading(false);
        return;
      }
      notification.error({
        message: response?.code || "Error",
        description:
          response?.error || "No se pudo crear la orden de compra directa.",
        placement: "topLeft",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description:
          error.message || "No se pudo crear la orden de compra directa.",
        placement: "topLeft",
      });
    } finally {
      setLoading(false);
    }
  };

  //funciones asociadas a ver ordenes directas existentes

  const buscarOrdenesDirectas = async () => {
    try {
      setLoading(true);
      const response = await obtenerOrdenesCompraDirecta();
      // console.log("Ordenes de compra directa obtenidas:", response.data);
      if (response.status === 200) {
        setOrdenesDirectas(response.data);
        notification.success({
          message: "Éxito",
          description: "Órdenes de compra directa obtenidas correctamente.",
          placement: "topLeft",
        });
        setLoading(false);
        return;
      }
      if (response.status === 204) {
        setOrdenesDirectas([]);
        notification.info({
          message: "Información",
          description: "No hay órdenes de compra directa registradas.",
          placement: "topLeft",
        });
        setLoading(false);
        return;
      }
      notification.error({
        message: "Error",
        description:
          response.error?.message ||
          "No se pudieron obtener las ordenes de compra directa.",
        placement: "topLeft",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description:
          error.message ||
          "No se pudieron obtener las ordenes de compra directa.",
        placement: "topLeft",
      });
    } finally {
      setLoading(false);
    }
  };

  // const descartarOrdenCompra = async (idCompraProveedor) => {
  //   try {
  //     setLoading(true);
  //     const response = await cancelarOrdenCompra(idCompraProveedor);
  //     if (response.status === 200) {
  //       notification.success({
  //         message: "Éxito",
  //         description: "Orden de compra cancelada correctamente.",
  //         placement: "topLeft",
  //       });
  //       setLoading(false);
  //       buscarOrdenesDirectas();
  //       return;
  //     }
  //     if (response.status === 404) {
  //       notification.error({
  //         message: "Error",
  //         description: "Orden de compra no encontrada.",
  //         placement: "topLeft",
  //       });
  //       setLoading(false);
  //       return;
  //     }
  //     notification.error({
  //       message: "Error",
  //       description:
  //         response.error?.message || "No se pudo cancelar la orden de compra.",
  //       placement: "topLeft",
  //     });
  //   } catch (error) {
  //     notification.error({
  //       message: "Error",
  //       description: error.message || "No se pudo cancelar la orden de compra.",
  //       placement: "topLeft",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const editarEstadoOrdenCompra = async (idCompraProveedor, datos) => {
    try {
      setLoading(true);
      const response = await cambiarEstadoOrdenCompra(idCompraProveedor, datos);
      console.log("Respuesta al cambiar estado OC:", response);
      if (response.status === 200) {
        notification.success({
          message: "Éxito",
          description: "Estado de la orden de compra cambiado correctamente.",
          placement: "topLeft",
        });
        buscarOrdenesDirectas();
        return;
      }
      notification.error({
        message: "Error",
        description:
          response?.error ||
          "No se pudo cambiar el estado de la orden de compra.",
        placement: "topLeft",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description:
          error.message ||
          "No se pudo cambiar el estado de la orden de compra.",
        placement: "topLeft",
      });
    } finally {
      setLoading(false);
    }
  };

  const edtitarDetalleOrdenCompra = async (idCompraProveedor, datos) => {
    try {
      setLoading(true);
      const response = await editarOrdenCompraProveedor(
        idCompraProveedor,
        datos
      );
      if (response.status === 200) {
        notification.success({
          message: "Éxito",
          description: "Detalle de la orden de compra editado correctamente.",
          placement: "topLeft",
        });
        buscarOrdenesDirectas();
        setLoading(false);
        return;
      }
      notification.error({
        message: "Error",
        description:
          response?.error ||
          "No se pudo editar el detalle de la orden de compra.",
        placement: "topLeft",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description:
          error.message ||
          "No se pudo editar el detalle de la orden de compra.",
        placement: "topLeft",
      });
    } finally {
      setLoading(false);
    }
  };

  // const handleCancelarOrdenCompra = (idCompraProveedor) => {
  //   descartarOrdenCompra(idCompraProveedor);
  // };
  const handelVerOrdenesDirectas = () => {
    setOrdenesDirectasFlag(false);
    buscarOrdenesDirectas();
    setVerOrdenesDirectasFlag(true);
  };

  const handleDetalleOC = (OC) => {
    // console.log("Ver detalles de la orden:", OC);
    setDetalleOrdenSeleccionada(OC);
    setDrawerVerOCVisible(true);
  };

  const getEstadoColor = (estado) => {
    const colores = {
      aprobada: "green",
      pendiente: "orange",
      rechazada: "red",
      fallo: "red",
    };
    return colores[estado] || "default";
  };

  const openModalEstado = (idCompraProveedor) => {
    // console.log("Abrir modal cambiar estado OC:", idCompraProveedor);
    formEstado.setFieldsValue({ idCompraProveedor: idCompraProveedor });
    setModalEstadoVisible(true);
  };

  const cerrarModalEstado = () => {
    setModalEstadoVisible(false);
    setDetalleOrdenSeleccionada(null);
    formEstado.resetFields();
  };

  const handleCambiarEstado = () => {
    const datos = formEstado.getFieldsValue();
    // console.log("Cambiar estado OC:", datos);
    if (datos.observaciones === undefined) {
      datos.observaciones = "";
    }
    editarEstadoOrdenCompra(datos.idCompraProveedor, datos);
    buscarOrdenesDirectas();
    cerrarModalEstado();
  };

  const openDrawerEditarOC = (datos) => {
    console.log("Abrir drawer editar OC:", datos);
    setDetalleOrdenSeleccionada(datos);
    setProductosEditables(datos.compraproveedordetalles);
    setDrawerEditarOCVisible(true);
  };

  const handleGuardarEdicion = (values) => {
    const datosActualizar = {
      productos: productosEditables,
      observaciones: values.observaciones,
    };
    edtitarDetalleOrdenCompra(
      detalleOrdenSeleccionada.idCompraProveedor,
      datosActualizar
    );
    setDrawerEditarOCVisible(false);
    setDetalleOrdenSeleccionada(null);
    formEditar.resetFields();
  };

  // Cambiar cantidad
  const handleCantidadChange = (index, nuevaCantidad) => {
    const nuevosProductos = [...productosEditables];
    nuevosProductos[index].cantidad = nuevaCantidad;
    nuevosProductos[index].total =
      nuevaCantidad * nuevosProductos[index].precioUnitario;
    setProductosEditables(nuevosProductos);
  };

  // Cambiar precio
  const handlePrecioChange = (index, nuevoPrecio) => {
    const nuevosProductos = [...productosEditables];
    nuevosProductos[index].precioUnitario = nuevoPrecio;
    nuevosProductos[index].total =
      nuevosProductos[index].cantidad * nuevoPrecio;
    setProductosEditables(nuevosProductos);
  };
  return (
    <>
      <Spin spinning={loading} fullscreen tip="Cargando..." />
      
      {/* Header Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)",
          padding: "32px",
          borderRadius: "12px",
          marginBottom: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, marginBottom: 8, color: "#1890ff" }}>
              Órdenes de Compra Directa
            </Title>
            <Text style={{ fontSize: "15px", color: "rgba(0,0,0,0.65)" }}>
              Gestión de compras directas por el administrador
            </Text>
          </Col>
          <Col>
            <Space size="middle">
              <Button
                type="primary"
                size="large"
                onClick={handelCrearOrdenDirecta}
                style={{
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(24,144,255,0.3)",
                }}
              >
                + Nueva Orden
              </Button>
              <Button
                size="large"
                onClick={handelVerOrdenesDirectas}
                style={{ borderRadius: "8px" }}
              >
                Ver Órdenes Existentes
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
      {ordenesDirectasFlag && (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCrearOrdenCompraDirecta}
        >
          <Row justify="center" gutter={[16, 16]} style={{ marginTop: "24px" }}>
            <Card
              className="card-modern"
              style={{
                width: "100%",
                maxWidth: 1000,
                borderRadius: "12px",
              }}
              actions={[
                <Button
                  type="primary"
                  size="large"
                  onClick={() => form.submit()}
                  disabled={productosOrdenDirecta.length === 0}
                  style={{
                    borderRadius: "8px",
                    padding: "8px 32px",
                    height: "auto",
                  }}
                >
                  Crear Orden de Compra
                </Button>,
              ]}
            >
              <Col span={24}>
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: 24,
                    paddingBottom: 16,
                    borderBottom: "2px solid #f0f0f0",
                  }}
                >
                  <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
                    Nueva Orden de Compra Directa
                  </Title>
                  <Text type="secondary">Complete los datos de la orden</Text>
                </div>
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={8}>
                    <Form.Item label="Solicitante">
                      <Input
                        disabled
                        style={{ width: "100%" }}
                        placeholder="Solicitante"
                        value={user?.nombre}
                      />
                    </Form.Item>
                    <Form.Item
                      name="nombreFuncionario"
                      initialValue={user?.nombre}
                      hidden
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Proveedor"
                      name="rutProveedor"
                      rules={[
                        { required: true, message: "Seleccione un proveedor" },
                      ]}
                    >
                      <Select
                        style={{ width: "100%" }}
                        placeholder="Seleccione un Proveedor"
                        showSearch
                        filterOption={(input, option) =>
                          option.children
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      >
                        {proveedores.map((proveedor) => (
                          <Select.Option
                            key={proveedor.rut}
                            value={proveedor.rut}
                          >
                            {proveedor.nombre} - {proveedor.rut}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Sucursal Destino"
                      name="idSucursal"
                      rules={[
                        { required: true, message: "Seleccione una sucursal" },
                      ]}
                    >
                      <Select
                        style={{ width: "100%" }}
                        placeholder="Seleccione una Sucursal"
                        showSearch
                        filterOption={(input, option) =>
                          option.children
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      >
                        {sucursales.map((sucursal) => (
                          <Select.Option
                            key={sucursal.idSucursal}
                            value={sucursal.idSucursal}
                          >
                            {sucursal.nombre} - {sucursal.direccion}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Divider style={{ margin: "24px 0" }} />
                {/* Sección de Productos */}
                <div style={{ marginBottom: 24 }}>
                  <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                    <Col>
                      <Title level={5} style={{ margin: 0 }}>
                        Productos de la Orden
                      </Title>
                    </Col>
                    <Col>
                      <Button
                        type="primary"
                        onClick={accionDrawerAgregarProducto}
                        style={{ borderRadius: "8px" }}
                      >
                        + Agregar Producto
                      </Button>
                    </Col>
                  </Row>
                </div>

                {/* Tabla de Productos */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={24}>
                    <Table
                      dataSource={productosOrdenDirecta}
                      columns={[
                        {
                          title: "ID",
                          dataIndex: "idProducto",
                          key: "idProducto",
                          width: "10%",
                          align: "center",
                        },
                        {
                          title: "Producto",
                          dataIndex: "nombre",
                          key: "nombre",
                        },
                        {
                          title: "Cantidad",
                          dataIndex: "cantidad",
                          key: "cantidad",
                          align: "center",
                          width: "15%",
                        },
                        {
                          title: "Precio Unitario",
                          dataIndex: "precioUnitario",
                          key: "precioUnitario",
                          align: "right",
                          width: "20%",
                          render: (precio) =>
                            `$${precio.toLocaleString("es-CL")}`,
                        },
                        {
                          title: "SubTotal",
                          dataIndex: "subtotal",
                          key: "subtotal",
                          align: "right",
                          width: "20%",
                          render: (total) =>
                            `$${(total || 0).toLocaleString("es-CL")}`,
                        },
                        {
                          title: "",
                          key: "acciones",
                          align: "center",
                          width: "10%",
                          render: (_, record) => (
                            <Popconfirm
                              title="¿Eliminar este producto?"
                              onConfirm={() =>
                                handleEliminarProducto(record.key)
                              }
                              okText="Sí"
                              cancelText="No"
                            >
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                              />
                            </Popconfirm>
                          ),
                        },
                      ]}
                      pagination={false}
                      size="middle"
                      locale={{ emptyText: "No hay productos agregados" }}
                      bordered
                      summary={() =>
                        productosOrdenDirecta.length > 0 && (
                          <Table.Summary.Row
                            style={{
                              backgroundColor: "#fafafa",
                              fontWeight: "bold",
                            }}
                          >
                            <Table.Summary.Cell colSpan={4} align="right">
                              <strong style={{ fontSize: 16 }}>Total:</strong>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell align="right">
                              <strong
                                style={{ fontSize: 18, color: "#52c41a" }}
                              >
                                ${calcularTotal().toLocaleString("es-CL")}
                              </strong>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell />
                          </Table.Summary.Row>
                        )
                      }
                    />
                  </Col>
                </Row>
                <Form.Item label="Observaciones" name="observaciones">
                  <TextArea
                    rows={4}
                    placeholder="Observaciones (opcional)"
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                </Form.Item>
              </Col>
            </Card>
          </Row>
          {/*Drawer Agregar Producto */}
          <Drawer
            title={
              <div style={{ fontSize: "18px", fontWeight: 600 }}>
                Agregar Producto a la Orden
              </div>
            }
            width={450}
            onClose={cerrarDrawerAgregarProducto}
            open={drawerVisible}
            footer={
              <div style={{ textAlign: "right" }}>
                <Space>
                  <Button onClick={cerrarDrawerAgregarProducto}>
                    Cancelar
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => formProducto.submit()}
                    style={{ borderRadius: "8px" }}
                  >
                    Agregar Producto
                  </Button>
                </Space>
              </div>
            }
          >
            <Form
              form={formProducto}
              layout="vertical"
              onFinish={handleAgregarProducto}
            >
              <Form.Item
                label="Producto"
                name="idProducto"
                rules={[{ required: true, message: "Seleccione un producto" }]}
              >
                <Select
                  placeholder="Seleccione un producto"
                  showSearch
                  size="large"
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  options={productos.map((producto) => ({
                    value: producto.idProducto,
                    label: `${producto.idProducto} - ${producto.nombre}`,
                  }))}
                />
              </Form.Item>
              <Form.Item
                label="Cantidad"
                name="cantidad"
                initialValue={1}
                rules={[{ required: true, message: "Ingrese la cantidad" }]}
              >
                <InputNumber
                  min={1}
                  size="large"
                  style={{ width: "100%" }}
                  placeholder="Cantidad"
                />
              </Form.Item>
              <Form.Item
                label="Precio Unitario"
                name="precioUnitario"
                rules={[{ required: true, message: "Ingrese el precio" }]}
                initialValue={1}
              >
                <InputNumber
                  min={1}
                  precision={1}
                  size="large"
                  style={{ width: "100%" }}
                  placeholder="Precio"
                  formatter={(value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                  }
                  parser={(value) => value.replace(/\$\s?|(\.*)/g, "")}
                />
              </Form.Item>
            </Form>
          </Drawer>
        </Form>
      )}
      {verOrdenesDirectasFlag && (
        <Row align="middle" justify="center" style={{ marginTop: "24px" }}>
          <Col span={24}>
            <Card className="card-modern" style={{ borderRadius: "12px" }}>
              <div style={{ marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
                  Órdenes de Compra Existentes
                </Title>
                <Text type="secondary">
                  Listado de todas las órdenes de compra directa
                </Text>
              </div>
              <Table
                columns={[
                  {
                    title: "Nombre Orden",
                    dataIndex: "nombreOrden",
                    key: "nombre",
                  },
                  {
                    title: "Fecha Compra",
                    dataIndex: "fechaCompra",
                    key: "fecha",
                    render: (date) => new Date(date).toLocaleDateString("es-CL"),
                  },
                  {
                    title: "Estado",
                    dataIndex: "estado",
                    key: "estado",
                    render: (estado) => (
                      <Tag color={getEstadoColor(estado)}>
                        {estado.charAt(0).toUpperCase() + estado.slice(1)}
                      </Tag>
                    ),
                  },
                  {
                    title: "Total",
                    dataIndex: "total",
                    key: "total",
                    align: "right",
                    render: (total) => (
                      <Text strong style={{ color: "#52c41a" }}>
                        ${total.toLocaleString("es-CL")}
                      </Text>
                    ),
                  },
                  {
                    title: "Sucursal",
                    dataIndex: ["sucursal", "nombre"],
                    key: "sucursal",
                  },
                  {
                    title: "Funcionario",
                    dataIndex: ["funcionario", "nombre"],
                    key: "funcionario",
                  },
                  {
                    title: "Proveedor",
                    dataIndex: ["proveedor", "nombre"],
                    key: "proveedor",
                  },
                  {
                    title: "Acciones",
                    key: "detalles",
                    align: "center",
                    width: 150,
                    render: (_, record) => (
                      <Space size="small">
                        <Button
                          type="text"
                          danger
                          icon={<CloseCircleOutlined />}
                          onClick={() =>
                            openModalEstado(record.idCompraProveedor)
                          }
                          title="Anular orden"
                        />
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => openDrawerEditarOC(record)}
                          title="Editar orden"
                        />
                        <Button
                          type="text"
                          onClick={() => handleDetalleOC(record)}
                          icon={<EyeOutlined />}
                          title="Ver detalles"
                        />
                      </Space>
                    ),
                  },
                ]}
                dataSource={ordenesDirectas}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} órdenes`,
                }}
                bordered
              />
            </Card>
            {/*Drawer Ver Detalles OC */}
            <Drawer
              title={
                <div style={{ fontSize: "18px", fontWeight: 600 }}>
                  Detalles de la Orden de Compra
                </div>
              }
              width={850}
              onClose={() => setDrawerVerOCVisible(false)}
              open={drawerVerOCVisible}
            >
              {detalleOrdenSeleccionada && (
                <>
                  {/* Información General */}
                  <Descriptions
                    title="Información General"
                    bordered
                    column={2}
                    size="middle"
                    style={{ marginBottom: 24 }}
                  >
                    <Descriptions.Item label="ID Orden">
                      {detalleOrdenSeleccionada.idCompraProveedor}
                    </Descriptions.Item>

                    <Descriptions.Item label="Nombre Orden">
                      {detalleOrdenSeleccionada.nombreOrden}
                    </Descriptions.Item>

                    <Descriptions.Item label="Fecha Compra">
                      {new Date(
                        detalleOrdenSeleccionada.fechaCompra
                      ).toLocaleString("es-CL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Descriptions.Item>

                    <Descriptions.Item label="Estado">
                      <Tag
                        color={getEstadoColor(detalleOrdenSeleccionada.estado)}
                        style={{ fontSize: "14px", padding: "4px 12px" }}
                      >
                        {detalleOrdenSeleccionada.estado.toUpperCase()}
                      </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Observaciones" span={2}>
                      {detalleOrdenSeleccionada.observaciones ||
                        "Sin observaciones"}
                    </Descriptions.Item>
                  </Descriptions>

                  <Divider />

                  {/* Información del Proveedor */}
                  <Descriptions
                    title="Proveedor"
                    bordered
                    column={1}
                    size="middle"
                    style={{ marginBottom: 24 }}
                  >
                    <Descriptions.Item label="RUT">
                      {detalleOrdenSeleccionada.proveedor.rut}
                    </Descriptions.Item>

                    <Descriptions.Item label="Nombre">
                      {detalleOrdenSeleccionada.proveedor.nombre}
                    </Descriptions.Item>

                    <Descriptions.Item label="Email">
                      {detalleOrdenSeleccionada.proveedor.email}
                    </Descriptions.Item>
                  </Descriptions>

                  <Divider />

                  {/* Información de Sucursal y Funcionario */}
                  <Descriptions
                    title="Sucursal y Funcionario"
                    bordered
                    column={2}
                    size="middle"
                    style={{ marginBottom: 24 }}
                  >
                    <Descriptions.Item label="Sucursal">
                      {detalleOrdenSeleccionada.sucursal.nombre}
                    </Descriptions.Item>

                    <Descriptions.Item label="Dirección">
                      {detalleOrdenSeleccionada.sucursal.direccion}
                    </Descriptions.Item>

                    <Descriptions.Item label="Funcionario">
                      {detalleOrdenSeleccionada.funcionario.nombre}
                    </Descriptions.Item>

                    <Descriptions.Item label="RUT Funcionario">
                      {detalleOrdenSeleccionada.funcionario.rut}
                    </Descriptions.Item>
                  </Descriptions>

                  <Divider>Detalle de Productos</Divider>

                  {/* Tabla de Productos */}
                  <Table
                    columns={[
                      {
                        title: "Código",
                        dataIndex: ["producto", "codigo"],
                        key: "codigo",
                      },
                      {
                        title: "Producto",
                        dataIndex: ["producto", "nombre"],
                        key: "nombre",
                      },
                      {
                        title: "Marca",
                        dataIndex: ["producto", "marca"],
                        key: "marca",
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
                        render: (precio) =>
                          `$${precio.toLocaleString("es-CL")}`,
                      },
                      {
                        title: "Total",
                        dataIndex: "total",
                        key: "total",
                        align: "right",
                        render: (total) => `$${total.toLocaleString("es-CL")}`,
                      },
                    ]}
                    dataSource={
                      detalleOrdenSeleccionada.compraproveedordetalles
                    }
                    pagination={false}
                    rowKey="idCompraProveedorDetalle"
                    size="small"
                    expandable={{
                      expandedRowRender: (record) => (
                        <div
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#fafafa",
                          }}
                        >
                          <strong>Descripción:</strong>{" "}
                          {record.producto.descripcion}
                        </div>
                      ),
                    }}
                    summary={() => (
                      <Table.Summary fixed>
                        <Table.Summary.Row>
                          <Table.Summary.Cell colSpan={5} align="right">
                            <strong>Total General:</strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell align="right">
                            <strong
                              style={{ fontSize: "16px", color: "#1890ff" }}
                            >
                              $
                              {detalleOrdenSeleccionada.total.toLocaleString(
                                "es-CL"
                              )}
                            </strong>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      </Table.Summary>
                    )}
                  />
                </>
              )}
            </Drawer>
            {/* Modal para cambiar estado de la orden de compra */}
            <Modal
              title={
                <div style={{ fontSize: "18px", fontWeight: 600, color: "#ff4d4f" }}>
                  Anulación de Orden de Compra
                </div>
              }
              open={ModalEstadoVisible}
              onCancel={cerrarModalEstado}
              footer={[
                <Button key="cancelar" onClick={cerrarModalEstado} size="large">
                  Cancelar
                </Button>,
                <Button
                  key="cambiar"
                  type="primary"
                  danger
                  size="large"
                  onClick={() => formEstado.submit()}
                  style={{ borderRadius: "8px" }}
                >
                  Confirmar Anulación
                </Button>,
              ]}
            >
              <Form
                form={formEstado}
                onFinish={handleCambiarEstado}
                layout="vertical"
              >
                <Form.Item name="idCompraProveedor" hidden>
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Nuevo Estado"
                  name="estado"
                  rules={[{ required: true, message: "Seleccione un estado" }]}
                >
                  <Select placeholder="Seleccione un nuevo estado" size="large">
                    <Select.Option value="rechazada">Rechazada</Select.Option>
                    <Select.Option value="cancelada">Cancelada</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Observaciones"
                  name="observaciones"
                  rules={[
                    {
                      required: true,
                      message: "Agregue observaciones sobre la anulación",
                    },
                  ]}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Agregue observaciones sobre la anulación"
                    style={{ borderRadius: "8px" }}
                  />
                </Form.Item>
              </Form>
            </Modal>
            {/*Drawer editar */}
            <Drawer
              title="Editar Orden de Compra Directa"
              width={800}
              onClose={() => {
                setDrawerEditarOCVisible(false);
                formEditar.resetFields();
              }}
              open={drawerEditarOCVisible}
              footer={
                <div style={{ textAlign: "right" }}>
                  <Space>
                    <Button onClick={() => setDrawerEditarOCVisible(false)}>
                      Cancelar
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => formEditar.submit()}
                      loading={loading}
                    >
                      Guardar Cambios
                    </Button>
                  </Space>
                </div>
              }
            >
              {detalleOrdenSeleccionada && (
                <Form
                  form={formEditar}
                  layout="vertical"
                  onFinish={handleGuardarEdicion}
                >
                  {/* Información General - SOLO LECTURA */}
                  <Descriptions
                    title="Información General"
                    bordered
                    column={2}
                    size="small"
                  >
                    <Descriptions.Item label="ID Orden">
                      {detalleOrdenSeleccionada.idCompraProveedor}
                    </Descriptions.Item>

                    <Descriptions.Item label="Nombre Orden">
                      {detalleOrdenSeleccionada.nombreOrden}
                    </Descriptions.Item>

                    <Descriptions.Item label="Fecha Compra">
                      {new Date(
                        detalleOrdenSeleccionada.fechaCompra
                      ).toLocaleString("es-CL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Descriptions.Item>

                    <Descriptions.Item label="Estado">
                      <Tag
                        color={getEstadoColor(detalleOrdenSeleccionada.estado)}
                      >
                        {detalleOrdenSeleccionada.estado.toUpperCase()}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>

                  <Divider />

                  {/* Proveedor y Sucursal - SOLO LECTURA */}
                  <Descriptions
                    title="Proveedor y Sucursal"
                    bordered
                    column={2}
                    size="small"
                  >
                    <Descriptions.Item label="Proveedor">
                      {detalleOrdenSeleccionada.proveedor.nombre}
                    </Descriptions.Item>

                    <Descriptions.Item label="RUT Proveedor">
                      {detalleOrdenSeleccionada.proveedor.rut}
                    </Descriptions.Item>

                    <Descriptions.Item label="Sucursal">
                      {detalleOrdenSeleccionada.sucursal.nombre}
                    </Descriptions.Item>

                    <Descriptions.Item label="Dirección">
                      {detalleOrdenSeleccionada.sucursal.direccion}
                    </Descriptions.Item>

                    <Descriptions.Item label="Funcionario">
                      {detalleOrdenSeleccionada.funcionario.nombre}
                    </Descriptions.Item>

                    <Descriptions.Item label="RUT Funcionario">
                      {detalleOrdenSeleccionada.funcionario.rut}
                    </Descriptions.Item>
                  </Descriptions>

                  <Divider />

                  {/* Observaciones - EDITABLE */}
                  <Form.Item
                    label="Observaciones"
                    name="observaciones"
                    initialValue={detalleOrdenSeleccionada.observaciones}
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Observaciones de la orden"
                    />
                  </Form.Item>

                  <Divider>Detalle de Productos</Divider>

                  {/* Tabla de Productos EDITABLE */}
                  <Table
                    columns={[
                      {
                        title: "Código",
                        dataIndex: "idCompraProveedorDetalle",
                        key: "idCompraProveedorDetalle",
                        width: 120,
                      },
                      {
                        title: "Producto",
                        dataIndex: ["producto", "nombre"],
                        key: "nombre",
                      },
                      {
                        title: "Marca",
                        dataIndex: ["producto", "marca"],
                        key: "marca",
                        width: 100,
                      },
                      {
                        title: "Cantidad",
                        dataIndex: "cantidad",
                        key: "cantidad",
                        align: "center",
                        width: 100,
                        render: (cantidad, record, index) => (
                          <InputNumber
                            min={1}
                            value={cantidad}
                            onChange={(value) =>
                              handleCantidadChange(index, value)
                            }
                            style={{ width: "80px" }}
                          />
                        ),
                      },
                      {
                        title: "Precio Unitario",
                        dataIndex: "precioUnitario",
                        key: "precioUnitario",
                        align: "right",
                        width: 140,
                        render: (precio, record, index) => (
                          <InputNumber
                            min={0}
                            value={precio}
                            formatter={(value) =>
                              `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                            }
                            parser={(value) =>
                              value.replace(/\$\s?|(\.*)/g, "")
                            }
                            onChange={(value) =>
                              handlePrecioChange(index, value)
                            }
                            style={{ width: "130px" }}
                          />
                        ),
                      },
                      {
                        title: "Total",
                        key: "total",
                        align: "right",
                        width: 120,
                        render: (_, record) => {
                          const total = record.cantidad * record.precioUnitario;
                          return `$${total.toLocaleString("es-CL")}`;
                        },
                      },
                    ]}
                    dataSource={productosEditables}
                    pagination={false}
                    rowKey="idCompraProveedorDetalle"
                    size="small"
                    scroll={{ x: 800 }}
                    expandable={{
                      expandedRowRender: (record) => (
                        <div
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#fafafa",
                          }}
                        >
                          <strong>Descripción:</strong>{" "}
                          {record.producto.descripcion}
                        </div>
                      ),
                    }}
                    summary={() => {
                      const totalGeneral = productosEditables.reduce(
                        (sum, item) =>
                          sum + item.cantidad * item.precioUnitario,
                        0
                      );
                      return (
                        <Table.Summary fixed>
                          <Table.Summary.Row>
                            <Table.Summary.Cell colSpan={5} align="right">
                              <strong>Total General:</strong>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell align="right">
                              <strong
                                style={{ fontSize: "16px", color: "#1890ff" }}
                              >
                                ${totalGeneral.toLocaleString("es-CL")}
                              </strong>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        </Table.Summary>
                      );
                    }}
                  />
                </Form>
              )}
            </Drawer>
          </Col>
        </Row>
      )}
    </>
  );
}
