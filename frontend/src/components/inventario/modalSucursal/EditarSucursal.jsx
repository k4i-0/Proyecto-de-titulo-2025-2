import { useState, useEffect } from "react";
import { Alert, Button, Form, Modal, Input, Select } from "antd";

import { editarSucursal } from "../../../services/inventario/Sucursal.service";

export default function EditarSucursal({
  sucursal,
  show,
  handleClose,
  funcionBuscarSucursales,
}) {
  //console.log("Sucursal para editar recibida en el modal:", sucursal);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    //console.log("Sucursal para editar cambiada:", sucursal);

    if (sucursal) {
      form.setFieldsValue({
        nombre: sucursal.nombre || "",
        direccion: sucursal.direccion || "",
        estado: sucursal.estado || "",
      });
    }
    setError("");
  }, [sucursal, form]);

  const handleSubmitEdicion = async (values) => {
    setLoading(true);
    setError("");

    const formData = {
      nombre: values.nombre,
      direccion: values.direccion,
      estado: values.estado,
    };
    try {
      const respuesta = await editarSucursal(formData, sucursal.idSucursal);
      if (respuesta.status === 200) {
        funcionBuscarSucursales();
        handleCerrar();
      } else {
        setError(
          respuesta.data?.message ||
            respuesta.error ||
            "Error al editar la sucursal"
        );
        console.log(respuesta);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Error de conexión al editar la sucursal"
      );
    } finally {
      setLoading(false);
    }
    // console.log("Datos para editar:", formData, sucursal.idSucursal);
  };
  const handleCerrar = () => {
    setError("");
    form.resetFields();
    handleClose();
  };

  return (
    <Modal
      open={show}
      // title={`Editar Sucursal ${sucursal?.idSucursal || ""}`}
      title="Editar Sucursal"
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

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmitEdicion}
        autoComplete="off"
      >
        <Form.Item
          label="Nombre"
          name="nombre"
          initialValue={sucursal?.nombre}
          rules={[{ required: true, message: "Por favor ingrese el nombre" }]}
        >
          <Input placeholder="Ingrese nombre" />
        </Form.Item>

        <Form.Item
          label="Dirección"
          name="direccion"
          initialValue={sucursal?.direccion}
          rules={[
            { required: true, message: "Por favor ingrese la dirección" },
          ]}
        >
          <Input placeholder="Ingrese dirección" />
        </Form.Item>

        <Form.Item
          label="Estado"
          name="estado"
          initialValue={sucursal?.estado}
          rules={[
            { required: true, message: "Por favor seleccione un estado" },
          ]}
        >
          <Select
            placeholder="Seleccione un estado"
            options={[
              { value: "Abierta", label: "Abierta" },
              { value: "Cerrada", label: "Cerrada" },
              { value: "Mantencion", label: "Mantencion" },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
