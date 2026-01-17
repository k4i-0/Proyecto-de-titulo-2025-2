import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Row, Col, Select, Alert } from "antd";
// 1. Asume que tienes un servicio para crear el proveedor
import { crearProveedor } from "../../../services/inventario/Proveedor.service";

const { Option } = Select;
const { TextArea } = Input;

// Estado inicial para el formulario
const initialState = {
  rut: "",
  nombre: "",
  telefono: "",
  email: "",
  rubro: "",
  giro: "",
  direccion: "",
  estado: "Activo", // Valor por defecto
};

export default function AgregarProveedor({
  show,
  handleClose,
  funcionBuscarProveedores,
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
  const handleSelectChange = (name) => (value) => {
    setDatos({ ...datos, [name]: value });
  };

  // Maneja el envío del formulario
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // 2. Llama al servicio para crear
      const respuesta = await crearProveedor(datos);

      if (respuesta.status === 201 || respuesta.status === 200) {
        funcionBuscarProveedores(); // Actualiza la tabla en el componente padre
        handleClose(); // Cierra el modal
      } else {
        // Muestra error de la API (ej: RUT ya existe)
        setError(respuesta.error || "Error al crear el proveedor.");
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
      open={show} // Prop 'show' del esqueleto original
      onCancel={handleClose} // Prop 'handleClose' del esqueleto original
      title="Crear Nuevo Proveedor"
      centered
      width={800} // Tamaño 'lg'
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
          {loading ? "Creando..." : "Crear Proveedor"}
        </Button>,
      ]}
    >
      {/* 3. Muestra errores si existen */}
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="RUT *" required>
              <Input
                placeholder="Ingrese RUT (ej: 12345678-9)"
                name="rut"
                value={datos.rut}
                onChange={handleChange}
                required
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Nombre *" required>
              <Input
                placeholder="Ingrese nombre o razón social"
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
          <Col span={12}>
            <Form.Item label="Rubro *" required>
              <Input
                placeholder="Ej: Ferretería, Alimentos, etc."
                name="rubro"
                value={datos.rubro}
                onChange={handleChange}
                required
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Giro *" required>
              <Input
                placeholder="Ej: Venta al por menor de..."
                name="giro"
                value={datos.giro}
                onChange={handleChange}
                required
              />
            </Form.Item>
          </Col>
        </Row>

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
      </Form>
    </Modal>
  );
}
