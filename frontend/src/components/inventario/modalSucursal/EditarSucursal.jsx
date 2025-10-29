import { useState, useEffect } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";

import { editarSucursal } from "../../../services/inventario/Sucursal.service";

export default function EditarSucursal({
  sucursal,
  show,
  handleClose,
  funcionBuscarSucursales,
}) {
  const [formData, setFormData] = useState({
    idSucursal: sucursal?.idSucursal,
    nombre: "",
    direccion: "",
    estado: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Sucursal para editar cambiada:", sucursal);

    if (sucursal) {
      setFormData({
        nombre: sucursal.nombre || "",
        direccion: sucursal.direccion || "",
        estado: sucursal.estado || "",
      });
    }
    setError("");
  }, [sucursal]);

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
      const respuesta = await editarSucursal(formData, sucursal.idSucursal);
      if (respuesta.status == 200) {
        funcionBuscarSucursales();
        handleCerrar();
      } else {
        setError(
          respuesta.data?.message ||
            respuesta.error ||
            "Error al editar la sucursal"
        );
        console.log(respuesta);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Error de conexión al editar la sucursal"
      );
    } finally {
      setLoading(false);
    }
    console.log("Datos para editar:", formData, sucursal.idSucursal);
  };
  const handleCerrar = () => {
    setError("");
    handleClose();
  };
  return (
    console.log("Modal editar sucursal renderizado"),
    (
      <Modal show={show} onHide={handleCerrar}>
        <Modal.Header closeButton onClick={handleCerrar}>
          <Modal.Title>Editar Sucursal {sucursal?.idSucursal}</Modal.Title>
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
            <Form.Group controlId="formUbicacion">
              <Form.Label>Direccion</Form.Label>
              <Form.Control
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChangeLocal}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Estado *</Form.Label>
              <Form.Control
                as="select"
                name="estado"
                value={formData.estado}
                onChange={handleChangeLocal}
                required
              >
                <option value="">Seleccione un estado</option>
                <option value="Abierta">Abierta</option>
                <option value="Cerrada">Cerrada</option>
                <option value="Mantencion">Mantencion</option>
                <option value="Eliminada">Eliminada</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCerrar}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            onClick={handleSubmitEdicion}
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </Modal.Footer>
      </Modal>
    )
  );
}
