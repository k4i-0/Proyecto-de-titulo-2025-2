import { useState, useEffect } from "react";
import { Alert, Button, Form, Modal, Input, Select } from "antd";

import { editarEstante } from "../../../services/inventario/Estante.service"; // <-- Servicio correcto

// Opciones para los Selects (igual que en CrearEstante)
const { Option } = Select;
const tiposEstante = ["Maquina", "Estante", "Lugar de Piso", "Otro"];
const estadosEstante = [
  "Habilitado",
  "Inhabilitado",
  "Mantenimiento",
  "Reservado",
];

export default function EditarEstante({
  estante,
  show,
  handleClose,
  estantesCargarBodega,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Efecto para poblar el formulario cuando el modal se abre
  useEffect(() => {
    if (show && estante) {
      // Pone los datos del 'estante' en los campos del formulario
      form.setFieldsValue({
        codigo: estante.codigo,
        tipo: estante.tipo,
        estado: estante.estado,
        idBodega: estante.idBodega,
      });
    } else if (!show) {
      form.resetFields();
      setError("");
    }
  }, [show, estante, form]); // Depende de estas variables

  // Se llama cuando el formulario se envía
  const handleSubmitEdicion = async (values) => {
    setLoading(true);
    setError("");

    // Datos que se enviarán a la API
    const formData = {
      codigo: values.codigo,
      tipo: values.tipo,
      estado: values.estado,
      idBodega: estante.idBodega,
    };

    try {
      // Llama al servicio con los datos y el ID del estante

      const respuesta = await editarEstante(formData, estante.idEstante);

      if (respuesta.status === 200) {
        estantesCargarBodega(); // Recarga la tabla en el componente padre
        handleCerrar(); // Cierra este modal
      } else {
        setError(
          respuesta.data?.message ||
            respuesta.error ||
            "Error al editar el estante"
        );
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Error de conexión al editar el estante"
      );
    } finally {
      setLoading(false);
    }
  };

  // Cierra el modal y limpia todo
  const handleCerrar = () => {
    setError("");
    form.resetFields();
    handleClose();
  };

  return (
    <Modal
      open={show}
      title={`Editar Estante (ID: ${estante?.idEstante || ""})`}
      onCancel={handleCerrar}
      footer={[
        <Button key="cancelar" onClick={handleCerrar}>
          Cancelar
        </Button>,
        <Button
          key="guardar"
          type="primary"
          loading={loading}
          onClick={() => form.submit()} // Dispara el onFinish
        >
          Guardar Cambios
        </Button>,
      ]}
    >
      {/* Alerta para mensajes */}
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => setError("")}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Formulario de Ant Design */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmitEdicion}
        autoComplete="off"
      >
        <Form.Item
          label="Código de Estante"
          name="codigo"
          rules={[{ required: true, message: "Por favor ingrese un código" }]}
        >
          <Input placeholder="Ej: A-01-N1" />
        </Form.Item>

        <Form.Item
          label="Tipo de Estante"
          name="tipo"
          rules={[{ required: true, message: "Por favor seleccione un tipo" }]}
        >
          <Select placeholder="Seleccione un tipo">
            {tiposEstante.map((tipo) => (
              <Option key={tipo} value={tipo}>
                {tipo}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Estado"
          name="estado"
          rules={[
            { required: true, message: "Por favor seleccione un estado" },
          ]}
        >
          <Select placeholder="Seleccione un estado">
            {estadosEstante.map((estado) => (
              <Option key={estado} value={estado}>
                {estado}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Bodega de Pertenencia (ID)" name="idBodega">
          <Input disabled />
        </Form.Item>
      </Form>
    </Modal>
  );
}
