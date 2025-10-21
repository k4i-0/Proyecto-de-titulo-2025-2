import { useState, useEffect } from "react";
import { Row, Col, Button, Form, Modal, Alert, Spinner } from "react-bootstrap";

import { crearBodega } from "../../../services/inventario/Bodega.service";
import { use } from "react";

export default function AgregarBodega({
  show,
  handleClose,
  funcionBuscarCategorias,
}) {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);
  const [sucursales, setSucursales] = useState([]);

  const [datos, setDatos] = useState({
    nombre: "",
    ubicacion: "",
    capacidad: "",
    estado: "",
    idSucursal: "",
  });

  useEffect(() => {}, [sucursales]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const resultado = await crearBodega(datos);
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
    <Modal show={show} onHide={handleClose}>
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
        <Modal.Title>Crear Nueva Bodega</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
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
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese nombre"
                  name="nombre"
                  value={datos.nombre}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Capacidad *</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Ingrese capacidad"
                  name="capacidad"
                  value={datos.capacidad}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Form.Group className="mb-3">
              <Form.Label>Ubicación *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese ubicación de la categoría"
                name="ubicacion"
                value={datos.ubicacion}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Estado *</Form.Label>
            <Form.Control
              as="select"
              name="estado"
              value={datos.estado}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un estado</option>
              <option value="En Funcionamiento">En Funcionamiento</option>
              <option value="En Mantenimiento">En Mantenimiento</option>
              <option value="Fuera de Servicio">Fuera de Servicio</option>
            </Form.Control>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Sucursales *</Form.Label>
            <Form.Control
              as="select"
              name="nameCategoria"
              value={datos.sucursal}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione una categoría</option>
              {sucursales.length > 0 &&
                sucursales.map((sucursal) => (
                  <option key={sucursal.idSucursal}>{sucursal.nombre}</option>
                ))}
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
