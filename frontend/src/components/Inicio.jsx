import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";

//funciones
import obtenerSucursales from "../services/inventario/Sucursal.service";

export default function Inicio({ nombreRol, onCambiarVista }) {
  const [flag, setFlag] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const consultaSucursal = async () => {
      const respuesta = await obtenerSucursales();
      console.log(respuesta);
      if (respuesta.status === 200) {
        setFlag(false);
        setMensaje("");
      }
      if (respuesta.status === 204) {
        setFlag(true);
        setMensaje(
          "No existen sucursales disponibles, debe crear una sucursal"
        );
      }
    };
    consultaSucursal();
  }, []);
  return (
    <Container>
      {flag && <Alert variant="warning">{mensaje}</Alert>}
      <Row className="justify-content-md-center">
        <Col md="4" className="text-center">
          <h2>Bienvenido {nombreRol}</h2>
          <p>Gestiona tu negocio de manera eficiente.</p>
        </Col>
      </Row>
      <Row className="justify-content-md-center">
        <Col md="4">
          <Card className="text-center mt-5">
            <Card.Body>
              <Card.Title>Gestiona tu sucursal</Card.Title>
              <Card.Text>
                Gestiona tu Sucursal y demás bodegas asociadas.
              </Card.Text>
              <Button
                variant="primary"
                onClick={() => onCambiarVista("sucursal")}
              >
                Ir a Sucursal
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md="4">
          <Card className="text-center mt-5">
            <Card.Body>
              <Card.Title>Gestiona tu Inventario</Card.Title>
              <Card.Text>
                Administra productos, categorías y stock de manera eficiente.
              </Card.Text>
              <Button
                variant="primary"
                disabled={flag}
                onClick={() => onCambiarVista("inventario")}
              >
                Ir a Inventario
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md="4">
          <Card className="text-center mt-5">
            <Card.Body>
              <Card.Title>Gestiona tu proveedor</Card.Title>
              <Card.Text>
                Administra tus proveedores y su apartado de manera eficiente.
              </Card.Text>
              <Button
                disabled={flag}
                variant="primary"
                onClick={() => onCambiarVista("proveedor")}
              >
                Ir a Proveedores
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
