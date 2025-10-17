import React, { useState, useEffect } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";

import { editarCategoria } from "../../../services/inventario/Categorias.service";

export default function EditarCategoria({
  Categoria,
  modalEditar,
  handleCerrarModal,
  funcionBuscarCategorias,
}) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    estado: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (Categoria) {
      setFormData({
        nombre: Categoria.nombre || "",
        descripcion: Categoria.descripcion || "",
        estado: Categoria.estado || "",
      });
      setError("");
    }
  }, [Categoria]);

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
      const respuesta = await editarCategoria(formData, Categoria.idCategoria);
      if (respuesta.status == 200) {
        funcionBuscarCategorias();
        handleCerrarModal();
      } else {
        setError(respuesta.error || "Error al editar la categoría");
        console.log(respuesta);
      }
    } catch (error) {
      setError("Error al editar la categoría", error);
    } finally {
      setLoading(false);
    }
    console.log("Datos para editar:", formData, Categoria.idCategoria);
  };

  return (
    <Modal show={modalEditar} onHide={handleCerrarModal}>
      <Modal.Header closeButton onClick={handleCerrarModal}>
        <Modal.Title>Editar Categoría {formData.nombre}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmitEdicion}>
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
          <Form.Group controlId="formDescripcion">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              name="descripcion"
              value={formData.descripcion}
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
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="eliminado">eliminado</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit" disabled={loading} onClick={handleSubmitEdicion}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
