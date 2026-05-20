import React, { useMemo, useState, useEffect } from "react";
import {
  Row,
  Col,
  Form,
  Select,
  InputNumber,
  Button,
  List,
  Typography,
  Alert,
  Card,
  Space,
  notification,
} from "antd";

import { buscarTodasSucursales } from "../../../services/functions/Sucursales.js";
import { buscarTodosProductos } from "../../../services/functions/Productos.js";
import { buscarBodegasPorSucursal } from "../../../services/functions/Bodegas.js";

const MAX_ITEMS = 30;

function generarCodigoRegistro() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.floor(100 + Math.random() * 900);
  return `REG-${t}-${r}`;
}

export default function IngresoManual() {
  const [sucursal, setSucursal] = useState([]);
  const [producto, setProducto] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [sucursalId, setSucursalId] = useState("");
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [bodegaId, setBodegaId] = useState("");
  const [items, setItems] = useState([]);
  const [registroCodigo, setRegistroCodigo] = useState(null);
  const [error, setError] = useState("");

  const totalProductos = useMemo(
    () => items.reduce((acc, it) => acc + Number(it.cantidad || 0), 0),
    [items],
  );

  //busquedas
  useEffect(() => {
    buscarTodasSucursales(setSucursal);
    buscarTodosProductos(setProducto);
  }, []);

  const handleSucursalChange = (value) => {
    console.log("sucursal 111,", value);
    setSucursalId(value);
    setBodegaId("");
    buscarBodegasPorSucursal(value, setBodegas);
  };

  function resetFormFields() {
    setProductoId("");
    setCantidad(1);
    setBodegaId("");
    setError("");
  }

  function handleAgregar() {
    setError("");
    if (!sucursalId) return setError("Seleccione una sucursal primero.");
    if (!productoId) return setError("Seleccione un producto.");
    if (!bodegaId) return setError("Seleccione una bodega de envío.");
    if (!cantidad || Number(cantidad) <= 0)
      return setError("Ingrese una cantidad válida (> 0).");
    if (items.length >= MAX_ITEMS)
      return setError(`Máximo ${MAX_ITEMS} productos permitidos.`);

    const pid = String(productoId);
    const bid = String(bodegaId);

    // Si existe la misma combinación producto+bodega, sumamos la cantidad
    const existingIndex = items.findIndex(
      (it) => String(it.productoId) === pid && String(it.bodegaId) === bid,
    );

    if (existingIndex >= 0) {
      const copy = [...items];
      copy[existingIndex].cantidad =
        Number(copy[existingIndex].cantidad) + Number(cantidad);
      setItems(copy);
    } else {
      setItems((prev) => [
        ...prev,
        { productoId: pid, cantidad: Number(cantidad), bodegaId: bid },
      ]);
    }

    resetFormFields();
  }

  function handleQuitar(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleCancelar() {
    setItems([]);
    setSucursalId("");
    setBodegas([]);
    setRegistroCodigo(null);
    resetFormFields();
    setError("");
  }

  function handleRegistrar() {
    setError("");
    if (!sucursalId)
      return setError("Seleccione una sucursal antes de registrar.");
    if (items.length === 0) return setError("No hay productos para registrar.");

    const codigo = generarCodigoRegistro();
    console.log("Registro:", { sucursalId, items, codigo });
    notification.success({
      message: "Ingreso registrado",
      description: `Código de registro: ${codigo}`,
      duration: 3,
    });

    setRegistroCodigo(codigo);
    setItems([]);
    setSucursalId("");
    resetFormFields();
  }

  function findNombre(arr, id) {
    const el = arr.find((x) => String(x.id) === String(id));
    return el ? el.nombre : "-";
  }

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

        <Form layout="vertical">
          <Form.Item label="Seleccionar Sucursal">
            <Select
              placeholder="-- Seleccione --"
              value={sucursalId || undefined}
              onChange={handleSucursalChange}
            >
              {sucursal?.map((s) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.nombre}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={12} align="bottom">
            <Col span={10}>
              <Form.Item label="Producto">
                <Select
                  placeholder="-- Seleccione --"
                  value={productoId || undefined}
                  onChange={(v) => setProductoId(String(v))}
                >
                  {producto?.map((p) => (
                    <Select.Option key={p.id} value={p.id}>
                      {p.nombre}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item label="Cantidad">
                <InputNumber
                  style={{ width: "100%" }}
                  min={1}
                  value={cantidad}
                  onChange={(v) => setCantidad(v || 1)}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label="Bodega de Envío">
                <Select
                  placeholder="-- Seleccione --"
                  value={bodegaId || undefined}
                  onChange={(v) => setBodegaId(String(v))}
                >
                  {bodegas?.map((b) => (
                    <Select.Option key={b.id} value={b.id}>
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
            Productos a ingresar ({items.length})
          </Typography.Title>

          <List
            bordered
            dataSource={items}
            locale={{ emptyText: "No hay productos añadidos." }}
            renderItem={(it, idx) => (
              <List.Item
                actions={[
                  <Button danger size="small" onClick={() => handleQuitar(idx)}>
                    Quitar
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={findNombre(producto, it.productoId)}
                  description={`Cantidad: ${it.cantidad} — Bodega: ${findNombre(
                    bodegas,
                    it.bodegaId,
                  )}`}
                />
              </List.Item>
            )}
            style={{ marginBottom: 12, maxHeight: 300, overflow: "auto" }}
          />

          <div style={{ marginTop: 8, fontWeight: "bold" }}>
            Total de productos: {totalProductos}
          </div>
        </div>

        <Space style={{ marginTop: 16 }}>
          <Button onClick={handleCancelar}>Cancelar</Button>
          <Button type="primary" onClick={handleRegistrar}>
            Registrar ingreso
          </Button>
        </Space>

        {registroCodigo && (
          <Alert
            style={{ marginTop: 16 }}
            message={`Registro creado: ${registroCodigo}`}
            type="success"
          />
        )}
      </Card>
    </>
  );
}
