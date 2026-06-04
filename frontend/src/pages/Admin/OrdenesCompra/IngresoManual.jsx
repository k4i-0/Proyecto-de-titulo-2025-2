import React, { useMemo, useState, useEffect } from "react";
import {
  Row,
  Col,
  Form,
  Select,
  InputNumber,
  Button,
  Table,
  Typography,
  Alert,
  Card,
  Space,
  notification,
} from "antd";
import { ingresoManualProductos } from "../../../services/inventario/Inventario.service.js";

import { buscarTodasSucursales } from "../../../services/functions/Sucursales.js";
import { buscarTodosProductos } from "../../../services/functions/Productos.js";
import { buscarBodegasPorSucursal } from "../../../services/functions/Bodegas.js";

const MAX_ITEMS = 5;

export default function IngresoManual() {
  const [sucursal, setSucursal] = useState([]);
  const [producto, setProducto] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [sucursalId, setSucursalId] = useState("");
  const [error, setError] = useState("");
  const [detalleIngreso, setDetalleIngreso] = useState([]);
  const [enviando, setEnviando] = useState(false);

  const [form] = Form.useForm();

  const totalProductos = useMemo(
    () => detalleIngreso.reduce((acc, it) => acc + Number(it.cantidad || 0), 0),
    [detalleIngreso],
  );

  useEffect(() => {
    buscarTodasSucursales(setSucursal);
    buscarTodosProductos(setProducto);
  }, []);

  useEffect(() => {
    if (sucursalId) {
      buscarBodegasPorSucursal(sucursalId, setBodegas);
    } else {
      setBodegas([]);
    }
  }, [sucursalId]);

  const handleSucursalChange = (value) => {
    setSucursalId(value ? String(value) : "");
    form.setFieldsValue({ idBodega: undefined });
  };

  function resetFormFields() {
    setError("");
    form.resetFields(["idProducto", "cantidad", "idBodega"]);
  }

  async function handleAgregar() {
    setError("");
    const values = form.getFieldsValue();
    const idSucursal = values.idSucursal ? String(values.idSucursal) : "";
    const idProducto = values.idProducto ? String(values.idProducto) : "";
    const idBodega = values.idBodega ? String(values.idBodega) : "";
    const cantidad = Number(values.cantidad || 0);

    if (!idSucursal) return setError("Seleccione una sucursal primero.");
    if (!idProducto) return setError("Seleccione un producto.");
    if (!idBodega) return setError("Seleccione una bodega de envío.");
    if (!cantidad || cantidad <= 0)
      return setError("Ingrese una cantidad válida (> 0).");
    if (detalleIngreso.length >= MAX_ITEMS)
      return setError(`Máximo ${MAX_ITEMS} productos permitidos.`);

    const productoSeleccionado = producto.find(
      (p) =>
        String(p.id) === String(idProducto) ||
        String(p.idProducto) === String(idProducto),
    );
    const bodegaSeleccionada = (bodegas || []).find(
      (b) =>
        String(b.id) === String(idBodega) ||
        String(b.idBodega) === String(idBodega),
    );
    const sucursalSeleccionada = (sucursal || []).find(
      (s) =>
        String(s.id) === String(idSucursal) ||
        String(s.idSucursal) === String(idSucursal),
    );

    if (!productoSeleccionado || !bodegaSeleccionada || !sucursalSeleccionada) {
      return setError(
        "No se pudo resolver producto/sucursal/bodega seleccionada.",
      );
    }

    const yaExiste = detalleIngreso.some(
      (it) =>
        String(it.idProducto) === String(idProducto) &&
        String(it.idBodega) === String(idBodega) &&
        String(it.idSucursal) === String(idSucursal),
    );

    if (yaExiste) {
      setDetalleIngreso((prev) =>
        prev.map((it) =>
          String(it.idProducto) === String(idProducto) &&
          String(it.idBodega) === String(idBodega) &&
          String(it.idSucursal) === String(idSucursal)
            ? { ...it, cantidad: Number(it.cantidad) + cantidad }
            : it,
        ),
      );
    } else {
      setDetalleIngreso((prev) => [
        ...prev,
        {
          key: crypto.randomUUID(),
          idProducto,
          productoNombre: productoSeleccionado.nombre,
          cantidad,
          idBodega,
          bodegaNombre: bodegaSeleccionada.nombre,
          idSucursal,
          sucursalNombre: sucursalSeleccionada.nombre,
        },
      ]);
    }

    resetFormFields();
  }

  function handleCancelar() {
    setDetalleIngreso([]);
    setSucursalId("");
    setBodegas([]);
    form.resetFields();
    resetFormFields();
    setError("");
  }

  async function handleRegistrar() {
    setError("");
    if (!sucursalId)
      return setError("Seleccione una sucursal antes de registrar.");
    if (detalleIngreso.length === 0)
      return setError("No hay productos para registrar.");

    await enviarIngresoManual();
  }

  const enviarIngresoManual = async () => {
    try {
      setEnviando(true);
      const values = form.getFieldsValue();
      const idSucursal = values.idSucursal ? String(values.idSucursal) : "";
      const payload = detalleIngreso.map((item) => ({
        idProducto: item.idProducto,
        cantidad: Number(item.cantidad || 0),
        idSucursal: item.idSucursal || idSucursal,
        idBodega: item.idBodega,
      }));

      const response = await ingresoManualProductos(payload);
      if (response?.status === 200) {
        notification.success({
          message: "Ingreso exitoso",
          description: "Los productos han sido ingresados correctamente.",
          duration: 4,
        });
        setDetalleIngreso([]);
        setSucursalId("");
        setBodegas([]);
        form.resetFields();
        return;
      }

      notification.error({
        message: "Error al ingresar productos",
        description:
          response?.error || "No se pudo completar el ingreso de productos.",
        duration: 4,
      });
    } catch (error) {
      console.log("error enviar datos ingreso manual", error);
      notification.error({
        message: "Error de conexión",
        description: "No se pudo conectar al servidor para ingresar productos.",
        duration: 4,
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <Card style={{ margin: 10, padding: 0 }}>
        <Row gutter={16} align="bottom">
          <Col span={24}>
            <Typography.Title level={2}>
              Ingreso Manual a Inventario
            </Typography.Title>
            <Typography.Text type="secondary">
              Registre manualmente productos que ingresan a una sucursal.
            </Typography.Text>
          </Col>
        </Row>
      </Card>
      <Card style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
        <Typography.Title level={3}>
          Ingreso Manual a Inventario
        </Typography.Title>

        <Form form={form} layout="vertical">
          <Form.Item label="Seleccionar Sucursal" name="idSucursal">
            <Select
              placeholder="-- Seleccione --"
              onChange={handleSucursalChange}
            >
              {sucursal?.map((s) => (
                <Select.Option key={s.idSucursal} value={s.idSucursal}>
                  {s.nombre}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={12} align="bottom">
            <Col span={10}>
              <Form.Item label="Producto" name="idProducto">
                <Select placeholder="-- Seleccione --">
                  {producto?.map((p) => (
                    <Select.Option key={p.idProducto} value={p.idProducto}>
                      {p.nombre}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item label="Cantidad" name="cantidad">
                <InputNumber style={{ width: "100%" }} min={1} />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label="Bodega de Envío" name="idBodega">
                <Select placeholder="-- Seleccione --">
                  {bodegas?.map((b) => (
                    <Select.Option key={b.idBodega} value={b.idBodega}>
                      {b.nombre}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Space style={{ marginBottom: 12 }}>
            <Button onClick={handleAgregar} type="primary">
              Agregar a lista
            </Button>
            <Button onClick={resetFormFields}>Limpiar campos</Button>
          </Space>
        </Form>

        {error && (
          <Alert style={{ marginBottom: 12 }} message={error} type="error" />
        )}

        <div style={{ marginTop: 8 }}>
          <Typography.Title level={5}>
            Productos a ingresar ({detalleIngreso.length})
          </Typography.Title>

          <Table
            rowKey="key"
            bordered
            pagination={false}
            locale={{ emptyText: "No hay productos añadidos." }}
            dataSource={detalleIngreso}
            columns={[
              {
                title: "Producto",
                dataIndex: "productoNombre",
                key: "productoNombre",
              },
              {
                title: "Sucursal",
                dataIndex: "sucursalNombre",
                key: "sucursalNombre",
              },
              {
                title: "Bodega",
                dataIndex: "bodegaNombre",
                key: "bodegaNombre",
              },
              {
                title: "Cantidad",
                dataIndex: "cantidad",
                key: "cantidad",
                width: 150,
                render: (value, record) => (
                  <InputNumber
                    style={{ width: "100%" }}
                    min={1}
                    value={value}
                    onChange={(nextValue) =>
                      setDetalleIngreso((prev) =>
                        prev.map((row) =>
                          row.key === record.key
                            ? { ...row, cantidad: Number(nextValue || 1) }
                            : row,
                        ),
                      )
                    }
                  />
                ),
              },
              {
                title: "Acciones",
                key: "acciones",
                width: 110,
                align: "center",
                render: (_, record) => (
                  <Button
                    danger
                    size="small"
                    onClick={() =>
                      setDetalleIngreso((prev) =>
                        prev.filter((row) => row.key !== record.key),
                      )
                    }
                  >
                    Quitar
                  </Button>
                ),
              },
            ]}
            style={{ marginBottom: 12, maxHeight: 300, overflow: "auto" }}
          />

          <div style={{ marginTop: 8, fontWeight: "bold" }}>
            Total de productos: {totalProductos}
          </div>
        </div>

        <Space style={{ marginTop: 16 }}>
          <Button onClick={handleCancelar}>Cancelar</Button>
          <Button type="primary" onClick={handleRegistrar} loading={enviando}>
            Registrar ingreso
          </Button>
        </Space>
      </Card>
    </>
  );
}
