import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Alert,
  Row,
  Col,
  InputNumber,
} from "antd";

import { crearBodega } from "../../../services/inventario/Bodega.service";
// import obtenerSucursales from "../../../services/inventario/Sucursal.service";
export default function AgregarBodega({
  show,
  handleClose,
  buscarBodegas,
  idSucursal,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);

  // const [datos, setDatos] = useState({
  //   nombre: "",
  //   capacidad: "",
  //   estado: "",
  //   idSucursal: idSucursal || "",
  // });

  // const buscarSucursales = async () => {
  //   try {
  //     const respuesta = await obtenerSucursales();

  //     if (respuesta.code) {
  //       setError(true);
  //       setMensaje(respuesta.error);
  //     } else {
  //       setSucursales(respuesta);
  //     }
  //   } catch (error) {
  //     setError(true);
  //     setMensaje("Error al cargar sucursales");
  //     console.error(error);
  //   }
  // };

  // useEffect(() => {
  //   if (show) buscarSucursales();
  // }, [show]);
  useEffect(() => {
    if (show) {
      form.setFieldsValue({
        idSucursal: idSucursal || "",
        nombre: "",
        capacidad: null, // Usar null o undefined para placeholders numéricos
        estado: "",
      });
      setMensaje("");
      setError(false);
    }
  }, [show, idSucursal, form]);

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setDatos({ ...datos, [name]: value });
  // };

  const handleSubmit = async (values) => {
    // e.preventDefault();
    setLoading(true);
    setMensaje("");
    setError(false);

    try {
      const resultado = await crearBodega(values);
      console.log("Respuesta al crear", resultado);
      if (resultado.status === 201) {
        setMensaje("Bodega creada exitosamente");
        setError(false);
        setTimeout(() => {
          buscarBodegas();
          handleCerrarModal();
          // setDatos({
          //   nombre: "",
          //   ubicacion: "",
          //   capacidad: "",
          //   estado: "",
          //   idSucursal: "",
          // });

          // handleClose();
          // setMensaje("");
        }, 1200);
      } else {
        setError(true);
        setMensaje(
          resultado.data?.message ||
            resultado.error ||
            "Error al crear la bodega."
        );
      }
    } catch (err) {
      setError(true);
      setMensaje(
        err.response?.data?.message || "Error de conexión al crear la bodega."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleCerrarModal = () => {
    form.resetFields();
    setMensaje("");
    setError(false);
    // setDatos({
    //   nombre: "",
    //   ubicacion: "",
    //   capacidad: "",
    //   estado: "",
    //   idSucursal: "",
    // });
    handleClose();
  };

  return (
    <Modal
      open={show}
      title="Crear Nueva Bodega"
      onCancel={handleCerrarModal}
      footer={[
        <Button key="cancelar" onClick={handleCerrarModal}>
          Cancelar
        </Button>,
        <Button
          key="guardar"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          {loading ? "Creando..." : "Crear Bodega"}
        </Button>,
      ]}
      width={600}
    >
      {mensaje && (
        <Alert
          message={mensaje}
          type={error ? "error" : "success"}
          showIcon
          closable
          onClose={() => setMensaje("")}
          style={{ marginBottom: 16 }}
        />
      )}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Nombre"
              name="nombre"
              rules={[
                { required: true, message: "Por favor ingrese el nombre" },
              ]}
            >
              <Input placeholder="Ingrese nombre" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Capacidad"
              name="capacidad"
              rules={[
                { required: true, message: "Por favor ingrese la capacidad" },
              ]}
            >
              <InputNumber
                placeholder="Ingrese capacidad"
                style={{ width: "100%" }}
                min={0}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Estado"
          name="estado"
          rules={[
            { required: true, message: "Por favor seleccione un estado" },
          ]}
        >
          <Select
            placeholder="Seleccione un estado"
            options={[
              { value: "En Funcionamiento", label: "En Funcionamiento" },
              { value: "En Mantenimiento", label: "En Mantenimiento" },
              { value: "Fuera de Servicio", label: "Fuera de Servicio" },
            ]}
          />
        </Form.Item>

        <Form.Item label="Sucursal" name="idSucursal">
          <Input placeholder="ID de Sucursal" disabled />
        </Form.Item>
      </Form>
      {/* {loading ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            borderRadius: "var(--bs-modal-border-radius)",
          }}
        >
          <Spinner animation="grow" />
          <p>Creando categoría...</p>
        </div>
      ) : null}
      <Modal.Header closeButton>
        <Modal.Title>Crear Nueva Bodega</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {mensaje && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(255, 255, 255, 0.85)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                borderRadius: "var(--bs-modal-border-radius)",
              }}
            >
              <Alert variant={error ? "danger" : "success"}>{mensaje}</Alert>
            </div>
          )}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese nombre"
                  name="nombre"
                  value={datos.nombre}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Capacidad *</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Ingrese capacidad"
                  name="capacidad"
                  value={datos.capacidad}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Estado *</Form.Label>
            <Form.Control
              as="select"
              name="estado"
              value={datos.estado}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un estado</option>
              <option value="En Funcionamiento">En Funcionamiento</option>
              <option value="En Mantenimiento">En Mantenimiento</option>
              <option value="Fuera de Servicio">Fuera de Servicio</option>
            </Form.Control>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Sucursales *</Form.Label>
            <Form.Control
              type="text"
              name="idSucursal"
              placeholder={idSucursal}
              value={datos.idSucursal}
              disabled={idSucursal}
            ></Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleCerrarModal}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creando..." : "Crear Bodega"}
        </Button>
      </Modal.Footer> */}
    </Modal>
  );
}
