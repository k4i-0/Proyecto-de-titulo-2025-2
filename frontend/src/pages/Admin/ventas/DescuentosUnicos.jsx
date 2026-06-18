import { useState, useEffect } from "react";

import {
  Row,
  Col,
  Card,
  Button,
  notification,
  Space,
  Typography,
  Tag,
} from "antd";
import { PercentageOutlined, PlusOutlined } from "@ant-design/icons";

import { obtenerDescuentosUnicos } from "../../../services/ventas/descuento.service.js";

import DataTable from "../../../components/Tabla.jsx";

export default function DescuentosUnicos() {
  const [descuentosUnicos, setDescuentosUnicos] = useState([]);

  const buscarDescuentosUnicos = async () => {
    try {
      const response = await obtenerDescuentosUnicos();
      console.log("Descuentos únicos obtenidos:", response);
      if (response.status === 200) {
        setDescuentosUnicos(response.data);
        notification.success({
          message: "Éxito",
          description: "Descuentos únicos obtenidos correctamente.",
        });
        return;
      }
      if (response.status === 204) {
        setDescuentosUnicos([]);
        notification.warning({
          message: "Sin resultados",
          description: "No se encontraron descuentos únicos.",
        });
        return;
      }
      notification.error({
        message: "Error",
        description: "No se encontraron descuentos únicos.",
      });
    } catch (error) {
      console.error("Error al obtener los descuentos únicos:", error);
      notification.error({
        message: "Error",
        description: "Error al obtener los descuentos únicos.",
      });
    }
  };

  useEffect(() => {
    buscarDescuentosUnicos();
  }, []);

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            title={
              <Space>
                <PercentageOutlined style={{ color: "#1890ff" }} />
                <span style={{ fontWeight: 600 }}>Descuentos Únicos</span>
              </Space>
            }
            style={{
              borderRadius: 12, // Bordes más suaves
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              width: "100%",
            }}
          >
            <div style={{ padding: "16px" }}>
              <DataTable
                size="middle"
                rowKey="idDescuento"
                data={descuentosUnicos}
                columns={[
                  {
                    title: "ID",
                    dataIndex: "idDescuento",
                    key: "idDescuento",
                    width: 80,
                    align: "center",
                    render: (id) => (
                      <Typography.Text type="secondary">#{id}</Typography.Text>
                    ),
                  },
                  {
                    title: "Descripción",
                    dataIndex: "descripcion",
                    key: "descripcion",
                    render: (text) => (
                      <Typography.Text strong>
                        {text || "Sin descripción"}
                      </Typography.Text>
                    ),
                  },
                  {
                    title: "Valor (%)",
                    dataIndex: "valorDescuento",
                    key: "valorDescuento",
                    align: "right",
                    width: 120,
                    render: (valor) => (
                      <Tag color="blue" style={{ margin: 0, fontWeight: 600 }}>
                        {Number(valor)}%
                      </Tag>
                    ),
                  },
                  {
                    title: "Estado",
                    dataIndex: "estado",
                    key: "estado",
                    align: "center",
                    width: 120,
                    render: (estado) => {
                      return (
                        <Tag
                          color={estado === "Activo" ? "success" : "error"}
                          style={{ margin: 0 }}
                        >
                          {estado.toUpperCase()}
                        </Tag>
                      );
                    },
                  },
                ]}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
}
