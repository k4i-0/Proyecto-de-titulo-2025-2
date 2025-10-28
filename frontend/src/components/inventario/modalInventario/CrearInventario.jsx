// src/components/inventario/modalInventario/CrearInventario.jsx

import { useState, useEffect } from "react";
import { Row, Col, Button, Form, Modal, Alert, Spinner } from "react-bootstrap";

// Asumo que estos servicios existen y se pueden importar
import { crearInventarios } from "../../../services/inventario/Inventario.service";
import obtenerProductos from "../../../services/inventario/Productos.service"; // ¡Necesario!

export default function CrearInventario({
  show,
  handleClose,
  buscarInventarios,
}) {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);

  // Estados para las listas de los 'selects'
  const [productos, setProductos] = useState([]);
  const [lotes, setLotes] = useState([]);

  const estadoInicial = {
    idProducto: "",
    estado: "",
    idLote: "",
    stock: "",
  };
  const [datos, setDatos] = useState(estadoInicial);

  // Carga productos y lotes cuando se abre el modal
  useEffect(() => {
    if (show) {
      const cargarDependencias = async () => {
        setLoading(true);
        try {
          // Carga ambas listas en paralelo
          const [resProductos] = await Promise.all([obtenerProductos()]);

          setProductos(resProductos.length ? resProductos : []);
        } catch (err) {
          setError(true);
          setMensaje("Error al cargar productos o bodegas");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      cargarDependencias();
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const datosAEnviar = {
        ...datos,
        stock: parseInt(datos.stock, 10), // Asegurar que el stock sea un número
      };
      const resultado = await crearInventarios(datosAEnviar);

      if (resultado.status === 201) {
        setMensaje("Stock asignado exitosamente");
        setError(false);
        setTimeout(() => {
          buscarInventarios();
          setDatos(estadoInicial);
          handleClose();
          setMensaje("");
        }, 1200);
      } else {
        setError(true);
        setMensaje(resultado.data?.message || "Error al asignar stock.");
      }
    } catch (err) {
      setError(true);
      setMensaje(err.response?.data?.message || "Error de conexión.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarModal = () => {
    setMensaje("");
    setError(false);
    setDatos(estadoInicial);
    setProductos([]);

    handleClose();
  };

  return (
    <Modal show={show} onHide={handleCerrarModal} centered size="lg">
      {loading ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            borderRadius: "var(--bs-modal-border-radius)",
          }}
        >
          <Spinner animation="grow" />
          <p>Cargando...</p>
        </div>
      ) : null}
      <Modal.Header closeButton>
        <Modal.Title>Asignar Stock a Bodega</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {mensaje && !loading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              borderRadius: "var(--bs-modal-border-radius)",
            }}
          >
            <Alert variant={error ? "danger" : "success"}>{mensaje}</Alert>
          </div>
        )}
        <Form onSubmit={handleSubmit} className="text-center">
          <Row>
            <Col>
              <Form.Group className="mb-3 ">
                <Form.Label>Producto *</Form.Label>
                <Form.Select
                  as="select"
                  name="idProducto"
                  value={datos.idProducto}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un producto</option>
                  {productos.map((p) => (
                    <option key={p.idProducto} value={p.idProducto}>
                      {p.nombre} (SKU: {p.codigo})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Stock *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese stock"
                  name="stock"
                  value={datos.stock}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group className="mb-3 ">
                <Form.Label>Estado Producto *</Form.Label>
                <Form.Select
                  as="select"
                  name="estado"
                  value={datos.estado}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione estado</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Lote *</Form.Label>
                <Form.Select
                  as="select"
                  name="idLote"
                  value={datos.idLote}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un lote</option>
                  {lotes.map((l) => (
                    <option key={l.idLote} value={l.idLote}>
                      {l.nombre} (SKU: {l.codigo})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleCerrarModal}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Asignando..." : "Asignar Stock"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
