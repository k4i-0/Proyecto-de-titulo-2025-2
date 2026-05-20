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
} from "antd";
import { anularOrdenCompraDirecta } from "../../../services/inventario/CompraProveedor.service";

const { Title, Text } = Typography;

export default function DetalleCompraDirecta() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const compra = state?.compra || null;
  const [modalAnularVisible, setModalAnularVisible] = useState(false);
  const [formAnular] = Form.useForm();
  const [anularLoading, setAnularLoading] = useState(false);

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
      <Card
        title={
          <Title level={3}>Detalle Compra Directa: {compra.nombreOrden}</Title>
        }
        extra={
          <Space>
            <Button danger onClick={() => setModalAnularVisible(true)}>
              Anular
            </Button>
            <Button onClick={() => navigate(-1)} type="default">
              Volver
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
                <Tag color={compra?.estado ? "blue" : "default"}>
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
              const resp = await anularOrdenCompraDirecta(compra.nombreOrden, datos);
              if (resp?.status === 200) {
                notification.success({ message: "Éxito", description: "Orden anulada correctamente." });
                setModalAnularVisible(false);
                navigate(-1);
                return;
              }
              notification.error({ message: "Error", description: resp?.error || "No se pudo anular la orden." });
            } catch (error) {
              console.error("Error al anular orden:", error);
              notification.error({ message: "Error", description: "Error de conexión al anular la orden." });
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
              <Button type="primary" danger htmlType="submit" loading={anularLoading}>
                Confirmar anulación
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
