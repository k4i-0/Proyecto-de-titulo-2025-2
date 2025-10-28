import React from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Navbar,
  Nav,
  NavDropdown,
} from "react-bootstrap";

export default function Navegacion({ nombreRol, onLogout, onCambiarVista }) {
  console.log("Usuario en Navegacion:", nombreRol);
  return (
    <Navbar
      className="justify-content-center"
      style={{
        padding: "10px",
        paddingLeft: "100px",
        paddingRight: "100px",
        margin: "40px",
      }}
    >
      <Container className="justify-content-left">
        <Navbar.Brand href="/dashboard" onClick={() => onCambiarVista("home")}>
          Negocios Rancaguinos
        </Navbar.Brand>
      </Container>

      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link onClick={() => onCambiarVista("home")}>Home</Nav.Link>

          <NavDropdown title="Inventario" id="inventario-dropdown">
            <NavDropdown.Item onClick={() => onCambiarVista("productos")}>
              Productos
            </NavDropdown.Item>
            <NavDropdown.Item onClick={() => onCambiarVista("categorias")}>
              Categorías
            </NavDropdown.Item>
            <NavDropdown.Item onClick={() => onCambiarVista("inventario")}>
              Inventario
            </NavDropdown.Item>
            <NavDropdown.Item onClick={() => onCambiarVista("sucursal")}>
              Sucursal
            </NavDropdown.Item>
            <NavDropdown.Item onClick={() => onCambiarVista("bodega")}>
              Bodega
            </NavDropdown.Item>
          </NavDropdown>

          <NavDropdown title="Ventas" id="ventas-dropdown">
            <NavDropdown.Item disabled onClick={() => onCambiarVista("ventas")}>
              Gestionar Ventas
            </NavDropdown.Item>
            <NavDropdown.Item
              disabled
              onClick={() => onCambiarVista("clientes")}
            >
              Clientes
            </NavDropdown.Item>
          </NavDropdown>
          <NavDropdown title={nombreRol} id="basic-nav-dropdown">
            <NavDropdown.Item href="#action/3.1">Perfil</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={() => onLogout()}>
              Cerrar Sesión
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
