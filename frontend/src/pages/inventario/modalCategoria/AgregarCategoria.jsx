import { useState } from "react";
import { Modal, Button, Form, Alert, Input, Select, Spin } from "antd";
import { crearCategoria } from "../../../services/inventario/Categorias.service";

const { TextArea } = Input;

export default function AgregarCategoria({
  show,
  handleClose,
  funcionBuscarCategorias,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    setMensaje("");
    setError(false);

    try {
      const resultado = await crearCategoria(values);
      console.log("Respuesta al crear", resultado);

      if (resultado.status === 201) {
        setMensaje("Categoría creada exitosamente");
        setError(false);
        funcionBuscarCategorias();
        setTimeout(() => {
          form.resetFields();
          handleClose();
          setMensaje("");
        }, 1200);
      } else {
        setError(true);
        setMensaje(resultado.error || "Error al crear la categoría.");
      }
    } catch (err) {
      setError(true);
      setMensaje("Error de conexión al crear la categoría.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrar = () => {
    setMensaje("");
    setError(false);
    form.resetFields();
    handleClose();
  };

  return (
    <Modal
      open={show}
      title="Crear Nueva Categoría"
      onCancel={handleCerrar}
      footer={[
        <Button key="cancelar" onClick={handleCerrar}>
          Cancelar
        </Button>,
        <Button
          key="crear"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          Crear Categoría
        </Button>,
      ]}
      width={600}
    >
      <Spin spinning={loading} tip="Creando categoría...">
        {mensaje && (
          <Alert
            message={mensaje}
            type={error ? "error" : "success"}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Nombre"
            name="nombre"
            rules={[{ required: true, message: "Por favor ingrese el nombre" }]}
          >
            <Input placeholder="Ingrese nombre de la categoría" />
          </Form.Item>

          <Form.Item label="Subcategoría" name="subcategoria">
            <Input placeholder="Ingrese una SubCategoría" />
          </Form.Item>

          <Form.Item
            label="Estado"
            name="estado"
            rules={[
              { required: true, message: "Por favor seleccione el estado" },
            ]}
          >
            <Select placeholder="Seleccione estado">
              <Select.Option value="Activo">Activo</Select.Option>
              <Select.Option value="Inactivo">Inactivo</Select.Option>
              <Select.Option value="Suspendido">Suspendido</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}
