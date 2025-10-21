import { useState, useEffect } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";

import { editarBodega } from "../../../services/inventario/Bodega.service";

export default function EditarBodega({
  bodegas,
  modalEditar,
  handleCerrarModal,
  funcionBuscarCategorias,
}) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    estado: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (bodegas) {
      setFormData({
        nombre: bodegas.nombre || "",
        ubicacion: bodegas.ubicacion || "",
        capacidad: bodegas.capacidad || "",
        estado: bodegas.estado || "",
      });
      setError("");
    } else {
      setError("");
    }
  }, [bodegas]);

  const handleChangeLocal = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmitEdicion = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const respuesta = await editarBodega(formData, bodegas.idBodega);
      if (respuesta.status == 200) {
        funcionBuscarCategorias();
        handleCerrarModal();
      } else {
        setError(respuesta || "Error al editar la categoría");
        console.log(respuesta);
      }
    } catch (error) {
      setError("Error al editar la categoría", error);
    } finally {
      setLoading(false);
    }
    console.log("Datos para editar:", formData, bodegas.idBodega);
  };
  return (
    <Modal show={modalEditar} onHide={handleCerrarModal}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Bodega</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmitEdicion}>
          <Form.Group controlId="formIdCategoria">
            <Form.Label>ID Categoría</Form.Label>
            <Form.Control
              type="text"
              name="idCategoria"
              value={bodegas ? bodegas.idBodega : ""}
              readOnly
            />
          </Form.Group>
          <Form.Group controlId="formNombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChangeLocal}
            />
          </Form.Group>
          <Form.Group controlId="formUbicacion">
            <Form.Label>Ubicación</Form.Label>
            <Form.Control
              type="text"
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleChangeLocal}
            />
          </Form.Group>
          <Form.Group controlId="formCapacidad">
            <Form.Label>Capacidad</Form.Label>
            <Form.Control
              type="number"
              name="capacidad"
              value={formData.capacidad}
              onChange={handleChangeLocal}
            />
          </Form.Group>
          <Form.Group controlId="formEstado">
            <Form.Label>Estado</Form.Label>
            <Form.Control
              as="select"
              name="estado"
              value={formData.estado}
              onChange={handleChangeLocal}
            >
              <option value="">Seleccione un estado</option>
              <option value="En Funcionamiento">En Funcionamiento</option>
              <option value="En Mantenimiento">En Mantenimiento</option>
              <option value="Fuera de Servicio">Fuera de Servicio</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit" disabled={loading} onClick={handleSubmitEdicion}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
