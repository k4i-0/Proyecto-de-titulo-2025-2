import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Empty,
  Row,
  Select,
  Space,
  Statistic,
  Tag,
  Typography,
  notification,
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  ShopOutlined,
  InboxOutlined,
} from "@ant-design/icons";

import DataTable from "../../components/Tabla";
import { obtenerInventarioPorSucursal } from "../../services/inventario/Inventario.service";

const estadoColores = {
  Bueno: "green",
  Malo: "orange",
  Roto: "red",
  Vendido: "default",
  Vencido: "purple",
};

const { Text } = Typography;

export default function GestionInventario() {
  const [loading, setLoading] = useState(false);
  const [inventarios, setInventarios] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [inventarioSeleccionado, setInventarioSeleccionado] = useState(null);

  const cargarInventario = useCallback(async (idSucursalFiltro = null) => {
    setLoading(true);
    try {
      const inventarioResponse = await obtenerInventarioPorSucursal();
      if (inventarioResponse?.status === 200) {
        const sucursalesConInventario = Array.isArray(inventarioResponse.data)
          ? inventarioResponse.data
          : [];

        const listaSucursales = sucursalesConInventario.map((sucursal) => ({
          idSucursal: sucursal.idSucursal,
          nombre: sucursal.nombre,
        }));
        setSucursales(listaSucursales);

        const sucursalObjetivo =
          idSucursalFiltro ||
          sucursalSeleccionada ||
          listaSucursales[0]?.idSucursal ||
          null;

        if (!sucursalObjetivo) {
          setInventarios([]);
          return;
        }

        if (sucursalSeleccionada !== sucursalObjetivo) {
          setSucursalSeleccionada(sucursalObjetivo);
        }

        const dataSucursal = sucursalesConInventario.find(
          (sucursal) => sucursal.idSucursal === sucursalObjetivo,
        );

        setInventarios(Array.isArray(dataSucursal?.inventarios) ? dataSucursal.inventarios : []);
        return;
      }

      notification.error({
        message: "No se pudo cargar el inventario",
        description:
          inventarioResponse?.error ||
          "Error al obtener productos de inventario.",
        duration: 4,
      });
      setInventarios([]);
    } catch {
      notification.error({
        message: "Error de conexión",
        description: "No se pudo cargar el inventario de productos.",
        duration: 4,
      });
      setInventarios([]);
    } finally {
      setLoading(false);
    }
  }, [sucursalSeleccionada]);

  useEffect(() => {
    cargarInventario();
  }, [cargarInventario]);

  const handleCambiarSucursal = (value) => {
    setSucursalSeleccionada(value);
    cargarInventario(value);
  };

  const tableData = useMemo(() => {
    return inventarios.map((item) => ({
      ...item,
      productoNombre: item.producto?.nombre || "Sin informacion",
      productoCodigo: item.producto?.codigo || "Sin informacion",
      productoMarca: item.producto?.marca || "Sin informacion",
      bodegaNombre: item.bodega?.nombre || "Sin informacion",
      sucursalNombre: item.bodega?.sucursal?.nombre || "Sin informacion",
    }));
  }, [inventarios]);

  const filtros = useMemo(() => {
    const uniqueOptions = (field) => {
      return [...new Set(tableData.map((item) => item[field]).filter(Boolean))]
        .map((value) => String(value))
        .sort((a, b) => a.localeCompare(b, "es"))
        .map((value) => ({ value, label: value }));
    };

    return [
      {
        key: "estado",
        placeholder: "Estado",
        options: uniqueOptions("estado"),
      },
      {
        key: "bodegaNombre",
        placeholder: "Bodega",
        options: uniqueOptions("bodegaNombre"),
      },
      {
        key: "sucursalNombre",
        placeholder: "Sucursal",
        options: uniqueOptions("sucursalNombre"),
      },
    ];
  }, [tableData]);

  const columns = [
    {
      title: "Codigo",
      dataIndex: "productoCodigo",
      key: "productoCodigo",
      width: 130,
    },
    {
      title: "Producto",
      dataIndex: "productoNombre",
      key: "productoNombre",
      width: 240,
    },
    {
      title: "Marca",
      dataIndex: "productoMarca",
      key: "productoMarca",
      width: 140,
    },
    {
      title: "Bodega",
      dataIndex: "bodegaNombre",
      key: "bodegaNombre",
      width: 160,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      width: 110,
      align: "center",
      render: (stock) => {
        const color = stock > 10 ? "success" : stock > 0 ? "warning" : "error";
        return <Badge status={color} text={stock ?? 0} />;
      },
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 130,
      render: (estado) => (
        <Tag color={estadoColores[estado] || "default"}>
          {estado || "Sin informacion"}
        </Tag>
      ),
    },
    {
      title: "Detalle",
      key: "detalle",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setInventarioSeleccionado(record);
            setDrawerVisible(true);
          }}
        >
          Ver
        </Button>
      ),
    },
  ];

  const totalStock = tableData.reduce(
    (acc, item) => acc + (item.stock || 0),
    0,
  );
  const sinStock = tableData.filter((item) => (item.stock || 0) === 0).length;
  const bajoStock = tableData.filter(
    (item) =>
      (item.stock || 0) > 0 && (item.stock || 0) <= (item.stockMinimo || 0),
  ).length;

  return (
    <div style={{ padding: "24px" }}>
      <Card style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col>
            <Space direction="vertical" size={0}>
              <Text strong style={{ fontSize: 15 }}>
                <ShopOutlined style={{ marginRight: 8 }} />
                Vista de inventario por sucursal
              </Text>
              <Text type="secondary">
                Selecciona una sucursal para consultar su inventario.
              </Text>
            </Space>
          </Col>
          <Col>
            <Space wrap>
              <Select
                style={{ minWidth: 280 }}
                value={sucursalSeleccionada}
                onChange={handleCambiarSucursal}
                options={[
                  ...sucursales.map((sucursal) => ({
                    value: sucursal.idSucursal,
                    label: `${sucursal.idSucursal} - ${sucursal.nombre}`,
                  })),
                ]}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={() => cargarInventario(sucursalSeleccionada)}
                loading={loading}
                disabled={!sucursalSeleccionada}
              >
                Recargar
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Productos en inventario"
              value={tableData.length}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Stock total"
              value={totalStock}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Bajo stock / sin stock"
              value={`${bajoStock} / ${sinStock}`}
            />
          </Card>
        </Col>
      </Row>

      {tableData.length > 0 || loading ? (
        <DataTable
          data={tableData}
          columns={columns}
          rowKey="idInventario"
          loading={loading}
          searchPlaceholder="Buscar por producto, codigo o bodega"
          searchableFields={[
            "productoNombre",
            "productoCodigo",
            "productoMarca",
            "bodegaNombre",
          ]}
          filterConfig={filtros}
        />
      ) : (
        <Empty description="No hay inventario disponible para la sucursal seleccionada" />
      )}

      <Drawer
        title="Detalle de Inventario"
        width={560}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          setInventarioSeleccionado(null);
        }}
      >
        {inventarioSeleccionado && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID Inventario">
              {inventarioSeleccionado.idInventario}
            </Descriptions.Item>
            <Descriptions.Item label="Producto">
              {inventarioSeleccionado.productoNombre}
            </Descriptions.Item>
            <Descriptions.Item label="Codigo">
              {inventarioSeleccionado.productoCodigo}
            </Descriptions.Item>
            <Descriptions.Item label="Marca">
              {inventarioSeleccionado.productoMarca}
            </Descriptions.Item>
            <Descriptions.Item label="Sucursal">
              {inventarioSeleccionado.sucursalNombre}
            </Descriptions.Item>
            <Descriptions.Item label="Bodega">
              {inventarioSeleccionado.bodegaNombre}
            </Descriptions.Item>
            <Descriptions.Item label="Stock">
              {inventarioSeleccionado.stock ?? 0}
            </Descriptions.Item>
            <Descriptions.Item label="Stock minimo">
              {inventarioSeleccionado.stockMinimo ?? 0}
            </Descriptions.Item>
            <Descriptions.Item label="Stock maximo">
              {inventarioSeleccionado.stockMaximo ?? 0}
            </Descriptions.Item>
            <Descriptions.Item label="Stock reservado">
              {inventarioSeleccionado.stockReservado ?? 0}
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag
                color={
                  estadoColores[inventarioSeleccionado.estado] || "default"
                }
              >
                {inventarioSeleccionado.estado || "Sin informacion"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
