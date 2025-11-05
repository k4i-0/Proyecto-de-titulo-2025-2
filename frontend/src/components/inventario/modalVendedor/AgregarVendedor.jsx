import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Row, Col, Select, Alert } from "antd";
// 1. Asumiendo que este es tu servicio para crear Vendedores
import { crearVendedor } from "../../../services/inventario/Proveedor.service";

const { Option } = Select;

// Estado inicial para el formulario
const initialState = {
  rut: "",
  nombre: "",
  telefono: "",
  email: "",
  rutProveedor: "",
};

export default function AgregarVendedor({
  show,
  handleClose,
  funcionBuscarVendedores,
  rutProveedor, // Se recibe el RUT/ID del Proveedor padre
}) {
  const [datos, setDatos] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Resetea el formulario cada vez que el modal se abre
  useEffect(() => {
    if (show) {
      setDatos(initialState);
      setError(null);
    }
  }, [show]);

  // Manejador genérico para inputs de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
  };

  // Manejador para el Select de 'estado'
  //   const handleSelectChange = (name) => (value) => {
  //     setDatos({ ...datos, [name]: value });
  //   };

  // Maneja el envío del formulario
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // 2. Combina los datos del formulario con el rutProveedor
      const dataParaEnviar = {
        ...datos,
        rutProveedor: rutProveedor,
      };

      console.log("Datos a enviar para crear Vendedor:", dataParaEnviar);

      // 3. Llama al servicio para crear Vendedor
      const respuesta = await crearVendedor(dataParaEnviar);

      if (respuesta.status === 201 || respuesta.status === 200) {
        funcionBuscarVendedores(); // Actualiza la tabla en el componente padre
        handleClose(); // Cierra el modal
      } else {
        // Muestra error de la API (ej: RUT ya existe)
        setError(respuesta.error || "Error al crear el vendedor.");
      }
    } catch (err) {
      setError("Error de conexión. Intente de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={show}
      onCancel={handleClose}
      title="Crear Nuevo Vendedor"
      centered
      width={800}
      footer={[
        <Button key="back" onClick={handleClose}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {loading ? "Creando..." : "Crear Vendedor"}
        </Button>,
      ]}
    >
      {/* Muestra errores si existen */}
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 4. Formulario adaptado a Vendedor */}
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="RUT Vendedor *" required>
              <Input
                placeholder="Ingrese RUT del vendedor (ej: 12345678-9)"
                name="rut"
                value={datos.rut}
                onChange={handleChange}
                required
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Nombre Vendedor *" required>
              <Input
                placeholder="Ingrese nombre completo"
                name="nombre"
                value={datos.nombre}
                onChange={handleChange}
                required
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Teléfono *" required>
              <Input
                placeholder="Ingrese teléfono de contacto"
                name="telefono"
                value={datos.telefono}
                onChange={handleChange}
                required
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Email *" required>
              <Input
                type="email"
                placeholder="Ingrese email de contacto"
                name="email"
                value={datos.email}
                onChange={handleChange}
                required
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* <Col span={12}>
            <Form.Item label="Estado *" required>
              <Select
                placeholder="Seleccione estado"
                name="estado"
                value={datos.estado}
                onChange={handleSelectChange("estado")}
                required
              >
                <Option value="Activo">Activo</Option>
                <Option value="Inactivo">Inactivo</Option>
              </Select>
            </Form.Item>
          </Col> */}
          <Col span={12}>
            <Form.Item label="RUT Proveedor (Asignado)">
              <Input value={rutProveedor} disabled />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
