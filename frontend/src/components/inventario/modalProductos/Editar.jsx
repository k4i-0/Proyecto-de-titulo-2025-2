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
import { editarProducto } from "../../../services/inventario/Productos.service";

const { TextArea } = Input;

export default function Editar({
  Producto,
  modalEditar,
  handleCerrarModal,
  categorias,
  funcionBuscarProductos,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (Producto) {
      // console.log("Cargando producto en el formulario de edición:", Producto);
      form.setFieldsValue({
        idProducto: Producto.idProducto || "",
        marca: Producto.marca || "",
        codigo: Producto.codigo || "",
        nombre: Producto.nombre || "",
        precioCompra: Producto.precioCompra || "",
        precioVenta: Producto.precioVenta || "",
        peso: Producto.peso || "",
        descripcion: Producto.descripcion || "",
        estado: Producto.estado || "",
        nameCategoria: Producto.categoria?.nombreCategoria || "",
      });
      setError("");
      setMensaje("");
    }
  }, [Producto, form]);

  const handleSubmitEdicion = async (values) => {
    setLoading(true);
    setError("");
    setMensaje("");
    // console.log("Valores enviados para edición:", values);
    try {
      const respuesta = await editarProducto(values, Producto.idProducto);
      if (respuesta.status === 200) {
        setMensaje("Producto actualizado exitosamente");
        setTimeout(() => {
          funcionBuscarProductos();
          handleCerrar();
        }, 1200);
      } else {
        setError(
          respuesta.data?.message ||
            respuesta.error ||
            "Ocurrió un error al actualizar."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Error de conexión. Por favor, intenta de nuevo."
      );
      console.log("Error al editar:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrar = () => {
    setError("");
    setMensaje("");
    form.resetFields();
    handleCerrarModal();
  };

  return (
    <Modal
      open={modalEditar}
      title={`Editar Producto: ${Producto?.nombre || ""}`}
      onCancel={handleCerrar}
      footer={[
        <Button key="cancelar" onClick={handleCerrar} disabled={loading}>
          Cancelar
        </Button>,
        <Button
          key="guardar"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          Guardar Cambios
        </Button>,
      ]}
      width={800}
    >
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => setError("")}
          style={{ marginBottom: 16 }}
        />
      )}

      {mensaje && (
        <Alert
          message={mensaje}
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmitEdicion}
        autoComplete="off"
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
                placeholder="0.00"
                style={{ width: "100%" }}
                min={0}
                step={0.01}
                precision={2}
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
