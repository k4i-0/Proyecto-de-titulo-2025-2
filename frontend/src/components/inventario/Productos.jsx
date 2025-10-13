import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";

import obtenerProductos from "../../services/inventario/Productos.service";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const buscarProducto = async () => {
    const respuesta = await obtenerProductos();
    if (respuesta) {
      setProductos(respuesta.data);
    }
  };
  useEffect(() => {
    buscarProducto();
  }, [productos]);

  return (
    <Container style={{ textAlign: "center", marginTop: "80px" }}>
      <Row>
        <Col>
          <h2>Gestión de Productos</h2>
          <p>Aquí puedes gestionar los productos de tu inventario.</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button variant="primary"> + Agregar Producto</Button>
        </Col>
        <Col>
          <Button variant="primary"> + Modificar Producto</Button>
        </Col>
        <Col>
          <Button variant="primary"> - Eliminar Producto</Button>
        </Col>
      </Row>
      <Row>
        {productos.map((producto) => (
          <Col key={producto.id}>
            <div>
              <h5>{producto.nombre}</h5>
            </div>
          </Col>
        ))}
      </Row>
      <Row></Row>
    </Container>
  );
}
