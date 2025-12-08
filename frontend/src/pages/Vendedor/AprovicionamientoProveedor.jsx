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
  message,
  Popconfirm,
  Empty,
  Spin,
  Typography,
  Modal,
  Form,
  Select,
  Divider,
  Alert,
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

import obtenerInventarios from "../../services/inventario/Inventario.service";

import {
  getAllProveedores,
  getAllProveedoresVendedor,
} from "../../services/inventario/Proveedor.service";

import obtenerProductos from "../../services/inventario/Productos.service";

const AprovicionamientoProveedor = () => {
  const navigate = useNavigate();

  // const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [
    productosSeleccionadosOrdenCompra,
    setProductosSeleccionadosOrdenCompra,
  ] = useState([]);

  const [visibleCompraNueva, setVisibleCompraNueva] = useState(false);
  const [drawerSelectProductoOrdenCompra, setDrawerSelectProductoOrdenCompra] =
    useState(false);
  const [loading, setLoading] = useState(false);

  //Formulario
  const [formOrdenCompra] = Form.useForm();
  const [formSeleccionarProducto] = Form.useForm();

  const buscarInventario = async () => {
    try {
      setLoading(true);
      const respuesta = await obtenerInventarios();
      // console.log("Respuesta del inventario:", respuesta.data);
      if (respuesta.status === 200) {
        message.success("Inventarios obtenidos con éxito");
        setInventario(respuesta.data);
        setLoading(false);
        return;
      }
      if (respuesta.status === 204) {
        message.info("No existe productos en el inventario");
        setInventario([
          {
            idInventario: 1,
            estado: "Bueno",
            stock: 100,
            idEstante: 1,
            lote: {
              idLote: 1,
              codigo: 203050,
              fechaVencimiento: "2024-12-31",
              cantidad: 500,
              fechaIngreso: "2024-01-15",
              idProducto: 1,
            },
          },
        ]);
        setLoading(false);
        return;
      }
      message.error(respuesta.error || "Error al obtener el inventario");
    } catch (error) {
      message.error("Error al obtener el inventario");
      console.error("Error al obtener el inventario:", error);
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
        message.success("Inventarios obtenidos con éxito");
        setProveedores(respuesta.data);
        setLoading(false);
        return;
      }
      if (respuesta.status === 204) {
        message.info("No existe productos en el inventario");
        setProveedores([]);
        setLoading(false);
        return;
      }
      message.error(respuesta.error || "Error al obtener el inventario");
    } catch (error) {
      message.error("Error al obtener el inventario");
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
        message.success("Inventarios obtenidos con éxito");
        setVendedores(respuesta.data);
        setLoading(false);
        return;
      }
      if (respuesta.status === 204) {
        message.info("No existe productos en el inventario");
        setVendedores([]);
        setLoading(false);
        // return;
      }
      message.error(respuesta.error || "Error al obtener el inventario");
    } catch (error) {
      message.error("Error al obtener el inventario");
      console.error("Error al obtener el inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  const buscarProductos = async () => {
    try {
      setLoading(true);

      const respuesta = await obtenerProductos();
      console.log("Respuesta del productos:", respuesta.data);
      if (respuesta.status === 200) {
        message.success("Productos obtenidos con éxito");
        setProductos(respuesta.data);
        setLoading(false);
        return;
      }
      if (respuesta.status === 204) {
        message.info("No existe productos en el inventario");
        setProductos([]);
        setLoading(false);
        // return;
      }
      message.error(respuesta.error || "Error al obtener los productos");
    } catch (error) {
      message.error("Error al obtener los productos");
      console.error("Error al obtener los productos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarInventario();
  }, []);

  const handleCerrarCompraNueva = () => {
    formOrdenCompra.resetFields();
    formSeleccionarProducto.resetFields();
    setProductosSeleccionadosOrdenCompra([]);
    setVendedores([]);
    setVisibleCompraNueva(false);
  };

  const handleAbrirCompraNueva = async () => {
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

  const AgregarProductoOrdenCompra = (values) => {
    console.log("Valores del formulario:", values);
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

  const enviarOrdenCompra = (values) => {
    console.log("Enviar orden de compra", values);
    console.log("Productos seleccionados:", productosSeleccionadosOrdenCompra);
  };

  const columnas = [
    {
      title: "ID",
      dataIndex: "idInventario",
      key: "idInventario",
    },
    {
      title: "Producto",
      dataIndex: "lote",
      key: "idProducto",
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
    },
    {
      title: "Estante",
      dataIndex: "idEstante",
      key: "idEstante",
    },
    {
      title: "Lote",
      dataIndex: "idLote",
      key: "idLote",
    },
  ];

  // const rowSelection = {
  //   type: "checkbox",
  //   selectedRowKeys,
  //   onChange: (selectedRows) => {
  //     setSelectedRowKeys(selectedRows);
  //     // console.log("Keys seleccionadas:", selectedRowKeys);
  //     console.log("Filas seleccionadas:", selectedRows);
  //   },
  // };

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
                        Productos en Inventario
                      </Title>
                    </Col>
                    <Col>
                      <Text type="secondary">
                        Total: {inventario.length} productos
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
                    <Col>
                      <Button disabled={inventario.length === 0}>
                        Crear Lista de productos faltantes
                      </Button>
                    </Col>
                  </Row>
                </div>
              )}
              // rowSelection={rowSelection}
              columns={columnas}
              pagination={{ pageSize: 10 }}
              dataSource={inventario}
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
            onClick={() => formOrdenCompra.submit()}
          >
            Crear Orden de Compra
          </Button>,
        ]}
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
                label="Funcionario"
                name="funcionario"
                rules={
                  [
                    // { required: true, message: "Funcionario es obligatorio" },
                  ]
                }
              >
                <Input disabled placeholder="Funcionario" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Sucursal"
                name="sucursal"
                rules={
                  [
                    // { required: true, message: "Sucursal es obligatorio" },
                  ]
                }
              >
                <Input disabled placeholder="Sucursal" />
              </Form.Item>
            </Col>
          </Row>
          {/*Proveedor - Vendedor */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Proveedor"
                name="proveedor"
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
                name="vendedor"
                dependencies={["proveedor"]}
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

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            // disabled={productos.length === 0}
            onClick={() => handleAgregarProductoOrdenCompra()}
          >
            Agregar Producto
          </Button>
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
            ]}
            dataSource={productosSeleccionadosOrdenCompra}
          />
          {/* <Form.Item>
              <Button type="primary" htmlType="submit">
                Crear Orden de Compra
              </Button>
            </Form.Item> */}
        </Form>
      </Modal>
    </>
  );
};

export default AprovicionamientoProveedor;
