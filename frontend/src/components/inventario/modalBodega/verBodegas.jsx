import { useEffect, useState } from "react";
import { Modal, Button, Table, Spinner, Alert } from "react-bootstrap";

import { obtenerBodegasPorSucursal } from "../../../services/inventario/Bodega.service";
import EditarBodega from "../modalBodega/editarBodega";
import CrearBodega from "../modalBodega/crearBodega";
import eliminarBodega from "../../../services/inventario/Bodega.service";

export default function VerBodegas({
  show,
  handleClose,
  bodega,
  buscarSucursales,
}) {
  const idSucursal = bodega;

  const [listaBodegas, setListaBodegas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [bodegaSelect, setBodegaSelect] = useState(null);
  const [modalCrear, setModalCrear] = useState(false);

  useEffect(() => {
    if (show && idSucursal) {
      const cargarDatosBodega = async () => {
        setLoading(true);
        setError(false);
        setMensaje("");
        setListaBodegas([]);

        try {
          const respuesta = await obtenerBodegasPorSucursal(idSucursal);
          console.log("Respuesta bodegas por sucursal:", respuesta);
          if (respuesta.status === 200) {
            setListaBodegas(respuesta.data);
          } else if (respuesta.status === 204) {
            setError(true);
            setMensaje("Esta sucursal no tiene bodegas registradas.");
          } else {
            setError(true);
            setMensaje("Error al cargar las bodegas.");
          }
        } catch (error) {
          setError(true);
          setMensaje("Error de conexión al buscar bodegas.");
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      cargarDatosBodega();
    }
  }, [show, idSucursal]);

  const handleCrear = () => {
    setError(false);
    setMensaje("");
    setModalCrear(true);
  };

  const handleEditar = (b) => {
    setError(false);
    setBodegaSelect(b);
    setMensaje("");
    setModalEditar(true);
  };
  const handleCerrarModal = () => {
    setModalEditar(false);
    setBodegaSelect(null);
    setModalCrear(false);
  };

  const handleEliminar = async (id) => {
    setLoading(true);
    setError(false);
    setMensaje("");
    try {
      const respuesta = await eliminarBodega(id);
      if (respuesta.status === 200) {
        setMensaje("Bodega eliminada exitosamente");
        setError(false);
        await buscarSucursales();
      } else {
        setError(true);
        setMensaje(respuesta.error || "Error al eliminar la bodega.");
      }
    } catch (error) {
      setError(true);
      setMensaje("Error de conexión al eliminar la bodega.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderContenido = () => {
    if (loading) {
      return (
        <div className="text-center my-3">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-2">Cargando bodegas...</p>
        </div>
      );
    }

    if (error) {
      return <Alert variant="warning">{mensaje}</Alert>;
    }

    if (listaBodegas.length > 0) {
      return (
        <div>
          <Button variant="info" onClick={() => handleCrear()}>
            Crear
          </Button>

          <Table striped bordered hover responsive>
            <thead className="text-center">
              <tr>
                <th>ID Bodega</th>
                <th>Nombre</th>
                <th>Capacidad m²</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {listaBodegas.map((b) => (
                <tr key={b.idBodega} onClick={() => handleEditar(b)}>
                  <td>{b.idBodega}</td>
                  <td>{b.nombre}</td>
                  <td>{b.capacidad}</td>
                  <td>{b.estado}</td>
                  <td>
                    <Button
                      variant="info"
                      onClick={() => handleEliminar(b.idBodega)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <CrearBodega
            show={modalCrear}
            handleClose={handleCerrarModal}
            buscarBodegas={buscarSucursales}
            idSucursal={idSucursal}
          />
          <EditarBodega
            show={modalEditar}
            bodegas={bodegaSelect}
            handleClose={handleCerrarModal}
            buscarBodegas={buscarSucursales}
          />
        </div>
      );
    }

    return <Alert variant="info">No hay información para mostrar.</Alert>;
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Detalle de Bodegas (Sucursal: {idSucursal})</Modal.Title>
      </Modal.Header>
      <Modal.Body>{renderContenido()}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
