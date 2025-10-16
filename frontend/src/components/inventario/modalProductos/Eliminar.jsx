import { useState } from "react";
import { Row, Col, Button, Alert, Modal } from "react-bootstrap";
import { eliminarProducto } from "../../../services/inventario/Productos.service";

export default function Eliminar({
  modalEliminar,
  setModalEliminar,
  productoEliminar,
  funcionBuscarProductos,
  setProductoEliminar,
}) {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("false");
  const handleEliminar = async () => {
    setLoading(true);
    try {
      const resultado = await eliminarProducto(productoEliminar.idProducto);
      console.log("Resultado de eliminar:", resultado);
      if (resultado.status == 200) {
        console.log("Producto eliminado con éxito");
        funcionBuscarProductos();
        setModalEliminar(false);
        setProductoEliminar(null);
      }
      if (resultado.status == 404) {
        setMensaje("Error al eliminar el producto");
        //console.log("404 Error al eliminar el producto");
        setTimeout(() => {
          setLoading(false);
        }, 3500);
      }
      if (resultado.status == 422) {
        setMensaje("ID de producto es obligatorio");
        //console.log("422 ID de producto es obligatorio");
        setTimeout(() => {
          setLoading(false);
        }, 3500);
      }
      if (resultado.status == 500) {
        setMensaje("Error en el servidor al eliminar el producto");
        //console.log("500 Error en el servidor al eliminar el producto");
        setTimeout(() => {
          setLoading(false);
        }, 3500);
      }
      setTimeout(() => {
        setLoading(false);
      }, 3500);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  return (
    <Modal show={modalEliminar} onHide={() => setModalEliminar(false)}>
      <Modal.Header closeButton onClick={() => setModalEliminar(false)}>
        <Modal.Title>Eliminar Producto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && (
          <Alert variant={!mensaje ? "info" : "danger"}>
            {!mensaje ? "Eliminando producto..." : mensaje}
          </Alert>
        )}
        <p>¿Estás seguro de que deseas eliminar el producto?</p>
        <p>
          <strong>{productoEliminar?.nombre}</strong>
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setModalEliminar(false)}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleEliminar}>
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
