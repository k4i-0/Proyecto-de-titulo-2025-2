import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  ButtonGroup,
  Alert,
  Card,
} from "react-bootstrap";

import obtenerInventarios from "../../services/inventario/Inventario.service";

export default function Inventario() {
  const [inventarios, setInventarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [bodegas, setBodegas] = useState([]);

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);

  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const buscarInventarios = async () => {
    try {
      setLoading(true);
      const respuesta = await obtenerInventarios();
      if (respuesta.code) {
        setError(true);
        setMensaje(respuesta.error);
      } else {
        if (respuesta.length === 0) {
          setMensaje(
            "No hay inventarios disponibles, por favor crea un inventario"
          );
        }
        setInventarios(respuesta);
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
    buscarInventarios();
  }, []);

  const handleCrear = () => {
    setError(false);
    setMensaje("");
    setModalCrear(true);
  };
  return (
    <Container style={{ marginTop: "30px" }}>
      <Row className="mb-4">
        <Col className="text-center">
          <h2>Gestión de Inventario</h2>
          <p className="text-muted">Aquí puedes gestionar tu inventario</p>
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
            Crear Inventario
          </Button>
        </Col>
      </Row>
      <Row>
        {loading ? (
          <Col className="text-center">
            <p>Cargando productos...</p>
          </Col>
        ) : inventarios.length > 0 ? (
          inventarios.map((inventario) => (
            <Col key={inventario.id} md={4} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>{inventario.nombre}</Card.Title>
                  <Card.Text>
                    <strong>Código:</strong> {inventario.codigo}
                    <br />
                    <strong>Precio:</strong> ${inventario.precioVenta}
                    <br />
                    <strong>Estado:</strong> {inventario.estado}
                    <br />
                    <strong>IdCategoria:</strong> {inventario.idCategoria}
                    <br />
                    <strong>Nombre Categoria:</strong>
                    {inventario.categoria.nombre}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : null}
      </Row>
    </Container>
  );
}
