import { useEffect, useState } from "react";
import { Modal, Button, Table, Spinner, Alert } from "react-bootstrap";

// const obtenerBodegasPorSucursal = async (idSucursal) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       // Simula que la sucursal con ID 1 tiene bodegas
//       if (idSucursal === 1) {
//         resolve({
//           status: 200,
//           data: [
//             { idBodega: 101, nombre: "Bodega Principal", capacidad: 1000 },
//             { idBodega: 102, nombre: "Bodega Refrigerados", capacidad: 500 },
//           ],
//         });
//       } else {
//         // Simula que otras sucursales no tienen
//         resolve({ status: 204 });
//       }
//     }, 1200); // Simula 1.2s de carga
//   });
// };

import { obtenerBodegasPorSucursal } from "../../../services/inventario/Bodega.service";

export default function VerBodegas({ show, handleClose, bodega }) {
  // 'bodega' es el prop que contiene el 'idSucursal'
  const idSucursal = bodega;

  const [listaBodegas, setListaBodegas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (show && idSucursal) {
      const cargarDatosBodega = async () => {
        setLoading(true);
        setError(false);
        setMensaje("");
        setListaBodegas([]);

        try {
          const respuesta = await obtenerBodegasPorSucursal(idSucursal);

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
        <Table striped bordered hover responsive>
          <thead className="text-center">
            <tr>
              <th>ID Bodega</th>
              <th>Nombre</th>
              <th>Capacidad</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {listaBodegas.map((b) => (
              <tr key={b.idBodega}>
                <td>{b.idBodega}</td>
                <td>{b.nombre}</td>
                <td>{b.capacidad} m³</td>
              </tr>
            ))}
          </tbody>
        </Table>
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
