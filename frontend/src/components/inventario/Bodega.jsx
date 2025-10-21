import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  ButtonGroup,
  Alert,
  Card,
  Placeholder,
} from "react-bootstrap";

import obtenerBodegas, {
  eliminarBodega,
} from "../../services/inventario/Bodega.service";

//modales
import CrearBodega from "./modalBodega/crearBodega";
import EditarBodega from "./modalBodega/editarBodega";

export default function Bodega() {
  const [bodegas, setBodegas] = useState([]);
  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const [bodegaSelect, setBodegaSelect] = useState(null);

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  //const [modalEliminar, setModalEliminar] = useState(false);
  const buscarBodegas = async () => {
    try {
      setLoading(true);
      const respuesta = await obtenerBodegas();
      console.log("Respuesta bodegas:", respuesta);
      if (respuesta.code) {
        setError(true);
        setMensaje(respuesta.error);
      } else {
        if (respuesta.length === 0) {
          setMensaje("No hay bodegas disponibles, por favor crea una bodega");
        }
        setBodegas(respuesta);
      }
    } catch (error) {
      setError(true);
      setMensaje("Error al cargar datos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarBodegas();
  }, []);

  const handleCerrarModal = () => {
    setModalCrear(false);

    // setDatos({ nombre: "", descripcion: "", estado: "" });
  };

  const handleCrear = () => {
    setError(false);
    setMensaje("");
    setModalCrear(true);
  };

  const handleEditar = (bodega) => {
    setError(false);
    setBodegaSelect(bodega);
    setMensaje("");
    setModalEditar(true);
  };

  const handleEliminar = async (id) => {
    try {
      const respuesta = await eliminarBodega(id);
      if (respuesta.status === 200) {
        setMensaje("Bodega eliminada exitosamente");
        setError(false);
        await buscarBodegas();
      } else {
        setError(true);
        setMensaje(respuesta.error || "Error al eliminar la bodega.");
      }
    } catch (error) {
      setError(true);
      setMensaje("Error de conexión al eliminar la bodega.");
      console.error(error);
    }
  };

  return (
    <Container style={{ marginTop: "30px" }}>
      <Row className="mb-4">
        <Col className="text-center">
          <h2>Gestión de Bodegas</h2>
          <p className="text-muted">Aquí puedes gestionar tus bodegas</p>
        </Col>
      </Row>
      {mensaje && (
        <Row className="mb-3">
          <Col>
            <Alert
              variant={error ? "danger" : "success"}
              dismissible
              onClose={() => setMensaje("")}
            >
              {mensaje}
            </Alert>
          </Col>
        </Row>
      )}
      {/* Botones de acción */}
      <Row className="mb-4">
        <Col md={3}>
          <Button
            variant="primary"
            onClick={handleCrear}
            disabled={loading}
            className="w-100"
          >
            Crear Bodega
          </Button>
        </Col>
      </Row>
      <Row>
        {loading ? (
          <Col className="text-center">
            <p>Cargando bodegas...</p>
          </Col>
        ) : bodegas.length > 0 ? (
          bodegas.map((bodega) => (
            <Col key={bodega.idBodega} md={4} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>{bodega.nombre}</Card.Title>
                  <Card.Text>
                    <strong>Bodega:</strong> {bodega.idBodega}
                    <br />
                    <strong>Ubicación:</strong> {bodega.ubicacion}
                    <br />
                    <strong>Capacidad:</strong> {bodega.capacidad}
                    <br />
                    <strong>Estado:</strong> {bodega.estado}
                  </Card.Text>
                </Card.Body>
                <Card.Footer>
                  <ButtonGroup className="w-100">
                    <Button
                      variant="warning"
                      onClick={() => handleEditar(bodega)}
                    >
                      Modificar Bodega
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleEliminar(bodega.idBodega)}
                    >
                      Eliminar Bodega
                    </Button>
                  </ButtonGroup>
                </Card.Footer>
              </Card>
            </Col>
          ))
        ) : (
          <Col md={4} className="mb-4">
            <Card>
              <Card.Body>
                <Placeholder as={Card.Title} animation="glow">
                  <Placeholder xs={6} />
                </Placeholder>

                <Placeholder as={Card.Text} animation="glow">
                  <Placeholder xs={7} /> <br />
                  <Placeholder xs={4} /> <br />
                  <Placeholder xs={4} /> <br />
                  <Placeholder xs={6} />
                </Placeholder>
              </Card.Body>
              <Card.Footer>
                <Placeholder.Button variant="primary" xs={6} />
                <Placeholder.Button variant="danger" xs={6} />
              </Card.Footer>
            </Card>
          </Col>
        )}
      </Row>
      <CrearBodega
        show={modalCrear}
        handleClose={handleCerrarModal}
        funcionBuscarCategorias={buscarBodegas}
      />
      <EditarBodega
        show={modalEditar}
        bodegas={bodegaSelect}
        handleClose={handleCerrarModal}
        funcionBuscarCategorias={buscarBodegas}
      />
    </Container>
  );
}
