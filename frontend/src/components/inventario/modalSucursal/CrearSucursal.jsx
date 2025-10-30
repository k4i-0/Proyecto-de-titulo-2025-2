import { useState } from "react";
import { Row, Col, Button, Form, Modal, Alert, Spinner } from "react-bootstrap";

import { crearSucursal } from "../../../services/inventario/Sucursal.service";
import { crearBodega } from "../../../services/inventario/Bodega.service";

export default function AgregarSucursal({
  show,
  handleClose,
  buscarSucursales,
}) {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);

  const [datosSucursal, setDatosSucursal] = useState({
    nombre: "",
    direccion: "",
    estado: "",
  });
  const [datosBodega, setDatosBodega] = useState({
    nombre: "",
    capacidad: "",
    estado: "",
    idSucursal: "",
  });
  const handleChangeSucursal = (e) => {
    const { name, value } = e.target;
    setDatosSucursal({ ...datosSucursal, [name]: value });
  };
  const handleChangeBodega = (e) => {
    const { name, value } = e.target;
    setDatosBodega({ ...datosBodega, [name]: value });
  };

  //   useEffect(() => {}, [sucursales]);
  //   const handleChangeSucursal = (e) => {
  //     const { name, value } = e.target;
  //     setDatos({ ...datos, [name]: value });
  //   };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resultado = await crearSucursal(datosSucursal);
      //console.log("Respuesta al crear", resultado);
      if (resultado.status === 201) {
        const resultadoBodega = await crearBodega({
          ...datosBodega,
          idSucursal: resultado.data.idSucursal,
        });
        //console.log("Respuesta al crear bodega", resultadoBodega);
        if (resultadoBodega.status == 201) {
          setMensaje("Sucursal creada exitosamente");
          setError(false);
          setTimeout(() => {
            buscarSucursales();
            setDatosSucursal({ nombre: "", direccion: "", estado: "" });
            setDatosBodega({
              nombre: "",
              capacidad: "",
              estado: "",
              idSucursal: "",
            });
            handleClose();
            setMensaje("");
          }, 1200);
        }
        if (resultadoBodega.status === 422) {
          setMensaje(
            "Sucursal creada, pero error al crear bodega principal: " +
              (resultadoBodega.data?.message ||
                resultadoBodega.error ||
                "Error desconocido.")
          );
          setError(true);
        }
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
    setDatosSucursal({ nombre: "", direccion: "", estado: "" });
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
          // style={{
          //   position: "absolute",
          //   top: 0,
          //   left: 0,
          //   width: "100%",
          //   height: "100%",
          //   backgroundColor: "rgba(255, 255, 255, 0.85)",
          //   display: "flex",
          //   flexDirection: "column",
          //   alignItems: "center",
          //   justifyContent: "center",
          //   zIndex: 10,
          //   borderRadius: "var(--bs-modal-border-radius)",
          // }}
          >
            <Alert variant={error ? "danger" : "success"}>{mensaje}</Alert>
          </div>
        )}
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese nombre"
                  name="nombre"
                  value={datosSucursal.nombre}
                  onChange={handleChangeSucursal}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  as="select"
                  name="estado"
                  value={datosSucursal.estado}
                  onChange={handleChangeSucursal}
                  required
                >
                  <option value="">Seleccione un estado</option>
                  <option value="Abierta">Abierta</option>
                  <option value="Cerrada">Cerrada</option>
                  <option value="Mantencion">Mantencion</option>
                  <option value="Eliminada">Eliminada</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese dirección de la sucursal"
                name="direccion"
                value={datosSucursal.direccion}
                onChange={handleChangeSucursal}
                required
              />
            </Form.Group>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre Bodega Principal</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese nombre"
                  name="nombre"
                  value={datosBodega.nombre}
                  onChange={handleChangeBodega}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Capacidad Bodega (m²)</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  max={10000}
                  placeholder="Ingrese capacidad"
                  name="capacidad"
                  value={datosBodega.capacidad}
                  onChange={handleChangeBodega}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Form.Group className="mb-3">
              <Form.Label>Estado Bodega</Form.Label>
              <Form.Select
                as="select"
                name="estado"
                value={datosBodega.estado}
                onChange={handleChangeBodega}
                required
              >
                <option value="">Seleccione un estado</option>
                <option value="En Funcionamiento">En Funcionamiento</option>
                <option value="En Mantenimiento">En Mantenimiento</option>
                <option value="Fuera de Servicio">Fuera de Servicio</option>
                <option value="Eliminado">Eliminado</option>
              </Form.Select>
            </Form.Group>
          </Row>
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
