import React from "react";
import { Row, Col, Button, Form, Modal } from "react-bootstrap";

export default function Editar({
  Producto,
  modalEditar,
  handleCerrarModal,
  datos,
  handleChange,
  categorias,
}) {
  console.log("Categorias:", categorias);
  return (
    <Modal show={modalEditar} onHide={handleCerrarModal} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Editar Producto {Producto?.nombre}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Código *</Form.Label>
                <Form.Control
                  type="number"
                  placeholder={Producto?.codigo}
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
                  placeholder={Producto?.nombre}
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
                  placeholder={Producto?.precioCompra}
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
                  placeholder={Producto?.precioVenta}
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
                  placeholder={Producto?.peso}
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
              placeholder={Producto?.descripcion}
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
              {categorias?.length > 0 &&
                categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
