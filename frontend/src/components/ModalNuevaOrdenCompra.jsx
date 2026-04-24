import React from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  Button,
  Row,
  Col,
  InputNumber,
  Divider,
  Space,
  Typography,
  Popconfirm,
  Alert,
  notification,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import DataTable from "./Tabla";

const { Title, Text } = Typography;

import { verificarStockProductosOrdenCompra } from "../services/inventario/CompraProveedor.service";

const ModalNuevaOrdenCompra = ({
  visible,
  onCancel,
  formOrdenCompra,
  formSeleccionarProducto,
  proveedores,
  sucursales,
  productos,
  proveedorSeleccionado,
  vendedorSeleccionado,
  productosSeleccionados,
  onSeleccionarProveedor,
  onAgregarProducto,
  onEliminarProducto,
  onAgregarProductoOrden,
  onGuardarOrden,
  onEditarProducto = () => {},
  loading,
  drawerSelectProductoOpen,
  setDrawerSelectProductoOpen,
}) => {
  //console.log("usuario:", user.nombreRol);
  const totalOrdenCompra = productosSeleccionados.reduce(
    (acumulado, producto) =>
      acumulado +
      (producto.cantidadProducto || 0) * (producto.valorUnitarioProducto || 0),
    0,
  );

  const verificarStock = async (idSucursal, idProveedor) => {
    try {
      const respuesta = await verificarStockProductosOrdenCompra(
        idSucursal,
        idProveedor,
      );

      if (respuesta.status === 200) {
        for (let i = 0; i < respuesta.data.length; i++) {
          //console.log("Productos con stock suficiente:", respuesta.data[i]);
          onAgregarProductoOrden({
            productoSeleccionado: respuesta.data[i].productoSeleccionado,
            cantidadProducto: respuesta.data[i].cantidadProducto,
            valorUnitarioProducto: respuesta.data[i].valorUnitarioProducto,
          });
        }
      }
      if (respuesta.status === 404) {
        notification.error({
          message: "Verificación de stock:",
          description:
            respuesta.data.error ||
            "No se encontraron productos con stock suficiente para recomendar.",
          duration: 5,
        });
      }
    } catch (error) {
      console.log("Error al obtener VerificarStock", error);

      notification.error({
        message: "Error al verificar stock",
        description:
          error.error ||
          "Ocurrió un error al verificar el stock de los productos. Por favor, intenta nuevamente.",
      });
    }
  };

  const handleVerificarStock = () => {
    const idSucursal = formOrdenCompra.getFieldValue("idSucursal");
    const idProveedor = formOrdenCompra.getFieldValue("idProveedor");
    console.log("handle datos:", idSucursal, idProveedor);
    if (idSucursal && idProveedor) {
      verificarStock(idSucursal, idProveedor);
    } else {
      notification.warning({
        message: "Datos incompletos",
        description:
          "Por favor, selecciona una sucursal y un proveedor para verificar el stock.",
      });
    }
  };
  return (
    <>
      {/* Modal Nueva Orden de Compra */}
      <Modal
        title="Nueva Orden de Compra"
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={900}
        forceRender
      >
        <Form
          form={formOrdenCompra}
          layout="vertical"
          onFinish={onGuardarOrden}
        >
          {proveedores.length === 0 && (
            <Alert
              message="Debes Solicitar la creación de proveedores antes de crear una orden de compra."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Buscar proveedor"
                name="idProveedor"
                rules={[
                  { required: true, message: "Proveedor es obligatorio" },
                ]}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder="Ingresa RUT o nombre del proveedor"
                  disabled={proveedores.length === 0}
                  options={proveedores.map((proveedor) => ({
                    value: proveedor.idProveedor,
                    label: `${proveedor.rut} - ${proveedor.nombre}`,
                  }))}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  onChange={onSeleccionarProveedor}
                  onClear={() => {
                    formOrdenCompra.setFieldsValue({
                      rutProveedor: undefined,
                      nombreProveedor: undefined,
                      idVendedorProveedor: undefined,
                      vendedorAsociado: undefined,
                    });
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Funcionario solicitante" name="idFuncionario">
                <Input disabled placeholder="Funcionario solicitante" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Sucursal" name="idSucursal" initialValue={100}>
                <Select
                  showSearch
                  placeholder="Selecciona una sucursal"
                  options={sucursales.map((sucursal) => ({
                    value: sucursal.idSucursal,
                    label: sucursal.nombre,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginBottom: 8 }}>
            <Col span={8}>
              <Form.Item label="Nombre proveedor" name="nombreProveedor">
                <Input disabled placeholder="Nombre proveedor" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="RUT proveedor" name="rutProveedor">
                <Input disabled placeholder="RUT proveedor" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Vendedor asociado" name="vendedorAsociado">
                <Input
                  disabled
                  placeholder="Vendedor asociado"
                  value={vendedorSeleccionado?.nombre || "—"}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Row gutter={16}>
            <Col span={24}>
              <Space
                style={{ marginBottom: 16, width: "100%" }}
                justify="space-between"
              >
                <Title level={4} style={{ margin: 0 }}>
                  Productos de la orden
                </Title>
                <Button
                  type="default"
                  icon={<PlusOutlined />}
                  onClick={onAgregarProducto}
                  disabled={!proveedorSeleccionado}
                >
                  Agregar producto
                </Button>
                <Button
                  type="default"
                  icon={<PlusOutlined />}
                  onClick={handleVerificarStock}
                  disabled={
                    !proveedorSeleccionado ||
                    !formOrdenCompra.getFieldValue("idSucursal")
                  }
                >
                  Productos Recomendados
                </Button>
              </Space>
            </Col>
          </Row>

          <Modal
            title="Agregar Producto"
            open={drawerSelectProductoOpen}
            onCancel={() => setDrawerSelectProductoOpen(false)}
            footer={null}
            width={700}
          >
            <Title level={4}>Seleccionar producto</Title>
            {productos.length === 0 && (
              <Alert
                message="Debes Solicitar la creación de productos antes de agregar a la orden de compra."
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
            <Form
              layout="vertical"
              form={formSeleccionarProducto}
              onFinish={onAgregarProductoOrden}
            >
              <Form.Item
                label="Producto"
                name="productoSeleccionado"
                rules={[{ required: true, message: "Producto es obligatorio" }]}
              >
                <Select
                  showSearch
                  placeholder={
                    productos.length > 0
                      ? "Busca por código o nombre"
                      : "No hay productos disponibles"
                  }
                  disabled={productos.length === 0}
                  options={productos.map((producto) => ({
                    value: producto.idProducto,
                    label: `${producto.codigoProducto || producto.codigo} - ${producto.nombre}`,
                  }))}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Cantidad"
                    name="cantidadProducto"
                    rules={[
                      { required: true, message: "Cantidad es obligatoria" },
                    ]}
                    initialValue={1}
                  >
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Precio compra"
                    name="valorUnitarioProducto"
                    rules={[
                      {
                        required: true,
                        message: "Precio compra es obligatorio",
                      },
                      {
                        type: "number",
                        min: 1,
                        message: "El precio debe ser mayor a 0",
                      },
                    ]}
                    initialValue={1}
                  >
                    <InputNumber
                      min={1}
                      step="0.01"
                      precision={0}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item style={{ textAlign: "right" }}>
                <Button type="primary" htmlType="submit">
                  Agregar a la orden
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          <DataTable
            columns={[
              {
                title: "ID",
                dataIndex: "key",
                key: "key",
              },
              {
                title: "Código",
                dataIndex: "codigoProducto",
                key: "codigoProducto",
                render: (codigo) => codigo || "—",
              },
              {
                title: "Producto",
                dataIndex: "nombreProducto",
                key: "nombreProducto",
                render: (nombre) => nombre || "—",
              },
              {
                title: "Cantidad",
                dataIndex: "cantidadProducto",
                key: "cantidadProducto",
                render: (valor, record) => (
                  <InputNumber
                    min={1}
                    value={Number(valor || 0)}
                    style={{ width: "100%" }}
                    onChange={(nuevoValor) =>
                      onEditarProducto(
                        record.key,
                        "cantidadProducto",
                        nuevoValor,
                      )
                    }
                  />
                ),
              },
              {
                title: "Valor Unitario",
                dataIndex: "valorUnitarioProducto",
                key: "valorUnitarioProducto",
                render: (valor, record) => (
                  <InputNumber
                    min={1}
                    step="1"
                    precision={0}
                    value={Number(valor || 0)}
                    style={{ width: "100%" }}
                    onChange={(nuevoValor) =>
                      onEditarProducto(
                        record.key,
                        "valorUnitarioProducto",
                        nuevoValor,
                      )
                    }
                  />
                ),
              },
              {
                title: "Total",
                dataIndex: "total",
                key: "total",
                render: (_, record) => {
                  const total =
                    (record.cantidadProducto || 0) *
                    (record.valorUnitarioProducto || 0);
                  return `$${total.toLocaleString("es-CL")}`;
                },
              },
              {
                title: "Acciones",
                key: "acciones",
                render: (_, record) => (
                  <Popconfirm
                    title="¿Eliminar producto?"
                    description="¿Está seguro de eliminar este producto de la orden?"
                    onConfirm={() => onEliminarProducto(record.key)}
                    okText="Sí"
                    cancelText="No"
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                    ></Button>
                  </Popconfirm>
                ),
              },
            ]}
            data={productosSeleccionados}
            rowKey="key"
            pagination={false}
            showSearch={false}
            showFilters={false}
          />

          <Divider />

          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={24}>
              <Text strong>
                Total orden: ${totalOrdenCompra.toLocaleString("es-CL")}
              </Text>
            </Col>
          </Row>

          <Form.Item
            label="Observaciones"
            name="observaciones"
            rules={[
              { required: true, message: "Observaciones son obligatorias" },
            ]}
          >
            <Input.TextArea rows={4} placeholder="Observaciones adicionales" />
          </Form.Item>

          <Row justify="end" gutter={8}>
            <Col>
              <Button key="cancel" onClick={onCancel}>
                Cancelar
              </Button>
            </Col>
            <Col>
              <Button
                key="submit"
                type="primary"
                loading={loading}
                disabled={
                  proveedores.length === 0 ||
                  productosSeleccionados.length === 0 ||
                  productos.length === 0 ||
                  !proveedorSeleccionado
                }
                onClick={() => {
                  formOrdenCompra.submit();
                }}
              >
                Generar orden
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default ModalNuevaOrdenCompra;
