// src/components/modalCategorias/AgregarCategoria.jsx

import { useState } from "react";
import { Modal, Button, Form, Row, Col, Spinner, Alert } from "react-bootstrap";
import { crearCategoria } from "../../../services/inventario/Categorias.service";

export default function AgregarCategoria({
  show,
  handleClose,
  funcionBuscarCategorias,
}) {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);
  const [datos, setDatos] = useState({
    nombre: "",
    descripcion: "",
    estado: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const resultado = await crearCategoria(datos);
      console.log("Respuesta al crear", resultado);
      if (resultado.status === 201) {
        setMensaje("Categoría creada exitosamente");
        setError(false);
        setTimeout(() => {
          funcionBuscarCategorias();
          setDatos({ nombre: "", descripcion: "", estado: "" });
          handleClose();
          setMensaje("");
        }, 1200);
      } else {
        setError(true);
        setMensaje(resultado.error || "Error al crear la categoría.");
      }
    } catch (err) {
      setError(true);
      setMensaje("Error de conexión al crear la categoría.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      {loading ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            borderRadius: "var(--bs-modal-border-radius)",
          }}
        >
          <Spinner animation="grow" />
          <p>Creando categoría...</p>
        </div>
      ) : null}
      <Modal.Header closeButton>
        <Modal.Title>Crear Nueva Categoría</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {mensaje && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              borderRadius: "var(--bs-modal-border-radius)",
            }}
          >
            <Alert variant={error ? "danger" : "success"}>{mensaje}</Alert>
          </div>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingrese nombre de la categoría"
              name="nombre"
              value={datos.nombre}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Ingrese una descripción"
              name="descripcion"
              value={datos.descripcion}
              onChange={handleChange}
            />
          </Form.Group>

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
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creando..." : "Crear Categoría"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
