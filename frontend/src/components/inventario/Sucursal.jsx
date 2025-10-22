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

import CrearSucursal from "./modalSucursal/CrearSucursal";
import EditarSucursal from "./modalSucursal/EditarSucursal";

import obtenerSucursales, {
  eliminarSucursal,
} from "../../services/inventario/Sucursal.service";

export default function Sucursal() {
  const [sucursales, setSucursales] = useState([]);
  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const [sucursalSelect, setSucursalSelect] = useState(null);

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);

  const buscarSucursales = async () => {
    try {
      setLoading(true);
      setError(false);
      setMensaje("");
      const respuesta = await obtenerSucursales();
      console.log("Respuesta sucursales:", respuesta);
      if (respuesta.code) {
        setError(true);
        setMensaje(respuesta.error);
      } else {
        if (respuesta.length === 0) {
          setMensaje(
            "No hay sucursales disponibles, por favor crea una sucursal"
          );
        }
        setSucursales(respuesta);
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
    buscarSucursales();
  }, []);

  const handleCerrarModal = () => {
    setModalCrear(false);
    setModalEditar(false);
    setSucursalSelect(null);
    // setDatos({ nombre: "", descripcion: "", estado: "" });
  };

  const handleCrear = () => {
    setError(false);
    setMensaje("");
    setModalCrear(true);
  };

  const handleEditar = (sucursal) => {
    setError(false);
    setSucursalSelect(sucursal);
    setMensaje("");
    setModalEditar(true);
  };

  const handleEliminar = async (id) => {
    setLoading(true);
    setError(false);
    setMensaje("");
    try {
      const respuesta = await eliminarSucursal(id);
      if (respuesta.status === 200) {
        setMensaje("Sucursal eliminada exitosamente");
        setError(false);
        await buscarSucursales();
      } else {
        setError(true);
        setMensaje(respuesta.error || "Error al eliminar la sucursal.");
      }
    } catch (error) {
      setError(true);
      setMensaje("Error de conexión al eliminar la sucursal.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Container style={{ marginTop: "30px" }}>
      <Row className="mb-4">
        <Col className="text-center">
          <h2>Gestión de Sucursales</h2>
          <p className="text-muted">Aquí puedes gestionar tus sucursales</p>
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
      <Row className="mb-4">
        <Col md={3}>
          <Button
            variant="primary"
            onClick={handleCrear}
            disabled={loading}
            className="w-100"
          >
            Crear Sucursal
          </Button>
        </Col>
      </Row>
      <Row>
        {loading ? (
          <Col className="text-center">
            <p>Cargando Sucursales...</p>
          </Col>
        ) : sucursales.length > 0 ? (
          sucursales.map((sucursal) => (
            <Col key={sucursal.idSucursal} md={4} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>{sucursal.nombre}</Card.Title>
                  <Card.Text>
                    <strong>Sucursal:</strong> {sucursal.idSucursal}
                    <br />
                    <strong>Ubicación:</strong> {sucursal.ubicacion}
                    <br />
                    <strong>telefono:</strong> {sucursal.telefono}
                    <br />
                    <strong>Estado:</strong> {sucursal.estado}
                  </Card.Text>
                </Card.Body>
                <Card.Footer>
                  <ButtonGroup className="w-100">
                    <Button
                      variant="warning"
                      onClick={() => handleEditar(sucursal)}
                      disabled={loading}
                    >
                      Modificar Sucursal
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleEliminar(sucursal.idSucursal)}
                      disabled={loading}
                    >
                      Eliminar Sucursal
                    </Button>
                  </ButtonGroup>
                </Card.Footer>
              </Card>
            </Col>
          ))
        ) : (
          // ) : (
          //   <Col md={4} className="mb-4">
          //     <Card>
          //       <Card.Body>
          //         <Placeholder as={Card.Title} animation="glow">
          //           <Placeholder xs={6} />
          //         </Placeholder>

          //         <Placeholder as={Card.Text} animation="glow">
          //           <Placeholder xs={7} /> <br />
          //           <Placeholder xs={4} /> <br />
          //           <Placeholder xs={4} /> <br />
          //           <Placeholder xs={6} />
          //         </Placeholder>
          //       </Card.Body>
          //       <Card.Footer>
          //         <Placeholder.Button variant="primary" xs={6} />
          //         <Placeholder.Button variant="danger" xs={6} />
          //       </Card.Footer>
          //     </Card>
          //   </Col>
          // )}
          !loading && (
            <Col>
              <p>No se encontraron sucursales.</p>
            </Col>
          )
        )}
      </Row>
      <CrearSucursal
        show={modalCrear}
        handleClose={handleCerrarModal}
        buscarSucursales={buscarSucursales}
      />
      <EditarSucursal
        show={modalEditar}
        handleClose={handleCerrarModal}
        sucursal={sucursalSelect}
        funcionBuscarSucursales={buscarSucursales}
      />
    </Container>
  );
}
