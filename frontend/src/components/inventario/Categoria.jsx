// src/pages/inventario/Categoria.jsx

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Alert, Card } from "react-bootstrap";
import obtenerCategoria, {
  crearCategoria,
} from "../../services/inventario/Categorias.service";
import AgregarCategoria from "../../components/inventario/modalCategoria/AgregarCategoria"; // Asegúrate que la ruta sea correcta

export default function Categoria() {
  const [categorias, setCategorias] = useState([]);
  const [modalCrear, setModalCrear] = useState(false);

  // Estados para feedback al usuario, igual que en Productos
  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  // Estado unificado para el formulario
  const [datos, setDatos] = useState({
    nombre: "",
    descripcion: "",
    estado: "",
  });

  const buscarCategorias = async () => {
    try {
      setLoading(true);
      setError(false);
      const respuesta = await obtenerCategoria();

      if (respuesta.code) {
        setError(true);
        setMensaje(respuesta.error || "Error al cargar categorías.");
      } else {
        setCategorias(respuesta);
        if (respuesta.length === 0) {
          setMensaje("No hay categorías disponibles, por favor crea una.");
        }
      }
    } catch (err) {
      setError(true);
      setMensaje("Error de conexión al cargar las categorías.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarCategorias();
  }, []);

  // Función genérica para manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
  };

  // Abre el modal de creación y resetea estados
  const handleCrear = () => {
    setError(false);
    setMensaje("");
    setModalCrear(true);
  };

  // Cierra el modal y resetea el formulario
  const handleCerrarModal = () => {
    setModalCrear(false);
    setDatos({ nombre: "", descripcion: "", estado: "" });
  };

  // Maneja el envío del formulario para crear una nueva categoría
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const resultado = await crearCategoria(datos);
      console.log("Respuesta al crear", resultado);
      if (resultado.status === 201) {
        setMensaje("Categoría creada exitosamente");
        setError(false);
        handleCerrarModal();
        await buscarCategorias(); // Recarga la lista
      } else {
        setError(true);
        setMensaje(resultado.error || "Error al crear la categoría.");
      }
    } catch (err) {
      setError(true);
      setMensaje("Error de conexión al crear la categoría.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={{ marginTop: "30px" }}>
      {/* Encabezado */}
      <Row className="mb-4">
        <Col className="text-center">
          <h2>Gestión de Categorías</h2>
          <p className="text-muted">
            Aquí puedes gestionar las categorías de tu inventario.
          </p>
        </Col>
      </Row>

      {/* Mensajes de Alerta */}
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
            + Agregar Categoría
          </Button>
        </Col>
        <Col md={4}>
          <Button variant="warning" className="w-100" disabled>
            ✎ Modificar Categoría
          </Button>
        </Col>
        <Col md={4}>
          <Button variant="danger" className="w-100" disabled>
            − Eliminar Categoría
          </Button>
        </Col>
      </Row>

      {/* Lista de Categorías */}
      <Row>
        {loading ? (
          <Col className="text-center">
            <p>Cargando categorías...</p>
          </Col>
        ) : (
          categorias.length > 0 &&
          categorias.map((categoria) => (
            <Col key={categoria.id} md={4} className="mb-3">
              <Card>
                <Card.Body>
                  <Card.Title>{categoria.nombre}</Card.Title>
                  <Card.Text>
                    <strong>Estado:</strong> {categoria.estado}
                  </Card.Text>
                  {/* Aquí podrías agregar botones de editar/eliminar por tarjeta */}
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Componente Modal */}
      <AgregarCategoria
        show={modalCrear}
        handleClose={handleCerrarModal}
        handleSubmit={handleSubmit}
        datos={datos}
        handleChange={handleChange}
        loading={loading}
      />
    </Container>
  );
}
