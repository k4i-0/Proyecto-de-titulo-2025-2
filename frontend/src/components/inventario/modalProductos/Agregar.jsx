import React, { useState, useEffect } from "react";
import { Row, Col, Button, Form, Modal, Alert } from "react-bootstrap";

export default function Agregar({
  modalCrear,
  handleCerrarModal,
  handleSubmit,
  datos,
  handleChange,
  categorias,
  loading,
}) {
  const [mensaje, setMensaje] = useState("");
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    if (categorias.length === 0) {
      setMensaje("!!No existe Categoría, debe crear una antes!!");
      setFlag(true);
    } else {
      setMensaje("");
      setFlag(false);
    }
  }, [categorias]);

  return (
    <Modal show={modalCrear} onHide={handleCerrarModal} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Crear Nuevo Producto</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {mensaje && (
            <Row className="mb-3">
              <Col>
                <Alert variant={flag ? "danger" : "success"}>{mensaje}</Alert>
              </Col>
            </Row>
          )}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Código *</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Ingrese código del producto"
                  name="codigo"
                  value={datos.codigo}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese nombre del producto"
                  name="nombre"
                  value={datos.nombre}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Precio Compra *</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0.00"
                  name="precioCompra"
                  value={datos.precioCompra}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Precio Venta *</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0.00"
                  name="precioVenta"
                  value={datos.precioVenta}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Peso (kg)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0.00"
                  name="peso"
                  value={datos.peso}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Estado *</Form.Label>
                <Form.Control
                  as="select"
                  name="estado"
                  value={datos.estado}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione estado</option>
                  <option value="Bueno">Bueno</option>
                  <option value="Malo">Malo</option>
                  <option value="Dañado">Dañado</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Ingrese descripción del producto"
              name="descripcion"
              value={datos.descripcion}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Categoría *</Form.Label>
            <Form.Control
              as="select"
              name="nameCategoria"
              value={datos.nameCategoria}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione una categoría</option>
              {categorias.length > 0 &&
                categorias.map((categoria) => (
                  <option key={categoria.id}>{categoria.nombre}</option>
                ))}
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleCerrarModal}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creando..." : "Crear Producto"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
