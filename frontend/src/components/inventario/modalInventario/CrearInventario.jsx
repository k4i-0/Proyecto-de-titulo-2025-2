// src/components/inventario/modalInventario/CrearInventario.jsx

import { useState, useEffect } from "react";
import { Row, Col, Button, Form, Modal, Alert, Spinner } from "react-bootstrap";

// Asumo que estos servicios existen y se pueden importar
import { crearInventarios } from "../../../services/inventario/Inventario.service";
import obtenerProductos from "../../../services/inventario/Productos.service"; // ¡Necesario!
import obtenerBodegas from "../../../services/inventario/Bodega.service"; // ¡Necesario!

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
  const [bodegas, setBodegas] = useState([]);

  const estadoInicial = {
    nombre: "",
    fechaCreacion: new Date(),
    encargado: "",
    estado: "",
    idProducto: "",
    idBodega: "",
    stock: "",
  };
  const [datos, setDatos] = useState(estadoInicial);

  // Carga productos y bodegas cuando se abre el modal
  useEffect(() => {
    if (show) {
      const cargarDependencias = async () => {
        setLoading(true);
        try {
          // Carga ambas listas en paralelo
          const [resProductos, resBodegas] = await Promise.all([
            obtenerProductos(),
            obtenerBodegas(),
          ]);

          setProductos(resProductos.length ? resProductos : []);
          setBodegas(resBodegas.length ? resBodegas : []);
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
    setProductos([]); // Limpia listas
    setBodegas([]); // Limpia listas
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
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingrese nombre"
              name="nombre"
              value={datos.nombre}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Encargado *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingrese nombre del encargado"
              name="encargado"
              value={datos.encargado}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Producto *</Form.Label>
            <Form.Control
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
            </Form.Control>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Bodega *</Form.Label>
            <Form.Control
              as="select"
              name="idBodega"
              value={datos.idBodega}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione una bodega</option>
              {bodegas.map((b) => (
                <option key={b.idBodega} value={b.idBodega}>
                  {b.nombre} ({b.ubicacion})
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Stock Inicial *</Form.Label>
            <Form.Control
              type="number"
              placeholder="Ingrese la cantidad de stock"
              name="stock"
              value={datos.stock}
              onChange={handleChange}
              required
              min="0"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Estado *</Form.Label>
            <Form.Control
              as="select"
              name="estado"
              value={datos.estado}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione estado</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </Form.Control>
          </Form.Group>
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
