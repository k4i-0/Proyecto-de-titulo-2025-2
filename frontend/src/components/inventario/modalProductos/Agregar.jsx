import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Button,
  Form,
  Modal,
  Alert,
  Input,
  Select,
  InputNumber,
} from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { crearProducto } from "../../../services/inventario/Productos.service";

const { TextArea } = Input;

export default function Agregar({
  modalCrear,
  handleCerrarModal,
  categorias,
  funcionBuscarProductos,
}) {
  const [form] = Form.useForm();
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sinCategorias, setSinCategorias] = useState(false);

  useEffect(() => {
    if (categorias.length === 0) {
      setMensaje(
        "No existe Categoría, debe crear una antes de agregar productos"
      );
      setSinCategorias(true);
      setError(true);
    } else {
      setMensaje("");
      setSinCategorias(false);
      setError(false);
    }
  }, [categorias]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(false);
    setMensaje("");

    try {
      const resultado = await crearProducto(values);

      if (resultado.status === 201) {
        setMensaje("Producto creado exitosamente");
        setError(false);
        setTimeout(() => {
          funcionBuscarProductos();
          form.resetFields();
          handleCerrarModal();
          setMensaje("");
        }, 1200);
      } else {
        setError(true);
        setMensaje(
          resultado.data?.message ||
            resultado.error ||
            "Error al crear el producto"
        );
      }
    } catch (err) {
      setError(true);
      setMensaje(
        err.response?.data?.message || "Error de conexión al crear el producto"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrar = () => {
    setMensaje("");
    setError(false);
    form.resetFields();
    handleCerrarModal();
  };

  return (
    <Modal
      open={modalCrear}
      title="Crear Nuevo Producto"
      onCancel={handleCerrar}
      footer={[
        <Button key="cancelar" onClick={handleCerrar}>
          Cancelar
        </Button>,
        <Button
          key="crear"
          type="primary"
          loading={loading}
          disabled={sinCategorias}
          onClick={() => form.submit()}
        >
          Crear Producto
        </Button>,
      ]}
      width={800}
    >
      {sinCategorias && (
        <Alert
          message="No hay categorías disponibles"
          description={mensaje}
          type="error"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 16 }}
        />
      )}

      {mensaje && !sinCategorias && (
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
        disabled={sinCategorias}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="NPI"
              name="idProducto"
              rules={[{ required: true, message: "Por favor ingrese el NPI" }]}
            >
              <Input placeholder="Ingrese NPI del producto" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Código"
              name="codigo"
              rules={[
                { required: true, message: "Por favor ingrese el código" },
              ]}
            >
              <InputNumber
                placeholder="Ingrese código del producto"
                style={{ width: "100%" }}
                min={0}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Nombre"
              name="nombre"
              rules={[
                { required: true, message: "Por favor ingrese el nombre" },
              ]}
            >
              <Input placeholder="Ingrese nombre del producto" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Marca"
              name="marca"
              rules={[
                {
                  required: true,
                  message: "Por favor ingrese la marca del producto",
                },
              ]}
            >
              <Input placeholder="Ingrese marca del producto" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Precio Compra"
              name="precioCompra"
              rules={[
                {
                  required: true,
                  message: "Por favor ingrese el precio de compra",
                },
              ]}
            >
              <InputNumber
                placeholder="1000"
                style={{ width: "100%" }}
                min={0}
                step={1}
                precision={0}
                prefix="$"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Precio Venta"
              name="precioVenta"
              rules={[
                {
                  required: true,
                  message: "Por favor ingrese el precio de venta",
                },
              ]}
            >
              <InputNumber
                placeholder="5000"
                style={{ width: "100%" }}
                min={0}
                step={1}
                precision={0}
                prefix="$"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Peso (kg)" name="peso">
              <InputNumber
                placeholder="2000"
                style={{ width: "100%" }}
                min={0}
                step={0.1}
                precision={1}
                suffix="kg"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Estado"
              name="estado"
              initialValue="Activo"
              rules={[
                { required: true, message: "Por favor seleccione el estado" },
              ]}
            >
              <Select placeholder="Seleccione estado">
                <Select.Option value="Activo">Activo</Select.Option>
                <Select.Option value="Inactivo">Inactivo</Select.Option>
                <Select.Option value="Depreciado">Depreciado</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Descripción" name="descripcion">
          <TextArea
            rows={3}
            placeholder="Ingrese descripción del producto"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          label="Categoría"
          name="nameCategoria"
          rules={[
            { required: true, message: "Por favor seleccione una categoría" },
          ]}
        >
          <Select
            placeholder="Seleccione una categoría"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {categorias.map((categoria) => (
              <Select.Option
                key={categoria.idCategoria}
                value={categoria.nombre}
              >
                {categoria.nombre}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
