import { useState } from "react";
import { Row, Col, Button, Form, Modal, Alert, Spinner } from "react-bootstrap";

import { crearSucursal } from "../../../services/inventario/Sucursal.service";

export default function AgregarSucursal({
  show,
  handleClose,
  buscarSucursales,
}) {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);

  const [datos, setDatos] = useState({
    nombre: "",
    ubicacion: "",
    telefono: "",
    estado: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
  };

  //   useEffect(() => {}, [sucursales]);
  //   const handleChange = (e) => {
  //     const { name, value } = e.target;
  //     setDatos({ ...datos, [name]: value });
  //   };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const resultado = await crearSucursal(datos);
      console.log("Respuesta al crear", resultado);
      if (resultado.status === 201) {
        setMensaje("Sucursal creada exitosamente");
        setError(false);
        setTimeout(() => {
          buscarSucursales();
          setDatos({ nombre: "", ubicacion: "", telefono: "", estado: "" });
          handleClose();
          setMensaje("");
        }, 1200);
      } else {
        setError(true);
        setMensaje(
          resultado.data?.message ||
            resultado.error ||
            "Error al crear la sucursal."
        );
      }
    } catch (err) {
      setError(true);
      setMensaje(
        err.response?.data?.message || "Error de conexión al crear la sucursal."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarModal = () => {
    setMensaje("");
    setError(false);
    setDatos({ nombre: "", ubicacion: "", telefono: "", estado: "" });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleCerrarModal}>
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
          <p>Creando sucursal...</p>
        </div>
      ) : null}
      <Modal.Header closeButton>
        <Modal.Title>Crear Nueva sucursal</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {mensaje && !loading && (
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
                <Form.Label>telefono *</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="Ingrese telefono"
                  name="telefono"
                  value={datos.telefono}
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
                placeholder="Ingrese ubicación de la sucursal"
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
              <option value="Abierta">Abierta</option>
              <option value="Cerrada">Cerrada</option>
              <option value="Mantencion">Mantencion</option>
              <option value="Eliminada">Eliminada</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleCerrarModal}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creando..." : "Crear Sucursal"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
