import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Placeholder,
  Button,
} from "react-bootstrap";

export default function Inicio({ nombreRol, onCambiarVista }) {
  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md="4" className="text-center">
          <h2>Bienvenido {nombreRol}</h2>
          <p>Que hacemos Hoy?</p>
        </Col>
      </Row>
      <Row className="justify-content-md-center">
        <Col md="4">
          <Card className="text-center mt-5">
            <Card.Body>
              <Card.Title>Gestiona tu Inventario</Card.Title>
              <Card.Text>
                Administra productos, categorías y stock de manera eficiente.
              </Card.Text>
              <Button
                variant="primary"
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
              <Card.Title>Gestiona tu Sucursales</Card.Title>
              <Card.Text>
                Administra tus sucursales y su inventario de manera eficiente.
              </Card.Text>
              <Button
                variant="primary"
                onClick={() => onCambiarVista("sucursal")}
              >
                Ir a Sucursales
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
