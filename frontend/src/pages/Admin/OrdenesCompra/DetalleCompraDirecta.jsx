import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Typography,
  Divider,
  Row,
  Col,
  Table,
  Button,
  Empty,
  Tag,
  notification,
  Modal,
  Form,
  Input,
  Space,
  Select,
  InputNumber,
  DatePicker,
  Spin,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import {
  anularOrdenCompraDirecta,
  editarOrdenCompraProveedor,
  recepcionarOrdenCompraDirecta,
} from "../../../services/inventario/CompraProveedor.service";

const { Title, Text } = Typography;

export default function DetalleCompraDirecta() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const compraInicial = state?.compra || null;
  const [compra, setCompra] = useState(compraInicial);
  const [modalAnularVisible, setModalAnularVisible] = useState(false);
  const [modalRecepcionarVisible, setModalRecepcionarVisible] = useState(false);
  const [drawerEditarOCVisible, setDrawerEditarOCVisible] = useState(false);
  const [formAnular] = Form.useForm();
  const [formRecepcionar] = Form.useForm();
  const [formEditar] = Form.useForm();
  const [anularLoading, setAnularLoading] = useState(false);
  const [recepcionarLoading, setRecepcionarLoading] = useState(false);
  const [editarLoading, setEditarLoading] = useState(false);
  const [productosRecepcionar, setProductosRecepcionar] = useState([]);
  const [productosEditables, setProductosEditables] = useState([]);

  if (!compra) {
    notification.error({
      message: "Detalle no disponible",
      description: "No se recibieron los datos de la compra directa.",
    });
    // navegar hacia atrás si no hay datos
    navigate(-1);
    return null;
  }

  const productos = compra?.compraproveedordetalles || [];

  const abrirRecepcion = () => {
    const prods = (compra.compraproveedordetalles || []).map((detalle) => ({
      idProducto: detalle.producto?.idProducto,
      nombreProducto: detalle.producto?.nombre,
      cantidad: detalle.cantidad,
      cantidadRecibida: detalle.cantidad,
      cantidadRechazada: 0,
      fechaVencimiento: null,
      observaciones: "",
    }));

    setProductosRecepcionar(prods);
    formRecepcionar.resetFields();
    setModalRecepcionarVisible(true);
  };

  const getEstadoColor = (estado) => {
    const colores = {
      aprobada: "green",
      "pendiente recibir": "orange",
      rechazada: "red",
      fallo: "red",
    };
    return colores[estado] || "default";
  };

  const abrirEdicion = () => {
    const prods = (compra.compraproveedordetalles || []).map((detalle) => ({
      ...detalle,
      producto: detalle.producto || {},
      total:
        Number(detalle.cantidad || 0) * Number(detalle.precioUnitario || 0),
    }));

    setProductosEditables(prods);
    formEditar.setFieldsValue({
      observaciones: compra.observaciones || "",
    });
    setDrawerEditarOCVisible(true);
  };

  const handleCantidadChange = (index, nuevaCantidad) => {
    const nuevosProductos = [...productosEditables];
    nuevosProductos[index].cantidad = nuevaCantidad;
    nuevosProductos[index].total =
      nuevaCantidad * nuevosProductos[index].precioUnitario;
    setProductosEditables(nuevosProductos);
  };

  const handlePrecioChange = (index, nuevoPrecio) => {
    const nuevosProductos = [...productosEditables];
    nuevosProductos[index].precioUnitario = nuevoPrecio;
    nuevosProductos[index].total =
      nuevosProductos[index].cantidad * nuevoPrecio;
    setProductosEditables(nuevosProductos);
  };

  const handleGuardarEdicion = async (values) => {
    try {
      setEditarLoading(true);
      const datosActualizar = {
        productos: productosEditables,
        observaciones: values.observaciones,
      };

      const response = await editarOrdenCompraProveedor(
        compra.nombreOrden,
        datosActualizar,
      );

      if (response.status === 200) {
        const compraRespuesta = response.data?.data || response.data || {};
        const compraActualizada = {
          ...compra,
          ...compraRespuesta,
          compraproveedordetalles:
            compraRespuesta.compraproveedordetalles || productosEditables,
          observaciones: values.observaciones,
          total:
            compraRespuesta.total ??
            productosEditables.reduce(
              (sum, item) =>
                sum +
                Number(item.cantidad || 0) * Number(item.precioUnitario || 0),
              0,
            ),
        };

        setCompra(compraActualizada);
        notification.success({
          message: "Éxito",
          description: "Orden de compra directa actualizada correctamente.",
          placement: "topLeft",
        });
        setDrawerEditarOCVisible(false);
        setProductosEditables([]);
        formEditar.resetFields();
        return;
      }

      notification.error({
        message: "Error",
        description:
          response?.error || "No se pudo editar la orden de compra directa.",
        placement: "topLeft",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description:
          error.message || "No se pudo editar la orden de compra directa.",
        placement: "topLeft",
      });
    } finally {
      setEditarLoading(false);
    }
  };

  const columnasEdicion = [
    {
      title: "Producto",
      dataIndex: ["producto", "nombre"],
      key: "nombre",
      width: 160,
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
      align: "center",
      width: 100,
      render: (cantidad, _, index) => (
        <InputNumber
          min={1}
          max={1000}
          value={cantidad}
          onChange={(value) => handleCantidadChange(index, value)}
        />
      ),
    },
    {
      title: "Precio Unitario",
      dataIndex: "precioUnitario",
      key: "precioUnitario",
      align: "center",
      width: "auto",
      render: (precio, _, index) => (
        <InputNumber
          min={0}
          max={9999999}
          value={precio}
          formatter={(value) =>
            `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
          }
          parser={(value) => value.replace(/\$\s?|\./g, "")}
          onChange={(value) => handlePrecioChange(index, value)}
        />
      ),
    },
    {
      title: "Total",
      key: "total",
      align: "right",
      width: 100,
      render: (_, record) => {
        const total =
          Number(record.cantidad || 0) * Number(record.precioUnitario || 0);
        return `$${total.toLocaleString("es-CL")}`;
      },
    },
  ];

  const handleCantidadRecibidaChange = (index, value) => {
    const nuevos = [...productosRecepcionar];
    nuevos[index].cantidadRecibida = value;
    setProductosRecepcionar(nuevos);
  };

  const handleCantidadRechazadaChange = (index, value) => {
    const nuevos = [...productosRecepcionar];
    nuevos[index].cantidadRechazada = value;
    setProductosRecepcionar(nuevos);
  };

  const handleFechaVencimientoChange = (index, date) => {
    const nuevos = [...productosRecepcionar];
    nuevos[index].fechaVencimiento = date ? date.toISOString() : null;
    setProductosRecepcionar(nuevos);
  };

  const handleObservacionProductoChange = (index, value) => {
    const nuevos = [...productosRecepcionar];
    nuevos[index].observaciones = value;
    setProductosRecepcionar(nuevos);
  };

  const handleConfirmarRecepcion = async () => {
    try {
      const values = formRecepcionar.getFieldsValue();
      if (!values.tipoDocumento) {
        notification.error({
          message: "Error",
          description: "Seleccione el tipo de documento.",
          placement: "topLeft",
        });
        return;
      }

      if (values.numeroDocumento && !/^\d+$/.test(values.numeroDocumento)) {
        notification.error({
          message: "Error",
          description: "El número de documento debe contener solo dígitos.",
          placement: "topLeft",
        });
        return;
      }

      const payload = {
        tipoDocumento: values.tipoDocumento,
        numeroDocumento: values.numeroDocumento || null,
        repartidor: values.repartidor || null,
        observaciones: values.observacionesDespacho || null,
        productos: productosRecepcionar,
      };

      setRecepcionarLoading(true);
      const response = await recepcionarOrdenCompraDirecta(
        compra.nombreOrden,
        payload,
      );

      if (response.status === 200) {
        notification.success({
          message: "Éxito",
          description: "Orden recepcionada correctamente.",
          placement: "topLeft",
        });
        setModalRecepcionarVisible(false);
        setProductosRecepcionar([]);
        formRecepcionar.resetFields();
        navigate(-1);
        return;
      }

      notification.error({
        message: "Error",
        description: response?.error || "No se pudo recepcionar la orden.",
        placement: "topLeft",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message || "Error al recepcionar la orden.",
        placement: "topLeft",
      });
    } finally {
      setRecepcionarLoading(false);
    }
  };

  const columnasRecepcion = [
    {
      title: "Producto",
      dataIndex: "nombreProducto",
      key: "nombreProducto",
      width: 180,
    },
    {
      title: "Cant. OC",
      dataIndex: "cantidad",
      key: "cantidad",
      align: "center",
      width: 90,
    },
    {
      title: "Cant. Recibida",
      key: "cantidadRecibida",
      align: "center",
      width: 130,
      render: (_, __, index) => (
        <InputNumber
          min={0}
          value={productosRecepcionar[index]?.cantidadRecibida}
          onChange={(value) => handleCantidadRecibidaChange(index, value)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Cant. Rechazada",
      key: "cantidadRechazada",
      align: "center",
      width: 130,
      render: (_, __, index) => (
        <InputNumber
          min={0}
          value={productosRecepcionar[index]?.cantidadRechazada}
          onChange={(value) => handleCantidadRechazadaChange(index, value)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Fecha Vencimiento",
      key: "fechaVencimiento",
      align: "center",
      width: 160,
      render: (_, __, index) => (
        <DatePicker
          style={{ width: "100%" }}
          placeholder="Opcional"
          onChange={(date) => handleFechaVencimientoChange(index, date)}
        />
      ),
    },
    {
      title: "Observaciones",
      key: "observaciones",
      width: 180,
      render: (_, __, index) => (
        <Input
          placeholder="Opcional"
          value={productosRecepcionar[index]?.observaciones}
          onChange={(event) =>
            handleObservacionProductoChange(index, event.target.value)
          }
        />
      ),
    },
  ];

  const columns = [
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
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
      align: "center",
    },
    {
      title: "Precio Unit.",
      dataIndex: "precioUnitario",
      key: "precioUnitario",
      align: "right",
      render: (v) => (v ? `$${Number(v).toLocaleString("es-CL")}` : "-"),
    },
    {
      title: "Subtotal",
      key: "subtotal",
      align: "right",
      render: (_, row) => {
        const p = Number(row.precioUnitario || 0) * Number(row.cantidad || 0);
        return `$${p.toLocaleString("es-CL")}`;
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Spin
        spinning={recepcionarLoading || anularLoading || editarLoading}
        fullscreen
      />
      <Button onClick={() => navigate(-1)} type="default">
        Volver
      </Button>
      <Card
        title={
          <div style={{ minWidth: 0, flex: 1 }}>
            <Title
              level={3}
              style={{ marginBottom: 0, whiteSpace: "nowrap" }}
              ellipsis
            >
              Detalle Compra Directa: {compra.nombreOrden}
            </Title>
          </div>
        }
        extra={
          <Space style={{ display: "flex", flexWrap: "wrap", gap: 8 }} size={8}>
            <Button
              type="primary"
              onClick={abrirRecepcion}
              disabled={
                !["pendiente recibir", "aceptada con modificaciones"].includes(
                  compra.estado,
                )
              }
            >
              Recepcionar
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={abrirEdicion}
              disabled={["anulada", "recepcionado"].includes(compra.estado)}
            >
              Editar
            </Button>
            <Button
              danger
              disabled={["anulada", "recepcionado"].includes(compra.estado)}
              onClick={() => setModalAnularVisible(true)}
            >
              Anular
            </Button>
          </Space>
        }
        style={{ maxWidth: 1100, margin: "0 auto" }}
      >
        <Title level={5} style={{ marginTop: 0 }}>
          Datos generales
        </Title>
        <Row>
          <Col span={24}>
            <Descriptions bordered column={3} size="small">
              <Descriptions.Item label="N° Orden" span={2}>
                {compra?.nombreOrden || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag color={getEstadoColor(compra?.estado)}>
                  {compra?.estado || "-"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Fecha">
                {compra?.fechaOrden
                  ? new Date(compra.fechaOrden).toLocaleDateString("es-CL")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Tipo">
                {compra?.tipo || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Total">
                <Text strong style={{ color: "#52c41a" }}>
                  ${compra?.total?.toLocaleString("es-CL") || 0}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Sucursal">
                {compra?.creaOrdenCompra?.sucursal?.nombre || "-"}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        <Divider />

        <Title level={5}>Proveedor</Title>
        <Row>
          <Col span={24}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Nombre">
                {compra?.creaOrdenCompra?.proveedor?.nombre || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="RUT">
                {compra?.creaOrdenCompra?.proveedor?.rut || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {compra?.creaOrdenCompra?.proveedor?.email || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Teléfono">
                {compra?.creaOrdenCompra?.proveedor?.telefono || "-"}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        <Divider />

        <Title level={5}>Productos</Title>
        {productos.length > 0 ? (
          <Table
            dataSource={productos}
            columns={columns}
            rowKey={(r) =>
              r.idCompraProveedorDetalle || r.key || JSON.stringify(r)
            }
            pagination={false}
            bordered
          />
        ) : (
          <Empty description="No hay productos en esta compra" />
        )}
      </Card>
      {/**Modal Anular */}
      <Modal
        title={<strong>Anular orden de compra</strong>}
        open={modalAnularVisible}
        onCancel={() => {
          setModalAnularVisible(false);
          formAnular.resetFields();
        }}
        footer={null}
      >
        <Form
          form={formAnular}
          layout="vertical"
          onFinish={async (values) => {
            const datos = values || {};
            if (datos.observaciones === undefined) datos.observaciones = "";
            try {
              setAnularLoading(true);
              const resp = await anularOrdenCompraDirecta(
                compra.nombreOrden,
                datos,
              );
              if (resp?.status === 200) {
                notification.success({
                  message: "Éxito",
                  description: "Orden anulada correctamente.",
                });
                setModalAnularVisible(false);
                navigate(-1);
                return;
              }
              notification.error({
                message: "Error",
                description: resp?.error || "No se pudo anular la orden.",
              });
            } catch (error) {
              console.error("Error al anular orden:", error);
              notification.error({
                message: "Error",
                description: "Error de conexión al anular la orden.",
              });
            } finally {
              setAnularLoading(false);
            }
          }}
        >
          <Form.Item name="observaciones" label="Observaciones (opcional)">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Space style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setModalAnularVisible(false);
                  formAnular.resetFields();
                }}
              >
                Cancelar
              </Button>
              <Button
                type="primary"
                danger
                htmlType="submit"
                loading={anularLoading}
              >
                Confirmar anulación
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      {/**Modal Recepcionar */}
      <Modal
        title={<strong>Recepcionar orden de compra directa</strong>}
        open={modalRecepcionarVisible}
        onCancel={() => {
          setModalRecepcionarVisible(false);
          formRecepcionar.resetFields();
          setProductosRecepcionar([]);
        }}
        width="min(95vw, 1050px)"
        footer={[
          <Button
            key="cancelar-recepcion"
            onClick={() => {
              setModalRecepcionarVisible(false);
              formRecepcionar.resetFields();
              setProductosRecepcionar([]);
            }}
          >
            Cancelar
          </Button>,
          <Button
            key="confirmar-recepcion"
            type="primary"
            loading={recepcionarLoading}
            onClick={handleConfirmarRecepcion}
          >
            Confirmar recepción
          </Button>,
        ]}
        destroyOnClose
      >
        <Form form={formRecepcionar} layout="vertical">
          <Divider orientation="left">Datos del documento de recepción</Divider>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={6}>
              <Form.Item
                label="Tipo de Documento"
                name="tipoDocumento"
                rules={[{ required: true, message: "Seleccione el tipo" }]}
              >
                <Select placeholder="Seleccione">
                  <Select.Option value="Factura">Factura</Select.Option>
                  <Select.Option value="Guia de despacho">
                    Guía de Despacho
                  </Select.Option>
                  <Select.Option value="Boleta">Boleta</Select.Option>
                  <Select.Option value="Otro">Otro</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="Número de Documento"
                name="numeroDocumento"
                rules={[
                  {
                    pattern: /^\d+$/,
                    message: "Solo se permiten dígitos",
                  },
                ]}
              >
                <Input placeholder="Ej: 123456" maxLength={20} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Nombre Repartidor" name="repartidor">
                <Input placeholder="Nombre del repartidor" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Observaciones" name="observacionesDespacho">
                <Input.TextArea
                  rows={1}
                  placeholder="Observaciones generales"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Detalle de la recepción</Divider>
          <Table
            dataSource={productosRecepcionar}
            rowKey="idProducto"
            pagination={false}
            bordered
            size="small"
            scroll={{ x: 900 }}
            columns={columnasRecepcion}
            summary={() => {
              const totalRecibido = productosRecepcionar.reduce(
                (sum, producto) =>
                  sum + (Number(producto.cantidadRecibida) || 0),
                0,
              );
              const totalRechazado = productosRecepcionar.reduce(
                (sum, producto) =>
                  sum + (Number(producto.cantidadRechazada) || 0),
                0,
              );

              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell>
                      <strong>Totales</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell />
                    <Table.Summary.Cell align="center">
                      <strong style={{ color: "#52c41a" }}>
                        {totalRecibido}
                      </strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="center">
                      <strong style={{ color: "#ff4d4f" }}>
                        {totalRechazado}
                      </strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell colSpan={2} />
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </Form>
      </Modal>
      {/**Modal Edición */}
      <Modal
        title="Editar Orden de Compra Directa"
        open={drawerEditarOCVisible}
        onCancel={() => {
          setDrawerEditarOCVisible(false);
          setProductosEditables([]);
          formEditar.resetFields();
        }}
        width="min(95vw, 850px)"
        destroyOnClose
        footer={
          <div style={{ textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setDrawerEditarOCVisible(false);
                  setProductosEditables([]);
                  formEditar.resetFields();
                }}
              >
                Cancelar
              </Button>
              <Button
                type="primary"
                onClick={() => formEditar.submit()}
                loading={editarLoading}
              >
                Guardar Cambios
              </Button>
            </Space>
          </div>
        }
      >
        {compra && (
          <Form
            form={formEditar}
            layout="vertical"
            onFinish={handleGuardarEdicion}
          >
            <Descriptions
              title="Información General"
              bordered
              column={2}
              size="small"
            >
              <Descriptions.Item label="Nombre Orden">
                {compra.nombreOrden}
              </Descriptions.Item>

              <Descriptions.Item label="Fecha Compra">
                {new Date(
                  compra.fechaCompra || compra.fechaOrden,
                ).toLocaleString("es-CL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Descriptions.Item>

              <Descriptions.Item label="Estado">
                <Tag color={getEstadoColor(compra.estado)}>
                  {String(compra.estado || "-").toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions
              title="Proveedor y Sucursal"
              bordered
              column={2}
              size="small"
            >
              <Descriptions.Item label="Proveedor">
                {compra.creaOrdenCompra?.proveedor?.nombre || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="RUT Proveedor">
                {compra.creaOrdenCompra?.proveedor?.rut || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Sucursal">
                {compra.creaOrdenCompra?.sucursal?.nombre || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Dirección">
                {compra.creaOrdenCompra?.sucursal?.direccion || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Funcionario">
                {compra.creaOrdenCompra?.vendedor?.nombre || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="RUT Funcionario">
                {compra.creaOrdenCompra?.vendedor?.rut || "-"}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Form.Item
              label="Observaciones"
              name="observaciones"
              initialValue={compra.observaciones}
            >
              <Input.TextArea
                rows={4}
                placeholder="Observaciones de la orden"
              />
            </Form.Item>

            <Divider>Detalle de Productos</Divider>

            <Table
              columns={columnasEdicion}
              dataSource={productosEditables}
              pagination={false}
              rowKey="idCompraProveedorDetalle"
              size="small"
              scroll={{ x: 800 }}
              expandable={{
                expandedRowRender: (record) => (
                  <div
                    style={{ padding: "8px 16px", backgroundColor: "#fafafa" }}
                  >
                    <strong>Marca:</strong> {record.producto?.marca || "-"}
                    <br />
                    <strong>Descripción:</strong>{" "}
                    {record.producto?.descripcion || "-"}
                  </div>
                ),
              }}
              summary={() => {
                const totalGeneral = productosEditables.reduce(
                  (sum, item) =>
                    sum +
                    Number(item.cantidad || 0) *
                      Number(item.precioUnitario || 0),
                  0,
                );
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell align="right" colSpan={4}>
                        <strong>Total General:</strong>
                        <strong
                          style={{
                            fontSize: "16px",
                            color: "#1890ff",
                            marginLeft: 8,
                          }}
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
      </Modal>
    </div>
  );
}
