import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Input, Select } from "antd";
import { editarCategoria } from "../../../services/inventario/Categorias.service";

const { TextArea } = Input;

export default function EditarCategoria({
  Categoria,
  modalEditar,
  handleCerrarModal,
  funcionBuscarCategorias,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (Categoria) {
      form.setFieldsValue({
        idCategoria: Categoria.idCategoria || "",
        nombre: Categoria.nombre || "",
        subcategoria: Categoria.subcategoria || "",
        estado: Categoria.estado || "",
      });
      setError("");
      setMensaje("");
    }
  }, [Categoria, form]);

  const handleSubmitEdicion = async (values) => {
    setLoading(true);
    setError("");
    setMensaje("");

    const formData = {
      nombre: values.nombre,
      subcategoria: values.subcategoria,
      estado: values.estado,
    };

    try {
      const respuesta = await editarCategoria(formData, Categoria.idCategoria);
      if (respuesta.status === 200) {
        setMensaje("Categoría actualizada exitosamente");
        setTimeout(() => {
          funcionBuscarCategorias();
          handleCerrar();
        }, 1200);
      } else {
        setError(
          respuesta.data?.message ||
            respuesta.error ||
            "Error al editar la categoría"
        );
        console.log(respuesta);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error al editar la categoría");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrar = () => {
    setError("");
    setMensaje("");
    form.resetFields();
    handleCerrarModal();
  };

  return (
    <Modal
      open={modalEditar}
      title={`Editar Categoría: ${Categoria?.nombre || ""}`}
      onCancel={handleCerrar}
      footer={[
        <Button key="cancelar" onClick={handleCerrar}>
          Cancelar
        </Button>,
        <Button
          key="guardar"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          Guardar cambios
        </Button>,
      ]}
      width={600}
    >
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

      {mensaje && (
        <Alert
          message={mensaje}
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmitEdicion}
        autoComplete="off"
      >
        <Form.Item label="ID Categoría" name="idCategoria">
          <Input disabled style={{ color: "rgba(0, 0, 0, 0.85)" }} />
        </Form.Item>

        <Form.Item
          label="Nombre"
          name="nombre"
          rules={[{ required: true, message: "Por favor ingrese el nombre" }]}
        >
          <Input placeholder="Ingrese nombre de la categoría" />
        </Form.Item>

        <Form.Item
          label="Subcategoría"
          name="subcategoria"
          rules={[
            { required: true, message: "Por favor ingrese la subcategoría" },
          ]}
        >
          <Input placeholder="Ingrese una subcategoría" />
        </Form.Item>

        <Form.Item
          label="Estado"
          name="estado"
          rules={[
            { required: true, message: "Por favor seleccione el estado" },
          ]}
        >
          <Select placeholder="Seleccione un estado">
            <Select.Option value="Activo">Activo</Select.Option>
            <Select.Option value="Inactivo">Inactivo</Select.Option>
            <Select.Option value="Depreciado">Depreciado</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
