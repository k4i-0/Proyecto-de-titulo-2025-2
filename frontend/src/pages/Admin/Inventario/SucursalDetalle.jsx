import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Space,
  Tag,
  Divider,
  Button,
  Skeleton,
  Progress,
  List,
  Avatar,
  notification,
} from "antd";
import {
  ShopOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  ProfileOutlined,
  WarningOutlined,
  TrophyOutlined,
  SyncOutlined,
  TeamOutlined,
  DesktopOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// --- Función auxiliar para dar formato a moneda ---
const formatearDinero = (valor) => {
  if (isNaN(valor)) return "$ 0";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(valor);
};

// --- Componente reutilizable para tarjetas armoniosas ---
const CardMetrica = ({
  loading,
  title,
  value,
  prefix,
  children,
  valueStyle,
}) => (
  <Card
    hoverable
    //bordered={false}
    style={{
      height: "100%",
      minHeight: "160px",
      borderRadius: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    }}
  >
    <Skeleton loading={loading} active paragraph={{ rows: 2 }}>
      <Statistic
        title={
          <Text type="secondary" strong>
            {title}
          </Text>
        }
        value={value}
        prefix={prefix}
        valueStyle={{ fontWeight: "bold", fontSize: "24px", ...valueStyle }}
      />
      <div style={{ marginTop: 12 }}>{children}</div>
    </Skeleton>
  </Card>
);

import { obtenerDashboardSucursal } from "../../../services/Metricas.service";

import { obtenerSucursalPorId } from "../../../services/inventario/Sucursal.service";

import obtenerInventarios from "../../../services/inventario/Inventario.service";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SucursalDetalle() {
  const { idSucursal } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // --- Estado de la Sucursal ---
  const [sucursalInfo, setSucursalInfo] = useState({
    nombre: "Cargando...",
    direccion: "",
    estado: "Cerrada",
  });
  const [sucursalInventarios, setSucursalInventarios] = useState([]);

  // --- Estado MOCK de Métricas (Lo que el backend deberá enviar) ---
  const [metricas, setMetricas] = useState(null);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await obtenerSucursalPorId(idSucursal);
      if (response.status === 200) {
        setSucursalInfo(response.data);
        try {
          const response = await obtenerDashboardSucursal(idSucursal);
          if (response.status === 200) {
            setMetricas(response.data);
            return;
          }
          notification.error({
            message: "Error",
            description: "No se pudieron cargar las métricas de la sucursal",
          });
        } catch (error) {
          console.error("Error al cargar métricas de la sucursal:", error);
          notification.error({
            message: "Error",
            description: "No se pudieron cargar las métricas de la sucursal",
          });
        }
        return;
      }
      notification.error({
        message: "Error",
        description: "No se pudo cargar la información de la sucursal",
      });
    } catch (error) {
      console.error("Error al cargar información de la sucursal:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  //funcion para traer inventarios de la sucursal
  const generarPDF = (inventarios) => {
    const doc = new jsPDF("p", "mm", "a4");

    doc.setFontSize(18);
    doc.text("Reporte de Inventario", 14, 20);

    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-CL")}`, 14, 28);

    const columnas = [
      "Producto",
      "Código",
      "Marca",
      "Bodega",
      "Stock Actual",
      "Estado",
    ];

    const filas = inventarios.map((item) => [
      item.producto.nombre,
      item.producto.codigo,
      item.producto.marca,
      item.bodega.nombre,
      Number(item.stock).toString(), // Quitamos decimales innecesarios
      item.estado,
    ]);

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 35,
      theme: "striped",
      headStyles: { fillColor: [24, 144, 255] },
      styles: { fontSize: 9 },
    });

    const pdfBlobUrl = doc.output("bloburl");
    window.open(pdfBlobUrl, "_blank");
  };

  const cargarInventarios = useCallback(async () => {
    setLoading(true);
    try {
      const response = await obtenerInventarios(idSucursal);
      if (response.status === 200) {
        console.log("inventarios obtenidos:", response.data);
        setSucursalInventarios(response.data);
        generarPDF(response.data);
        return;
      }
      notification.error({
        message: "Error",
        description: "No se pudieron cargar los inventarios de la sucursal",
      });
    } catch (error) {
      console.error("Error al cargar inventarios de la sucursal:", error);
      notification.error({
        message: "Error",
        description: "No se pudieron cargar los inventarios de la sucursal",
      });
    } finally {
      setLoading(false);
    }
  }, [idSucursal]);

  useEffect(() => {
    if (!idSucursal || idSucursal === "undefined") {
      navigate("/");
      return;
    }
    cargarDatos();
  }, [idSucursal, navigate, cargarDatos]);

  return (
    <div style={{ padding: "0 12px" }}>
      {/* --- CABECERA --- */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space size="large">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              shape="circle"
            />
            <Space align="center">
              <Avatar
                size={54}
                icon={<ShopOutlined />}
                style={{ backgroundColor: "#1890ff" }}
              />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  {sucursalInfo.nombre}
                </Title>
                <Space>
                  <Text type="secondary">{sucursalInfo.direccion}</Text>
                  <Tag
                    color={
                      sucursalInfo.estado === "Abierta" ? "success" : "error"
                    }
                  >
                    {sucursalInfo.estado}
                  </Tag>
                </Space>
              </div>
            </Space>
          </Space>
        </Col>
        <Col>
          <Button type="primary" onClick={cargarInventarios}>
            Descargar Inventario
          </Button>
        </Col>
      </Row>

      <Divider style={{ margin: "16px 0 24px 0" }} />

      {/* --- SECCIÓN 1: FINANZAS Y FLUJO (Lo que más importa al gerente) --- */}
      <Title level={4} style={{ marginBottom: 16 }}>
        Rendimiento Comercial de Hoy
      </Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <CardMetrica
            loading={loading}
            title="Ingresos del Día"
            value={metricas ? formatearDinero(metricas.ventasHoy) : "$ 0"}
            prefix={<DollarOutlined />}
            valueStyle={{ color: "#3f8600" }}
          >
            {/* <Progress
              percent={75}
              size="small"
              strokeColor="#3f8600"
              format={() => "Meta diaria"}
            /> */}
          </CardMetrica>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <CardMetrica
            loading={loading}
            title="Transacciones (Boletas)"
            value={metricas?.transaccionesHoy || 0}
            prefix={<ShoppingCartOutlined style={{ color: "#722ed1" }} />}
          >
            <Text type="secondary">
              <ClockCircleOutlined /> Hora pico: {metricas?.horaPico?.hora} hrs
              ({metricas?.horaPico?.cantidad} ventas)
            </Text>
          </CardMetrica>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <CardMetrica
            loading={loading}
            title="Ticket Promedio"
            value={metricas ? formatearDinero(metricas.ticketPromedio) : "$ 0"}
            prefix={<ProfileOutlined style={{ color: "#1890ff" }} />}
          >
            <Text type="secondary">Gasto promedio por cliente</Text>
          </CardMetrica>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <CardMetrica
            loading={loading}
            title="Operatividad"
            value={`${metricas?.cajasActivas || 0} / ${metricas?.totalCajas || 0}`}
            prefix={<DesktopOutlined style={{ color: "#fa8c16" }} />}
          >
            <Space>
              <TeamOutlined style={{ color: "#8c8c8c" }} />
              <Text type="secondary">
                {metricas?.funcionariosActivos || 0} funcionarios en turno
              </Text>
            </Space>
          </CardMetrica>
        </Col>
      </Row>

      {/* --- SECCIÓN 2: INVENTARIO Y OPERACIONES --- */}
      <Title level={4} style={{ marginBottom: 16 }}>
        Estado de Inventario
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <CardMetrica
            loading={loading}
            title="Alertas de Stock Crítico"
            value={metricas?.productosStockCritico || 0}
            prefix={<WarningOutlined />}
            valueStyle={{
              color:
                metricas?.productosStockCritico > 0 ? "#cf1322" : "#52c41a",
            }}
          >
            {metricas?.productosStockCritico > 0 ? (
              <Button type="link" danger style={{ padding: 0 }}>
                Revisar productos a reponer
              </Button>
            ) : (
              <Text type="success">Inventario saludable</Text>
            )}
          </CardMetrica>
        </Col>

        <Col xs={24} md={8}>
          <CardMetrica
            loading={loading}
            title="Producto Más Vendido"
            value={metricas?.productoEstrella?.nombre || "N/A"}
            prefix={<TrophyOutlined style={{ color: "#faad14" }} />}
            valueStyle={{ fontSize: "18px", color: "#876800" }}
          >
            <Text type="secondary">
              Se han vendido{" "}
              <strong>{metricas?.productoEstrella?.cantidad || 0}</strong>{" "}
              unidades hoy.
            </Text>
          </CardMetrica>
        </Col>

        <Col xs={24} md={8}>
          <CardMetrica
            loading={loading}
            title="Rotación de Inventario (Mes)"
            value={metricas?.rotacionInventario || 0}
            prefix={<SyncOutlined style={{ color: "#13c2c2" }} />}
            valueStyle={{ color: "#13c2c2" }}
          >
            <Progress
              percent={metricas?.rotacionInventario}
              size="small"
              strokeColor="#13c2c2"
              format={(val) => `${val}% rotado`}
            />
          </CardMetrica>
        </Col>
      </Row>
    </div>
  );
}
