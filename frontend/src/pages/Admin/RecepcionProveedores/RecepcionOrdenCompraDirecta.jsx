import { useState } from "react";

import {
  Row,
  Col,
  Typography,
  Form,
  Input,
  Divider,
  Button,
  Card,
  notification,
  Table,
  Tag,
  Drawer,
  Descriptions,
  DatePicker,
  Space,
  Select,
} from "antd";

const { Title, Text } = Typography;
import { EyeOutlined, InboxOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import Tabla from "../../../components/Tabla.jsx";

//importacion
import { buscarTodasOrdenesParaRecepcion } from "../../../services/inventario/CompraProveedor.service.js";

export default function RecepcionOrdenCompra() {
  const [formBusqueda] = Form.useForm();
  const [formRecepcion] = Form.useForm();

  const [ordenesCompra, setOrdenesCompra] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState(null);

  const [receptionDrawerVisible, setReceptionDrawerVisible] = useState(false);
  const [ordenARecepcionar, setOrdenARecepcionar] = useState(null);

  const handleBuscarOC = async (values) => {
    console.log("Buscar OC con valores:", values.rutProveedor);

    try {
      const response = await buscarTodasOrdenesParaRecepcion(
        values.rutProveedor
      );
      console.log("Respuesta de la búsqueda de OC:", response);
      if (response.status === 200) {
        setOrdenesCompra(response.data);
        notification.success({
          message: "Éxito",
          description: "Órdenes de compra encontradas exitosamente.",
          placement: "topLeft",
        });
        return;
      }
      if (response.status === 204) {
        setOrdenesCompra([]);
        notification.info({
          message: "Información",
          description: "No se encontraron órdenes de compra para el proveedor.",
          placement: "topLeft",
        });
        return;
      }
      notification.error({
        message: "Error",
        description:
          response.error || "Ocurrió un error al buscar las órdenes de compra.",
        placement: "topLeft",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description:
          error || "Ocurrió un error al buscar las órdenes de compra.",
        placement: "topLeft",
      });
    }
  };
  const formatearRutSinPuntos = (valor) => {
    // Eliminar todo excepto números y K
    const limpio = valor.replace(/[^0-9kK]/g, "");

    if (!limpio || limpio.length < 2) return limpio;

    // Separar cuerpo y DV
    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1).toUpperCase();

    return `${cuerpo}-${dv}`;
  };

  //funciones drawer
  const showDrawer = (record) => {
    setSelectedOrden(record);
    setDrawerVisible(true);
  };

  const onClose = () => {
    setDrawerVisible(false);
    setSelectedOrden(null);
  };

  const estadoFilters = [
    ...new Set(ordenesCompra.map((item) => item.estado)),
  ].map((e) => ({ text: e.toUpperCase(), value: e }));
  const proveedorFilters = [
    ...new Set(ordenesCompra.map((item) => item.proveedor.nombre)),
  ].map((p) => ({ text: p, value: p }));

  const columns = [
    {
      title: "ID",
      dataIndex: "idOrdenCompra",
      key: "idOrdenCompra",
      width: 80,
      align: "center",
      // Ejemplo de ordenamiento simple
      sorter: (a, b) => a.idOrdenCompra - b.idOrdenCompra,
    },
    {
      title: "Orden Compra",
      dataIndex: "nombreOrden",
      key: "nombreOrden",
      width: 150,
      // Filtro de búsqueda textual simple (opcional)
      onFilter: (value, record) => record.nombreOrden.includes(value),
    },
    {
      title: "Fecha Compra",
      dataIndex: "fechaOrden",
      key: "fechaOrden",
      width: 120,
      render: (fecha) => new Date(fecha).toLocaleDateString("es-CL"),
      sorter: (a, b) => new Date(a.fechaOrden) - new Date(b.fechaOrden),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 120,
      align: "center",

      filters: estadoFilters,
      onFilter: (value, record) => record.estado === value,
      render: (estado) => (
        <Tag color={estado === "aprobada" ? "green" : "orange"}>
          {estado.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      width: 120,
      align: "right",
      render: (total) => `$${total.toLocaleString("es-CL")}`,
    },
    {
      title: "Proveedor",
      dataIndex: ["proveedor", "nombre"],
      key: "proveedor",
      width: 180,

      filters: proveedorFilters,
      onFilter: (value, record) => record.proveedor.nombre === value,
      render: (_, record) => (
        <div>
          <div>{record.proveedor.nombre}</div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {record.proveedor.rut}
          </div>
        </div>
      ),
    },
    {
      title: "Funcionario",
      dataIndex: ["funcionario", "nombre"],
      key: "funcionario",
      width: 150,
    },
    {
      title: "Sucursal",
      dataIndex: ["sucursal", "nombre"],
      key: "sucursal",
      width: 150,
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 100,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showDrawer(record)}
          >
            Ver
          </Button>

          {/* Botón que abre el formulario de Recepción */}
          <Button
            type="link"
            size="small"
            icon={<InboxOutlined />}
            style={{
              color: record.estado === "recibida" ? undefined : "#52c41a",
            }}
            disabled={record.estado === "recibida"}
            onClick={() => showReceptionDrawer(record)}
          >
            Recepcionar
          </Button>
        </div>
      ),
    },
  ];

  const detalleColumns = [
    {
      title: "Producto",
      dataIndex: ["producto", "nombre"],
      key: "producto",
      onFilter: (value, record) => record.producto.nombre.includes(value),
    },
    { title: "Cant.", dataIndex: "cantidad", key: "cant", align: "center" },
    {
      title: "Precio Unit.",
      dataIndex: "precioUnitario",
      key: "pu",
      align: "right",
      render: (val) => `$${val.toLocaleString("es-CL")}`,
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      key: "subt",
      align: "right",
      render: (val) => (
        <span style={{ fontWeight: "bold" }}>
          ${val.toLocaleString("es-CL")}
        </span>
      ),
    },
  ];

  //funciones drawer confirmacion recepcion
  const showReceptionDrawer = (record) => {
    setOrdenARecepcionar(record);
    setReceptionDrawerVisible(true);

    formRecepcion.setFieldsValue({
      fechaRecepcion: dayjs(), // Fecha actual
      tipoDocumento: "guia", // Valor por defecto
    });
  };

  const onCloseReception = () => {
    setReceptionDrawerVisible(false);
    setOrdenARecepcionar(null);
    formRecepcion.resetFields();
  };

  const onFinishRecepcion = (values) => {
    console.log("Datos del Formulario:", values);
    console.log("ID de la Orden:", ordenARecepcionar.idCompraProveedor);

    // --- AQUÍ HACES TU LLAMADA AL BACKEND ---
    // axios.post('/api/recepcionar', { id: ordenARecepcionar.idCompraProveedor, ...values })

    notification.success({
      message: "Exito",
      description: `Orden ${ordenARecepcionar.nombreOrden} recepcionada con éxito`,
      placement: "topLeft",
    });
    onCloseReception();

    // Recuerda actualizar tu tabla o recargar los datos aquí
  };
  return (
    <>
      <Row>
        <Col>
          <Title level={4}>Recepción de Órdenes de Compra a Proveedores</Title>
          <Text>Recepcionar Cualquier orden de compra con su OC</Text>
        </Col>
      </Row>
      <Divider />

      <Form
        form={formBusqueda}
        onFinish={handleBuscarOC}
        layout="inline"
        style={{
          width: "100%",
          textAlign: "center",
          alignItems: "center",
        }}
      >
        {/* <Form.Item
          label="Orden de Compra"
          name="idCompraProveedor"
          //   rules={[{ required: true, message: "Ingrese el número de OC" }]}
          style={{ marginBottom: 0 }}
        >
          <Input placeholder="Ingrese el número de OC" />
        </Form.Item> */}

        <Form.Item
          label="Rut Proveedor"
          name="rutProveedor"
          style={{ marginBottom: 0 }}
          normalize={(value) => {
            if (!value) return value;
            return formatearRutSinPuntos(value);
          }}
          rules={[{ required: true, message: "Ingrese un rut" }]}
        >
          <Input maxLength={10} placeholder="Ingrese Rut Proveedor" />
        </Form.Item>

        {/* <Form.Item
          label="Rut Solicitante"
          name="rut"
          style={{ marginBottom: 0 }}
          normalize={(value) => {
            if (!value) return value;
            return formatearRutSinPuntos(value);
          }}
        >
          <Input maxLength={10} min={9} placeholder="Ingrese Rut Solicitante" />
        </Form.Item> */}

        <Button type="primary" htmlType="submit">
          Buscar
        </Button>
      </Form>
      {ordenesCompra != null && ordenesCompra.length > 0 && (
        <>
          <Tabla
            columns={columns}
            data={ordenesCompra}
            rowKey="idOrdenCompra"
          />
        </>
      )}

      {/**Drawer Detalle */}
      <Drawer
        title={`Detalle Orden: ${selectedOrden?.nombreOrden || ""}`}
        placement="right"
        width={600}
        onClose={onClose}
        open={drawerVisible}
      >
        {selectedOrden && (
          <>
            <Descriptions
              title="Información General"
              column={2}
              bordered
              size="small"
            >
              <Descriptions.Item label="Fecha">
                {new Date(selectedOrden.fechaCompra).toLocaleDateString(
                  "es-CL"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag>{selectedOrden.estado.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Proveedor">
                {selectedOrden.proveedor.nombre}
              </Descriptions.Item>
              <Descriptions.Item label="RUT">
                {selectedOrden.proveedor.rut}
              </Descriptions.Item>
              <Descriptions.Item label="Sucursal">
                {selectedOrden.sucursal.nombre}
              </Descriptions.Item>
              <Descriptions.Item label="Solicitante">
                {selectedOrden.funcionario.nombre}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Productos</Divider>

            <Table
              columns={detalleColumns}
              dataSource={selectedOrden.compraproveedordetalles}
              rowKey="idCompraProveedorDetalle"
              pagination={false}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3} align="right">
                    Total Final
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Tag color="blue" style={{ fontSize: "14px" }}>
                      ${selectedOrden.total.toLocaleString("es-CL")}
                    </Tag>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </>
        )}
      </Drawer>
      {/**Drawer Confirmacion Recepcion despacho */}

      <Drawer
        title={`Recepcionar: ${ordenARecepcionar?.nombreOrden || ""}`}
        width={450}
        onClose={onCloseReception}
        open={receptionDrawerVisible}
        // Agregamos un footer con los botones de acción para mejor UX
        footer={
          <div style={{ textAlign: "right" }}>
            <Button onClick={onCloseReception} style={{ marginRight: 8 }}>
              Cancelar
            </Button>
            <Button
              type="primary"
              onClick={() => formRecepcion.submit()}
              icon={<SaveOutlined />}
            >
              Confirmar Recepción
            </Button>
          </div>
        }
      >
        <Form
          form={formRecepcion}
          layout="vertical"
          onFinish={onFinishRecepcion}
          autoComplete="off"
        >
          {/* Fila informativa (no editable) */}
          <Descriptions column={1} size="small" style={{ marginBottom: 20 }}>
            <Descriptions.Item label="Proveedor">
              {ordenARecepcionar?.proveedor?.nombre}
            </Descriptions.Item>
          </Descriptions>

          {/* 1. Fecha de Recepción (Visualizar, no editar) */}
          <Form.Item
            name="fechaRecepcion"
            label="Fecha de Recepción"
            rules={[{ required: true }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY HH:mm"
              disabled
            />
          </Form.Item>

          {/* 2. Tipo de Documento */}
          <Form.Item
            name="tipoDocumento"
            label="Tipo de Documento Recibido"
            rules={[
              { required: true, message: "Seleccione el tipo de documento" },
            ]}
          >
            <Select placeholder="Seleccione documento">
              <Select.Option value="guia">Guía de Despacho</Select.Option>
              <Select.Option value="factura">Factura</Select.Option>
              <Select.Option value="boleta">Boleta</Select.Option>
              <Select.Option value="otro">Otro</Select.Option>
            </Select>
          </Form.Item>

          {/**  */}

          {/* Extra: Número de documento (Suele ser necesario) */}
          <Form.Item
            name="numeroDocumento"
            label="Número de Documento (Folio)"
            rules={[
              {
                required: false,
                message: "Ingrese el número del documento físico",
              },
            ]}
          >
            <Input placeholder="Ej: 123456" />
          </Form.Item>

          {/* 3. Repartidor */}
          <Form.Item
            name="repartidor"
            label="Nombre del Repartidor"
            rules={[
              { required: true, message: "Ingrese quien entregó la carga" },
            ]}
          >
            <Input
              prefix={<InboxOutlined />}
              placeholder="Nombre persona / Transporte"
            />
          </Form.Item>

          {/* 4. Observaciones */}
          <Form.Item name="observaciones" label="Observaciones Adicionales">
            <Input.TextArea
              rows={4}
              placeholder="Ej: Cajas llegaron un poco dañadas, falta 1 unidad..."
            />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
}
