import { useState, useEffect } from "react"; // <-- Se añade useEffect
import {
  Row,
  Col,
  Button,
  Form,
  Modal,
  Alert,
  Spin,
  Input,
  Select,
} from "antd";

import { crearEstante } from "../../../services/inventario/Estante.service";

// Opciones para los Selects (puedes moverlas o cambiarlas)
const { Option } = Select;
const tiposEstante = ["Maquina", "Estante", "Lugar de Piso", "Otro"];
const estadosEstante = [
  "Habilitado",
  "Inhabilitado",
  "Mantenimiento",
  "Reservado",
];

export default function CrearEstante({
  show,
  handleClose,
  estantesCargarBodega, // Esta es la función para recargar
  idBodega,
}) {
  //   console.log("ID de Bodega recibido en CrearEstante:", idBodega);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);

  // Efecto para setear el ID de la bodega en el formulario
  useEffect(() => {
    if (show) {
      form.setFieldsValue({
        idBodega: idBodega,
      });
    } else {
      form.resetFields();
    }
  }, [show, idBodega, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setMensaje("");
    setError(false);

    // Los 'values' vienen del formulario
    const datosEstante = {
      codigo: values.codigo,
      tipo: values.tipo,
      estado: values.estado,
      capacidad: values.capacidad || 0,
      idBodega: idBodega,
    };

    try {
      const resultado = await crearEstante(datosEstante);
      if (resultado.status === 201) {
        setMensaje("Estante creado exitosamente");
        setError(false);
        setTimeout(() => {
          estantesCargarBodega();
          handleCerrarModal();
        }, 1200);
      } else if (resultado.status === 422) {
        setMensaje(
          "Datos duplicados o inválidos: " +
            (resultado.data?.message || resultado.error || "Error desconocido.")
        );
        setError(true);
      }
    } catch (error) {
      setError(true);
      setMensaje(
        error.response?.data?.message ||
          "Error de conexión al crear el estante."
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarModal = () => {
    setMensaje("");
    setError(false);
    form.resetFields();
    handleClose();
  };

  return (
    <Modal
      open={show}
      title="Crear Nuevo Estante"
      onCancel={handleCerrarModal}
      footer={[
        <Button key="cancelar" onClick={handleCerrarModal}>
          Cancelar
        </Button>,
        <Button
          key="guardar"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          {loading ? "Creando..." : "Crear Estante"}
        </Button>,
      ]}
    >
      {/* Alerta para mensajes */}
      {mensaje && (
        <Alert
          message={mensaje}
          type={error ? "error" : "success"}
          showIcon
          closable
          onClose={() => setMensaje("")}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Formulario de Ant Design */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="Código de Estante"
          name="codigo"
          rules={[{ required: true, message: "Por favor ingrese un código" }]}
        >
          <Input placeholder="Ej: A-01-N1 (Pasillo-Sección-Nivel)" />
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

        <Form.Item label="Capacidad" name="capacidad">
          <Input placeholder="Capacidad del estante" />
        </Form.Item>

        <Form.Item
          label="Estado"
          name="estado"
          initialValue="Habilitado" // Valor por defecto
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
