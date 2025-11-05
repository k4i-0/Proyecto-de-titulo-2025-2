import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Row, Col, Select, Alert } from "antd";

import { editarVendedor } from "../../../services/inventario/Proveedor.service";

const { Option } = Select;

export default function EditarVendedor({
  Vendedor,
  modalEditar,
  handleCerrarModal,
  funcionBuscarVendedores,
  rutProveedor,
}) {
  const [datos, setDatos] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (modalEditar && Vendedor) {
      setDatos(Vendedor);
      setError(null);
    } else {
      setDatos({});
    }
  }, [modalEditar, Vendedor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
  };

  //   const handleSelectChange = (name) => (value) => {
  //     setDatos({ ...datos, [name]: value });
  //   };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const respuesta = await editarVendedor(
        datos,
        Vendedor.idVendedorProveedor
      );

      if (respuesta.status === 200) {
        funcionBuscarVendedores();
        handleCerrarModal();
      } else {
        setError(respuesta.error || "Error al actualizar el vendedor.");
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
      open={modalEditar}
      onCancel={handleCerrarModal}
      title="Editar Vendedor"
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
          {loading ? "Actualizando..." : "Actualizar Vendedor"}
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

      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="RUT Vendedor *" required>
              <Input
                placeholder="RUT del vendedor"
                name="rut"
                value={datos.rut || ""}
                onChange={handleChange}
                required
                disabled
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Nombre Vendedor *" required>
              <Input
                placeholder="Ingrese nombre completo"
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
            <Form.Item label="RUT Proveedor (Asignado)">
              <Input
                value={rutProveedor || datos.rutProveedor || ""}
                disabled
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
