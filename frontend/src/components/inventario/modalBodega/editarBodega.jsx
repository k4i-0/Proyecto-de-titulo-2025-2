import { useState, useEffect } from "react";
import { Alert, Button, Form, Modal, Input, Select, InputNumber } from "antd";

import { editarBodega } from "../../../services/inventario/Bodega.service";

export default function EditarBodega({
  bodegas,
  show,
  handleClose,
  buscarBodegas,
}) {
  //console.log("Bodega a editar:", bodegas?.capacidad);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (show && bodegas) {
      form.setFieldsValue({
        nombre: bodegas.nombre || "",
        capacidad: bodegas.capacidad || null,
        estado: bodegas.estado || "",
      });
    } else {
      form.resetFields();
    }
    setError("");
  }, [show, bodegas, form]);

  const handleSubmitEdicion = async (values) => {
    setLoading(true);
    setError("");
    const dataParaEnviar = {
      ...values,
      idSucursal: bodegas.idSucursal,
    };
    try {
      const respuesta = await editarBodega(dataParaEnviar, bodegas.idBodega);
      if (respuesta.status === 200) {
        buscarBodegas();
        handleCerrar();
      } else {
        setError(respuesta?.error || "Error al editar la bodega.");
        console.log(respuesta);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error al editar la bodega.");
    } finally {
      setLoading(false);
    }
    console.log("Datos para editar:", dataParaEnviar, bodegas.idBodega);
  };
  const handleCerrar = () => {
    setError("");
    form.resetFields();
    handleClose();
  };
  return (
    <Modal
      open={show}
      title={`Editar Bodega ${bodegas?.idBodega || ""}`}
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
          {loading ? "Guardando..." : "Guardar cambios"}
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
          rules={[{ required: true, message: "Por favor ingrese el nombre" }]}
        >
          <Input placeholder="Ingrese nombre" />
        </Form.Item>

        <Form.Item
          label="Capacidad (m²)"
          name="capacidad"
          rules={[
            { required: true, message: "Por favor ingrese la capacidad" },
          ]}
        >
          <InputNumber
            placeholder="Ingrese capacidad"
            min={0}
            max={10000}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          label="Estado"
          name="estado"
          rules={[
            { required: true, message: "Por favor seleccione un estado" },
          ]}
        >
          <Select
            placeholder="Seleccione un estado"
            options={[
              { value: "En Funcionamiento", label: "En Funcionamiento" },
              { value: "En Mantenimiento", label: "En Mantenimiento" },
              { value: "Fuera de Servicio", label: "Fuera de Servicio" },
            ]}
          />
        </Form.Item>
      </Form>
      {/* <Form onSubmit={handleSubmitEdicion}>
          <Form.Group controlId="formNombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChangeLocal}
              required
            />
          </Form.Group>
          <Form.Group controlId="formCapacidad">
            <Form.Label>Capacidad</Form.Label>
            <Form.Control
              type="number"
              name="capacidad"
              min={0}
              max={10000}
              value={formData.capacidad}
              onChange={handleChangeLocal}
              required
            />
          </Form.Group>
          <Form.Group controlId="formEstado">
            <Form.Label>Estado</Form.Label>
            <Form.Control
              as="select"
              name="estado"
              value={formData.estado}
              onChange={handleChangeLocal}
              required
            >
              <option value="">Seleccione un estado</option>
              <option value="En Funcionamiento">En Funcionamiento</option>
              <option value="En Mantenimiento">En Mantenimiento</option>
              <option value="Fuera de Servicio">Fuera de Servicio</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCerrar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} onClick={handleSubmitEdicion}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </Modal.Footer> */}
    </Modal>
  );
}
