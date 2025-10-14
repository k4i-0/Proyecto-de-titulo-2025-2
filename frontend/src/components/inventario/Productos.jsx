import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";

import obtenerProductos from "../../services/inventario/Productos.service";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [modalCrear, setModalCrear] = useState(false);
  const buscarProducto = async () => {
    const respuesta = await obtenerProductos();
    if (respuesta) {
      setProductos(respuesta.data);
    }
  };
  useEffect(() => {
    buscarProducto();
  }, []);

  const handleCrear = () => {
    console.log("Crear producto");
    setModalCrear(true);
  };

  return (
    <Container style={{ textAlign: "center", marginTop: "30px" }}>
      <Row>
        <Col>
          <h2>Gestión de Productos</h2>
          <p>Aquí puedes gestionar los productos de tu inventario.</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button variant="primary" onClick={() => handleCrear()}>
            + Agregar Producto
          </Button>
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
      {modalCrear && (
        <div
          style={{
            textAlign: "center",
            maxWidth: "400px",
            margin: "auto",
            marginTop: "30px",
            maxHeight: "600px",
            height: "600px",
          }}
        >
          <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>codigo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese codigo del producto"
              />
              <Form.Label>nombre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese nombre del producto"
              />
              <Form.Label>precioCompra</Form.Label>
              <Form.Control
                type="number"
                placeholder="Ingrese precio de compra del producto"
              />
              <Form.Label>precioVenta</Form.Label>
              <Form.Control
                type="number"
                placeholder="Ingrese precio de venta del producto"
              />
              <Form.Label>peso</Form.Label>
              <Form.Control
                type="number"
                placeholder="Ingrese peso del producto"
              />
              <Form.Label>Descripcion</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese descripcion del producto"
              />
              <Form.Label>Estado</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese estado del producto"
              />
              <Form.Label>idcategoria</Form.Label>
              <Form.Control
                type="number"
                placeholder="Ingrese idcategoria del producto"
              />
              <Button
                variant="primary"
                type="submit"
                style={{ marginTop: "20px" }}
              />
            </Form.Group>
          </Form>
        </div>
      )}
    </Container>
  );
}
