import { useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  InputNumber,
  Card,
  Table,
  Space,
  Row,
  Col,
  Popconfirm,
  message,
  Drawer,
  Divider,
  Badge,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

const FormularioConDrawer = () => {
  const [form] = Form.useForm();
  const [formProducto] = Form.useForm();

  const [productos, setProductos] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Catálogo de productos
  const catalogoProductos = [
    { id: 1, nombre: "Laptop HP", marca: "HP", sku: "SKU001", precio: 850000 },
    {
      id: 2,
      nombre: "Mouse Logitech",
      marca: "Logitech",
      sku: "SKU002",
      precio: 25000,
    },
    {
      id: 3,
      nombre: "Teclado Mecánico",
      marca: "Razer",
      sku: "SKU003",
      precio: 120000,
    },
    {
      id: 4,
      nombre: 'Monitor LG 27"',
      marca: "LG",
      sku: "SKU004",
      precio: 180000,
    },
    {
      id: 5,
      nombre: "Webcam Logitech",
      marca: "Logitech",
      sku: "SKU005",
      precio: 95000,
    },
  ];

  // Agregar producto
  const handleAgregarProducto = (values) => {
    const productoExiste = productos.some(
      (p) => p.idProducto === values.idProducto
    );

    if (productoExiste) {
      message.warning("Este producto ya está en la lista");
      return;
    }

    const productoInfo = catalogoProductos.find(
      (p) => p.id === values.idProducto
    );

    const nuevoProducto = {
      key: Date.now(),
      idProducto: values.idProducto,
      nombre: productoInfo.nombre,
      marca: productoInfo.marca,
      sku: productoInfo.sku,
      cantidad: values.cantidad,
      precioUnitario: values.precioUnitario,
      subtotal: values.cantidad * values.precioUnitario,
    };

    setProductos([...productos, nuevoProducto]);
    formProducto.resetFields();
    message.success("Producto agregado correctamente");
  };

  // Eliminar producto
  const handleEliminarProducto = (key) => {
    setProductos(productos.filter((p) => p.key !== key));
    message.success("Producto eliminado");
  };

  // Calcular total
  const calcularTotal = () => {
    return productos.reduce((sum, p) => sum + p.subtotal, 0);
  };

  // Abrir drawer
  const handleAbrirDrawer = () => {
    formProducto.resetFields();
    setDrawerVisible(true);
  };

  // Cerrar drawer
  const handleCerrarDrawer = () => {
    setDrawerVisible(false);
    formProducto.resetFields();
  };

  // Enviar formulario
  const onFinish = (values) => {
    if (productos.length === 0) {
      message.warning("Debe agregar al menos un producto");
      return;
    }

    const ordenCompra = {
      ...values,
      productos: productos,
      total: calcularTotal(),
    };

    console.log("Orden de Compra:", ordenCompra);
    message.success("Orden de compra creada exitosamente");
  };

  // Columnas de la tabla
  const columns = [
    {
      title: "Producto",
      dataIndex: "nombre",
      key: "nombre",
      width: "30%",
      render: (text, record) => (
        <div>
          <div>
            <strong>{text}</strong>
          </div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {record.marca} - {record.sku}
          </div>
        </div>
      ),
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
      render: (precio) => `$${precio.toLocaleString("es-CL")}`,
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      key: "subtotal",
      align: "right",
      width: "20%",
      render: (subtotal) => (
        <strong style={{ color: "#1890ff" }}>
          ${subtotal.toLocaleString("es-CL")}
        </strong>
      ),
    },
    {
      title: "",
      key: "acciones",
      align: "center",
      width: "15%",
      render: (_, record) => (
        <Popconfirm
          title="¿Eliminar este producto?"
          onConfirm={() => handleEliminarProducto(record.key)}
          okText="Sí"
          cancelText="No"
        >
          <Button type="text" danger icon={<DeleteOutlined />}>
            Eliminar
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <Card
        title={
          <Space>
            <ShoppingCartOutlined />
            Nueva Orden de Compra
            {productos.length > 0 && (
              <Badge
                count={productos.length}
                style={{ backgroundColor: "#52c41a" }}
              />
            )}
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* Información Básica */}
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Solicitante">
                <Input disabled value="Juan Pérez" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Proveedor"
                name="proveedor"
                rules={[{ required: true, message: "Seleccione un proveedor" }]}
              >
                <Select placeholder="Seleccione un proveedor">
                  <Select.Option value="proveedor1">Proveedor 1</Select.Option>
                  <Select.Option value="proveedor2">Proveedor 2</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Sucursal Destino"
                name="sucursal"
                rules={[{ required: true, message: "Seleccione una sucursal" }]}
              >
                <Select placeholder="Seleccione una sucursal">
                  <Select.Option value="sucursal1">
                    Sucursal Centro
                  </Select.Option>
                  <Select.Option value="sucursal2">
                    Sucursal Norte
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Sección de Productos */}
          <div style={{ marginBottom: 16 }}>
            <Row justify="space-between" align="middle">
              <Col>
                <h3>
                  <ShoppingOutlined /> Productos
                  {productos.length > 0 && (
                    <span style={{ marginLeft: 8, color: "#1890ff" }}>
                      ({productos.length})
                    </span>
                  )}
                </h3>
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAbrirDrawer}
                  size="large"
                >
                  Agregar Producto
                </Button>
              </Col>
            </Row>
          </div>

          {/* Tabla de Productos */}
          <Table
            dataSource={productos}
            columns={columns}
            pagination={false}
            locale={{
              emptyText:
                'No hay productos agregados. Haga clic en "Agregar Producto"',
            }}
            summary={() =>
              productos.length > 0 && (
                <Table.Summary.Row style={{ backgroundColor: "#e6f7ff" }}>
                  <Table.Summary.Cell colSpan={3} align="right">
                    <strong style={{ fontSize: 16 }}>Total General:</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell align="right">
                    <strong style={{ fontSize: 18, color: "#1890ff" }}>
                      ${calcularTotal().toLocaleString("es-CL")}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell />
                </Table.Summary.Row>
              )
            }
          />

          <Divider />

          {/* Observaciones */}
          <Form.Item label="Observaciones" name="observaciones">
            <Input.TextArea
              rows={4}
              placeholder="Observaciones adicionales (opcional)"
            />
          </Form.Item>

          {/* Botones */}
          <Form.Item>
            <Row gutter={8} justify="end">
              <Col>
                <Button
                  onClick={() => {
                    form.resetFields();
                    setProductos([]);
                  }}
                >
                  Cancelar
                </Button>
              </Col>
              <Col>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={productos.length === 0}
                  size="large"
                >
                  Crear Orden de Compra
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Card>

      {/* Drawer para Agregar Producto */}
      <Drawer
        title={
          <Space>
            <ShoppingOutlined />
            Agregar Producto
          </Space>
        }
        placement="right"
        onClose={handleCerrarDrawer}
        open={drawerVisible}
        width={500}
        footer={
          <Row gutter={8} justify="end">
            <Col>
              <Button onClick={handleCerrarDrawer}>Cancelar</Button>
            </Col>
            <Col>
              <Button type="primary" onClick={() => formProducto.submit()}>
                Agregar al Carrito
              </Button>
            </Col>
          </Row>
        }
      >
        <Form
          form={formProducto}
          layout="vertical"
          onFinish={handleAgregarProducto}
          initialValues={{ cantidad: 1, precioUnitario: 0 }}
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
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              onChange={(value) => {
                const producto = catalogoProductos.find((p) => p.id === value);
                formProducto.setFieldsValue({
                  precioUnitario: producto.precio,
                });
              }}
            >
              {catalogoProductos.map((producto) => (
                <Select.Option key={producto.id} value={producto.id}>
                  <div>
                    <div>
                      <strong>{producto.nombre}</strong>
                    </div>
                    <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                      {producto.marca} - {producto.sku}
                    </div>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Cantidad"
            name="cantidad"
            rules={[{ required: true, message: "Ingrese la cantidad" }]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="Cantidad"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Precio Unitario"
            name="precioUnitario"
            rules={[{ required: true, message: "Ingrese el precio" }]}
          >
            <InputNumber
              min={0}
              precision={0}
              style={{ width: "100%" }}
              placeholder="Precio"
              size="large"
              formatter={(value) =>
                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
              }
              parser={(value) => value.replace(/\$\s?|(\.*)/g, "")}
            />
          </Form.Item>

          <Divider />

          {/* Preview del producto actual */}
          <Card
            title="Vista Previa"
            size="small"
            style={{ backgroundColor: "#f0f2f5" }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <strong>Cantidad:</strong>{" "}
                {formProducto.getFieldValue("cantidad") || 0}
              </div>
              <div>
                <strong>Precio Unitario:</strong> $
                {(
                  formProducto.getFieldValue("precioUnitario") || 0
                ).toLocaleString("es-CL")}
              </div>
              <Divider style={{ margin: "8px 0" }} />
              <div>
                <strong>Subtotal:</strong>{" "}
                <span
                  style={{ fontSize: 18, color: "#1890ff", fontWeight: "bold" }}
                >
                  $
                  {(
                    (formProducto.getFieldValue("cantidad") || 0) *
                    (formProducto.getFieldValue("precioUnitario") || 0)
                  ).toLocaleString("es-CL")}
                </span>
              </div>
            </Space>
          </Card>
        </Form>
      </Drawer>
    </>
  );
};

export default FormularioConDrawer;
