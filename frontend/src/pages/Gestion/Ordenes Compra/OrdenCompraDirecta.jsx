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
} from "antd";

const { Title, Text } = Typography;

//user context
import { useAuth } from "../../../context/AuthContext";

//services
import { getAllProveedores } from "../../../services/inventario/Proveedor.service";

import obtenerSucursales from "../../../services/inventario/Sucursal.service";

export default function OrdenCompraDirecta() {
  const { user } = useAuth();
  console.log("Usuario en OC Directa:", user);

  const [ordenesDirectasFlag, setOrdenesDirectasFlag] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [productoActual, setProductoActual] = useState({
    idProducto: null,
    cantidad: 1,
    precioUnitario: 0,
  });
  const [form] = Form.useForm();

  const obtenerProveedores = async () => {
    try {
      const response = await getAllProveedores();
      console.log("Proveedores obtenidos en OC Directa:", response);
      if (response.status === 200) {
        setProveedores(response.data);
        notification.success({
          message: "Éxito",
          description: "Proveedores obtenidos correctamente.",
        });
        return;
      }
      if (response.status === 204) {
        setProveedores([]);
        notification.info({
          message: "Información",
          description: "No hay proveedores registrados.",
        });
        return;
      }
      notification.error({
        message: "Error",
        description:
          response.error?.message || "No se pudieron obtener los proveedores.",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message || "No se pudieron obtener los proveedores.",
      });
    }
  };

  const cargarSucursales = async () => {
    try {
      const response = await obtenerSucursales();
      if (response.status === 200) {
        setSucursales(response.data);
        notification.success({
          message: "Éxito",
          description: "Sucursales obtenidas correctamente.",
        });
        return;
      }
      if (response.status === 204) {
        setSucursales([]);
        notification.info({
          message: "Información",
          description: "No hay sucursales registradas.",
        });
        return;
      }
      notification.error({
        message: "Error",
        description:
          response.error?.message || "No se pudieron obtener las sucursales.",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message || "No se pudieron obtener las sucursales.",
      });
    }
  };

  const handelCrearOrdenDirecta = () => {
    setOrdenesDirectasFlag(true);
    obtenerProveedores();
    cargarSucursales();
  };

  const handleAgregarProducto = () => {
    if (!productoActual.idProducto) {
      notification.warning("Seleccione un producto");
      return;
    }

    if (productoActual.cantidad <= 0) {
      notification.warning("La cantidad debe ser mayor a 0");
      return;
    }

    if (productoActual.precioUnitario <= 0) {
      notification.warning("El precio debe ser mayor a 0");
      return;
    }

    const productoExiste = productosSeleccionados.some(
      (item) => item.idProducto === productoActual.idProducto
    );

    if (productoExiste) {
      notification.warning("Este producto ya está en la lista");
      return;
    }

    const producto = productos.find(
      (p) => p.idProducto === productoActual.idProducto
    );

    const nuevoProducto = {
      key: Date.now(),
      idProducto: productoActual.idProducto,
      nombre: producto.nombre,
      marca: producto.marca,
      cantidad: productoActual.cantidad,
      precioUnitario: productoActual.precioUnitario,
      total: productoActual.cantidad * productoActual.precioUnitario,
    };

    setProductosSeleccionados([...productosSeleccionados, nuevoProducto]);
    setProductoActual({ idProducto: null, cantidad: 1, precioUnitario: 0 });
    notification.success("Producto agregado");
  };

  const handleEliminarProducto = (key) => {
    setProductosSeleccionados(
      productosSeleccionados.filter((item) => item.key !== key)
    );
    notification.success("Producto eliminado");
  };

  const calcularTotal = () => {
    return productosSeleccionados.reduce((sum, item) => sum + item.total, 0);
  };

  return (
    <>
      <Row justify="center" align="middle" style={{ marginTop: "20px" }}>
        <Col>
          <Title level={2}>Órdenes de Compra Directa Proveedor</Title>
        </Col>
      </Row>
      <Divider />
      <Row justify="end" gutter={[16, 16]} style={{ marginTop: "20px" }}>
        <Col>
          <Button type="primary" onClick={handelCrearOrdenDirecta}>
            Crear Nueva Orden de Compra Directa
          </Button>
        </Col>
        <Col>
          <Button type="primary">
            Ver Órdenes de Compra Directa Existentes
          </Button>
        </Col>
      </Row>
      {ordenesDirectasFlag && (
        <Form form={form} layout="vertical">
          <Row justify="center" gutter={[16, 16]} style={{ marginTop: "20px" }}>
            <Card>
              <Col span={24}>
                <Title
                  level={4}
                  style={{ textAlign: "center", marginBottom: 20 }}
                >
                  Formulario de Nueva Orden de Compra Directa
                </Title>
                <Divider />
                <Row gutter={16}>
                  <Col>
                    <Form.Item label="Solicitante">
                      <Input
                        disabled
                        style={{ width: 300, marginBottom: 20 }}
                        placeholder="Solicitante"
                        value={user?.nombre}
                      />
                    </Form.Item>
                  </Col>
                  <Col>
                    {/* Proveedores */}
                    <Form.Item label="Proveedor" name="proveedor">
                      <Select
                        style={{ width: 300, marginBottom: 20 }}
                        placeholder="Seleccione un Proveedor"
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
                  <Col>
                    {/* Sucursales */}
                    <Form.Item label="Sucursal Destino" name="sucursal">
                      <Select
                        style={{ width: 300, marginBottom: 20 }}
                        placeholder="Seleccione una Sucursal"
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
                <Row>
                  <Col>
                    {/* Tabla de Productos */}
                    <Table
                      dataSource={productosSeleccionados}
                      columns={[
                        {
                          title: "Producto",
                          dataIndex: "nombre",
                          key: "nombre",
                          width: "35%",
                          render: (text, record) => (
                            <div>
                              <div>
                                <strong>{text}</strong>
                              </div>
                              <div
                                style={{ fontSize: "12px", color: "#8c8c8c" }}
                              >
                                {record.marca}
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
                          render: (precio) =>
                            `$${precio.toLocaleString("es-CL")}`,
                        },
                        {
                          title: "Total",
                          dataIndex: "total",
                          key: "total",
                          align: "right",
                          width: "20%",
                          render: (total) => (
                            <strong style={{ color: "#1890ff" }}>
                              ${total.toLocaleString("es-CL")}
                            </strong>
                          ),
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
                      size="small"
                      locale={{ emptyText: "No hay productos agregados" }}
                      summary={() =>
                        productosSeleccionados.length > 0 && (
                          <Table.Summary.Row
                            style={{ backgroundColor: "#fafafa" }}
                          >
                            <Table.Summary.Cell colSpan={3} align="right">
                              <strong style={{ fontSize: 16 }}>
                                Total General:
                              </strong>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell align="right">
                              <strong
                                style={{ fontSize: 18, color: "#1890ff" }}
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
              </Col>
            </Card>
          </Row>
        </Form>
      )}
    </>
  );
}
