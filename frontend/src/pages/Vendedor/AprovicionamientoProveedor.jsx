import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Tag,
  Card,
  Row,
  Col,
  InputNumber,
  Badge,
  Drawer,
  List,
  notification,
  Popconfirm,
  Empty,
  Spin,
  Typography,
  Modal,
  Form,
  Select,
  Divider,
  Alert,
  Descriptions,
} from "antd";

import {
  SearchOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  DeleteOutlined,
  SendOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

import { useNavigate } from "react-router-dom";

import {
  getAllProveedores,
  getAllProveedoresVendedor,
} from "../../services/inventario/Proveedor.service";

import obtenerProductos from "../../services/inventario/Productos.service";

import { obtenerQuienSoy } from "../../services/usuario/funcionario.service";

import crearOrdenCompraProveedor, {
  obtenerOrdenesCompraProveedores,
} from "../../services/inventario/CompraProveedor.service";

const AprovicionamientoProveedor = () => {
  const navigate = useNavigate();

  // const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [miDatos, setMiDatos] = useState([]);
  const [ordenesCompra, setOrdenesCompra] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [
    productosSeleccionadosOrdenCompra,
    setProductosSeleccionadosOrdenCompra,
  ] = useState([]);

  const [modalDetalle, setModalDetalle] = useState({
    visible: false,
    compraProveedor: null,
  });

  const [visibleCompraNueva, setVisibleCompraNueva] = useState(false);
  const [drawerSelectProductoOrdenCompra, setDrawerSelectProductoOrdenCompra] =
    useState(false);
  const [loading, setLoading] = useState(false);

  //Formulario
  const [formOrdenCompra] = Form.useForm();
  const [formSeleccionarProducto] = Form.useForm();

  //Funciones de Api

  const buscarMiDatos = async () => {
    try {
      setLoading(true);
      const respuesta = await obtenerQuienSoy();
      // console.log(respuesta);
      if (respuesta.status === 200) {
        notification.success({
          message: "Datos obtenidos con éxito",
          duration: 3.5,
        });
        setMiDatos(respuesta.data);
        setLoading(false);
        return;
      }
      if (respuesta.status === 204) {
        notification.info({
          message: "No hay datos disponibles",
          duration: 3.5,
        });
        setMiDatos([]);
        setLoading(false);
        return;
      }
      notification.error({
        message: respuesta.error || "Error al obtener los datos",
        duration: 3.5,
      });
    } catch (error) {
      notification.error({
        message: "Error al obtener los datos",
        duration: 3.5,
      });
      console.error("Error al obtener los datos:", error);
    } finally {
      setLoading(false);
    }
  };
  const buscarOrdenesCompraProveedores = async () => {
    try {
      setLoading(true);
      const respuesta = await obtenerOrdenesCompraProveedores();
      // console.log(
      //   "Respuesta del ordenes de compra a proveedores:",
      //   respuesta.data
      // );
      if (respuesta.status === 200) {
        notification.success({
          message: "Ordenes de compra a proveedores obtenidas con éxito",
          duration: 3.5,
        });
        setOrdenesCompra(respuesta.data);
        setLoading(false);
        return;
      }
      if (respuesta.status === 204) {
        notification.info({
          message: "No existe ordenes de compra a proveedores",
          duration: 3.5,
        });
        setOrdenesCompra([]);
        setLoading(false);
        return;
      }
      notification.error({
        message:
          respuesta.error ||
          "Error al obtener las ordenes de compra a proveedores",
        duration: 3.5,
      });
    } catch (error) {
      notification.error({
        message: "Error al obtener las ordenes de compra a proveedores",
        duration: 3.5,
      });
      console.error(
        "Error al obtener las ordenes de compra a proveedores:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const obtenerProveedores = async () => {
    try {
      setLoading(true);
      const respuesta = await getAllProveedores();
      // console.log("Respuesta del inventario:", respuesta.data);
      if (respuesta.status === 200) {
        notification.success({
          message: "Inventarios obtenidos con éxito",
          duration: 3.5,
        });
        setProveedores(respuesta.data);
        setLoading(false);
        return;
      }
      if (respuesta.status === 204) {
        notification.info({
          message: "No existe productos en el inventario",
          duration: 3.5,
        });
        setProveedores([]);
        setLoading(false);
        return;
      }
      notification.error({
        message: respuesta.error || "Error al obtener el inventario",
        duration: 3.5,
      });
    } catch (error) {
      notification.error({
        message: "Error al obtener el inventario",
        duration: 3.5,
      });
      console.error("Error al obtener el inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  const buscarVenedoresPorProveedor = async (rutProveedor) => {
    try {
      setLoading(true);

      const respuesta = await getAllProveedoresVendedor(rutProveedor);

      if (respuesta.status === 200) {
        notification.success({
          message: "Inventarios obtenidos con éxito",
          duration: 3.5,
        });
        setVendedores(respuesta.data);
        setLoading(false);
        return;
      }
      if (respuesta.status === 204) {
        notification.info({
          message: "No existe productos en el inventario",
          duration: 3.5,
        });
        setVendedores([]);
        setLoading(false);
        // return;
      }
      notification.error({
        message: respuesta.error || "Error al obtener el inventario",
        duration: 3.5,
      });
    } catch (error) {
      notification.error({
        message: "Error al obtener el inventario",
        duration: 3.5,
      });
      console.error("Error al obtener el inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  const buscarProductos = async () => {
    try {
      setLoading(true);

      const respuesta = await obtenerProductos();
      // console.log("Respuesta del productos:", respuesta.data);
      if (respuesta.status === 200) {
        notification.success({
          message: "Productos obtenidos con éxito",
          duration: 3.5,
        });
        setProductos(respuesta.data);
        setLoading(false);
        return;
      }
      if (respuesta.status === 204) {
        notification.info({
          message: "No existe productos en el inventario",
          duration: 3.5,
        });
        setProductos([]);
        setLoading(false);
        // return;
      }
      notification.error({
        message: respuesta.error || "Error al obtener los productos",
        duration: 3.5,
      });
    } catch (error) {
      notification.error({
        message: "Error al obtener los productos",
        duration: 3.5,
      });
      console.error("Error al obtener los productos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarOrdenesCompraProveedores();
  }, []);

  const handleCerrarCompraNueva = () => {
    formOrdenCompra.resetFields();
    formSeleccionarProducto.resetFields();
    setProductosSeleccionadosOrdenCompra([]);
    setVendedores([]);
    setVisibleCompraNueva(false);
  };

  const handleAbrirCompraNueva = async () => {
    await buscarMiDatos();
    await obtenerProveedores();
    setVisibleCompraNueva(true);
  };

  const seleccionProveedor = async (idProveedorSeleccionado) => {
    const proveedorSeleccionado = proveedores.find(
      (p) => p.idProveedor === idProveedorSeleccionado
    );
    if (proveedorSeleccionado) {
      // console.log("Proveedor seleccionado:", proveedorSeleccionado);

      await buscarVenedoresPorProveedor(proveedorSeleccionado.rut);
    } else {
      console.warn(
        "Proveedor no encontrado para el ID:",
        idProveedorSeleccionado
      );
    }
  };

  const handleAgregarProductoOrdenCompra = async () => {
    await buscarProductos();
    setDrawerSelectProductoOrdenCompra(true);
  };
  const eliminarProductoOrdenCompra = (key) => {
    setProductosSeleccionadosOrdenCompra(
      productosSeleccionadosOrdenCompra.filter((item) => item.key !== key)
    );
    notification.success({ message: "Producto eliminado de la orden" });
  };

  const AgregarProductoOrdenCompra = (values) => {
    // console.log("Valores del formulario:", values);
    const productoExiste = productosSeleccionadosOrdenCompra.some(
      (item) => item.productoSeleccionado === values.productoSeleccionado
    );

    if (productoExiste) {
      notification.warning({
        message: "Este producto ya está en la orden de compra",
      });
      return;
    }
    setProductosSeleccionadosOrdenCompra((prevProductos) => {
      const maxKey =
        prevProductos.length > 0
          ? Math.max(...prevProductos.map((p) => p.key))
          : 0;

      const newKey = maxKey + 1;

      return [
        ...prevProductos,
        {
          ...values,
          key: newKey,
        },
      ];
    });
    formSeleccionarProducto.resetFields();
    setDrawerSelectProductoOrdenCompra(false);
  };

  const enviarOrdenCompra = async (values) => {
    try {
      const ordenCompleta = {
        ...values,
        productos: productosSeleccionadosOrdenCompra,
      };
      // console.log("Orden de compra completa:", ordenCompleta);
      setLoading(true);
      const respuesta = await crearOrdenCompraProveedor(ordenCompleta);
      if (respuesta.status === 201) {
        notification.success({
          message: "Orden de compra creada con éxito",
          duration: 3.5,
        });
        handleCerrarCompraNueva();
        buscarOrdenesCompraProveedores();
        setLoading(false);
        return;
      }
      notification.error({
        message: respuesta.error || "Error al crear la orden de compra",
        duration: 3.5,
      });
      setLoading(false);
    } catch (error) {
      notification.error({
        message: "Error al crear la orden de compra",
        duration: 3.5,
      });
      console.error("Error al crear la orden de compra:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const columnas = [
    {
      title: "ID",
      dataIndex: "idCompraProveedor",
      key: "idCompraProveedor",
    },
    {
      title: " Orden Compra",
      dataIndex: "nombreOrden",
      key: "nombreOrden",
    },
    {
      title: "Proveedor",
      dataIndex: ["proveedor", "nombre"],
      key: "proveedor.nombre",
    },
    {
      title: "Fecha Compra",
      dataIndex: "fechaCompra",
      key: "fechaCompra",
      render: (fecha) => new Date(fecha).toLocaleDateString(),
    },
    {
      title: "Hora",
      dataIndex: "fechaCompra",
      key: "fechaCompra",
      render: (fecha) =>
        new Date(fecha).toLocaleTimeString("es-CL", {
          hour12: false,
        }),
    },
    {
      title: "Estados",
      dataIndex: "estado",
      key: "estado",
      render: (estado) => {
        let color = "gray";
        if (estado === "pendiente") {
          color = "yellow";
        } else if (estado === "aprobada") {
          color = "blue";
        } else if (estado === "recibida") {
          color = "green";
        } else if (estado === "cancelada") {
          color = "red";
        }
        return <Tag color={color}>{estado.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Total Compra",
      dataIndex: "total",
      key: "total",
    },
    {
      title: "Ver detalles",
      key: "detalles",
      render: (_, record) => (
        <Button type="link" onClick={() => handleAbrirModalDetalles(record)}>
          Ver Detalles
        </Button>
      ),
    },
  ];

  const handleAbrirModalDetalles = (compraProveedor) => {
    // console.log("Detalles de la compra proveedor:", compraProveedor);
    setModalDetalle({ visible: true, compraProveedor: compraProveedor });
  };

  return (
    <>
      {/* Titulo */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col justify="start" style={{ textAlign: "left" }}>
          <Button onClick={() => navigate("/vendedor")}>Volver</Button>
        </Col>
        <Col justify="center" style={{ flex: 1, textAlign: "center" }}>
          <Title level={2}>Compra Proveedor</Title>
        </Col>
      </Row>

      <Divider />
      {/* Tabla de Ordenes de Compra */}
      <Row>
        <Col span={24} style={{ marginTop: 16 }}>
          <Card>
            <Table
              title={() => (
                <div style={{ marginBottom: 8 }}>
                  <Row
                    justify="space-between"
                    align="middle"
                    gutter={16}
                    style={{ marginBottom: 12 }}
                  >
                    <Col>
                      <Title level={4} style={{ margin: 0 }}>
                        Ordenes de compra
                      </Title>
                    </Col>
                    <Col>
                      <Text type="secondary">
                        Total: {ordenesCompra.length} Ordenes De Compra
                      </Text>
                    </Col>
                  </Row>
                  <Row gutter={8}>
                    <Col>
                      <Button
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        onClick={handleAbrirCompraNueva}
                      >
                        Crear Oden de Compra
                      </Button>
                    </Col>
                    {/* <Col>
                      <Button disabled={ordenesCompra.length === 0}>
                        Crear Lista de productos faltantes
                      </Button>
                    </Col> */}
                  </Row>
                </div>
              )}
              rowKey="idCompraProveedor"
              columns={columnas}
              pagination={{ pageSize: 10 }}
              dataSource={ordenesCompra}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
      {/* Modal Nueva Orden de Compra */}
      <Modal
        title="Nueva Orden de Compra"
        open={visibleCompraNueva}
        onCancel={handleCerrarCompraNueva}
        footer={[
          <Button key="cancel" onClick={handleCerrarCompraNueva}>
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            disabled={
              proveedores.length === 0 ||
              productosSeleccionadosOrdenCompra.length === 0 ||
              productos.length === 0
            }
            onClick={() => {
              formOrdenCompra.submit();
            }}
          >
            Crear Orden de Compra
          </Button>,
        ]}
        width={800}
      >
        <Form
          form={formOrdenCompra}
          layout="vertical"
          onFinish={enviarOrdenCompra}
        >
          {proveedores.length === 0 && (
            <Alert
              message="Debes Solicitar la creación de proveedores antes de crear una orden de compra."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          {/*Funcionario - Sucursal disabled */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="CodFuncionario"
                name="idFuncionario"
                initialValue={miDatos.idFuncionario}
              >
                <Input disabled placeholder="CodFuncionario" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="CodSucursal"
                name="idSucursal"
                initialValue={miDatos.idSucursal}
              >
                <Input disabled placeholder="CodSucursal" />
              </Form.Item>
            </Col>
          </Row>
          {/*Proveedor - Vendedor */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Proveedor"
                name="idProveedor"
                rules={[
                  { required: true, message: "Proveedor es obligatorio" },
                ]}
              >
                <Select
                  disabled={proveedores.length === 0}
                  options={proveedores.map((proveedor) => ({
                    value: proveedor.idProveedor,
                    label: `${proveedor.rut} - ${proveedor.nombre}`,
                  }))}
                  onChange={seleccionProveedor}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Vendedor"
                name="idVendedorProveedor"
                dependencies={["idProveedor"]}
                rules={[
                  {
                    required: vendedores.length > 0,
                    message: "Vendedor es Requerido",
                  },
                ]}
              >
                <Select
                  placeholder={
                    vendedores.length > 0
                      ? "Seleccione un vendedor"
                      : "Seleccione un proveedor primero"
                  }
                  disabled={vendedores.length === 0}
                  options={vendedores.map((vendedor) => ({
                    value: vendedor.idVendedorProveedor,
                    label: vendedor.nombre,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
            <Col>
              <Button
                type="default"
                icon={<PlusOutlined />}
                // disabled={productos.length === 0}
                onClick={() => handleAgregarProductoOrdenCompra()}
              >
                Agregar Producto
              </Button>
            </Col>
            <Col>
              <Button type="default" disabled={ordenesCompra.length === 0}>
                Crear Lista de productos faltantes
              </Button>
            </Col>
          </Row>

          <Drawer
            title="Seleccionar Producto"
            width={350}
            onClose={() => setDrawerSelectProductoOrdenCompra(false)}
            open={drawerSelectProductoOrdenCompra}
          >
            <Title level={4}>Seleccionar Producto</Title>
            {productos.length === 0 && (
              <Alert
                message="Debes Solicitar la creación de productos antes de agregar a la orden de compra."
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
            <Form
              layout="vertical"
              form={formSeleccionarProducto}
              onFinish={AgregarProductoOrdenCompra}
            >
              <Form.Item
                label="Producto"
                name="productoSeleccionado"
                rules={[{ required: true, message: "Producto es obligatorio" }]}
              >
                <Select
                  showSearch
                  placeholder={
                    productos.length > 0
                      ? "Seleccione un producto"
                      : "No hay productos disponibles"
                  }
                  disabled={productos.length === 0}
                  options={productos.map((producto) => ({
                    value: producto.idProducto,
                    label: `${producto.nombre} - ${producto.marca}`,
                  }))}
                />
              </Form.Item>

              <Form.Item
                label="Cantidad"
                name="cantidadProducto"
                rules={[{ required: true, message: "Cantidad es obligatoria" }]}
                initialValue={1}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="Valor Unitario"
                name="valorUnitarioProducto"
                rules={[
                  {
                    required: true,
                    message: "Valor Unitario es obligatorio",
                  },
                ]}
                initialValue={0}
              >
                <InputNumber
                  min={0}
                  step="0.01"
                  precision={0}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Agregar a la Orden
                </Button>
              </Form.Item>
            </Form>
          </Drawer>

          <Table
            // rowSelection={rowSelection}
            columns={[
              {
                title: "ID",
                dataIndex: "key",
                key: "key",
              },
              {
                title: "Producto",
                dataIndex: "productoSeleccionado",
                key: "productoSeleccionado",
                render: (id) => {
                  const prod = productos.find((p) => p.idProducto === id);
                  return prod ? `${prod.nombre} - ${prod.marca}` : id;
                },
              },
              {
                title: "Cantidad",
                dataIndex: "cantidadProducto",
                key: "cantidadProducto",
              },
              {
                title: "Valor Unitario",
                dataIndex: "valorUnitarioProducto",
                key: "valorUnitarioProducto",
              },
              {
                title: "Total",
                dataIndex: "total",
                key: "total",
                render: (_, record) => {
                  const cantidad = record.cantidadProducto || 0;
                  const valor = record.valorUnitarioProducto || 0; // Corregido el nombre de la propiedad
                  return cantidad * valor;
                },
              },
              {
                title: "Acciones",
                key: "acciones",
                render: (_, record) => (
                  <Popconfirm
                    title="¿Eliminar producto?"
                    description="¿Está seguro de eliminar este producto de la orden?"
                    onConfirm={() => eliminarProductoOrdenCompra(record.key)}
                    okText="Sí"
                    cancelText="No"
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                    ></Button>
                  </Popconfirm>
                ),
              },
            ]}
            dataSource={productosSeleccionadosOrdenCompra}
            scroll={{ x: 400 }}
          />
          <Form.Item
            label="Observaciones"
            name="observaciones"
            rules={[
              { required: true, message: "Observaciones son obligatorias" },
            ]}
          >
            <Input.TextArea rows={4} placeholder="Observaciones adicionales" />
          </Form.Item>
          {/* <Form.Item>
              <Button type="primary" htmlType="submit">
                Crear Orden de Compra
              </Button>
            </Form.Item> */}
        </Form>
      </Modal>

      {/* Modal Detalles Orden de Compra */}
      <Modal
        title="Detalles de la Orden de Compra"
        open={modalDetalle.visible}
        onCancel={() =>
          setModalDetalle({ visible: false, compraProveedor: null })
        }
        footer={[
          <Button
            key="close"
            onClick={() =>
              setModalDetalle({ visible: false, compraProveedor: null })
            }
          >
            Cerrar
          </Button>,
        ]}
        width={800}
      >
        {modalDetalle.compraProveedor && (
          <>
            {/* Información General */}
            <Descriptions
              bordered
              column={2}
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Descriptions.Item label="Sucursal" span={2}>
                {modalDetalle.compraProveedor.sucursal?.nombre} -{" "}
                {modalDetalle.compraProveedor.sucursal?.direccion}
              </Descriptions.Item>
              <Descriptions.Item label="N° Orden">
                {modalDetalle.compraProveedor.idCompraProveedor}
              </Descriptions.Item>
              <Descriptions.Item label="Nombre Orden">
                {modalDetalle.compraProveedor.nombreOrden}
              </Descriptions.Item>

              <Descriptions.Item label="Fecha">
                {new Date(
                  modalDetalle.compraProveedor.fechaCompra
                ).toLocaleDateString("es-CL")}
              </Descriptions.Item>
              <Descriptions.Item label="Hora">
                {new Date(
                  modalDetalle.compraProveedor.fechaCompra
                ).toLocaleTimeString("es-CL", {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Descriptions.Item>

              <Descriptions.Item label="Proveedor">
                {modalDetalle.compraProveedor.proveedor?.nombre}
              </Descriptions.Item>
              <Descriptions.Item label="RUT Proveedor">
                {modalDetalle.compraProveedor.proveedor?.rut}
              </Descriptions.Item>

              <Descriptions.Item label="Funcionario">
                {modalDetalle.compraProveedor.funcionario?.nombre}
              </Descriptions.Item>
              <Descriptions.Item label="Email Funcionario">
                {modalDetalle.compraProveedor.funcionario?.email}
              </Descriptions.Item>

              <Descriptions.Item label="Estado">
                <Tag
                  color={
                    modalDetalle.compraProveedor.estado === "pendiente"
                      ? "orange"
                      : "green"
                  }
                >
                  {modalDetalle.compraProveedor.estado?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total">
                <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
                  ${modalDetalle.compraProveedor.total?.toLocaleString("es-CL")}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Observaciones" span={2}>
                {modalDetalle.compraProveedor.observaciones ||
                  "Sin observaciones"}
              </Descriptions.Item>
            </Descriptions>

            {/* Detalles de Productos */}
            <Divider>Productos</Divider>

            {modalDetalle.compraProveedor.compraproveedordetalles?.length >
            0 ? (
              <Table
                dataSource={
                  modalDetalle.compraProveedor.compraproveedordetalles
                }
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
                    title: "Descripción",
                    dataIndex: ["producto", "descripcion"],
                    key: "descripcion",
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
                summary={(pageData) => {
                  const totalGeneral = pageData.reduce(
                    (sum, record) => sum + (record.total || 0),
                    0
                  );
                  return (
                    <Table.Summary.Row style={{ backgroundColor: "#fafafa" }}>
                      <Table.Summary.Cell colSpan={4} align="right">
                        <Text strong>Total General:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="right">
                        <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
                          ${totalGeneral.toLocaleString("es-CL")}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  );
                }}
              />
            ) : (
              <Empty description="No hay productos en esta orden" />
            )}
          </>
        )}
      </Modal>
    </>
  );
};

export default AprovicionamientoProveedor;
