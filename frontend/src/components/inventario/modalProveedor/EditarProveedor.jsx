import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Row, Col, Select, Alert } from "antd";
// 1. Asume que tienes un servicio para *editar* el proveedor
import { editarProveedor } from "../../../services/inventario/Proveedor.service";

const { Option } = Select;
const { TextArea } = Input;

export default function EditarProveedor({
  Proveedor, // El proveedor seleccionado de la tabla
  modalEditar, // 'show' del esqueleto original
  handleCerrarModal, // 'handleClose' del esqueleto original
  funcionBuscarProveedores,
}) {
  const [datos, setDatos] = useState({}); // Empezar vacío, se llenará con useEffect
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 2. Hook clave: Carga los datos del proveedor cuando el modal se abre
  useEffect(() => {
    if (modalEditar && Proveedor) {
      // Si el modal se abre y hay un proveedor, llena el estado 'datos'
      setDatos(Proveedor);
      setError(null); // Limpia errores antiguos
    } else {
      // Opcional: Limpia los datos cuando se cierra
      setDatos({});
    }
  }, [modalEditar, Proveedor]); // Se ejecuta si 'modalEditar' o 'Proveedor' cambian

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
      // 3. Llama al servicio para editar
      // Pasa el ID del proveedor y los datos actualizados
      const respuesta = await editarProveedor(datos, Proveedor.idProveedor);

      if (respuesta.status === 200) {
        funcionBuscarProveedores(); // Actualiza la tabla en el componente padre
        handleCerrarModal(); // Cierra el modal
      } else {
        setError(respuesta.error || "Error al actualizar el proveedor.");
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
      open={modalEditar} // Prop 'modalEditar' del esqueleto
      onCancel={handleCerrarModal} // Prop 'handleCerrarModal' del esqueleto
      title="Editar Proveedor" // Título actualizado
      centered
      width={800}
      footer={[
        <Button key="back" onClick={handleCerrarModal}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {loading ? "Actualizando..." : "Actualizar Proveedor"}
        </Button>,
      ]}
    >
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* El formulario es idéntico al de 'Agregar', pero los 'value' 
        se llenan desde el 'useEffect' 
      */}
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="RUT *" required>
              <Input
                placeholder="Ingrese RUT (ej: 12345678-9)"
                name="rut"
                value={datos.rut || ""} // || '' para evitar warnings de React
                onChange={handleChange}
                required
                disabled // 4. RUT no debería ser editable
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Nombre *" required>
              <Input
                placeholder="Ingrese nombre o razón social"
                name="nombre"
                value={datos.nombre || ""}
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
                value={datos.telefono || ""}
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
                value={datos.email || ""}
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
                value={datos.rubro || ""}
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
                value={datos.giro || ""}
                onChange={handleChange}
                required
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Estado *" required>
          <Select
            placeholder="Seleccione estado"
            value={datos.estado || ""}
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
