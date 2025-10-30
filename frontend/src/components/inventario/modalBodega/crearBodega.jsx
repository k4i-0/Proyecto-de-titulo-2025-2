import { useState } from "react";
import { Row, Col, Button, Form, Modal, Alert, Spinner } from "react-bootstrap";

import { crearBodega } from "../../../services/inventario/Bodega.service";
// import obtenerSucursales from "../../../services/inventario/Sucursal.service";
export default function AgregarBodega({
  show,
  handleClose,
  buscarBodegas,
  idSucursal,
}) {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);

  const [datos, setDatos] = useState({
    nombre: "",
    capacidad: "",
    estado: "",
    idSucursal: idSucursal || "",
  });

  // const buscarSucursales = async () => {
  //   try {
  //     const respuesta = await obtenerSucursales();

  //     if (respuesta.code) {
  //       setError(true);
  //       setMensaje(respuesta.error);
  //     } else {
  //       setSucursales(respuesta);
  //     }
  //   } catch (error) {
  //     setError(true);
  //     setMensaje("Error al cargar sucursales");
  //     console.error(error);
  //   }
  // };

  // useEffect(() => {
  //   if (show) buscarSucursales();
  // }, [show]);

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
        setMensaje("Bodega creada exitosamente");
        setError(false);
        setTimeout(() => {
          buscarBodegas();
          setDatos({
            nombre: "",
            ubicacion: "",
            capacidad: "",
            estado: "",
            idSucursal: "",
          });

          handleClose();
          setMensaje("");
        }, 1200);
      } else {
        setError(true);
        setMensaje(
          resultado.data?.message ||
            resultado.error ||
            "Error al crear la bodega."
        );
      }
    } catch (err) {
      setError(true);
      setMensaje(
        err.response?.data?.message || "Error de conexión al crear la bodega."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleCerrarModal = () => {
    setMensaje("");
    setError(false);
    setDatos({
      nombre: "",
      ubicacion: "",
      capacidad: "",
      estado: "",
      idSucursal: "",
    });
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
              type="text"
              name="idSucursal"
              placeholder={idSucursal}
              value={datos.idSucursal}
              disabled={idSucursal}
            ></Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleCerrarModal}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creando..." : "Crear Bodega"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
