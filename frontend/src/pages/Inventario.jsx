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
} from "antd";

import { LoadingOutlined } from "@ant-design/icons";

import DataTable from "../components/Tabla";
import obtenerInventarios from "../services/inventario/Inventario.service";
import obtenerSucursales from "../services/inventario/Sucursal.service";

export default function Inventario() {
  const [inventarios, setInventarios] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);

  const buscarSucursales = async () => {
    setLoading(true);
    try {
      const response = await obtenerSucursales();
      console.log("Respuesta sucursales:", response);
      if (response.status === 200) {
        setSucursales(response.data || []);
        setLoading(false);
        notification.success({
          message: "Éxito",
          description: "Sucursales cargadas correctamente",
        });
        return;
      }
      if (response.status === 204) {
        notification.info({
          message: "Información",
          description: "No hay sucursales disponibles",
        });
        setSucursales([]);
        setLoading(false);
        return;
      }
      notification.error({
        message: "Error",
        description: response.error || "No se pudieron cargar las sucursales",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: "No se pudieron cargar las sucursales",
      });
      setSucursales([]);
      setLoading(false);
      console.error("Error al obtener sucursales:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarInventarios = async () => {
    try {
      setLoading(true);
      const response = await obtenerInventarios();
      console.log("Respuesta inventarios:", response);
      if (!response) {
        notification.error({
          message: "Error",
          description: "No se pudieron cargar los productos",
        });
        setInventarios([]);
        return;
      }

      if (response.status === 422) {
        notification.warning({
          message: "Advertencia",
          description: "No hay productos en el inventario",
        });
        setInventarios([]);
        return;
      }

      const data = response.data || response;
      setInventarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener inventarios:", error);
      notification.error({
        message: "Error",
        description: "No se pudieron cargar los productos",
      });
      setInventarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarSucursales();
  }, []);

  const handleSucursalSeleccionada = (value) => {
    console.log(`Sucursal seleccionada: ${value}`);
    setSucursalSeleccionada(sucursales.find((s) => s.idSucursal === value));
    cargarInventarios();
  };

  const columns = [
    {
      title: "Código",
      dataIndex: ["producto", "idProducto"],
      key: "idProducto",
      width: "12%",
      align: "center",
    },
    {
      title: "Producto",
      dataIndex: ["producto", "nombre"],
      key: "nombre",
      width: "30%",
    },
    {
      title: "Stock",
      dataIndex: "cantidad",
      key: "cantidad",
      width: "12%",
      align: "center",
      render: (cantidad) => (
        <Tag color={cantidad > 10 ? "success" : cantidad > 0 ? "warning" : "error"} style={{ fontSize: "13px" }}>
          {cantidad}
        </Tag>
      ),
    },
    {
      title: "Lote",
      dataIndex: ["lote", "codigo"],
      key: "lote",
      width: "20%",
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: "15%",
      align: "center",
      render: (estado) => {
        const colores = {
          Disponible: "success",
          "Bajo Stock": "warning",
          Agotado: "error",
        };
        return (
          <Tag color={colores[estado] || "default"} style={{ fontSize: "13px" }}>
            {estado}
          </Tag>
        );
      },
    },
  ];

  // Renderizado condicional para estados de carga y vacío
  if (loading && sucursales.length === 0) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          tip="Cargando sucursales..."
          size="large"
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
          <Select
            style={{ width: "100%", maxWidth: 400 }}
            size="large"
            placeholder="Seleccionar Sucursal"
            value={sucursalSeleccionada?.idSucursal}
            onChange={(value) => handleSucursalSeleccionada(value)}
            loading={loading}
          >
            {sucursales.map((sucursal) => (
              <Select.Option key={sucursal.idSucursal} value={sucursal.idSucursal}>
                {sucursal.nombre} - {sucursal.direccion}
              </Select.Option>
            ))}
          </Select>
        </Space>
      </Card>

      {/* Tabla de Inventario */}
      {sucursalSeleccionada ? (
        <DataTable
          title="Inventario de Productos"
          description={`Sucursal: ${sucursalSeleccionada.nombre} - ${sucursalSeleccionada.direccion}`}
          data={inventarios}
          columns={columns}
          rowKey="idInventario"
          loading={loading}
          searchableFields={["producto.nombre", "lote.codigo"]}
          filterConfig={[
            {
              key: "estado",
              placeholder: "Filtrar por estado",
              options: [
                { value: "Disponible", label: "Disponible" },
                { value: "Bajo Stock", label: "Bajo Stock" },
                { value: "Agotado", label: "Agotado" },
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
    </div>
  );
}
