// src/components/inventario/Inventario.jsx

import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  ButtonGroup,
  Alert,
  Card,
  Placeholder, // <-- Importado para el loading
} from "react-bootstrap";

// Asumo que estos servicios existen y están en la ruta correcta
import obtenerInventarios, {
  eliminarInventario,
} from "../../services/inventario/Inventario.service";

// Modales
import CrearInventario from "./modalInventario/CrearInventario";
import EditarInventario from "./modalInventario/EditarInventario";

export default function Inventario() {
  const [inventarios, setInventarios] = useState([]);
  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const [inventarioSelect, setInventarioSelect] = useState(null);

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);

  const buscarInventarios = async () => {
    try {
      setLoading(true);
      setError(false);
      setMensaje("");
      const respuesta = await obtenerInventarios();
      console.log("Respuesta inventarios:", respuesta);
      if (respuesta.code) {
        setError(true);
        setMensaje(respuesta.error);
      } else {
        if (respuesta.length === 0) {
          setMensaje(
            "No hay stock registrado, por favor crea una entrada de inventario"
          );
        }
        setInventarios(respuesta);
      }
    } catch (error) {
      setError(true);
      setMensaje("Error al cargar datos de inventario");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarInventarios();
  }, []);

  const handleCerrarModal = () => {
    setModalCrear(false);
    setModalEditar(false);
    setInventarioSelect(null);
  };

  const handleCrear = () => {
    setError(false);
    setMensaje("");
    setModalCrear(true);
  };

  const handleEditar = (inventario) => {
    setError(false);
    setInventarioSelect(inventario);
    setMensaje("");
    setModalEditar(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta entrada de stock?")) {
      return;
    }

    setLoading(true);
    setError(false);
    setMensaje("");
    try {
      // Asumo que tienes un servicio 'eliminarInventario'
      const respuesta = await eliminarInventario(id);
      if (respuesta.status === 200) {
        setMensaje("Entrada de inventario eliminada exitosamente");
        setError(false);
        await buscarInventarios();
      } else {
        setError(true);
        setMensaje(respuesta.error || "Error al eliminar la entrada.");
      }
    } catch (error) {
      setError(true);
      setMensaje("Error de conexión al eliminar la entrada.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={{ marginTop: "30px" }}>
      <Row className="mb-4">
        <Col className="text-center">
          <h2>Gestión de Inventario</h2>
          <p className="text-muted">
            Aquí puedes gestionar el stock de productos en tus bodegas
          </p>
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
            Añadir Inventario
          </Button>
        </Col>
      </Row>
      <Row>
        {
          loading && inventarios.length === 0
            ? [...Array(3)].map((_, index) => (
                <Col md={4} className="mb-4" key={index}>
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
                      <ButtonGroup className="w-100">
                        <Placeholder.Button variant="warning" xs={6} />
                        <Placeholder.Button variant="danger" xs={6} />
                      </ButtonGroup>
                    </Card.Footer>
                  </Card>
                </Col>
              ))
            : inventarios.length > 0
            ? inventarios.map((inventario) => (
                <Col key={inventario.idInventario} md={4} className="mb-4">
                  {" "}
                  {/* Asumo 'idInventario' como key */}
                  <Card>
                    <Card.Body>
                      {/* Asumo que los datos vienen anidados */}
                      <Card.Title>{inventario?.nombre}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        Codigo: {inventario?.idInventario}
                      </Card.Subtitle>
                      <Card.Text>
                        <strong>Codigo Bodega:</strong> {inventario?.idBodega}
                        <br />
                        <strong>Codigo Producto:</strong>{" "}
                        {inventario?.idProducto}
                        <br />
                        <strong>Encargado:</strong> {inventario?.encargado}
                        <br />
                        <strong>Stock Actual:</strong> {inventario.stock}{" "}
                        unidades
                        <br />
                        <strong>Estado:</strong> {inventario?.estado}
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                      <ButtonGroup className="w-100">
                        <Button
                          variant="warning"
                          onClick={() => handleEditar(inventario)}
                          disabled={true}
                        >
                          Modificar Stock
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() =>
                            handleEliminar(inventario.idInventario)
                          }
                          disabled={loading}
                        >
                          Eliminar
                        </Button>
                      </ButtonGroup>
                    </Card.Footer>
                  </Card>
                </Col>
              ))
            : !loading && (
                <Col>
                  <p>{mensaje}</p>
                </Col>
              ) // Muestra el mensaje si no hay datos
        }
      </Row>

      {/* Modales */}
      <CrearInventario
        show={modalCrear}
        handleClose={handleCerrarModal}
        buscarInventarios={buscarInventarios}
      />
      <EditarInventario
        show={modalEditar}
        handleClose={handleCerrarModal}
        inventario={inventarioSelect}
        buscarInventarios={buscarInventarios}
      />
    </Container>
  );
}
