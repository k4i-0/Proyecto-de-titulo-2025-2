import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Button,
  Form,
  Modal,
  notification,
  Input,
  Select,
  InputNumber,
} from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { crearProducto } from "../../../../services/inventario/Productos.service";

const { TextArea } = Input;

export default function Agregar({
  modalCrear,
  handleCerrarModal,
  categorias,
  funcionBuscarProductos,
}) {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [sinCategorias, setSinCategorias] = useState(false);

  useEffect(() => {
    if (categorias.length === 0) {
      notification.error({
        message: "No existe Categoría",
        description: "Debe crear una antes de agregar productos",
        key: "sinCategorias",
      });
      setSinCategorias(true);
    } else {
      notification.destroy("sinCategorias");
      setSinCategorias(false);
    }
  }, [categorias]);

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      const resultado = await crearProducto(values);

      if (resultado.status === 201) {
        notification.success({
          message: "Producto creado exitosamente",
        });
        setTimeout(() => {
          funcionBuscarProductos();
          form.resetFields();
          handleCerrarModal();
        }, 1200);
      } else {
        const msg =
          resultado.data?.message ||
          resultado.error ||
          "Error al crear el producto";
        notification.error({
          message: "Error al crear el producto",
          description: msg,
        });
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "Error de conexión al crear el producto";
      notification.error({
        message: "Error al crear el producto",
        description: errMsg,
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrar = () => {
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
      {/* sinCategorias se muestra via notification */}

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
              label="Código"
              name="codigo"
              rules={[
                { required: true, message: "Por favor ingrese el código" },
                {
                  pattern: /^(?:\d{8}|\d{12}|\d{13})$/,
                  message:
                    "Ingrese un código EAN/UPC válido (8, 12 o 13 dígitos)",
                },
              ]}
            >
              <Input
                placeholder="Ingrese código EAN/UPC (8, 12 o 13 dígitos)"
                maxLength={13}
                inputMode="numeric"
                pattern="\\d*"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Estado" name="estado" initialValue="Activo">
              <Select placeholder="Seleccione estado" disabled>
                <Select.Option value="Activo">Activo</Select.Option>
                <Select.Option value="Inactivo">Inactivo</Select.Option>
                <Select.Option value="Depreciado">Depreciado</Select.Option>
              </Select>
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
                {
                  pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ]+$/,
                  message: "Solo se permiten letras, números y espacios",
                },
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
            <Form.Item label="Precio Venta" name="precioVenta">
              <InputNumber
                placeholder="2000"
                style={{ width: "100%" }}
                min={0}
                step={0}
                precision={1}
                formatter={(value) =>
                  `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                parser={(value) => value.replace(/\$\s?|\./g, "")}
              />
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
            optionFilterProp="label"
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          >
            {categorias.map((categoria) => (
              <Select.Option
                key={categoria.idCategoria}
                value={categoria.nombreCategoria}
                label={categoria.nombreCategoria}
              >
                {categoria.nombreCategoria}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
