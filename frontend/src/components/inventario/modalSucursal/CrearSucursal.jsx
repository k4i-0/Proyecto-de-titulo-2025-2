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
  Checkbox,
  Divider,
  Space,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

import { crearSucursal } from "../../../services/inventario/Sucursal.service";
import { crearBodega } from "../../../services/inventario/Bodega.service";

export default function AgregarSucursal({
  show,
  handleClose,
  buscarSucursales,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);
  const [agregarBodega, setAgregarBodega] = useState(false); // Estado para controlar si se agrega bodega

  const handleSubmit = async (values) => {
    setLoading(true);
    setMensaje("");
    setError(false);

    const datosSucursal = {
      nombre: values.nombreSucursal,
      direccion: values.direccion,
      estado: values.estadoSucursal,
    };

    try {
      const resultado = await crearSucursal(datosSucursal);

      if (resultado.status === 201) {
        // Si el usuario eligió agregar bodega
        if (agregarBodega) {
          const datosBodega = {
            nombre: values.nombreBodega,
            capacidad: values.capacidad,
            estado: values.estadoBodega,
            idSucursal: resultado.data.idSucursal,
          };

          const resultadoBodega = await crearBodega(datosBodega);

          if (resultadoBodega.status === 201) {
            setMensaje("Sucursal y bodega creadas exitosamente");
            setError(false);
          } else {
            setMensaje(
              "Sucursal creada, pero error al crear bodega: " +
                (resultadoBodega.data?.message ||
                  resultadoBodega.error ||
                  "Error desconocido.")
            );
            setError(true);
          }
        } else {
          // Solo se creó la sucursal
          setMensaje("Sucursal creada exitosamente");
          setError(false);
        }

        setTimeout(() => {
          buscarSucursales();
          form.resetFields();
          setAgregarBodega(false);
          handleClose();
          setMensaje("");
        }, 1200);
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
    setAgregarBodega(false);
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
                initialValue="Abierta"
                rules={[
                  { required: true, message: "Por favor seleccione un estado" },
                ]}
              >
                <Select
                  placeholder="Seleccione un estado"
                  options={[
                    { value: "Abierta", label: "Abierta" },
                    { value: "Cerrada", label: "Cerrada" },
                    { value: "Mantencion", label: "Mantencion" },
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

          <Divider />

          {/* Checkbox para agregar bodega */}
          <Form.Item>
            <Checkbox
              checked={agregarBodega}
              onChange={(e) => {
                setAgregarBodega(e.target.checked);
                // Limpiar campos de bodega si se desmarca
                if (!e.target.checked) {
                  form.setFieldsValue({
                    nombreBodega: undefined,
                    capacidad: undefined,
                    estadoBodega: undefined,
                  });
                }
              }}
            >
              <Space>
                <PlusOutlined />
                <span style={{ fontWeight: 600 }}>
                  Agregar Bodega Principal
                </span>
              </Space>
            </Checkbox>
          </Form.Item>

          {/* Datos de la Bodega Principal (condicional) */}
          {agregarBodega && (
            <>
              <div
                style={{
                  marginBottom: 16,
                  fontWeight: 600,
                  fontSize: 16,
                  marginTop: 16,
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
                        required: agregarBodega,
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
                        required: agregarBodega,
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
                    initialValue="En Funcionamiento"
                    rules={[
                      {
                        required: agregarBodega,
                        message:
                          "Por favor seleccione un estado para la bodega",
                      },
                    ]}
                  >
                    <Select
                      allowClear
                      placeholder="Seleccione un estado"
                      options={[
                        {
                          value: "En Funcionamiento",
                          label: "En Funcionamiento",
                        },
                        {
                          value: "En Mantenimiento",
                          label: "En Mantenimiento",
                        },
                        {
                          value: "Fuera de Servicio",
                          label: "Fuera de Servicio",
                        },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}
        </Form>
      </Spin>
    </Modal>
  );
}
