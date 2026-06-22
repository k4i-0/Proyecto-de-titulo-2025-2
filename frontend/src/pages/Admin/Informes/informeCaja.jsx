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
  Tooltip,
  Spin,
  message,
} from "antd";
import {
  WalletOutlined,
  DollarOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

// Importa tu servicio real
import { obtenerInformeCaja } from "../../../services/Metricas.service";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
import dayjs from "dayjs";

// --- Función de formato de dinero (Estándar CLP) ---
const formatearDinero = (valor) => {
  return `$${Number(valor || 0).toLocaleString("es-CL")}`;
};

import { buscarTodasLasCajas } from "../../../services/ventas/caja.service";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function InformeCaja() {
  const [loading, setLoading] = useState(false);

  // --- Estados de Datos de la API ---
  const [metricasCaja, setMetricasCaja] = useState(null);
  const [historialCajas, setHistorialCajas] = useState([]);
  const [cajasDisponibles, setCajasDisponibles] = useState([]);

  // --- Estados de Filtros ---
  const [cajaFiltro, setCajaFiltro] = useState("todas");
  const [fechasFiltro, setFechasFiltro] = useState([null, null]);

  // --- Función de Carga ---
  const cargarInforme = useCallback(async (idCaja, fechaInicio, fechaFin) => {
    setLoading(true);
    try {
      const response = await obtenerInformeCaja({
        idCaja,
        fechaInicio,
        fechaFin,
      });

      const data = response?.data || response;

      if (data && data.metricasCaja) {
        setMetricasCaja(data.metricasCaja);
        setHistorialCajas(data.historialCajas || []);
      } else {
        message.error("Estructura de datos incorrecta desde el servidor");
      }
    } catch (error) {
      console.error("Error al cargar el informe de caja:", error);
      message.error("Ocurrió un error al cargar los datos");
    } finally {
      setLoading(false);
    }
  }, []);

  // ---- Funcion cargar cajas disponibles para el filtro ---
  const cargarCajasDisponibles = useCallback(async () => {
    try {
      const response = await buscarTodasLasCajas();
      //console.log("Respuesta al cargar cajas disponibles:", response);
      if (response.status === 200) {
        setCajasDisponibles(response.data);
      } else {
        message.error("No se pudieron cargar las cajas disponibles");
      }
    } catch (error) {
      console.error("Error al cargar cajas disponibles:", error);
      message.error("Ocurrió un error al cargar las cajas");
    }
  }, []);

  // --- Carga Inicial ---
  useEffect(() => {
    cargarInforme("todas", null, null);
    cargarCajasDisponibles();
  }, [cargarInforme, cargarCajasDisponibles]);

  // --- Manejador del Botón Filtrar ---
  const handleFiltrar = () => {
    const fechaInicio = fechasFiltro[0] ? fechasFiltro[0].toISOString() : null;
    const fechaFin = fechasFiltro[1] ? fechasFiltro[1].toISOString() : null;
    cargarInforme(cajaFiltro, fechaInicio, fechaFin);
  };

  // --- Columnas del Historial de Cajas ---
  const columnasCajas = [
    {
      title: "Caja",
      dataIndex: "numeroCaja",
      key: "numeroCaja",
      render: (num) => <Text strong>N° {num}</Text>,
    },
    {
      title: "Cajero",
      dataIndex: "cajero",
      key: "cajero",
    },
    {
      title: "Apertura",
      dataIndex: "fechaApertura",
      key: "fechaApertura",
      render: (fecha) => new Date(fecha).toLocaleString("es-CL"),
    },
    {
      title: "Cierre",
      dataIndex: "fechaCierre",
      key: "fechaCierre",
      render: (fecha) =>
        fecha ? (
          new Date(fecha).toLocaleString("es-CL")
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Monto Inicial",
      dataIndex: "montoInicial",
      key: "montoInicial",
      align: "right",
      render: (monto) => formatearDinero(monto),
    },
    {
      title: "Esperado en Efectivo",
      dataIndex: "montoFinalEsperado",
      key: "montoFinalEsperado",
      align: "right",
      render: (monto) => formatearDinero(monto),
    },
    {
      title: "Diferencia Arqueo",
      dataIndex: "diferencia",
      key: "diferencia",
      align: "right",
      render: (dif, record) => {
        if (record.estadoCaja === "Abierta")
          return <Text type="secondary">En curso</Text>;
        if (dif === 0) return <Tag color="success">Cuadrada</Tag>;

        const color = dif < 0 ? "error" : "warning";
        const prefijo = dif > 0 ? "+" : "";
        return (
          <Tooltip
            title={dif < 0 ? "Faltante de dinero" : "Sobrante de dinero"}
          >
            <Tag color={color}>
              {prefijo}
              {formatearDinero(dif)}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Estado",
      dataIndex: "estadoCaja",
      key: "estadoCaja",
      align: "center",
      render: (estado) => {
        const esAbierta = estado === "Abierta";
        return (
          <Tag
            icon={esAbierta ? <SyncOutlined spin /> : <CheckCircleOutlined />}
            color={esAbierta ? "processing" : "default"}
          >
            {estado.toUpperCase()}
          </Tag>
        );
      },
    },
  ];

  //---- Manejo de fechas ----------
  const bloquearFechasFuturas = (current) => {
    return current && current > dayjs().endOf("day");
  };

  // ------ Funcion Generar PDF -----------
  const generarPDF = () => {
    // 1. Inicializar jsPDF en formato A4 vertical
    const doc = new jsPDF("p", "mm", "a4");

    // --- ENCABEZADO DEL REPORTES ---
    doc.setFontSize(18);
    doc.setTextColor(33, 33, 33);
    doc.text("Reporte de Flujo y Cuadratura de Cajas", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const cajaTexto =
      cajaFiltro === "todas" ? "Todas las cajas" : `Caja N° ${cajaFiltro}`;
    doc.text(`Filtro de Caja: ${cajaTexto}`, 14, 28);
    doc.text(`Fecha de emisión: ${new Date().toLocaleString("es-CL")}`, 14, 33);

    // --- SECCIÓN 1: MÉTRICAS CONSOLIDADAS ---
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("1. Resumen de Saldos Actuales", 14, 45);

    autoTable(doc, {
      startY: 50,
      head: [["Flujo Financiero", "Monto Calculado"]],
      body: [
        [
          "Efectivo Físico Estimado (En Gaveta)",
          formatearDinero(metricasCaja?.efectivoEnCaja),
        ],
        [
          "Retiros / Salidas de Efectivo",
          formatearDinero(metricasCaja?.totalRetiros),
        ],
        [
          "Total Débito Acumulado (Ventas POS)",
          formatearDinero(metricasCaja?.debitoTotal),
        ],
        [
          "Total Crédito Acumulado (Ventas POS)",
          formatearDinero(metricasCaja?.creditoTotal),
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: [24, 144, 255] }, // Azul Ant Design
      columnStyles: {
        1: { halign: "right", fontStyle: "bold" }, // Alinear montos a la derecha
      },
      styles: { fontSize: 10 },
    });

    // --- SECCIÓN 2: HISTORIAL DE TURNOS Y CUADRATURAS ---
    let finalY = doc.lastAutoTable.finalY + 15;

    // Validación de espacio: si la tabla de resumen terminó muy abajo, saltamos de hoja
    if (finalY > 230) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFontSize(14);
    doc.text("2. Historial de Turnos y Arqueos", 14, finalY);

    // Mapeamos el arreglo de historialCajas al formato requerido por la tabla del PDF
    const filasHistorial = historialCajas.map((turno) => {
      const fechaAperturaStr = new Date(turno.fechaApertura).toLocaleString(
        "es-CL",
        {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        },
      );

      const fechaCierreStr = turno.fechaCierre
        ? new Date(turno.fechaCierre).toLocaleString("es-CL", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "En curso";

      // Formateo condicional para la diferencia
      let diferenciaTexto = "-";
      if (turno.estadoCaja !== "Abierta") {
        diferenciaTexto =
          turno.diferencia === 0
            ? "Cuadrada"
            : `${turno.diferencia > 0 ? "+" : ""}${formatearDinero(turno.diferencia)}`;
      }

      return [
        `N° ${turno.numeroCaja}`,
        turno.cajero,
        fechaAperturaStr,
        fechaCierreStr,
        formatearDinero(turno.montoInicial),
        formatearDinero(turno.montoFinalResperado || turno.montoFinalEsperado),
        diferenciaTexto,
        turno.estadoCaja.toUpperCase(),
      ];
    });

    autoTable(doc, {
      startY: finalY + 5,
      head: [
        [
          "Caja",
          "Cajero",
          "Apertura",
          "Cierre",
          "M. Inicial",
          "Esperado Em.",
          "Dif. Arqueo",
          "Estado",
        ],
      ],
      body: filasHistorial,
      theme: "striped",
      headStyles: { fillColor: [24, 144, 255] },
      styles: { fontSize: 8.5 }, // Reducimos un poco la fuente para que quepan holgadamente las 8 columnas
      columnStyles: {
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" },
        7: { halign: "center" },
      },
      // Pintamos filas de color sutil si la caja sigue abierta
      willDrawCell: (data) => {
        if (data.section === "body" && data.row.raw[7] === "ABIERTA") {
          doc.setFillColor(230, 247, 255); // Color celeste suave para destacar turno activo
        }
      },
    });

    // --- TRANSMITIR AL NAVEGADOR ---
    const pdfBlobUrl = doc.output("bloburl");
    window.open(pdfBlobUrl, "_blank");
  };

  return (
    <div style={{ padding: "0 10px" }}>
      {/* --- ENCABEZADO Y ACCIONES --- */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space size="middle">
            <WalletOutlined style={{ fontSize: "32px", color: "#1890ff" }} />
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Informe de Flujo de Cajas
              </Title>
              <Text type="secondary">
                Auditoría de arqueos, estados de turnos y saldos en terminales
              </Text>
            </div>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<FilePdfOutlined />}
              danger
              onClick={generarPDF}
              disabled={loading || !metricasCaja}
            >
              Exportar PDF
            </Button>
            {/* <Button
              icon={<FileExcelOutlined />}
              style={{ color: "#3f8600", borderColor: "#3f8600" }}
              disabled={loading || !metricasCaja}
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
            <Text strong block style={{ marginBottom: 4 }}>
              Seleccionar Caja
            </Text>
            <Select
              value={cajaFiltro}
              onChange={(valor) => setCajaFiltro(valor)}
              style={{ width: "100%" }}
            >
              <Select.Option value="todas">Todas las Cajas</Select.Option>
              {cajasDisponibles.map((caja) => (
                <Select.Option key={caja.idCaja} value={caja.idCaja}>
                  N° {caja.numeroCaja} - {caja.sucursal.nombre}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Text strong block style={{ marginBottom: 4 }}>
              Periodo de Auditoría
            </Text>
            <RangePicker
              style={{ width: "100%" }}
              placeholder={["Fecha Inicio", "Fecha Fin"]}
              disabledDate={bloquearFechasFuturas}
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

      <Spin
        spinning={loading && !metricasCaja}
        tip="Cargando flujos de caja..."
      >
        {/* --- TARJETAS METRICAS FINANCIERAS DE CAJA --- */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable style={{ borderRadius: "12px", height: "100%" }}>
              <Statistic
                title={
                  <Text type="secondary" strong>
                    Efectivo Físico Estimado
                  </Text>
                }
                value={metricasCaja?.efectivoEnCaja || 0}
                formatter={(val) => formatearDinero(val)}
                valueStyle={{ color: "#3f8600", fontWeight: "bold" }}
                prefix={<DollarOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Debería haber hoy en gavetas</Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable style={{ borderRadius: "12px", height: "100%" }}>
              <Statistic
                title={
                  <Text type="secondary" strong>
                    Retiros / Salidas de Efectivo
                  </Text>
                }
                value={metricasCaja?.totalRetiros || 0}
                formatter={(val) => formatearDinero(val)}
                valueStyle={{ color: "#cf1322", fontWeight: "bold" }}
                prefix={<ArrowDownOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="danger">Gastos o retiros blindados</Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable style={{ borderRadius: "12px", height: "100%" }}>
              <Statistic
                title={
                  <Text type="secondary" strong>
                    Total Débito acumulado
                  </Text>
                }
                value={metricasCaja?.debitoTotal || 0}
                formatter={(val) => formatearDinero(val)}
                valueStyle={{ color: "#1890ff", fontWeight: "bold" }}
                prefix={<ArrowUpOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Ventas POS Mercado Pago</Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable style={{ borderRadius: "12px", height: "100%" }}>
              <Statistic
                title={
                  <Text type="secondary" strong>
                    Total Crédito acumulado
                  </Text>
                }
                value={metricasCaja?.creditoTotal || 0}
                formatter={(val) => formatearDinero(val)}
                valueStyle={{ color: "#722ed1", fontWeight: "bold" }}
                prefix={<ArrowUpOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Ventas POS Crédito</Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* --- TABLA HISTORIAL DE SESIONES / ARQUEOS --- */}
        <Row style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card
              title="Historial de Turnos y Cuadraturas"
              style={{ borderRadius: "12px" }}
              extra={
                <Space>
                  <InfoCircleOutlined style={{ color: "#1890ff" }} />
                  <Text type="secondary" size="small">
                    Muestra aperturas y descalces de dinero
                  </Text>
                </Space>
              }
            >
              <Table
                columns={columnasCajas}
                dataSource={historialCajas}
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}
