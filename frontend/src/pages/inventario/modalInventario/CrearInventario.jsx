// src/components/inventario/modalInventario/CrearInventario.jsx

import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Button,
  Form,
  Modal,
  Alert,
  Spin, // Para la carga de dependencias
  Select,
  InputNumber, // Mejor para el stock
  Input, // Para el lote, si es texto
} from "antd";

// Asumo que estos servicios existen y se pueden importar
import { crearInventarios } from "../../../services/inventario/Inventario.service";
import obtenerProductos from "../../../services/inventario/Productos.service";
// import obtenerLotes from "../../../services/inventario/Lotes.service"; // Probablemente necesites esto

export default function CrearInventario({
  show,
  handleClose,
  buscarInventarios,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false); // Para el envío del form
  const [loadingDeps, setLoadingDeps] = useState(false); // Para cargar dropdowns
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);

  // Estados para las listas de los 'selects'
  const [productos, setProductos] = useState([]);
  const [lotes, setLotes] = useState([]); // El código original no carga lotes, este array estará vacío.

  // Carga productos cuando se abre el modal
  useEffect(() => {
    if (show) {
      const cargarDependencias = async () => {
        setLoadingDeps(true);
        try {
          // Cargar productos
          const resProductos = await obtenerProductos();
          // Asumiendo que resProductos.data es el array
          setProductos(resProductos.data || []);

          // NOTA: Tu código original no carga los lotes.
          // Si necesitas cargarlos, descomenta la siguiente línea:
          // const resLotes = await obtenerLotes();
          // setLotes(resLotes.data || []);
        } catch (err) {
          setError(true);
          setMensaje("Error al cargar productos");
          console.error(err);
        } finally {
          setLoadingDeps(false);
        }
      };
      cargarDependencias();
    }
  }, [show]);

  // Se llama con onFinish del Form
  const handleSubmit = async (values) => {
    setLoading(true);
    setMensaje("");
    setError(false);

    try {
      // 'values' ya tiene los datos del form. 'stock' es un número por InputNumber.
      const resultado = await crearInventarios(values);

      if (resultado.status === 201) {
        setMensaje("Stock asignado exitosamente");
        setError(false);
        setTimeout(() => {
          buscarInventarios();
          handleCerrarModal(); // Cierra y resetea
        }, 1200);
      } else {
        setError(true);
        setMensaje(resultado.data?.message || "Error al asignar stock.");
      }
    } catch (err) {
      setError(true);
      setMensaje(err.response?.data?.message || "Error de conexión.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarModal = () => {
    form.resetFields();
    setMensaje("");
    setError(false);
    setProductos([]);
    setLotes([]);
    handleClose();
  };

  return (
    <Modal
      open={show}
      title="Asignar Stock a Bodega"
      onCancel={handleCerrarModal}
      width={700} // Un poco más ancho para los campos
      footer={[
        <Button key="cancelar" onClick={handleCerrarModal}>
          Cancelar
        </Button>,
        <Button
          key="guardar"
          type="primary"
          loading={loading} // Se usa el loading del submit
          onClick={() => form.submit()}
        >
          {loading ? "Asignando..." : "Asignar Stock"}
        </Button>,
      ]}
    >
      {/* Mensaje de Alerta */}
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

      {/* Spinner mientras cargan los dropdowns */}
      {loadingDeps ? (
        <div style={{ textAlign: "center", padding: "30px 0" }}>
          <Spin tip="Cargando datos..." />
        </div>
      ) : (
        // Formulario de Ant Design
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Producto"
                name="idProducto"
                rules={[
                  {
                    required: true,
                    message: "Por favor seleccione un producto",
                  },
                ]}
              >
                <Select
                  placeholder="Seleccione un producto"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={productos.map((p) => ({
                    value: p.idProducto,
                    label: ` (Codigo: ${p.codigo}) - ${p.nombre}`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Stock"
                name="stock"
                rules={[
                  { required: true, message: "Por favor ingrese el stock" },
                ]}
              >
                <InputNumber
                  placeholder="Ingrese stock"
                  min={0}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Estado Producto"
                name="estado"
                rules={[
                  { required: true, message: "Por favor seleccione un estado" },
                ]}
              >
                <Select
                  placeholder="Seleccione estado"
                  options={[
                    { value: "Activo", label: "Activo" },
                    { value: "Inactivo", label: "Inactivo" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Lote"
                name="idLote"
                rules={[
                  { required: true, message: "Por favor seleccione un lote" },
                ]}
              >
                {/* NOTA: Tu código original no carga 'lotes'. 
                  Si 'lotes' se carga, este Select funcionará.
                  Si 'idLote' es un texto, cambia <Select> por <Input />
                */}
                <Select
                  placeholder="Seleccione un lote"
                  options={lotes.map((l) => ({
                    value: l.idLote,
                    label: `${l.nombre} (Código: ${l.codigo})`,
                  }))}
                  disabled={lotes.length === 0} // Deshabilitado si no hay lotes cargados
                />
                {/* Si 'idLote' es un campo de texto, usa esto en su lugar:
                <Input placeholder="Ingrese el código de lote" />
                */}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </Modal>
  );
}
