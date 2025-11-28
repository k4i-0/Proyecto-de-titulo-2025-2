// src/components/inventario/modalInventario/EditarInventario.jsx
import { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Alert, Spin, Flex } from "antd";
import { editarInventario } from "../../../services/inventario/Inventario.service";

export default function EditarInventario({
  inventario,
  show,
  handleClose,
  buscarInventarios,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (inventario && show) {
      form.setFieldsValue({
        nombre: inventario.nombre || "",
        producto: inventario.idProducto || "Cargando...",
        bodega: inventario.bodega?.nombre || "Cargando...",
        stock: inventario.stock || "",
      });
      setError("");
    }
  }, [inventario, show, form]);

  const handleSubmitEdicion = async (values) => {
    setLoading(true);
    setError("");

    try {
      const datosAEnviar = {
        stock: parseInt(values.stock, 10),
      };

      const respuesta = await editarInventario(
        inventario.idInventario,
        datosAEnviar
      );

      if (respuesta.status === 200) {
        buscarInventarios();
        handleCerrar();
      } else {
        setError(respuesta.data?.message || "Error al editar el stock.");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handleCerrar = () => {
    setError("");
    form.resetFields();
    handleClose();
  };

  return (
    <Modal
      title="Editar Inventario"
      open={show}
      onCancel={handleCerrar}
      footer={[
        <Button key="cancel" onClick={handleCerrar}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          Guardar Cambios
        </Button>,
      ]}
      width={600}
      destroyOnClose
    >
      {error && (
        <Alert
          message={error}
          type="error"
          closable
          onClose={() => setError("")}
          style={{ marginBottom: 16 }}
          showIcon
        />
      )}

      {!inventario ? (
        <Flex justify="center" align="center" style={{ padding: "40px 0" }}>
          <Spin size="large" />
        </Flex>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitEdicion}
          autoComplete="off"
        >
          <Form.Item
            label="Nombre"
            name="nombre"
            rules={[{ required: true, message: "Por favor ingrese el nombre" }]}
          >
            <Input placeholder="Ingrese nombre" disabled />
          </Form.Item>

          <Form.Item label="Producto" name="producto">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Bodega" name="bodega">
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Nuevo Stock"
            name="stock"
            rules={[
              { required: true, message: "Por favor ingrese el stock" },
              {
                pattern: /^\d+$/,
                message: "Debe ser un número válido",
              },
            ]}
          >
            <Input
              type="number"
              placeholder="Ingrese cantidad de stock"
              min={0}
              autoFocus
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
