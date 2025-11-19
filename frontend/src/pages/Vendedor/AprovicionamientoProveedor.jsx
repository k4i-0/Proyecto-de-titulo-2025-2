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
} from "antd";

import {
  SearchOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  DeleteOutlined,
  SendOutlined,
} from "@ant-design/icons";

import obtenerInventarios from "../../services/inventario/Inventario.service";

const AprovicionamientoProveedor = () => {
  const [productos, setProductos] = useState([
    // {
    //   id: 1,
    //   codigo: "PROD001",
    //   nombre: "Laptop HP",
    //   categoria: "Electrónica",
    //   stock: 5,
    //   stockMinimo: 10,
    //   precio: 850000,
    // },
    // {
    //   id: 2,
    //   codigo: "PROD002",
    //   nombre: "Mouse Logitech",
    //   categoria: "Accesorios",
    //   stock: 15,
    //   stockMinimo: 20,
    //   precio: 25000,
    // },
    // {
    //   id: 3,
    //   codigo: "PROD003",
    //   nombre: "Teclado Mecánico",
    //   categoria: "Accesorios",
    //   stock: 2,
    //   stockMinimo: 8,
    //   precio: 75000,
    // },
    // {
    //   id: 4,
    //   codigo: "PROD004",
    //   nombre: 'Monitor Samsung 24"',
    //   categoria: "Electrónica",
    //   stock: 0,
    //   stockMinimo: 5,
    //   precio: 180000,
    // },
    // {
    //   id: 5,
    //   codigo: "PROD005",
    //   nombre: "Webcam HD",
    //   categoria: "Accesorios",
    //   stock: 8,
    //   stockMinimo: 10,
    //   precio: 45000,
    // },
  ]);

  const [filtroTexto, setFiltroTexto] = useState("");
  const [productosSolicitud, setProductosSolicitud] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  //obtener inventarios
  useEffect(() => {
    const cargarInventarios = async () => {
      try {
        setLoading(true);
        const response = await obtenerInventarios();

        if (!response) {
          message.error("Error al obtener inventarios");
          setProductos([]);
          return;
        }

        if (response.status === 422) {
          message.warning("No hay productos en el inventario");
          setProductos([]);
          return;
        }

        // Asumiendo que la respuesta tiene la data en response.data
        const data = response.data || response;
        setProductos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al obtener inventarios:", error);
        message.error("No se pudieron cargar los productos");
        setProductos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarInventarios();
  }, []);

  // Filtrar productos por código o nombre
  const productosFiltrados = productos.filter(
    (producto) =>
      producto.codigo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      producto.nombre.toLowerCase().includes(filtroTexto.toLowerCase())
  );

  // Agregar producto a la solicitud
  const agregarASolicitud = (producto) => {
    const existe = productosSolicitud.find((p) => p.id === producto.id);

    if (existe) {
      message.warning("Este producto ya está en la solicitud");
      return;
    }

    const nuevoProducto = {
      ...producto,
      cantidadSolicitada: 1,
    };

    setProductosSolicitud([...productosSolicitud, nuevoProducto]);
    message.success(`${producto.nombre} agregado a la solicitud`);
  };

  // Actualizar cantidad solicitada
  const actualizarCantidad = (id, cantidad) => {
    if (cantidad < 1) return;

    setProductosSolicitud(
      productosSolicitud.map((p) =>
        p.id === id ? { ...p, cantidadSolicitada: cantidad } : p
      )
    );
  };

  // Eliminar producto de la solicitud
  const eliminarDeSolicitud = (id) => {
    setProductosSolicitud(productosSolicitud.filter((p) => p.id !== id));
    message.info("Producto eliminado de la solicitud");
  };

  // Enviar solicitud
  const enviarSolicitud = () => {
    if (productosSolicitud.length === 0) {
      message.error("Debes agregar al menos un producto");
      return;
    }

    console.log("Solicitud a enviar:", productosSolicitud);
    // Aquí harías la petición a tu API
    message.success("Solicitud de stock enviada correctamente");
    setProductosSolicitud([]);
    setDrawerVisible(false);
  };

  // Calcular total de la solicitud
  const calcularTotal = () => {
    return productosSolicitud.reduce(
      (total, p) => total + p.precio * p.cantidadSolicitada,
      0
    );
  };

  // Columnas de la tabla
  const columnas = [
    {
      title: "Código",
      dataIndex: "codigo",
      key: "codigo",
      width: 120,
    },
    {
      title: "Producto",
      dataIndex: "nombre",
      key: "nombre",
    },
    {
      title: "Stock Actual",
      dataIndex: "stock",
      key: "stock",
      //   width: 120,
      align: "center",
      render: (stock, record) => {
        let color = "green";
        if (stock === 0) color = "red";
        else if (stock < record.stockMinimo) color = "orange";

        return <Tag color={color}>{stock}</Tag>;
      },
    },
    // {
    //   title: "Stock Mínimo",
    //   dataIndex: "stockMinimo",
    //   key: "stockMinimo",
    //   width: 130,
    //   align: "center",
    // },
    // {
    //   title: "Precio",
    //   dataIndex: "precio",
    //   key: "precio",
    //   width: 120,
    //   render: (precio) => `$${precio.toLocaleString("es-CL")}`,
    // },
    {
      title: "Acción",
      key: "accion",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => agregarASolicitud(record)}
          size="small"
        >
          Solicitar
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <Spin size="large" tip="Cargando productos..." />
      </div>
    );
  }

  return (
    <>
      <div style={{ padding: "24px" }}>
        {productos.length > 0 ? (
          <>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card
                  title="Solicitud de Stock"
                  extra={
                    <Badge count={productosSolicitud.length} showZero>
                      <Button
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        onClick={() => setDrawerVisible(true)}
                      >
                        Ver Solicitud
                      </Button>
                    </Badge>
                  }
                >
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="large"
                  >
                    {/* Filtro de búsqueda */}
                    <Input
                      placeholder="Buscar por código o nombre del producto"
                      prefix={<SearchOutlined />}
                      value={filtroTexto}
                      onChange={(e) => setFiltroTexto(e.target.value)}
                      allowClear
                      size="large"
                    />

                    {/* Tabla de productos */}
                    <Table
                      columns={columnas}
                      dataSource={productosFiltrados}
                      rowKey="id"
                      pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Total: ${total} productos`,
                      }}
                      scroll={{ x: 1000 }}
                    />
                  </Space>
                </Card>
              </Col>
            </Row>

            {/* Drawer con productos solicitados */}
            <Drawer
              title="Productos a Solicitar"
              placement="right"
              width={500}
              onClose={() => setDrawerVisible(false)}
              open={drawerVisible}
              extra={
                <Space>
                  <Button onClick={() => setDrawerVisible(false)}>
                    Cancelar
                  </Button>
                  <Popconfirm
                    title="¿Confirmar solicitud?"
                    description="Se enviará la solicitud de stock al proveedor"
                    onConfirm={enviarSolicitud}
                    okText="Sí"
                    cancelText="No"
                  >
                    <Button type="primary" icon={<SendOutlined />}>
                      Enviar Solicitud
                    </Button>
                  </Popconfirm>
                </Space>
              }
            >
              {productosSolicitud.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "50px 0",
                    color: "#999",
                  }}
                >
                  No hay productos en la solicitud
                </div>
              ) : (
                <>
                  <List
                    dataSource={productosSolicitud}
                    renderItem={(producto) => (
                      <List.Item
                        actions={[
                          <Popconfirm
                            title="¿Eliminar producto?"
                            onConfirm={() => eliminarDeSolicitud(producto.id)}
                            okText="Sí"
                            cancelText="No"
                          >
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              size="small"
                            />
                          </Popconfirm>,
                        ]}
                      >
                        <List.Item.Meta
                          title={producto.nombre}
                          description={
                            <Space direction="vertical" size="small">
                              <div>Código: {producto.codigo}</div>
                              <div>Stock actual: {producto.stock}</div>
                              <div>
                                Precio: $
                                {producto.precio.toLocaleString("es-CL")}
                              </div>
                              <Space>
                                <span>Cantidad:</span>
                                <InputNumber
                                  min={1}
                                  value={producto.cantidadSolicitada}
                                  onChange={(value) =>
                                    actualizarCantidad(producto.id, value)
                                  }
                                  size="small"
                                />
                              </Space>
                              <div style={{ fontWeight: "bold" }}>
                                Subtotal: $
                                {(
                                  producto.precio * producto.cantidadSolicitada
                                ).toLocaleString("es-CL")}
                              </div>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />

                  <div
                    style={{
                      marginTop: "20px",
                      padding: "15px",
                      background: "#f5f5f5",
                      borderRadius: "8px",
                    }}
                  >
                    <Row
                      justify="space-between"
                      style={{ fontSize: "16px", fontWeight: "bold" }}
                    >
                      <Col>Total:</Col>
                      <Col>${calcularTotal().toLocaleString("es-CL")}</Col>
                    </Row>
                    <Row justify="space-between" style={{ marginTop: "10px" }}>
                      <Col>Productos:</Col>
                      <Col>{productosSolicitud.length}</Col>
                    </Row>
                    <Row justify="space-between">
                      <Col>Unidades totales:</Col>
                      <Col>
                        {productosSolicitud.reduce(
                          (sum, p) => sum + p.cantidadSolicitada,
                          0
                        )}
                      </Col>
                    </Row>
                  </div>
                </>
              )}
            </Drawer>
          </>
        ) : (
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="Solicitud de Stock">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No hay productos disponibles para solicitar"
                ></Empty>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </>
  );
};

export default AprovicionamientoProveedor;
