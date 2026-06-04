import { Button, Col, Form, Input, Modal, Row, Select } from "antd";

import DataTable from "./Tabla";

export default function ModalIngresoManualProductos({
  open,
  onCancel,
  onConfirm,
  form,
  productos = [],
  sucursalesDisponibles = [],
  bodegas = [],
  detalleIngreso = [],
  onAgregarDetalle,
  onChangeSucursalIngreso,
  onEditarCantidad,
  onEliminarFila,
}) {
  const columnsDetalle = [
    {
      title: "Producto",
      dataIndex: "productoNombre",
      key: "producto",
    },
    {
      title: "Sucursal",
      dataIndex: "sucursalNombre",
      key: "sucursal",
    },
    {
      title: "Bodega",
      dataIndex: "bodegaNombre",
      key: "bodega",
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
      width: 150,
      render: (value, record) => (
        <Input
          type="number"
          value={value}
          min={1}
          style={{ width: "100%" }}
          onChange={(e) => onEditarCantidad(record.key, Number(e.target.value))}
        />
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Button danger size="small" onClick={() => onEliminarFila(record.key)}>
          Eliminar
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title="Ingreso manual de productos"
      open={open}
      onCancel={onCancel}
      okText="Confirmar Ingreso"
      okButtonProps={{ disabled: detalleIngreso.length === 0 }}
      onOk={onConfirm}
      width={700}
    >
      <Form form={form} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item label="Producto" name="producto">
              <Select
                placeholder="Selecciona un producto"
                allowClear
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
              >
                {productos.map((producto) => (
                  <Select.Option
                    key={producto.idProducto}
                    value={producto.idProducto}
                    label={`${producto.codigo} - ${producto.nombre} (${producto.marca})`}
                  >
                    {`${producto.codigo} - ${producto.nombre} (${producto.marca})`}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Cantidad" name="cantidad">
              <Input
                type="number"
                placeholder="Ingresa la cantidad a ingresar"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item label="Sucursal" name="sucursal">
              <Select
                placeholder="Selecciona una sucursal"
                allowClear
                onChange={onChangeSucursalIngreso}
              >
                {sucursalesDisponibles.map((sucursal) => (
                  <Select.Option
                    key={sucursal.idSucursal}
                    value={sucursal.idSucursal}
                  >
                    {`${sucursal.idSucursal} - ${sucursal.nombre}`}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Bodega" name="bodega">
              <Select
                placeholder="Selecciona una bodega"
                disabled={bodegas.length === 0}
              >
                {bodegas.map((bodega) => (
                  <Select.Option key={bodega.idBodega} value={bodega.idBodega}>
                    {`${bodega.idBodega} - ${bodega.nombre}`}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" onClick={onAgregarDetalle}>
            Agregar
          </Button>
        </Form.Item>
      </Form>
      {detalleIngreso.length > 0 && (
        <DataTable
          data={detalleIngreso}
          columns={columnsDetalle}
          rowKey="key"
          showSearch={false}
          showFilters={false}
          pagination={false}
        />
      )}
    </Modal>
  );
}
