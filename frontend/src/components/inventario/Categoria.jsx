import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import obtenerCategoria, {
  crearCategoria,
} from "../../services/inventario/Categorias.service";

export default function Categoria() {
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState(true);
  const [modalCrear, setModalCrear] = useState(false);
  const [mensaje, setMensaje] = useState();

  const [datos, setDatos] = useState({
    nombre: "",
    descripcion: "",
    estado: "",
  });

  const buscarCategoria = async () => {
    const respuesta2 = await obtenerCategoria();
    //console.log("Categrias:", categorias);
    //console.log("error en categoria", respuesta2);
    if (respuesta2.code) {
      setMensaje(respuesta2.error);
    } else {
      //manejar cuando llegue categoria
      setCategorias(respuesta2);
    }
  };
  useEffect(() => {
    buscarCategoria();
  }, []);

  const handleCrear = () => {
    setError(false);
    setModalCrear(true);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos({
      ...datos,
      [name]: value,
    });
  };
  const handleCrearCategoria = async (e) => {
    e.preventDefault();

    try {
      const confirmacion = await crearCategoria(datos);
      //console.log(confirmacion);

      if (confirmacion) {
        // Recargar categorías
        await buscarCategoria();
        // Cerrar modal y limpiar formulario
        setModalCrear(false);
        setDatos({ nombre: "", descripcion: "", estado: "" });
        setMensaje("Categoría creada exitosamente");
      } else {
        setError(true);
        setMensaje(confirmacion.error || "Error al crear categoría");
      }
    } catch (error) {
      console.error("Error al crear categoría:", error);
      setError(true);
      setMensaje("Error al crear categoría");
    }
  };
  return (
    <Container style={{ textAlign: "center", marginTop: "30px" }}>
      <Row>
        <Col>
          <h2>Gestión de Categorias</h2>
          <p>Aquí puedes gestionar los categorias de tu inventario.</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button variant="primary" onClick={() => handleCrear()}>
            Agregar Categoria
          </Button>
        </Col>
        <Col>
          <Button variant="primary"> Modificar Categoria</Button>
        </Col>
        <Col>
          <Button variant="primary">Eliminar Categoria</Button>
        </Col>
      </Row>
      <Row>
        {categorias.length > 0 ? (
          categorias.map((categoria) => (
            <Col key={categoria.id} md={4} className="mb-3">
              <div
                className="border p-3 rounded"
                style={{ marginTop: "100px" }}
              >
                <h5>{categoria.nombre}</h5>
              </div>
            </Col>
          ))
        ) : (
          <Col>
            <p style={{ color: error ? "red" : "gray", marginTop: "50px" }}>
              {error ? mensaje : "No hay categorías disponibles"}
            </p>
          </Col>
        )}
      </Row>
      {modalCrear && (
        <div
          style={{
            position: "fixed",
            top: "60%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            width: "90%",
            maxWidth: "500px",
          }}
        >
          <Button
            variant="close"
            onClick={() => setModalCrear(false)}
            style={{ position: "absolute", top: "10px", right: "10px" }}
          >
            X
          </Button>

          <Form onSubmit={handleCrearCategoria}>
            <h3>Crear Nueva Categoría</h3>

            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese nombre de la categoría"
                name="nombre"
                value={datos.nombre}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripcion</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese tipo de categoría"
                name="descripcion"
                value={datos.descripcion}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
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
                <option value="eliminado">eliminado</option>
              </Form.Control>
            </Form.Group>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
              }}
            >
              <Button variant="secondary" onClick={() => setModalCrear(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Crear Categoría
              </Button>
            </div>
          </Form>
        </div>
      )}
    </Container>
  );
}
