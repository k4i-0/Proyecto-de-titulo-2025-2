import React from "react";
import {
  Modal,
  Descriptions,
  Divider,
  Form,
  Typography,
  Spin,
  Row,
  Col,
  Select,
  Input,
  InputNumber,
  Card,
  Button,
} from "antd";

export default function ModalRecepcionDespachos({
  open,
  onCancel,
  ordenSeleccionada,
  sucursales = [],
  bodegas = [],
  form,
  onFinish,
  loading = false,
}) {
  if (!ordenSeleccionada) return null;
  console.log("Modal recepcionar Orden", ordenSeleccionada);
  return (
    <Modal
      title="Recepción de Despacho"
      open={open}
      width={700}
      onCancel={onCancel}
      footer={[
        <Button key="cerrar" onClick={onCancel}>
          Cerrar
        </Button>,
        <Button
          key="recepcionar"
          type="primary"
          htmlType="submit"
          form="form-recepcion"
        >
          Recepcionar
        </Button>,
      ]}
    >
      <Spin spinning={loading} fullscreen />
      <>
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="Proveedor">
            {ordenSeleccionada.proveedor?.nombre || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="RUT proveedor">
            {ordenSeleccionada.proveedor?.rut || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Nombre orden">
            {ordenSeleccionada.ordencompra?.nombreOrden || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="ID orden compra">
            {ordenSeleccionada.ordencompra?.idOrdenCompra || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Solicitante">
            {ordenSeleccionada.vendedor?.nombre || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="RUT solicitante">
            {ordenSeleccionada.vendedor?.rut || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Sucursal" span={2}>
            {ordenSeleccionada.sucursal?.nombre || "-"}
          </Descriptions.Item>
        </Descriptions>

        <Divider style={{ margin: "16px 0" }} />

        <Form
          id="form-recepcion"
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Typography.Title level={5}>Datos del despacho</Typography.Title>
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Tipo de documento"
                name="tipoDocumento"
                rules={[{ required: true, message: "Seleccione un tipo" }]}
              >
                <Select
                  placeholder="Seleccione tipo de documento"
                  options={[
                    { label: "Guía de despacho", value: "Guia de despacho" },
                    { label: "Factura", value: "Factura" },
                    { label: "Boleta", value: "Boleta" },
                    { label: "Otro", value: "Otro" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Número de documento"
                name="numeroDocumento"
                rules={[
                  {
                    required: true,
                    message: "Ingrese el número de documento",
                  },
                ]}
              >
                <Input placeholder="Ej: 00012345" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Sucursal"
                name="idSucursal"
                initialValue={ordenSeleccionada.sucursal?.idSucursal}
                rules={[{ required: true, message: "Seleccione una sucursal" }]}
              >
                <Select placeholder="Seleccione sucursal">
                  {sucursales.map((sucursal) => (
                    <Select.Option
                      key={sucursal.idSucursal}
                      value={sucursal.idSucursal}
                    >
                      {sucursal.idSucursal} - {sucursal.nombre}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Repartidor"
                name="repartidor"
                rules={[
                  {
                    required: true,
                    message: "Ingrese el nombre del repartidor",
                  },
                ]}
              >
                <Input placeholder="Nombre del repartidor" />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Item label="Bodega de destino" name="idBodega">
                <Select
                  placeholder="Seleccione bodega de destino"
                  disabled={bodegas.length === 0}
                >
                  {bodegas.map((bodega) => (
                    <Select.Option
                      key={bodega.idBodega}
                      value={bodega.idBodega}
                    >
                      {bodega.nombre} - {bodega.capacidad} unidades
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Observaciones" name="observacionesRecepcion">
            <Input.TextArea
              rows={3}
              placeholder="Ingrese observaciones de la recepción"
            />
          </Form.Item>

          <Divider style={{ margin: "8px 0 16px" }} />

          <Typography.Title level={5}>Productos a recepcionar</Typography.Title>
          <Form.List name="detalles">
            {(fields) => (
              <>
                {fields.map((field) => {
                  const idProducto = form.getFieldValue([
                    "detalles",
                    field.name,
                    "idProducto",
                  ]);
                  const productoNombre = form.getFieldValue([
                    "detalles",
                    field.name,
                    "productoNombre",
                  ]);
                  const productoCodigo = form.getFieldValue([
                    "detalles",
                    field.name,
                    "productoCodigo",
                  ]);
                  const cantidadSolicitada =
                    Number(
                      form.getFieldValue([
                        "detalles",
                        field.name,
                        "cantidadSolicitada",
                      ]),
                    ) || 0;

                  return (
                    <Card
                      key={field.key}
                      size="small"
                      style={{ marginBottom: 12, background: "#fafafa" }}
                    >
                      <Typography.Text strong>
                        {idProducto || "-"}
                      </Typography.Text>
                      <Typography.Text strong>
                        {productoNombre || "Producto sin nombre"}
                      </Typography.Text>
                      <Typography.Text
                        type="secondary"
                        style={{ display: "block", marginBottom: 8 }}
                      >
                        Código: {productoCodigo || "-"}
                      </Typography.Text>

                      <Row gutter={12}>
                        <Col xs={24} md={8}>
                          <Form.Item
                            label="Cantidad solicitada"
                            name={[field.name, "cantidadSolicitada"]}
                          >
                            <InputNumber
                              disabled
                              min={0}
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item
                            label="Cantidad recibida"
                            name={[field.name, "cantidadRecibida"]}
                            rules={[
                              {
                                required: true,
                                message: "Ingrese cantidad recibida",
                              },
                              {
                                validator: (_, value) => {
                                  const recibida = Number(value) || 0;
                                  const rechazada =
                                    Number(
                                      form.getFieldValue([
                                        "detalles",
                                        field.name,
                                        "cantidadRechazada",
                                      ]),
                                    ) || 0;

                                  if (recibida < 0)
                                    return Promise.reject(
                                      new Error("No puede ser negativa"),
                                    );
                                  if (recibida + rechazada > cantidadSolicitada)
                                    return Promise.reject(
                                      new Error(
                                        "Recibida + rechazada supera la solicitada",
                                      ),
                                    );
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <InputNumber min={0} style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item
                            label="Cantidad rechazada"
                            name={[field.name, "cantidadRechazada"]}
                            rules={[
                              {
                                required: true,
                                message: "Ingrese cantidad rechazada",
                              },
                              {
                                validator: (_, value) => {
                                  const rechazada = Number(value) || 0;
                                  const recibida =
                                    Number(
                                      form.getFieldValue([
                                        "detalles",
                                        field.name,
                                        "cantidadRecibida",
                                      ]),
                                    ) || 0;

                                  if (rechazada < 0)
                                    return Promise.reject(
                                      new Error("No puede ser negativa"),
                                    );
                                  if (recibida + rechazada > cantidadSolicitada)
                                    return Promise.reject(
                                      new Error(
                                        "Recibida + rechazada supera la solicitada",
                                      ),
                                    );
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <InputNumber min={0} style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item name={[field.name, "productoNombre"]} hidden>
                        <Input />
                      </Form.Item>
                      <Form.Item name={[field.name, "productoCodigo"]} hidden>
                        <Input />
                      </Form.Item>
                      <Form.Item name={[field.name, "idProducto"]} hidden>
                        <Input />
                      </Form.Item>
                    </Card>
                  );
                })}
              </>
            )}
          </Form.List>
        </Form>
      </>
    </Modal>
  );
}
