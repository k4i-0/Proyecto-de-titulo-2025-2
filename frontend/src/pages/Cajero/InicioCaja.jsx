import {
  Col,
  Row,
  Input,
  Form,
  Card,
  Button,
  Modal,
  Drawer,
  List,
  Typography,
  Divider,
  Avatar,
  Space,
  notification,
} from "antd";
import React, { useState, useEffect } from "react";

import DataTable from "../../components/Tabla";

export default function InicioCaja() {
  const [productosStock, setProductosStock] = useState([]);
  const [productosVender, setProductosVender] = useState([]);
  const [totalVenta, setTotalVenta] = useState(0);
  const [formAgregarProducto] = Form.useForm();
  const [modalBusquedaVisible, setModalBusquedaVisible] = useState(false);
  const [drawerMenuVisible, setDrawerMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ejemplo local de productos (frontend-only)
  const sampleProductos = [
    { codigo: "P-001", nombre: "Leche 1L", precioUnitario: 1200, cantidad: 10 },
    {
      codigo: "P-002",
      nombre: "Pan integral",
      precioUnitario: 800,
      cantidad: 20,
    },
    {
      codigo: "P-003",
      nombre: "Arroz 1kg",
      precioUnitario: 1500,
      cantidad: 15,
    },
    { codigo: "P-004", nombre: "Aceite 1L", precioUnitario: 3200, cantidad: 8 },
  ];

  useEffect(() => {
    if (!productosStock || productosStock.length === 0)
      setProductosStock(sampleProductos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columnaProductos = [
    {
      title: "Código",
      dataIndex: "codigo",
      key: "codigo",
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
    },
    {
      title: "Precio Unitario",
      dataIndex: "precioUnitario",
      key: "precioUnitario",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <Button
          danger
          size="small"
          onClick={() => handleRemoverProducto(record)}
        >
          Quitar
        </Button>
      ),
    },
  ];

  const handleAgregarProducto = (values) => {
    console.log("Producto agregado:", values);
    // buscar producto por código en stock
    const producto = productosStock.find(
      (p) => p.codigo === values.codigoProducto,
    );
    const precio = producto ? producto.precioUnitario : 1000;
    const total = (Number(values.cantidad) || 1) * precio;
    const nuevo = {
      codigo: values.codigoProducto,
      nombre: producto ? producto.nombre : "Producto desconocido",
      cantidad: Number(values.cantidad) || 1,
      precioUnitario: precio,
      total,
    };
    const nuevos = [...productosVender, nuevo];
    setProductosVender(nuevos);
    setTotalVenta(nuevos.reduce((acc, curr) => acc + (curr.total || 0), 0));
    formAgregarProducto.resetFields();
  };

  const handleRemoverProducto = (record) => {
    const nuevos = productosVender.filter((p) => p !== record);
    setProductosVender(nuevos);
    setTotalVenta(nuevos.reduce((acc, curr) => acc + (curr.total || 0), 0));
  };

  const abrirModalBusqueda = () => setModalBusquedaVisible(true);
  const cerrarModalBusqueda = () => setModalBusquedaVisible(false);

  const abrirDrawerMenu = () => setDrawerMenuVisible(true);
  const cerrarDrawerMenu = () => setDrawerMenuVisible(false);

  const handleSeleccionarProducto = (producto) => {
    const nuevo = {
      codigo: producto.codigo,
      nombre: producto.nombre,
      cantidad: 1,
      precioUnitario: producto.precioUnitario,
      total: producto.precioUnitario,
    };
    const nuevos = [...productosVender, nuevo];
    setProductosVender(nuevos);
    setTotalVenta(nuevos.reduce((acc, curr) => acc + (curr.total || 0), 0));
    notification?.success?.({ message: "Producto añadido al carrito" });
  };
  return (
    <div>
      <Row
        align="middle"
        justify="center"
        style={{ height: "100%", padding: "24px" }}
      >
        <Col span={24}>
          <h1>Datos venta</h1>
          <text>
            Datos del cliente si esque hay, datos de la sucursal, cajero, hora,
            fecha
          </text>
        </Col>
      </Row>
      <Row
        align="middle"
        justify="center"
        style={{
          height: "100%",
          marginTop: 10,
          marginBottom: 10,
          background: "#f0f2f5",
          borderRadius: "8px",
        }}
      >
        <Col span={14}>
          <Card>
            <Form
              form={formAgregarProducto}
              layout="vertical"
              onFinish={handleAgregarProducto}
              initialValues={{ cantidad: 1 }}
            >
              <Row gutter={8} align="bottom">
                <Col flex="auto">
                  <Form.Item label="Código de producto" name="codigoProducto">
                    <Input placeholder="Código de producto" />
                  </Form.Item>
                </Col>
                <Col flex="100px">
                  <Form.Item label="Cantidad" name="cantidad">
                    <Input placeholder="Cantidad" />
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item label=" ">
                    <Button
                      style={{ display: "none" }}
                      type="primary"
                      htmlType="submit"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
        <Col span={10}>
          <Card style={{ textAlign: "center" }}>
            <Space direction="inline" style={{ width: "100%" }}>
              <Button type="default" block onClick={abrirModalBusqueda}>
                Buscar productos
              </Button>
              <Button type="primary" block onClick={abrirDrawerMenu}>
                Menú caja
              </Button>
            </Space>
          </Card>
        </Col>
        {/* <Col span={5}>
          <Card>
            <Typography.Title level={5}>Carrito</Typography.Title>
            <Divider />
            <List
              size="small"
              dataSource={productosVender}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar>{item.nombre?.charAt(0)}</Avatar>}
                    title={`${item.nombre} x${item.cantidad}`}
                    description={`$ ${item.total}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col> */}
      </Row>
      <DataTable columns={columnaProductos} showSearch={false} />
      {/** Modal búsqueda de productos */}
      <Modal
        title="Buscar Productos"
        open={modalBusquedaVisible}
        onCancel={cerrarModalBusqueda}
        footer={null}
        width={800}
      >
        <Input.Search
          placeholder="Buscar por nombre o código"
          enterButton
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <List
          dataSource={productosStock.filter(
            (p) =>
              p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.codigo.toLowerCase().includes(searchQuery.toLowerCase()),
          )}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  key="add"
                  type="primary"
                  onClick={() => handleSeleccionarProducto(item)}
                >
                  Agregar
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar>{item.nombre.charAt(0)}</Avatar>}
                title={`${item.nombre} (${item.codigo})`}
                description={`Precio: $ ${item.precioUnitario} - Stock: ${item.cantidad}`}
              />
            </List.Item>
          )}
        />
      </Modal>

      {/** Drawer menú de caja */}
      <Drawer
        title="Menú de Caja"
        placement="right"
        onClose={cerrarDrawerMenu}
        open={drawerMenuVisible}
        width={320}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button block>Resumen caja</Button>
          <Button block>Historial de ventas</Button>
          <Button block>Cerrar caja</Button>
          <Divider />
          <Button block type="link">
            Configuración
          </Button>
        </Space>
      </Drawer>
      <Row
        align="end"
        justify="end"
        style={{
          height: "100%",
          marginTop: 10,
          marginBottom: 10,
          padding: "24px",
        }}
      >
        <Col span={12}>Total venta: ${totalVenta.toFixed(0)}</Col>
        <Col span={12}>
          <Button type="primary">Pagar</Button>
        </Col>
      </Row>
    </div>
  );
}
