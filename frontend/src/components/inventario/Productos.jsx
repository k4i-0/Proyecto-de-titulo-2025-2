import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  ButtonGroup,
  Alert,
  Card,
} from "react-bootstrap";

import Agregar from "./modalProductos/Agregar";
import Editar from "./modalProductos/Editar";
import Eliminar from "./modalProductos/Eliminar";

import obtenerProductos, {
  crearProducto,
} from "../../services/inventario/Productos.service";
import obtenerCategoria from "../../services/inventario/Categorias.service";

export default function Productos({ onCambiarVista }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);

  const [productosSelect, setProductoSelect] = useState(null);

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
    nameCategoria: "",
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
        if (respuesta.length == 0) {
          setMensaje(
            "No hay productos disponibles, por favor cree un producto"
          );
        }
        setProductos(respuesta);
        //console.log("Productos obtenidos:", respuesta[0]);
      }

      if (respuesta2.code) {
        setError(true);
        setMensaje(respuesta2.error);
      } else {
        //if (respuesta2.length == 0) {
        //  setMensaje(
        //    "No hay categorias disponibles, por favor cree una categoria antes de agregar productos"
        //  );
        //}
        //console.log("Categrias:", categorias);
        setCategorias(respuesta2);
      }
    } catch (error) {
      setError(true);
      setMensaje("Error al cargar datos");
      console.error(error);
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
  const handleEditar = (producto) => {
    setError(false);
    setProductoSelect(producto);
    setMensaje("");
    setModalEditar(true);
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
    //console.log("Datos a enviar:", datos);
    try {
      const resultado = await crearProducto(datos);
      //console.log("el resultado es:", resultado);
      if (resultado.status === 201) {
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
          nameCategoria: "",
        });
        await buscarProducto();
      } else {
        setError(true);
        setMensaje(resultado.error || "Error al crear producto");
      }
    } catch (error) {
      setError(true);
      setMensaje("Error al crear producto");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarModal = () => {
    setModalCrear(false);
    setModalEditar(false);
    setDatos({
      codigo: "",
      nombre: "",
      precioCompra: "",
      precioVenta: "",
      peso: "",
      descripcion: "",
      estado: "",
      nameCategoria: "",
    });
  };

  const handleEliminar = (producto) => {
    setModalEliminar(true);
    setProductoSelect(producto);
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
              onClose={() => setMensaje("")}
            >
              {mensaje}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Botones de acción */}
      <Row className="mb-4">
        <Col md={3}>
          <Button
            variant="primary"
            onClick={handleCrear}
            disabled={loading}
            className="w-100"
          >
            + Agregar
          </Button>
        </Col>
        {/* <Col md={4}>
          <Button
            variant="warning"
            className="w-100"
            // onClick={handleEditar}
            // disabled={loading}
          >
            ✎ Modificar Producto
          </Button>
        </Col>
        <Col md={4}>
          <Button variant="danger" className="w-100" disabled>
            − Eliminar Producto
          </Button>
        </Col> */}
      </Row>

      {/* Lista de productos */}
      <Row>
        {
          loading ? (
            <Col className="text-center">
              <p>Cargando productos...</p>
            </Col>
          ) : productos.length > 0 ? (
            productos.map((producto) => (
              <Col key={producto.id} md={4} className="mb-4">
                <Card>
                  <Card.Body>
                    <Card.Title>{producto.nombre}</Card.Title>
                    <Card.Text>
                      <strong>Código:</strong> {producto.codigo}
                      <br />
                      <strong>Precio:</strong> ${producto.precioVenta}
                      <br />
                      <strong>Estado:</strong> {producto.estado}
                      <br />
                      <strong>IdCategoria:</strong> {producto.idCategoria}
                      <br />
                      <strong>Nombre Categoria:</strong>
                      {producto.categoria.nombre}
                    </Card.Text>
                    <Card.Text>
                      <ButtonGroup>
                        <Button
                          variant="warning"
                          className="w-100"
                          onClick={() => handleEditar(producto)}
                        >
                          Modificar Producto
                        </Button>
                        <Button
                          variant="danger"
                          className="w-100"
                          onClick={() => handleEliminar(producto)}
                        >
                          Eliminar Producto
                        </Button>
                      </ButtonGroup>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : null
          //(
          //   <Col className="text-center">
          //     <p className="text-muted" style={{ marginTop: "50px" }}>
          //       No hay productos disponibles
          //     </p>
          //   </Col> )
        }
      </Row>

      <Agregar
        modalCrear={modalCrear}
        handleCerrarModal={handleCerrarModal}
        handleSubmit={handleSubmit}
        datos={datos}
        handleChange={handleChange}
        categorias={categorias}
        loading={loading}
        cambiarVista={onCambiarVista}
      />
      <Editar
        Producto={productosSelect}
        categorias={categorias}
        modalEditar={modalEditar}
        handleCerrarModal={handleCerrarModal}
        funcionBuscarProductos={buscarProducto}
      />

      <Eliminar
        modalEliminar={modalEliminar}
        setModalEliminar={setModalEliminar}
        productoEliminar={productosSelect}
        setProductoEliminar={setProductoSelect}
        funcionBuscarProductos={buscarProducto}
      />
    </Container>
  );
}
