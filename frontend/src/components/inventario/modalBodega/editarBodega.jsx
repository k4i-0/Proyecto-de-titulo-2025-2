import { useState, useEffect } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";

import { editarBodega } from "../../../services/inventario/Bodega.service";

export default function EditarBodega({
  bodegas,
  show,
  handleClose,
  buscarBodegas,
}) {
  console.log("Bodega a editar:", bodegas?.capacidad);
  const [formData, setFormData] = useState({
    nombre: "",
    capacidad: "",
    estado: "",
    idSucursal: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (bodegas) {
      setFormData({
        nombre: bodegas.nombre || "",
        capacidad: bodegas.capacidad || "",
        estado: bodegas.estado || "",
        idSucursal: bodegas.idSucursal || "",
      });
    }
    setError("");
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
        buscarBodegas();
        handleCerrar();
      } else {
        setError(respuesta?.error || "Error al editar la bodega.");
        console.log(respuesta);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error al editar la bodega.");
    } finally {
      setLoading(false);
    }
    console.log("Datos para editar:", formData, bodegas.idBodega);
  };
  const handleCerrar = () => {
    setError(""); // <--- Limpia error al cerrar
    handleClose();
  };
  return (
    <Modal show={show} onHide={handleCerrar}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Bodega {bodegas?.idBodega}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmitEdicion}>
          <Form.Group controlId="formNombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChangeLocal}
              required
            />
          </Form.Group>
          <Form.Group controlId="formCapacidad">
            <Form.Label>Capacidad</Form.Label>
            <Form.Control
              type="number"
              name="capacidad"
              min={0}
              max={10000}
              value={formData.capacidad}
              onChange={handleChangeLocal}
              required
            />
          </Form.Group>
          <Form.Group controlId="formEstado">
            <Form.Label>Estado</Form.Label>
            <Form.Control
              as="select"
              name="estado"
              value={formData.estado}
              onChange={handleChangeLocal}
              required
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
        <Button variant="secondary" onClick={handleCerrar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} onClick={handleSubmitEdicion}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
