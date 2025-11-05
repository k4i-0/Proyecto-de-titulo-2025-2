import { useState } from "react";
import {
  Row,
  Col,
  Button,
  Form,
  Modal,
  Alert,
  Spin,
  Input,
  Select,
} from "antd";

import { crearSucursal } from "../../../services/inventario/Sucursal.service";
import { crearBodega } from "../../../services/inventario/Bodega.service";

export default function AgregarSucursal({
  show,
  handleClose,
  buscarSucursales,
}) {
  console.log("Renderizando CrearSucursal");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);

  // const [datosSucursal, setDatosSucursal] = useState({
  //   nombre: "",
  //   direccion: "",
  //   estado: "",
  // });
  // const [datosBodega, setDatosBodega] = useState({
  //   nombre: "",
  //   capacidad: "",
  //   estado: "",
  //   idSucursal: "",
  // });

  // const handleChangeSucursal = (e) => {
  //   const { name, value } = e.target;
  //   setDatosSucursal({ ...datosSucursal, [name]: value });
  // };
  // const handleChangeBodega = (e) => {
  //   const { name, value } = e.target;
  //   setDatosBodega({ ...datosBodega, [name]: value });
  // };

  //   useEffect(() => {}, [sucursales]);
  //   const handleChangeSucursal = (e) => {
  //     const { name, value } = e.target;
  //     setDatos({ ...datos, [name]: value });
  //   };

  const handleSubmit = async (values) => {
    // e.preventDefault();
    // setLoading(true);
    setLoading(true);
    setMensaje("");
    setError(false);

    const datosSucursal = {
      nombre: values.nombreSucursal,
      direccion: values.direccion,
      estado: values.estadoSucursal,
    };

    const datosBodega = {
      nombre: values.nombreBodega,
      capacidad: values.capacidad,
      estado: values.estadoBodega,
    };
    try {
      const resultado = await crearSucursal(datosSucursal);
      //console.log("Respuesta al crear", resultado);
      if (resultado.status === 201) {
        const resultadoBodega = await crearBodega({
          ...datosBodega,
          idSucursal: resultado.data.idSucursal,
        });
        //console.log("Respuesta al crear bodega", resultadoBodega);
        if (resultadoBodega.status == 201) {
          setMensaje("Sucursal creada exitosamente");
          setError(false);
          setTimeout(() => {
            buscarSucursales();
            form.resetFields();
            handleClose();
            setMensaje("");
          }, 1200);
        } else {
          if (resultadoBodega.status === 422) {
            setMensaje(
              "Sucursal creada, pero error al crear bodega principal: " +
                (resultadoBodega.data?.message ||
                  resultadoBodega.error ||
                  "Error desconocido.")
            );
            setError(true);
          }
        }
      } else {
        setError(true);
        setMensaje(
          resultado.data?.message ||
            resultado.error ||
            "Error al crear la sucursal."
        );
      }
    } catch (err) {
      setError(true);
      setMensaje(
        err.response?.data?.message || "Error de conexión al crear la sucursal."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarModal = () => {
    setMensaje("");
    setError(false);
    form.resetFields();
    handleClose();
  };

  return (
    <Modal
      open={show}
      title="Crear Nueva Sucursal"
      onCancel={handleCerrarModal}
      footer={[
        <Button key="cancelar" onClick={handleCerrarModal}>
          Cancelar
        </Button>,
        <Button
          key="crear"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          Crear Sucursal
        </Button>,
      ]}
      width={700}
    >
      <Spin spinning={loading} tip="Creando sucursal...">
        {mensaje && (
          <Alert
            message={mensaje}
            type={error ? "error" : "success"}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          {/* Datos de la Sucursal */}
          <div style={{ marginBottom: 16, fontWeight: 600, fontSize: 16 }}>
            Datos de la Sucursal
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nombre"
                name="nombreSucursal"
                rules={[
                  { required: true, message: "Por favor ingrese el nombre" },
                ]}
              >
                <Input placeholder="Ingrese nombre" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Estado"
                name="estadoSucursal"
                rules={[
                  { required: true, message: "Por favor seleccione un estado" },
                ]}
              >
                <Select
                  allowClear
                  placeholder="Seleccione un estado"
                  options={[
                    { value: "Abierta", label: "Abierta" },
                    { value: "Cerrada", label: "Cerrada" },
                    { value: "Mantencion", label: "Mantencion" },
                    { value: "Eliminada", label: "Eliminada" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Form.Item
                label="Dirección"
                name="direccion"
                rules={[
                  { required: true, message: "Por favor ingrese la dirección" },
                ]}
              >
                <Input placeholder="Ingrese dirección de la sucursal" />
              </Form.Item>
            </Col>
          </Row>

          {/* Datos de la Bodega Principal */}
          <div
            style={{
              marginBottom: 16,
              fontWeight: 600,
              fontSize: 16,
              marginTop: 24,
            }}
          >
            Bodega Principal
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nombre Bodega Principal"
                name="nombreBodega"
                rules={[
                  {
                    required: true,
                    message: "Por favor ingrese el nombre de la bodega",
                  },
                ]}
              >
                <Input placeholder="Ingrese nombre" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Capacidad Bodega (m²)"
                name="capacidad"
                rules={[
                  {
                    required: true,
                    message: "Por favor ingrese la capacidad",
                  },
                  {
                    type: "number",
                    min: 0,
                    max: 10000,
                    message: "La capacidad debe estar entre 0 y 10000",
                    transform: (value) => Number(value),
                  },
                ]}
              >
                <Input
                  type="number"
                  min={0}
                  max={10000}
                  placeholder="Ingrese capacidad"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Form.Item
                label="Estado Bodega"
                name="estadoBodega"
                rules={[
                  {
                    required: true,
                    message: "Por favor seleccione un estado para la bodega",
                  },
                ]}
              >
                <Select
                  allowClear
                  placeholder="Seleccione un estado"
                  options={[
                    { value: "En Funcionamiento", label: "En Funcionamiento" },
                    { value: "En Mantenimiento", label: "En Mantenimiento" },
                    { value: "Fuera de Servicio", label: "Fuera de Servicio" },
                    { value: "Eliminado", label: "Eliminado" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Spin>
      {/* <Spin spinning={loading} tip="Creando sucursal...">
        {mensaje && (
          <Alert
            message={mensaje}
            type={error ? "error" : "success"}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

      <>
        {mensaje && !loading && (
          <div
          // style={{
          //   position: "absolute",
          //   top: 0,
          //   left: 0,
          //   width: "100%",
          //   height: "100%",
          //   backgroundColor: "rgba(255, 255, 255, 0.85)",
          //   display: "flex",
          //   flexDirection: "column",
          //   alignItems: "center",
          //   justifyContent: "center",
          //   zIndex: 10,
          //   borderRadius: "var(--bs-modal-border-radius)",
          // }}
          >
            <Alert variant={error ? "danger" : "success"}>{mensaje}</Alert>
          </div>
        )}
        <Form onFinish={handleSubmit}>
          <Form.Item
            label="Nombre"
            name="nombre"
            rules={[{ required: true, message: "Por favor ingrese el nombre" }]}
          >
            <Input 
            id="nombre"
            placeholder="Ingrese nombre"
            />
          </Form.Item>
          <Form.Item
            label="Dirección"
            name="direccion"
            rules={[{ required: true, message: "Por favor ingrese la dirección" }]}
          >
            <Input
              id="direccion"
              placeholder="Ingrese dirección"
            />
          </Form.Item>
          <Form.Item
            label="Estado"
            name="estado"
            rules={[{ required: true }]}
          >
            <Select 
            allowClear 
            placeholder="Seleccione un estado"
            onChange={}
             options={[
              { value: 'Abierta', label: 'Abierta' },
              { value: 'Cerrada', label: 'Cerrada' },
              { value: 'Mantencion', label: 'Mantencion' },
              { value: 'Eliminada', label: 'Eliminada' },
            ]}
            />
            
          </Form.Item>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese nombre"
                  name="nombre"
                  value={datosSucursal.nombre}
                  onChange={handleChangeSucursal}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  as="select"
                  name="estado"
                  value={datosSucursal.estado}
                  onChange={handleChangeSucursal}
                  required
                >
                  <option value="">Seleccione un estado</option>
                  <option value="Abierta">Abierta</option>
                  <option value="Cerrada">Cerrada</option>
                  <option value="Mantencion">Mantencion</option>
                  <option value="Eliminada">Eliminada</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese dirección de la sucursal"
                name="direccion"
                value={datosSucursal.direccion}
                onChange={handleChangeSucursal}
                required
              />
            </Form.Group>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre Bodega Principal</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese nombre"
                  name="nombre"
                  value={datosBodega.nombre}
                  onChange={handleChangeBodega}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Capacidad Bodega (m²)</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  max={10000}
                  placeholder="Ingrese capacidad"
                  name="capacidad"
                  value={datosBodega.capacidad}
                  onChange={handleChangeBodega}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Form.Group className="mb-3">
              <Form.Label>Estado Bodega</Form.Label>
              <Form.Select
                as="select"
                name="estado"
                value={datosBodega.estado}
                onChange={handleChangeBodega}
                required
              >
                <option value="">Seleccione un estado</option>
                <option value="En Funcionamiento">En Funcionamiento</option>
                <option value="En Mantenimiento">En Mantenimiento</option>
                <option value="Fuera de Servicio">Fuera de Servicio</option>
                <option value="Eliminado">Eliminado</option>
              </Form.Select>
            </Form.Group>
          </Row>
        </Form>
      </> */}

      {/* <Modal.Footer>
        <Button variant="secondary" onClick={handleCerrarModal}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creando..." : "Crear Sucursal"}
        </Button>
      </Modal.Footer> */}
    </Modal>
  );
}
