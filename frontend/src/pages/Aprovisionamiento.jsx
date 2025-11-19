import React, { useState } from "react";

import {
  Row,
  Col,
  Form,
  Input,
  Button,
  message,
  Card,
  Select,
  Typography,
} from "antd";

const { Title } = Typography;

function ComprasProveedor({ visible, cerrarModal }) {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Form values:", values);
    message.success("Compra registrada exitosamente");
    cerrarModal(false);
    form.resetFields();
  };

  const onFinishFailded = (errorInfo) => {
    console.log("Failed:", errorInfo);
    message.error("Error al registrar la compra");
  };
  return (
    <>
      <Row justify="center" align="middle">
        <Col span={12}>
          {visible ? (
            <Card
              title="Compras a Proveedores"
              style={{ textAlign: "center", marginTop: 20, width: 600 }}
            >
              <Form
                form={form}
                name="comprasProveedor"
                onFinish={onFinish}
                onFinishFailed={onFinishFailded}
                autoComplete="off"
              >
                <Form.Item
                  label="Proveedor"
                  name="Proveedor"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Seleccione Proveedor">
                    <Select.Option value="12345678-9">Carozzi</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                  <Button type="primary" htmlType="submit">
                    Registrar Compra
                  </Button>
                  <Button onClick={() => cerrarModal(false)}>Cerrar</Button>
                </Form.Item>
              </Form>
            </Card>
          ) : null}
        </Col>
        <Col span={12}></Col>
      </Row>
    </>
  );
}

export default function Aprovisionamiento() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleComprasClick = () => {
    setIsModalVisible(true);
  };
  return (
    <>
      <Row justify="center" align="middle">
        <Col span={24} style={{ marginTop: 20, textAlign: "center" }}>
          <Title level={2}>Página de Aprovisionamiento</Title>
        </Col>
      </Row>
      <Row justify="center" align="middle">
        <Col
          span={24}
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Button type="primary" onClick={() => handleComprasClick()}>
            Compras a Proveedores
          </Button>
          <Button type="primary">Despacho Proveedor</Button>
        </Col>
        <ComprasProveedor
          cerrarModal={(valor) => setIsModalVisible(valor)}
          visible={isModalVisible}
        />
      </Row>
    </>
  );
}
