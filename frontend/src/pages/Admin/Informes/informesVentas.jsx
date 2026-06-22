import React, { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Typography,
  Space,
  Select,
  DatePicker,
  Button,
  Tag,
  List,
  Progress,
  Spin,
  notification,
} from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  PercentageOutlined,
  BarChartOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  EyeOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";

// Importa tu servicio real
import { obtenerInformesVentas } from "../../../services/Metricas.service";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Función de formato de dinero (Estándar CLP)
const formatearDinero = (valor) => {
  return `$${Number(valor || 0).toLocaleString("es-CL")}`;
};

import { buscarTodasSucursales } from "../../../services/functions/Sucursales";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function InformesVentas() {
  const [loading, setLoading] = useState(false);

  // --- Estados de Datos de la API ---
  const [resumenFinanciero, setResumenFinanciero] = useState(null);
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [ventasRecientes, setVentasRecientes] = useState([]);

  // --- Estados de Filtros ---
  const [sucursalFiltro, setSucursalFiltro] = useState("todas");
  const [sucursales, setSucursales] = useState([]);
  const [fechasFiltro, setFechasFiltro] = useState([null, null]);

  // --- Funcion para cargar todas las sucursales ----
  const cargarSucursales = useCallback(async () => {
    try {
      const response = await buscarTodasSucursales(setSucursales);
      notification.success({
        message: "Sucursales cargadas",
        description: `Se han cargado ${response?.length} sucursales.`,
        duration: 3,
      });
    } catch (error) {
      console.error("Error al cargar sucursales:", error);
    }
  }, []);

  // --- Función de Carga ---

  const cargarInformesVentas = useCallback(
    async (idSucursal, fechaInicio, fechaFin) => {
      setLoading(true);
      try {
        const response = await obtenerInformesVentas(
          idSucursal,
          fechaInicio,
          fechaFin,
        );

        // Ajusta si tu interceptor de axios retorna response o response.data directamente
        const data = response?.data || response;

        if (data && data.resumenFinanciero) {
          setResumenFinanciero(data.resumenFinanciero);
          setProductosMasVendidos(data.productosMasVendidos || []);
          setVentasRecientes(data.ventasRecientes || []);
        } else {
          console.error(
            "Error al cargar informes: Estructura de datos incorrecta",
          );
        }
      } catch (error) {
        console.error("Error al cargar informes de ventas:", error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // --- Funcion para manejar la exportación a PDF ---
  const generarPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    // --- ENCABEZADO DEL DOCUMENTO ---
    doc.setFontSize(18);
    doc.text("Reporte Consolidado de Ventas", 14, 20);

    doc.setFontSize(10);
    // Usamos el estado del filtro para indicar si es de una sucursal en específico o de todas
    const sucursalTexto =
      sucursalFiltro === "todas"
        ? "Todas las sucursales"
        : `Sucursal ID: ${sucursalFiltro}`;
    doc.text(`Filtro: ${sucursalTexto}`, 14, 28);
    doc.text(
      `Fecha de emisión: ${new Date().toLocaleDateString("es-CL")}`,
      14,
      33,
    );

    // --- SECCIÓN 1: RESUMEN FINANCIERO ---
    doc.setFontSize(14);
    doc.text("1. Resumen Financiero", 14, 45);

    autoTable(doc, {
      startY: 50,
      head: [["Métrica", "Valor"]],
      body: [
        [
          "Ingresos Brutos",
          formatearDinero(resumenFinanciero?.ingresosTotales),
        ],
        [
          "Total Transacciones",
          String(resumenFinanciero?.totalTransacciones || 0),
        ],
        ["Ticket Promedio", formatearDinero(resumenFinanciero?.ticketPromedio)],
        [
          "Margen Neto Estimado",
          formatearDinero(resumenFinanciero?.margenGananciaEstimado),
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: [24, 144, 255] }, // Azul Ant Design
      styles: { fontSize: 10 },
    });

    // --- SECCIÓN 2: PRODUCTOS MÁS VENDIDOS ---
    // doc.lastAutoTable.finalY nos dice en qué coordenada "Y" terminó la tabla anterior
    let finalY = doc.lastAutoTable.finalY + 15;

    doc.setFontSize(14);
    doc.text("2. Productos de Mayor Demanda", 14, finalY);

    const filasProductos = productosMasVendidos.map((prod) => [
      prod.nombre,
      Number(prod.cantidad).toFixed(2),
      `${prod.porcentaje}%`,
    ]);

    autoTable(doc, {
      startY: finalY + 5,
      head: [["Producto", "Cantidad Vendida", "Participación (%)"]],
      body: filasProductos,
      theme: "striped",
      headStyles: { fillColor: [114, 46, 209] }, // Morado para diferenciar esta tabla
      styles: { fontSize: 9 },
    });

    // --- SECCIÓN 3: DESGLOSE DE VENTAS ---
    finalY = doc.lastAutoTable.finalY + 15;

    // Validación inteligente: Si queda poco espacio en la hoja, forzamos un salto de página
    if (finalY > 240) {
      doc.addPage();
      finalY = 20; // Reiniciamos la coordenada Y para la nueva página
    }

    doc.setFontSize(14);
    doc.text("3. Desglose de Ventas", 14, finalY);

    const filasVentas = ventasRecientes.map((venta) => [
      `#${venta.idVentaCliente}`,
      new Date(venta.fechaVenta).toLocaleString("es-CL"),
      venta.sucursal,
      venta.metodoPago,
      formatearDinero(venta.totalVenta),
      venta.estadoVenta,
    ]);

    autoTable(doc, {
      startY: finalY + 5,
      head: [
        [
          "Nro Venta",
          "Fecha y Hora",
          "Sucursal",
          "Método Pago",
          "Total",
          "Estado",
        ],
      ],
      body: filasVentas,
      theme: "striped",
      headStyles: { fillColor: [24, 144, 255] },
      styles: { fontSize: 9 },
    });

    // --- ABRIR EL PDF ---
    const pdfBlobUrl = doc.output("bloburl");
    window.open(pdfBlobUrl, "_blank");
  };

  // --- Carga Inicial ---
  useEffect(() => {
    cargarInformesVentas("todas", null, null);
    cargarSucursales();
  }, [cargarInformesVentas, cargarSucursales]);

  // --- Manejador del Botón Filtrar ---
  const handleFiltrar = () => {
    const fechaInicio = fechasFiltro[0] ? fechasFiltro[0].toISOString() : null;
    const fechaFin = fechasFiltro[1] ? fechasFiltro[1].toISOString() : null;
    cargarInformesVentas(sucursalFiltro, fechaInicio, fechaFin);
  };

  // --- Columnas de la Tabla ---
  const columnasVentas = [
    {
      title: "Nro Venta",
      dataIndex: "idVentaCliente",
      key: "idVentaCliente",
      render: (id) => <Text strong>#{id}</Text>,
    },
    {
      title: "Fecha / Hora",
      dataIndex: "fechaVenta",
      key: "fechaVenta",
      render: (fecha) => new Date(fecha).toLocaleString("es-CL"),
    },
    {
      title: "Sucursal",
      dataIndex: "sucursal",
      key: "sucursal",
    },
    {
      title: "Método Pago",
      dataIndex: "metodoPago",
      key: "metodoPago",
      render: (metodo) => (
        <Tag color={metodo === "Pago Mixto" ? "purple" : "blue"}>{metodo}</Tag>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalVenta",
      key: "totalVenta",
      align: "right",
      render: (total) => <Text strong>{formatearDinero(total)}</Text>,
    },
    {
      title: "Estado",
      dataIndex: "estadoVenta",
      key: "estadoVenta",
      align: "center",
      render: (estado) => <Tag color="success">{estado}</Tag>,
    },
    {
      title: "Acciones",
      key: "acciones",
      align: "center",
      render: () => (
        <Button type="link" icon={<EyeOutlined />}>
          Detalle
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "0 10px" }}>
      {/* --- ENCABEZADO Y CONTROLES EXPORTACIÓN --- */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space size="middle">
            <BarChartOutlined style={{ fontSize: "32px", color: "#1890ff" }} />
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Informes de Ventas
              </Title>
              <Text type="secondary">
                Consolidado comercial, auditoría y KPIs del negocio
              </Text>
            </div>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<FilePdfOutlined />}
              danger
              disabled={loading}
              onClick={generarPDF}
            >
              Exportar PDF
            </Button>
            {/* <Button
              icon={<FileExcelOutlined />}
              style={{ color: "#3f8600", borderColor: "#3f8600" }}
              disabled={loading}
            >
              Exportar Excel
            </Button> */}
          </Space>
        </Col>
      </Row>

      {/* --- BARRA DE FILTROS --- */}
      <Card style={{ marginBottom: 24, borderRadius: "8px" }} size="small">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} lg={6}>
            <Text strong style={{ marginBottom: 4 }}>
              Sucursal
            </Text>
            <Select
              value={sucursalFiltro}
              onChange={(valor) => setSucursalFiltro(valor)}
              style={{ width: "100%" }}
            >
              <Select.Option value="todas">Todas las Sucursales</Select.Option>
              {sucursales.map((sucursal) => (
                <Select.Option
                  key={sucursal.idSucursal}
                  value={sucursal.idSucursal}
                >
                  {sucursal.nombre}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Text strong style={{ marginBottom: 4 }}>
              Rango de Fechas
            </Text>
            <RangePicker
              style={{ width: "100%" }}
              placeholder={["Fecha Inicio", "Fecha Fin"]}
              onChange={(fechas) => setFechasFiltro(fechas || [null, null])}
            />
          </Col>
          <Col xs={24} sm={4} lg={4} style={{ paddingTop: 22 }}>
            <Button
              type="primary"
              block
              onClick={handleFiltrar}
              loading={loading}
            >
              Filtrar
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Spinner global de carga mientras se obtienen los datos iniciales */}
      <Spin spinning={loading && !resumenFinanciero} tip="Cargando métricas...">
        {/* --- TARJETAS METRICAS CLAVE --- */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              //bordered={false}
              hoverable
              style={{ borderRadius: "12px", height: "100%" }}
            >
              <Statistic
                title={
                  <Text type="secondary" strong>
                    Ingresos Brutos
                  </Text>
                }
                value={resumenFinanciero?.ingresosTotales || 0}
                formatter={(val) => formatearDinero(val)}
                valueStyle={{ color: "#3f8600", fontWeight: "bold" }}
                prefix={<DollarOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="success">
                  <ArrowUpOutlined /> Referencial
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              //bordered={false}
              hoverable
              style={{ borderRadius: "12px", height: "100%" }}
            >
              <Statistic
                title={
                  <Text type="secondary" strong>
                    Total Transacciones
                  </Text>
                }
                value={resumenFinanciero?.totalTransacciones || 0}
                valueStyle={{ fontWeight: "bold" }}
                prefix={<ShoppingCartOutlined style={{ color: "#1890ff" }} />}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Órdenes de compra aprobadas</Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              //bordered={false}
              hoverable
              style={{ borderRadius: "12px", height: "100%" }}
            >
              <Statistic
                title={
                  <Text type="secondary" strong>
                    Ticket Promedio
                  </Text>
                }
                value={resumenFinanciero?.ticketPromedio || 0}
                formatter={(val) => formatearDinero(val)}
                valueStyle={{ color: "#722ed1", fontWeight: "bold" }}
                prefix={<PercentageOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Valor promedio por boleta</Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              //bordered={false}
              hoverable
              style={{ borderRadius: "12px", height: "100%" }}
            >
              <Statistic
                title={
                  <Text type="secondary" strong>
                    Margen Neto Estimado
                  </Text>
                }
                value={resumenFinanciero?.margenGananciaEstimado || 0}
                formatter={(val) => formatearDinero(val)}
                valueStyle={{ color: "#13c2c2", fontWeight: "bold" }}
                prefix={<DollarOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Utilidad calculada s/costos</Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* --- SECCIÓN DETALLES Y RANKINGS --- */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {/* Tabla Principal de Ventas */}
          <Col xs={24} lg={16}>
            <Card title="Desglose de Ventas" style={{ borderRadius: "12px" }}>
              <Table
                columns={columnasVentas}
                dataSource={ventasRecientes}
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </Col>

          {/* Ranking de Productos Más Vendidos */}
          <Col xs={24} lg={8}>
            <Card
              title="Productos de Mayor Demanda"
              style={{ borderRadius: "12px", height: "100%" }}
            >
              <List
                itemLayout="horizontal"
                dataSource={productosMasVendidos}
                loading={loading}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={<Text strong>{item.nombre}</Text>}
                      description={`${Number(item.cantidad).toFixed(2)} unidades vendidas`}
                    />
                    <div style={{ width: 100, textAlign: "right" }}>
                      <Progress
                        percent={item.porcentaje}
                        size="small"
                        showInfo={false}
                        strokeColor="#722ed1"
                      />
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {item.porcentaje}% del total
                      </Text>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}
