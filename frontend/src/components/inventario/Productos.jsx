import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Alert,
  Modal,
} from "react-bootstrap";

import obtenerProductos from "../../services/inventario/Productos.service";
import obtenerCategoria from "../../services/inventario/Categorias.service";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modalCrear, setModalCrear] = useState(false);
  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [datos, setDatos] = useState({
    codigo: "",
    nombre: "",
    precioCompra: "",
    precioVenta: "",
    peso: "",
    descripcion: "",
    estado: "",
    idcategoria: "",
  });

  const buscarProducto = async () => {
    try {
      setLoading(true);
      const respuesta = await obtenerProductos();
      const respuesta2 = await obtenerCategoria();

      if (respuesta.code) {
        setError(true);
        setMensaje(respuesta.error);
      } else {
        setProductos(respuesta);
      }

      if (respuesta2.code) {
        setError(true);
        setMensaje(respuesta2.error);
      } else {
        setCategorias(respuesta2);
      }
    } catch (err) {
      setError(true);
      setMensaje("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarProducto();
  }, []);

  const handleCrear = () => {
    setError(false);
    setMensaje("");
    setModalCrear(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos({
      ...datos,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const resultado = await crearProducto(datos);

      if (resultado.success) {
        setMensaje("Producto creado exitosamente");
        setError(false);
        setModalCrear(false);
        setDatos({
          codigo: "",
          nombre: "",
          precioCompra: "",
          precioVenta: "",
          peso: "",
          descripcion: "",
          estado: "",
          idcategoria: "",
        });
        await buscarProducto();
      } else {
        setError(true);
        setMensaje(resultado.error || "Error al crear producto");
      }
    } catch (err) {
      setError(true);
      setMensaje("Error al crear producto");
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarModal = () => {
    setModalCrear(false);
    setDatos({
      codigo: "",
      nombre: "",
      precioCompra: "",
      precioVenta: "",
      peso: "",
      descripcion: "",
      estado: "",
      idcategoria: "",
    });
  };

  return (
    <Container style={{ marginTop: "30px" }}>
      {/* Encabezado */}
      <Row className="mb-4">
        <Col className="text-center">
          <h2>Gestión de Productos</h2>
          <p className="text-muted">
            Aquí puedes gestionar los productos de tu inventario
          </p>
        </Col>
      </Row>

      {/* Mensajes */}
      {mensaje && (
        <Row className="mb-3">
          <Col>
            <Alert
              variant={error ? "danger" : "success"}
              dismissible
              onClose={() => setMensaje("")}>
              {mensaje}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Botones de acción */}
      <Row className="mb-4">
        <Col md={4}>
          <Button
            variant="primary"
            onClick={handleCrear}
            disabled={loading}
            className="w-100">
            + Agregar Producto
          </Button>
        </Col>
        <Col md={4}>
          <Button variant="warning" className="w-100" disabled>
            ✎ Modificar Producto
          </Button>
        </Col>
        <Col md={4}>
          <Button variant="danger" className="w-100" disabled>
            − Eliminar Producto
          </Button>
        </Col>
      </Row>

      {/* Lista de productos */}
      <Row>
        {loading ? (
          <Col className="text-center">
            <p>Cargando productos...</p>
          </Col>
        ) : productos.length > 0 ? (
          productos.map((producto) => (
            <Col key={producto.id} md={4} className="mb-3">
              <Card>
                <Card.Body>
                  <Card.Title>{producto.nombre}</Card.Title>
                  <Card.Text>
                    <strong>Código:</strong> {producto.codigo}
                    <br />
                    <strong>Precio:</strong> ${producto.precioVenta}
                    <br />
                    <strong>Estado:</strong> {producto.estado}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col className="text-center">
            <p className="text-muted" style={{ marginTop: "50px" }}>
              No hay productos disponibles
            </p>
          </Col>
        )}
      </Row>

      {/* Modal de Creación */}
      <Modal show={modalCrear} onHide={handleCerrarModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Crear Nuevo Producto</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Código *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingrese código del producto"
                    name="codigo"
                    value={datos.codigo}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingrese nombre del producto"
                    name="nombre"
                    value={datos.nombre}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Precio Compra *</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0.00"
                    name="precioCompra"
                    value={datos.precioCompra}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Precio Venta *</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0.00"
                    name="precioVenta"
                    value={datos.precioVenta}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Peso (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0.00"
                    name="peso"
                    value={datos.peso}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Estado *</Form.Label>
                  <Form.Control
                    as="select"
                    name="estado"
                    value={datos.estado}
                    onChange={handleChange}
                    required>
                    <option value="">Seleccione estado</option>
                    <option value="Bueno">Bueno</option>
                    <option value="Malo">Malo</option>
                    <option value="Dañado">Dañado</option>
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Ingrese descripción del producto"
                name="descripcion"
                value={datos.descripcion}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Categoría *</Form.Label>
              <Form.Control
                as="select"
                name="idcategoria"
                value={datos.idcategoria}
                onChange={handleChange}
                required>
                <option value="">Seleccione una categoría</option>
                {categorias.length > 0 &&
                  categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCerrarModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creando..." : "Crear Producto"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
