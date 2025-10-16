import React, { useState, useEffect } from "react";
import { Row, Col, Button, Form, Modal } from "react-bootstrap";
import { editarProducto } from "../../../services/inventario/Productos.service";

export default function Editar({
  Producto,
  modalEditar,
  handleCerrarModal,
  categorias,
  funcionBuscarProductos,
}) {
  //console.log("producto seleccionado:", Producto);
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    precioCompra: "",
    precioVenta: "",
    peso: "",
    descripcion: "",
    estado: "",
    nameCategoria: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (Producto) {
      setFormData({
        codigo: Producto.codigo || "",
        nombre: Producto.nombre || "",
        precioCompra: Producto.precioCompra || "",
        precioVenta: Producto.precioVenta || "",
        peso: Producto.peso || "",
        descripcion: Producto.descripcion || "",
        estado: Producto.estado || "",
        nameCategoria: Producto.categoria.nombre || "",
      });
      setError("");
    }
  }, [Producto]);

  const handleChangeLocal = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmitEdicion = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const respuesta = await editarProducto(formData, Producto.idProducto);
      if (respuesta.status == 200) {
        await funcionBuscarProductos();
        handleCerrarModal();
      } else {
        setError(respuesta.error || "Ocurrió un error al actualizar.");
      }
    } catch (error) {
      setError("Error de conexión. Por favor, intenta de nuevo.");
      console.log("Error al editar:", error);
    } finally {
      setLoading(false);
    }
    // Llama a una función del padre para actualizar el producto, pasando formData
    // Ejemplo: handleUpdate(Producto.id, formData);
    console.log("Datos para actualizar:", formData);
  };

  return (
    <Modal show={modalEditar} onHide={handleCerrarModal} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Editar Producto {formData.nombre}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmitEdicion}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Código *</Form.Label>
                <Form.Control
                  type="number"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChangeLocal}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChangeLocal}
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
                  name="precioCompra"
                  value={formData.precioCompra}
                  onChange={handleChangeLocal}
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
                  name="precioVenta"
                  value={formData.precioVenta}
                  onChange={handleChangeLocal}
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
                  name="peso"
                  value={formData.peso}
                  onChange={handleChangeLocal}
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
                  value={formData.estado}
                  onChange={handleChangeLocal}
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
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChangeLocal}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Categoría *</Form.Label>
            <Form.Control
              as="select"
              name="nameCategoria"
              value={formData.nameCategoria}
              placeholder={formData.nameCategoria}
              onChange={handleChangeLocal}
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
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={handleCerrarModal}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          variant="warning"
          onClick={handleSubmitEdicion}
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
