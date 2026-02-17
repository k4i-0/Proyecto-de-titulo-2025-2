import React from "react";
import { Row, Col, Card, Statistic } from "antd";
import { ShoppingOutlined, ClockCircleOutlined } from "@ant-design/icons";

const CORPORATE_COLOR = "#1c2e4a";

/**
 *
 * @param {Object} datos - Array de objetos con los parametros de los KPI.
 * Cada objeto debe tener:
 *  - titulo: Título del KPI.
 * - valor: Valor numérico del KPI.
 * - prefijo: (Opcional) Prefijo para el valor (ej: "$").
 * - estiloValor: (Opcional) Estilos personalizados para el valor (ej: color, fontWeight).
 * @returns
 */

export default function KPIStats({ datos }) {
  const cantidad = datos.length;

  const getColSpan = () => {
    switch (cantidad) {
      case 1:
        return { xs: 24, sm: 24, md: 24, lg: 24 };
      case 2:
        return { xs: 24, sm: 12, md: 12, lg: 12 };
      case 3:
        return { xs: 24, sm: 12, md: 8, lg: 8 };
      case 4:
        return { xs: 24, sm: 12, md: 6, lg: 6 };
      case 5:
        return { xs: 24, sm: 12, md: 8, lg: 4 }; // 5 elementos
      case 6:
        return { xs: 24, sm: 12, md: 8, lg: 4 };
      default:
        return { xs: 24, sm: 12, md: 8, lg: 6 }; // 7+
    }
  };

  const colSpan = getColSpan();
  if (!datos) {
    datos = [
      {
        titulo: "Ventas del Día",
        valor: 12500,
        prefijo: "$",
        estiloValor: { color: CORPORATE_COLOR, fontWeight: "bold" },
      },
      {
        titulo: "Órdenes Pendientes",

        valor: 8,
        prefijo: <ClockCircleOutlined />,
        estiloValor: { color: CORPORATE_COLOR, fontWeight: "bold" },
      },
      {
        titulo: "Productos Vendidos",
        valor: 320,
        prefijo: <ShoppingOutlined />,
        estiloValor: { color: CORPORATE_COLOR, fontWeight: "bold" },
      },
    ];
  }
  return (
    <Row gutter={16} style={{ marginBottom: "24px" }}>
      {datos.map((dato, index) => (
        <Col {...colSpan} key={dato.titulo || index}>
          <Card
            hoverable
            style={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              transition: "all 0.3s",
            }}
          >
            <Statistic
              title={dato.titulo}
              value={dato.valor}
              prefix={dato.icono || dato.prefijo}
              valueStyle={dato.estiloValor}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
