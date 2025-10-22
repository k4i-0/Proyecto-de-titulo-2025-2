// src/components/inventario/modalInventario/EditarInventario.jsx

import { useState, useEffect } from "react";
import { Alert, Button, Form, Modal, Spinner } from "react-bootstrap";

// Asumo que tienes un servicio 'editarInventario'
import { editarInventario } from "../../../services/inventario/Inventario.service";

export default function EditarInventario({
  inventario, // El item de inventario seleccionado
  show,
  handleClose,
  buscarInventarios,
}) {
  const [formData, setFormData] = useState({ stock: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (inventario) {
      setFormData({
        stock: inventario.stock || "",
      });
      setError("");
    }
  }, [inventario]);

  const handleChangeLocal = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmitEdicion = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const datosAEnviar = {
        ...formData,
        stock: parseInt(formData.stock, 10), // Asegurar que sea número
      };

      // Asumo que editarInventario acepta (id, datos)
      const respuesta = await editarInventario(
        inventario.idInventario,
        datosAEnviar
      );

      if (respuesta.status == 200) {
        buscarInventarios();
        handleClose();
      } else {
        setError(respuesta.data?.message || "Error al editar el stock.");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handleCerrar = () => {
    setError("");
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleCerrar}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Inventario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Muestra un spinner si el inventario no ha cargado */}
        {!inventario ? (
          <Spinner animation="border" />
        ) : (
          <Form onSubmit={handleSubmitEdicion}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese nombre"
                name="nombre"
                value={inventario?.nombre}
                required
              />
            </Form.Group>
            <Form.Group controlId="formProducto" className="mb-3">
              <Form.Label>Producto</Form.Label>
              <Form.Control
                type="text"
                value={inventario?.idProducto || "Cargando..."}
                readOnly
                disabled
              />
            </Form.Group>

            <Form.Group controlId="formBodega" className="mb-3">
              <Form.Label>Bodega</Form.Label>
              <Form.Control
                type="text"
                value={inventario.bodega?.nombre || "Cargando..."}
                readOnly
                disabled
              />
            </Form.Group>

            <Form.Group controlId="formStock" className="mb-3">
              <Form.Label>Nuevo Stock *</Form.Label>
              <Form.Control
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChangeLocal}
                required
                min="0"
                autoFocus // Pone el cursor aquí
              />
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCerrar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} onClick={handleSubmitEdicion}>
          {loading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
