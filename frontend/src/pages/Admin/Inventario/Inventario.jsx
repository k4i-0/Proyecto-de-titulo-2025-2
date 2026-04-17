import { useEffect, useState } from "react";
import {
  Button,
  Typography,
  Space,
  Empty,
  Spin,
  Select,
  notification,
  Card,
  Tag,
  Statistic,
  Row,
  Col,
  Modal,
} from "antd";

import { LoadingOutlined, ReloadOutlined } from "@ant-design/icons";

import DataTable from "../../../components/Tabla";
import obtenerInventarios from "../../../services/inventario/Inventario.service";
import obtenerSucursales from "../../../services/inventario/Sucursal.service";

import { obtenerLotesAsociadosInventario } from "../../../services/inventario/Lote.service";

const estadoColores = {
  Bueno: "success",
  Malo: "warning",
  Roto: "error",
  Vendido: "default",
  Vencido: "purple",
};

export default function Inventario() {
  const [inventarios, setInventarios] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalLotesVisible, setModalLotesVisible] = useState(false);
  const [lotes, setLotes] = useState([]);

  const buscarSucursales = async () => {
    setLoading(true);
    try {
      const response = await obtenerSucursales();
      if (response.status === 200) {
        setSucursales(response.data || []);
      } else {
        notification.error({
          message: "Error",
          description: response.error || "No se pudieron cargar las sucursales",
        });
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Error de conexión",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const cargarInventarios = async (idSucursal) => {
    try {
      setLoading(true);
      const response = await obtenerInventarios(idSucursal);
      if (response?.status === 200) {
        setInventarios(Array.isArray(response.data) ? response.data : []);
      } else {
        setInventarios([]);
      }
    } catch (error) {
      console.error("Error al obtener inventarios:", error);
      setInventarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarSucursales();
  }, []);

  const handleSucursalSeleccionada = (value) => {
    const sucursal = sucursales.find((s) => s.idSucursal === value);
    setSucursalSeleccionada(sucursal);
    cargarInventarios(value);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "—";
    const fechaParseada = new Date(fecha);
    if (Number.isNaN(fechaParseada.getTime())) return "—";
    return fechaParseada.toLocaleDateString("es-CL");
  };

  const columns = [
    {
      title: "Producto",
      dataIndex: ["producto", "nombre"],
      key: "nombre",
      width: "25%",
      render: (v) => v || "—",
    },
    {
      title: "Código",
      dataIndex: ["producto", "codigo"],
      key: "codigo",
      width: "12%",
      align: "center",
      render: (v) => v || "—",
    },
    {
      title: "Bodega",
      dataIndex: ["bodega", "nombre"],
      key: "bodega",
      width: "15%",
      render: (v) => v || "—",
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      width: "10%",
      align: "center",
      sorter: (a, b) => (a.stock || 0) - (b.stock || 0),
      render: (stock) => (
        <Tag
          color={stock > 10 ? "success" : stock > 0 ? "warning" : "error"}
          style={{ fontSize: "13px" }}
        >
          {stock ?? 0}
        </Tag>
      ),
    },
    {
      title: "Mín.",
      dataIndex: "stockMinimo",
      key: "stockMinimo",
      width: "8%",
      align: "center",
    },
    {
      title: "Máx.",
      dataIndex: "stockMaximo",
      key: "stockMaximo",
      width: "8%",
      align: "center",
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: "12%",
      align: "center",
      render: (estado) => (
        <Tag
          color={estadoColores[estado] || "default"}
          style={{ fontSize: "13px" }}
        >
          {estado || "—"}
        </Tag>
      ),
    },
    {
      title: "Lotes",
      render: (_, record) => (
        <Button type="link" onClick={() => handleAbrirModal(record)}>
          Ver lotes
        </Button>
      ),
    },
  ];

  const buscarLotesInventario = async (idBodega, idProducto) => {
    try {
      const response = await obtenerLotesAsociadosInventario(
        idProducto,
        idBodega,
      );

      if (response.status === 200) {
        setLotes(Array.isArray(response.data) ? response.data : []);
        notification.success({
          message: "Éxito",
          description: "Lotes cargados correctamente",
        });
        return;
      } else {
        setLotes([]);
        notification.error({
          message: "Error",
          description: response.error || "No se pudieron cargar los lotes",
        });
        return;
      }
    } catch (error) {
      console.log("Error Obtener lotes de prodoucto", error);
      notification.error({
        message: "Error",
        description: "Error de conexión al cargar los lotes",
      });
      setLotes([]);
      return;
    }
  };

  const handleAbrirModal = (inventario) => {
    buscarLotesInventario(
      inventario.bodega.idBodega,
      inventario.producto.idProducto,
    );
    setModalLotesVisible(true);
  };

  const columnasLotes = [
    {
      title: "Código lote",
      dataIndex: "codigoLote",
      key: "codigoLote",
      render: (v) => v || "—",
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      align: "center",
      render: (estado) => (
        <Tag color={estado === "disponible" ? "success" : "default"}>
          {estado || "—"}
        </Tag>
      ),
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
      width: 110,
      align: "center",
      render: (v) => v ?? 0,
    },
    {
      title: "Fecha creación",
      dataIndex: "fechaCreacion",
      key: "fechaCreacion",
      render: (v) => formatearFecha(v),
    },
    {
      title: "Fecha vencimiento",
      dataIndex: "fechaVencimiento",
      key: "fechaVencimiento",
      render: (v) => formatearFecha(v),
    },
  ];

  // Estadísticas rápidas
  const totalStock = inventarios.reduce((s, i) => s + (i.stock || 0), 0);
  const sinStock = inventarios.filter((i) => (i.stock || 0) === 0).length;
  const bajoStock = inventarios.filter(
    (i) => (i.stock || 0) > 0 && (i.stock || 0) <= (i.stockMinimo || 0),
  ).length;

  if (loading && sucursales.length === 0) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          tip="Cargando sucursales..."
          size="large"
          fullscreen
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Selector de Sucursal */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Typography.Text strong style={{ fontSize: "15px" }}>
            Selecciona una sucursal:
          </Typography.Text>
          <Space wrap>
            <Select
              style={{ width: 380 }}
              size="large"
              placeholder="Seleccionar Sucursal"
              value={sucursalSeleccionada?.idSucursal}
              onChange={handleSucursalSeleccionada}
              loading={loading}
              allowClear
              onClear={() => {
                setSucursalSeleccionada(null);
                setInventarios([]);
              }}
            >
              {sucursales.map((s) => (
                <Select.Option key={s.idSucursal} value={s.idSucursal}>
                  {s.nombre} — {s.direccion}
                </Select.Option>
              ))}
            </Select>
            {sucursalSeleccionada && (
              <Button
                icon={<ReloadOutlined />}
                onClick={() =>
                  cargarInventarios(sucursalSeleccionada.idSucursal)
                }
                loading={loading}
              >
                Recargar
              </Button>
            )}
          </Space>
        </Space>
      </Card>

      {/* Estadísticas rápidas */}
      {sucursalSeleccionada && inventarios.length > 0 && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: "12px", background: "#f6ffed" }}>
              <Statistic
                title="Stock total"
                value={totalStock}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: "12px", background: "#fffbe6" }}>
              <Statistic
                title="Bajo stock mínimo"
                value={bajoStock}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: "12px", background: "#fff2f0" }}>
              <Statistic
                title="Sin stock"
                value={sinStock}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Tabla de Inventario */}
      {sucursalSeleccionada ? (
        <DataTable
          title="Inventario de Productos"
          description={`Sucursal: ${sucursalSeleccionada.nombre}`}
          data={inventarios}
          columns={columns}
          rowKey="idInventario"
          loading={loading}
          searchableFields={["producto.nombre", "producto.codigoProducto"]}
          filterConfig={[
            {
              key: "estado",
              placeholder: "Filtrar por estado",
              options: [
                { value: "Bueno", label: "Bueno" },
                { value: "Malo", label: "Malo" },
                { value: "Roto", label: "Roto" },
                { value: "Vendido", label: "Vendido" },
                { value: "Vencido", label: "Vencido" },
              ],
            },
          ]}
        />
      ) : (
        <Empty
          description="Selecciona una sucursal para ver su inventario"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
      {/* Modal de Lotes */}
      <Modal
        open={modalLotesVisible}
        onCancel={() => setModalLotesVisible(false)}
        footer={null}
        width={800}
      >
        <Typography.Title level={4}>Lotes del producto</Typography.Title>

        {lotes.length > 0 ? (
          <DataTable
            data={lotes}
            columns={columnasLotes}
            rowKey="idLote"
            pagination={false}
            searchableFields={["codigoLote", "estado", "idLote", "cantidad"]}
            searchPlaceholder="Buscar lote..."
          />
        ) : (
          <Empty
            description="No hay lotes asociados para este producto en esta bodega"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Modal>
    </div>
  );
}
