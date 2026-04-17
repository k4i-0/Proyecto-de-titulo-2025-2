import { useState, useEffect } from "react";

import {
  Card,
  Form,
  Button,
  Typography,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  notification,
  Tag,
  Modal,
  Descriptions,
  Divider,
  Table,
} from "antd";

import DataTable from "../../components/Tabla";

import { useParams } from "react-router-dom";

//service
import {
  buscarOrdenesCompraSucursalVendedor,
  crearOrdenCompraSucursalVendedor,
} from "../../services/inventario/CompraProveedor.service";

import obtenerSucursales from "../../services/inventario/Sucursal.service";

export default function RecepcionDespachos() {
  const { rutProveedor } = useParams();

  const [ordenes, setOrdenes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [modalRecepcionAbierto, setModalRecepcionAbierto] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

  const [form] = Form.useForm();
  const [formRecepcion] = Form.useForm();

  const buscarSucursales = async () => {
    try {
      const respuesta = await obtenerSucursales();
      if (respuesta.status === 200) {
        const sucursales = Array.isArray(respuesta.data)
          ? respuesta.data
          : respuesta.data?.sucursales || [];
        setSucursales(sucursales);
        notification.success({
          message: "Éxito",
          description: "Sucursales encontradas",
        });
        return;
      }
      if (respuesta.status === 204) {
        setSucursales([]);
        notification.info({
          message: "Información",
          description: "No se encontraron sucursales",
        });
        return;
      }
      notification.error({
        message: "Error",
        description: respuesta.error || "Error al buscar las sucursales",
      });
    } catch (error) {
      console.log("Error", error);
      notification.error({
        message: "Error",
        description: "Error al buscar las sucursales",
      });
    }
  };

  const columns = [
    {
      title: "Orden",
      dataIndex: ["ordencompra", "nombreOrden"],
      key: "nombreOrden",
    },
    {
      title: "Fecha",
      dataIndex: ["ordencompra", "fechaOrden"],
      key: "fechaOrden",
      render: (fecha) => new Date(fecha).toLocaleDateString("es-CL"),
    },
    {
      title: "Estado",
      dataIndex: ["ordencompra", "estado"],
      key: "estado",
      render: (estado) => <Tag color="orange">{estado}</Tag>,
    },
    {
      title: "Tipo",
      dataIndex: ["ordencompra", "tipo"],
      key: "tipo",
    },
    {
      title: "Total",
      dataIndex: ["ordencompra", "total"],
      key: "total",
      render: (total) => `$${total.toLocaleString("es-CL")}`,
    },
    {
      title: "Sucursal",
      dataIndex: ["sucursal", "nombre"],
      key: "sucursal",
    },
    {
      title: "Solicitante",
      dataIndex: ["vendedor", "nombre"],
      key: "vendedor",
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            disabled={
              record.ordencompra.estado === "recepcionada" ||
              record.ordencompra.estado === "recibida con faltante"
            }
            onClick={() => handleRecepcionar(record)}
          >
            Recepcionar
          </Button>
          {/* <Button onClick={() => handleVerDetalle(record)}>Ver detalle</Button> */}
        </div>
      ),
    },
  ];

  const handleBuscar = async (values) => {
    try {
      const respuesta = await buscarOrdenesCompraSucursalVendedor(
        values.rutProveedor,
      );
      //console.log("Respuesta de la búsqueda:", respuesta);
      if (respuesta.status === 200) {
        const ordenesCompra = Array.isArray(respuesta.data)
          ? respuesta.data
          : respuesta.data?.ordenesCompra || [];

        setOrdenes(ordenesCompra);
        //console.log("Órdenes de compra encontradas:", ordenesCompra);
        notification.success({
          message: "Éxito",
          description: "Órdenes de compra encontradas",
        });
        return;
      }
      if (respuesta.status === 204) {
        setOrdenes([]);
        notification.info({
          message: "Información",
          description: "No se encontraron órdenes de compra para el proveedor",
        });
        return;
      }
      notification.error({
        message: "Error",
        description: respuesta.error || "Error al buscar las órdenes de compra",
      });
    } catch (error) {
      console.error("Error al buscar las órdenes de compra:", error);
      notification.error({
        message: "Error",
        description: "Error al buscar las órdenes de compra",
      });
    }
  };

  const handleVerDetalle = (record) => {
    setOrdenSeleccionada(record);
    setModalDetalleAbierto(true);
  };

  const handleCerrarDetalle = () => {
    setModalDetalleAbierto(false);
    setOrdenSeleccionada(null);
  };

  const detallesProductos =
    ordenSeleccionada?.ordencompra?.compraproveedordetalles || [];

  const cantidadItems = detallesProductos.length;

  const cantidadTotalProductos = detallesProductos.reduce(
    (acumulador, detalle) => acumulador + (Number(detalle.cantidad) || 0),
    0,
  );

  const columnasProductos = [
    {
      title: "Producto",
      dataIndex: ["producto", "nombre"],
      key: "productoNombre",
      render: (nombre) => nombre || "-",
    },
    {
      title: "Código",
      dataIndex: ["producto", "codigo"],
      key: "productoCodigo",
      render: (codigo) => codigo || "-",
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
      render: (cantidad) => Number(cantidad) || 0,
    },
  ];

  const ordenesConNombreOrden = ordenes.map((orden) => ({
    ...orden,
    nombreOrden: orden.ordencompra?.nombreOrden || "",
  }));

  const handleRecepcionar = (record) => {
    //console.log("orden seleccionada", record.sucursal.idSucursal);
    buscarSucursales();
    setOrdenSeleccionada(record);
    const detallesIniciales =
      record?.ordencompra?.compraproveedordetalles?.map((detalle) => ({
        idProducto: detalle.producto?.idProducto,
        productoNombre: detalle.producto?.nombre || "",
        productoCodigo: detalle.producto?.codigo || "",
        cantidadSolicitada: Number(detalle.cantidad) || 0,
        cantidadRecibida: Number(detalle.cantidad) || 0,
        cantidadRechazada: 0,
      })) || [];

    formRecepcion.setFieldsValue({
      tipoDocumento: undefined,
      tipoDespacho: undefined,
      numeroDocumento: "",
      repartidor: "",
      idSucursal: record?.sucursal?.idSucursal,
      observacionesRecepcion: "",
      detalles: detallesIniciales,
    });

    setModalRecepcionAbierto(true);
  };

  const handleCerrarRecepcion = () => {
    setModalRecepcionAbierto(false);
    formRecepcion.resetFields();
  };

  const handleConfirmarRecepcion = async (values) => {
    const payloadRecepcion = {
      idOrdenCompra: ordenSeleccionada?.ordencompra?.idOrdenCompra,
      idProveedor: ordenSeleccionada?.idProveedor,
      tipoDocumento: values.tipoDocumento,
      tipoDespacho: values.tipoDespacho,
      numeroDocumento: values.numeroDocumento,
      repartidor: values.repartidor,
      observaciones: values.observacionesRecepcion,
      idSucursal: ordenSeleccionada?.sucursal?.idSucursal,
      productos: (values.detalles || []).map((detalle) => ({
        idProducto: detalle.idProducto,
        productoCodigo: detalle.productoCodigo,
        cantidadSolicitada: Number(detalle.cantidadSolicitada) || 0,
        cantidadRecibida: Number(detalle.cantidadRecibida) || 0,
        cantidadRechazada: Number(detalle.cantidadRechazada) || 0,
      })),
    };

    //console.log("Payload recepción:", payloadRecepcion);
    try {
      const respuesta =
        await crearOrdenCompraSucursalVendedor(payloadRecepcion);
      if (respuesta.status === 200) {
        notification.success({
          message: "Recepción registrada",
          description: "La recepción del despacho fue preparada correctamente.",
        });
        handleCerrarRecepcion();
        return;
      }
      notification.error({
        message: "Error",
        description:
          respuesta.error || "Error al registrar la recepción del despacho",
      });
      return;
    } catch (error) {
      console.error("Error al crear la recepción del despacho:", error);
      notification.error({
        message: "Error",
        description: "Error al registrar la recepción del despacho",
      });
      return;
    }
  };
  useEffect(() => {
    if (rutProveedor) {
      console.log("Despachos:", rutProveedor);
      form.setFieldsValue({ rutProveedor: rutProveedor });
      handleBuscar({ rutProveedor: rutProveedor });
    }
  }, [rutProveedor, form]);
  return (
    <div>
      <Typography.Title level={3}>Recepción de Despachos</Typography.Title>

      <Card style={{ marginTop: 20 }}>
        <Form
          layout="inline"
          style={{ marginBottom: 20 }}
          form={form}
          onFinish={handleBuscar}
        >
          <Form.Item
            label="Rut del Proveedor"
            name="rutProveedor"
            rules={[
              {
                required: true,
                message: "Por favor ingrese el RUT del proveedor",
              },
            ]}
          >
            <Input placeholder="Ingrese el RUT del proveedor" />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Buscar
          </Button>
        </Form>
      </Card>
      {ordenes.length > 0 && (
        <DataTable
          data={ordenesConNombreOrden}
          columns={columns}
          rowKey="idOrdenCompra"
          searchableFields={["nombreOrden"]}
          showFilters={false}
          searchPlaceholder="Buscar por nombre de orden"
          onRowClick={handleVerDetalle}
        />
      )}
      {/**Modal Detalle */}
      <Modal
        title="Detalle de orden de compra"
        open={modalDetalleAbierto}
        width={700}
        onCancel={handleCerrarDetalle}
        footer={[
          <Button key="cerrar" onClick={handleCerrarDetalle}>
            Cerrar
          </Button>,
        ]}
      >
        {ordenSeleccionada && (
          <>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="ID proveedor">
                {ordenSeleccionada.idProveedor || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="ID orden compra">
                {ordenSeleccionada.ordencompra?.idOrdenCompra || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Nombre orden">
                {ordenSeleccionada.ordencompra?.nombreOrden || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="RUT solicitante">
                {ordenSeleccionada.vendedor?.rut || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Observaciones" span={2}>
                <div style={{ whiteSpace: "pre-line" }}>
                  {ordenSeleccionada.ordencompra?.observaciones || "-"}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Detalle estado" span={2}>
                {ordenSeleccionada.ordencompra?.detalleEstado || "-"}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: "16px 0" }} />

            <Typography.Text strong>
              Productos ({cantidadItems} ítems, {cantidadTotalProductos}{" "}
              unidades)
            </Typography.Text>

            <Table
              size="small"
              style={{ marginTop: 10 }}
              dataSource={detallesProductos}
              columns={columnasProductos}
              rowKey={(detalle, index) =>
                `${detalle.producto?.codigo || "sin-codigo"}-${index}`
              }
              pagination={false}
              locale={{ emptyText: "No hay productos en el detalle" }}
            />
          </>
        )}
      </Modal>
      {/**Modal Recepción */}
      <Modal
        title="Recepción de Despacho"
        open={modalRecepcionAbierto}
        width={700}
        onCancel={handleCerrarRecepcion}
        footer={[
          <Button key="cerrar" onClick={handleCerrarRecepcion}>
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
        {ordenSeleccionada && (
          <>
            <Descriptions column={3} size="small" bordered>
              <Descriptions.Item label="ID proveedor">
                {ordenSeleccionada.idProveedor || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="ID orden compra">
                {ordenSeleccionada.ordencompra?.idOrdenCompra || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Nombre orden">
                {ordenSeleccionada.ordencompra?.nombreOrden || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="RUT solicitante">
                {ordenSeleccionada.vendedor?.rut || "-"}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: "16px 0" }} />

            <Form
              id="form-recepcion"
              form={formRecepcion}
              layout="vertical"
              onFinish={handleConfirmarRecepcion}
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
                        {
                          label: "Guía de despacho",
                          value: "Guia de despacho",
                        },
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
                    rules={[
                      {
                        required: true,
                        message: "Seleccione una sucursal",
                      },
                    ]}
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

              <Form.Item label="Observaciones" name="observacionesRecepcion">
                <Input.TextArea
                  rows={3}
                  placeholder="Ingrese observaciones de la recepción"
                />
              </Form.Item>

              <Divider style={{ margin: "8px 0 16px" }} />

              <Typography.Title level={5}>
                Productos a recepcionar
              </Typography.Title>
              <Form.List name="detalles">
                {(fields) => (
                  <>
                    {fields.map((field) => {
                      const idProducto = formRecepcion.getFieldValue([
                        "detalles",
                        field.name,
                        "idProducto",
                      ]);
                      const productoNombre = formRecepcion.getFieldValue([
                        "detalles",
                        field.name,
                        "productoNombre",
                      ]);
                      const productoCodigo = formRecepcion.getFieldValue([
                        "detalles",
                        field.name,
                        "productoCodigo",
                      ]);
                      const cantidadSolicitada =
                        Number(
                          formRecepcion.getFieldValue([
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
                            {idProducto || "Producto sin nombre"}
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
                                {...field}
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
                                {...field}
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
                                          formRecepcion.getFieldValue([
                                            "detalles",
                                            field.name,
                                            "cantidadRechazada",
                                          ]),
                                        ) || 0;

                                      if (recibida < 0) {
                                        return Promise.reject(
                                          new Error("No puede ser negativa"),
                                        );
                                      }

                                      if (
                                        recibida + rechazada >
                                        cantidadSolicitada
                                      ) {
                                        return Promise.reject(
                                          new Error(
                                            "Recibida + rechazada supera la solicitada",
                                          ),
                                        );
                                      }

                                      return Promise.resolve();
                                    },
                                  },
                                ]}
                              >
                                <InputNumber
                                  min={0}
                                  style={{ width: "100%" }}
                                />
                              </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                              <Form.Item
                                {...field}
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
                                          formRecepcion.getFieldValue([
                                            "detalles",
                                            field.name,
                                            "cantidadRecibida",
                                          ]),
                                        ) || 0;

                                      if (rechazada < 0) {
                                        return Promise.reject(
                                          new Error("No puede ser negativa"),
                                        );
                                      }

                                      if (
                                        recibida + rechazada >
                                        cantidadSolicitada
                                      ) {
                                        return Promise.reject(
                                          new Error(
                                            "Recibida + rechazada supera la solicitada",
                                          ),
                                        );
                                      }

                                      return Promise.resolve();
                                    },
                                  },
                                ]}
                              >
                                <InputNumber
                                  min={0}
                                  style={{ width: "100%" }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Form.Item
                            {...field}
                            name={[field.name, "productoNombre"]}
                            hidden
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            {...field}
                            name={[field.name, "productoCodigo"]}
                            hidden
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            {...field}
                            name={[field.name, "idProducto"]}
                            hidden
                          >
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
        )}
      </Modal>
    </div>
  );
}
