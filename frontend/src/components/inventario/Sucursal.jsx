import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  ButtonGroup,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Table,
} from "react-bootstrap";

import CrearSucursal from "./modalSucursal/CrearSucursal";
import EditarSucursal from "./modalSucursal/EditarSucursal";

import obtenerSucursales, {
  eliminarSucursal,
} from "../../services/inventario/Sucursal.service";

import VerBodegas from "./modalBodega/verBodegas";

export default function Sucursal() {
  const [sucursales, setSucursales] = useState([]);
  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const [sucursalSelect, setSucursalSelect] = useState(null);
  const [bodegaSelect, setBodegaSelect] = useState(null);

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalBodegaVer, setModalBodegaVer] = useState(false);

  const buscarSucursales = async () => {
    try {
      setLoading(true);
      setError(false);
      setMensaje("");
      const respuesta = await obtenerSucursales();
      //console.log("Respuesta sucursales:", respuesta.data[0]);
      if (respuesta.status == 204) {
        setError(true);
        setMensaje(
          "No hay sucursales disponibles, por favor crea una sucursal"
        );
        setSucursales([]);
      } else {
        if (respuesta.status === 200) {
          setMensaje("");
          setSucursales(respuesta.data);
        }
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
    buscarSucursales();
  }, []);

  const handleCerrarModal = () => {
    setModalCrear(false);
    setModalEditar(false);
    setModalBodegaVer(false);
    setSucursalSelect(null);
    // setDatos({ nombre: "", descripcion: "", estado: "" });
  };

  const handleCrear = () => {
    setError(false);
    setMensaje("");
    setModalCrear(true);
  };

  const handleEditar = (sucursal) => {
    setError(false);
    setSucursalSelect(sucursal);
    setMensaje("");
    setModalEditar(true);
  };

  const handleEliminar = async (id) => {
    setLoading(true);
    setError(false);
    setMensaje("");
    try {
      const respuesta = await eliminarSucursal(id);
      if (respuesta.status === 200) {
        setMensaje("Sucursal eliminada exitosamente");
        setError(false);
        await buscarSucursales();
      } else {
        setError(true);
        setMensaje(respuesta.error || "Error al eliminar la sucursal.");
      }
    } catch (error) {
      setError(true);
      setMensaje("Error de conexión al eliminar la sucursal.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVer = (bodega) => {
    setBodegaSelect(bodega);
    setModalBodegaVer(true);
  };
  return (
    <Container style={{ marginTop: "30px" }}>
      <Row className="mb-4">
        <Col className="text-center">
          <h2>Gestión de Sucursales</h2>
          <p className="text-muted">Aquí puedes gestionar tus sucursales</p>
        </Col>
      </Row>

      {mensaje && (
        <Row className="mb-3">
          <Col>
            <Alert
              variant={error ? "warning" : "success"}
              dismissible
              onClose={setTimeout(() => setMensaje(""), 5000)}
            >
              {mensaje}
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="mb-4">
        <Col md={3}>
          <Button
            variant="primary"
            onClick={handleCrear}
            disabled={loading}
            className="w-60"
          >
            Crear Sucursal
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover className="text-center">
        <thead>
          <tr>
            <th>Cod. Sucursal</th>
            <th>Nombre</th>
            <th>Direccion</th>
            <th>Estado</th>

            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sucursales.length > 0 ? (
            sucursales.map((sucursal) => (
              <tr
                key={sucursal.idSucursal}
                onClick={() => handleVer(sucursal.idSucursal)}
              >
                <td>{sucursal.idSucursal}</td>
                <td>{sucursal.nombre}</td>
                <td>{sucursal.direccion}</td>
                <td>{sucursal.estado}</td>

                <td>
                  <Button
                    variant="warning"
                    onClick={() => handleEditar(sucursal)}
                    disabled={loading}
                    style={{ margin: "5px" }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleEliminar(sucursal.idSucursal)}
                    disabled={loading}
                    style={{ margin: "5px" }}
                  >
                    Eliminar
                  </Button>
                  {/* <Button
                    variant="info"
                    onClick={() => handleVer(sucursal.idSucursal)}
                    disabled={loading}
                    style={{ margin: "5px" }}
                  >
                    Bodegas
                  </Button> */}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No hay sucursales disponibles
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <CrearSucursal
        show={modalCrear}
        handleClose={handleCerrarModal}
        buscarSucursales={buscarSucursales}
      />
      <EditarSucursal
        show={modalEditar}
        handleClose={handleCerrarModal}
        sucursal={sucursalSelect}
        funcionBuscarSucursales={buscarSucursales}
      />
      <VerBodegas
        show={modalBodegaVer}
        handleClose={handleCerrarModal}
        bodega={bodegaSelect}
        buscarSucursales={buscarSucursales}
      />
    </Container>
  );
}
