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
  Input,
  Button,
  Tag,
  List,
  Tooltip,
  Spin,
  message,
} from "antd";
import {
  AppstoreOutlined,
  WarningOutlined,
  DollarOutlined,
  InboxOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  SearchOutlined,
  AlertOutlined,
} from "@ant-design/icons";

// Importa tu servicio real
import { obtenerInformeInventario } from "../../../services/Metricas.service";

const { Title, Text } = Typography;

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Función de formato de dinero (Estándar CLP)
const formatearDinero = (valor) => {
  return `$${Number(valor || 0).toLocaleString("es-CL")}`;
};

export default function InformeInventario() {
  const [loading, setLoading] = useState(false);

  // --- Estados de Datos de la API ---
  const [metricasGlobales, setMetricasGlobales] = useState(null);
  const [productosCriticos, setProductosCriticos] = useState([]);
  const [inventario, setInventario] = useState([]);

  // --- Estados de Filtros ---
  const [bodegaFiltro, setBodegaFiltro] = useState("todas");
  const [estadoStockFiltro, setEstadoStockFiltro] = useState("todos");
  const [busquedaFiltro, setBusquedaFiltro] = useState("");

  // --- Función de Carga ---
  const cargarInventario = useCallback(
    async (idBodega, estadoStock, busqueda) => {
      setLoading(true);
      try {
        // Ajusta la llamada según cómo reciba los parámetros tu servicio
        console.log("Cargando informe de inventario con filtros:", {
          idBodega,
          estadoStock,
          busqueda,
        });
        const response = await obtenerInformeInventario({
          idBodega,
          estadoStock,
          busqueda,
        });

        const data = response?.data || response;

        if (data && data.metricasGlobales) {
          setMetricasGlobales(data.metricasGlobales);
          setProductosCriticos(data.productosCriticos || []);
          setInventario(data.inventario || []);
        } else {
          message.error("Estructura de datos incorrecta desde el servidor");
        }
      } catch (error) {
        console.error("Error al cargar el informe de inventario:", error);
        message.error("Ocurrió un error al cargar los datos");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ---- Generación de PDF ----
  const generarPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    // --- ENCABEZADO DEL DOCUMENTO ---
    doc.setFontSize(18);
    doc.text("Reporte de Inventario y Valorización", 14, 20);

    doc.setFontSize(10);
    const bodegaTexto =
      bodegaFiltro === "todas"
        ? "Todas las bodegas"
        : `Bodega ID: ${bodegaFiltro}`;
    doc.text(`Filtro Bodega: ${bodegaTexto}`, 14, 28);
    doc.text(`Filtro Estado: ${estadoStockFiltro}`, 14, 33);
    doc.text(
      `Fecha de emisión: ${new Date().toLocaleDateString("es-CL")}`,
      14,
      38,
    );

    // --- SECCIÓN 1: MÉTRICAS CLAVE ---
    doc.setFontSize(14);
    doc.text("1. Resumen Global", 14, 50);

    autoTable(doc, {
      startY: 55,
      head: [["Indicador", "Valor"]],
      body: [
        [
          "Valorización Total (Capital)",
          formatearDinero(metricasGlobales?.valorizacionTotal),
        ],
        [
          "Total Productos Activos (SKUs)",
          String(metricasGlobales?.totalProductosActivos || 0),
        ],
        [
          "Quiebre de Stock (Agotados)",
          String(metricasGlobales?.productosSinStock || 0),
        ],
        [
          "Stock Crítico (Bajo el mínimo)",
          String(metricasGlobales?.productosStockCritico || 0),
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: [24, 144, 255] }, // Azul
      styles: { fontSize: 10 },
    });

    let finalY = doc.lastAutoTable.finalY + 15;

    // --- SECCIÓN 2: ACCIÓN REQUERIDA (PRODUCTOS CRÍTICOS) ---
    if (productosCriticos && productosCriticos.length > 0) {
      // Salto de página preventivo si estamos muy abajo
      if (finalY > 230) {
        doc.addPage();
        finalY = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(207, 19, 34); // Rojo para alertas
      doc.text("2. Acción Requerida (Stock Crítico/Agotado)", 14, finalY);
      doc.setTextColor(0, 0, 0); // Restaurar color negro

      const filasCriticos = productosCriticos.map((prod) => [
        prod.nombre,
        Number(prod.stockActual).toFixed(2),
        Number(prod.stockMinimo).toFixed(2),
      ]);

      autoTable(doc, {
        startY: finalY + 5,
        head: [["Producto", "Stock Actual", "Mínimo Sugerido"]],
        body: filasCriticos,
        theme: "striped",
        headStyles: { fillColor: [207, 19, 34] }, // Cabecera roja
        styles: { fontSize: 9 },
      });

      finalY = doc.lastAutoTable.finalY + 15;
    }

    // --- SECCIÓN 3: INVENTARIO COMPLETO ---
    if (finalY > 230) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFontSize(14);
    doc.text(
      productosCriticos.length > 0
        ? "3. Detalle de Existencias"
        : "2. Detalle de Existencias",
      14,
      finalY,
    );

    const filasInventario = inventario.map((item) => {
      const valorizacionItem =
        item.stockActual > 0 ? item.stockActual * item.precioCompra : 0;
      return [
        item.codigo,
        item.producto,
        item.bodega,
        Number(item.stockActual).toFixed(2),
        Number(item.stockMinimo).toFixed(2),
        formatearDinero(item.precioCompra),
        formatearDinero(valorizacionItem),
        item.estado,
      ];
    });

    autoTable(doc, {
      startY: finalY + 5,
      head: [
        [
          "SKU",
          "Producto",
          "Bodega",
          "Stock",
          "Mínimo",
          "Costo U.",
          "Valor Total",
          "Estado",
        ],
      ],
      body: filasInventario,
      theme: "striped",
      headStyles: { fillColor: [24, 144, 255] },
      styles: { fontSize: 8 }, // Letra más pequeña para que quepan todas las columnas
    });

    // --- ABRIR EL PDF ---
    const pdfBlobUrl = doc.output("bloburl");
    window.open(pdfBlobUrl, "_blank");
  };

  // --- Carga Inicial ---
  useEffect(() => {
    cargarInventario("todas", "todos", "");
  }, [cargarInventario]);

  // --- Manejador del Botón Filtrar ---
  const handleFiltrar = () => {
    cargarInventario(bodegaFiltro, estadoStockFiltro, busquedaFiltro);
  };

  // --- Configuración de Columnas ---
  const columnasInventario = [
    {
      title: "SKU / Código",
      dataIndex: "codigo",
      key: "codigo",
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: "Producto",
      dataIndex: "producto",
      key: "producto",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Bodega",
      dataIndex: "bodega",
      key: "bodega",
    },
    {
      title: "Stock",
      key: "stock",
      align: "right",
      sorter: (a, b) => a.stockActual - b.stockActual,
      render: (_, record) => {
        let color = "#52c41a"; // Verde normal
        if (record.stockActual <= 0)
          color = "#cf1322"; // Rojo agotado/negativo
        else if (record.stockActual <= record.stockMinimo) color = "#faad14"; // Naranja alerta

        return (
          <Text strong style={{ color }}>
            {Number(record.stockActual).toFixed(2)}
          </Text>
        );
      },
    },
    {
      title: "Mínimo",
      dataIndex: "stockMinimo",
      key: "stockMinimo",
      align: "right",
      render: (val) => <Text type="secondary">{val}</Text>,
    },
    {
      title: "Costo Unit.",
      dataIndex: "precioCompra",
      key: "precioCompra",
      align: "right",
      render: (val) => formatearDinero(val),
    },
    {
      title: "Valorización",
      key: "valorizacion",
      align: "right",
      render: (_, record) => {
        const total =
          record.stockActual > 0 ? record.stockActual * record.precioCompra : 0;
        return <Text strong>{formatearDinero(total)}</Text>;
      },
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      align: "center",
      render: (estado) => {
        const colores = {
          Bueno: "success",
          Malo: "error",
          Revisión: "warning",
        };
        return <Tag color={colores[estado] || "default"}>{estado}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: "0 10px" }}>
      {/* --- ENCABEZADO --- */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space size="middle">
            <AppstoreOutlined style={{ fontSize: "32px", color: "#1890ff" }} />
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Informe de Inventario
              </Title>
              <Text type="secondary">
                Control de existencias, valorización y alertas de reposición
              </Text>
            </div>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<FilePdfOutlined />}
              danger
              disabled={loading || !metricasGlobales}
              onClick={generarPDF}
            >
              Exportar PDF
            </Button>
          </Space>
        </Col>
      </Row>

      {/* --- BARRA DE FILTROS --- */}
      <Card style={{ marginBottom: 24, borderRadius: "8px" }} size="small">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} lg={6}>
            <Text strong style={{ marginBottom: 4, display: "block" }}>
              Bodega
            </Text>
            <Select
              value={bodegaFiltro}
              onChange={(valor) => setBodegaFiltro(valor)}
              style={{ width: "100%" }}
            >
              <Select.Option value="todas">Todas las Bodegas</Select.Option>
              {/* Aquí podrías mapear tus bodegas reales si las traes de la API */}
              <Select.Option value="1">Bodega Central</Select.Option>
              <Select.Option value="2">Bodega Sucursal 2</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} lg={6}>
            <Text strong style={{ marginBottom: 4, display: "block" }}>
              Estado del Stock
            </Text>
            <Select
              value={estadoStockFiltro}
              onChange={(valor) => setEstadoStockFiltro(valor)}
              style={{ width: "100%" }}
            >
              <Select.Option value="todos">Todos los productos</Select.Option>
              <Select.Option value="bajo">Stock Bajo o Crítico</Select.Option>
              <Select.Option value="agotado">Agotados (Stock 0)</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} lg={8}>
            <Text strong style={{ marginBottom: 4, display: "block" }}>
              Buscar Producto
            </Text>
            <Input
              placeholder="Nombre, SKU o Categoría"
              prefix={<SearchOutlined />}
              value={busquedaFiltro}
              onChange={(e) => setBusquedaFiltro(e.target.value)}
              onPressEnter={handleFiltrar} // Permite filtrar al presionar Enter
            />
          </Col>
          <Col xs={24} sm={24} lg={4} style={{ paddingTop: 22 }}>
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

      <Spin
        spinning={loading && !metricasGlobales}
        tip="Calculando valorizaciones..."
      >
        {/* --- MÉTRICAS CLAVE (KPIs) --- */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable style={{ borderRadius: "12px", height: "100%" }}>
              <Statistic
                title={
                  <Text type="secondary" strong>
                    Valorización Total
                  </Text>
                }
                value={metricasGlobales?.valorizacionTotal || 0}
                formatter={(val) => formatearDinero(val)}
                valueStyle={{ color: "#1890ff", fontWeight: "bold" }}
                prefix={<DollarOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Capital invertido en bodega</Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable style={{ borderRadius: "12px", height: "100%" }}>
              <Statistic
                title={
                  <Text type="secondary" strong>
                    Productos Activos
                  </Text>
                }
                value={metricasGlobales?.totalProductosActivos || 0}
                valueStyle={{ fontWeight: "bold" }}
                prefix={<InboxOutlined style={{ color: "#52c41a" }} />}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">SKUs con existencias registradas</Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{
                borderRadius: "12px",
                height: "100%",
                backgroundColor: "#fff1f0",
              }}
            >
              <Statistic
                title={
                  <Text type="danger" strong>
                    Quiebre de Stock
                  </Text>
                }
                value={metricasGlobales?.productosSinStock || 0}
                valueStyle={{ color: "#cf1322", fontWeight: "bold" }}
                prefix={<WarningOutlined />}
                suffix="ítems"
              />
              <div style={{ marginTop: 8 }}>
                <Text type="danger">Productos agotados o en negativo</Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{
                borderRadius: "12px",
                height: "100%",
                backgroundColor: "#fffbe6",
              }}
            >
              <Statistic
                title={
                  <Text style={{ color: "#d48806" }} strong>
                    Stock Crítico
                  </Text>
                }
                value={metricasGlobales?.productosStockCritico || 0}
                valueStyle={{ color: "#faad14", fontWeight: "bold" }}
                prefix={<AlertOutlined />}
                suffix="ítems"
              />
              <div style={{ marginTop: 8 }}>
                <Text style={{ color: "#d48806" }}>
                  Bajo el nivel mínimo sugerido
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* --- TABLA DE DETALLES Y ALERTAS --- */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={18}>
            <Card
              title="Detalle de Existencias"
              style={{ borderRadius: "12px" }}
            >
              <Table
                columns={columnasInventario}
                dataSource={inventario}
                loading={loading}
                pagination={{ pageSize: 10 }}
                size="small"
              />
            </Card>
          </Col>

          <Col xs={24} lg={6}>
            <Card
              title={
                <Space>
                  <WarningOutlined style={{ color: "#cf1322" }} />
                  Acción Requerida
                </Space>
              }
              style={{ borderRadius: "12px", height: "100%" }}
            >
              <List
                itemLayout="horizontal"
                dataSource={productosCriticos}
                loading={loading}
                locale={{ emptyText: "Sin productos críticos" }}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={<Text strong>{item.nombre}</Text>}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="danger" size="small">
                            Stock Actual: {Number(item.stockActual).toFixed(2)}
                          </Text>
                          <Text type="secondary" size="small">
                            Mínimo sugerido:{" "}
                            {Number(item.stockMinimo).toFixed(2)}
                          </Text>
                        </Space>
                      }
                    />
                    <Tooltip title="Generar orden de compra">
                      <Button type="primary" size="small" ghost>
                        Pedir
                      </Button>
                    </Tooltip>
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
