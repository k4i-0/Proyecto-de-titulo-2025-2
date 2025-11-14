// import { useState, useEffect } from "react";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Alert,
  Statistic,
  Divider,
} from "antd";

const { Title, Text } = Typography;

import { useAuth } from "../context/AuthContext";

// import { useNavigate } from "react-router-dom";

//funciones
// import obtenerSucursales from "../services/inventario/Sucursal.service";

export default function Inicio() {
  const { user } = useAuth();
  // const [flag, setFlag] = useState(false);
  // const [mensaje, setMensaje] = useState("");

  // const navigate = useNavigate();

  // useEffect(() => {
  //   const consultaSucursal = async () => {
  //     const respuesta = await obtenerSucursales();
  //     //console.log(respuesta);
  //     if (respuesta.status === 200) {
  //       setFlag(false);
  //       setMensaje("");
  //     }
  //     if (respuesta.status === 204) {
  //       setFlag(true);
  //       setMensaje(
  //         "No existen sucursales disponibles, debe crear una sucursal"
  //       );
  //     }
  //   };
  //   consultaSucursal();
  // }, []);
  return (
    <>
      <Row justify="center" align="middle" style={{ margin: 20 }}>
        <Title level={1}>Bienvenido {user.nombre}</Title>
      </Row>
      <Row justify="start" align="middle" gutter={16}>
        <Divider
          orientation="left"
          orientationMargin={0}
          style={{ borderColor: "#000" }}
        >
          <Title type="success" level={3}>
            Indicadores Diarios
          </Title>
        </Divider>
      </Row>

      <Row
        justify="center"
        align="middle"
        gutter={16}
        style={{ marginTop: 20, textAlign: "center" }}
      >
        <Col style={{ marginBottom: 20 }}>
          <Card
            hoverable
            title="Ventas Totales"
            style={{ width: 200, height: 180 }}
            variant="borderless"
          >
            <Statistic
              formatter={() => "20.000.000"}
              value={20000000}
              precision={0}
              valueStyle={{ color: "#3f8600" }}
              prefix="$"
            />
            <Text type="success">M</Text>
          </Card>
        </Col>
        <Col style={{ marginBottom: 20 }}>
          <Card
            hoverable
            title="Sucursales Activas"
            style={{ width: 200, height: 180 }}
          >
            <Title level={2}>2</Title>
            <Text type="success">Sucursales</Text>
          </Card>
        </Col>
        <Col style={{ marginBottom: 20 }}>
          <Card
            hoverable
            title="Productos Vendidos"
            style={{ width: 200, height: 180 }}
          >
            <Title level={2}>1500</Title>
            <Text type="success">Productos</Text>
          </Card>
        </Col>
        <Col style={{ marginBottom: 20 }}>
          <Card
            hoverable
            title="Mayor venta"
            style={{ width: 200, height: 180 }}
          >
            <Title level={2}>$1.500.000</Title>
            <Text type="success">Sucusal A</Text>
          </Card>
        </Col>
      </Row>

      {/* Kpis Financieros Relevantes */}
      <Row style={{ margin: 20 }}>
        <Divider orientation="left" style={{ borderColor: "#000" }}>
          <Title type="success" level={3}>
            Indicadores Financieros Mensuales
          </Title>
        </Divider>
      </Row>
      <Row
        justify="center"
        align="middle"
        gutter={16}
        style={{ marginTop: "20", textAlign: "center" }}
      >
        <Col style={{ marginBottom: 20 }}>
          <Card
            hoverable
            title="Margen Utilitario"
            style={{ width: "auto", height: 180 }}
          >
            {/* (Ingresos Totales-Costos Totales) / Ingresos Totales*/}
            <Title level={2}>1.500.000</Title>
            <Text type="success">Millones</Text>
          </Card>
        </Col>

        <Col style={{ marginBottom: 20 }}>
          <Card
            hoverable
            title="Rotacion Inventario"
            style={{ width: "auto", height: 180 }}
          >
            {/* Valor Venta / Valor Promedio Inventario */}
            <Title level={2}>2</Title>
            <Text type="success">Cantidad</Text>
          </Card>
        </Col>

        <Col style={{ marginBottom: 20 }}>
          <Card
            hoverable
            title="Productos Mas vendido"
            style={{ width: "auto", height: 180 }}
          >
            <Title level={3}>Producto A</Title>
            <Text type="success">n veces</Text>
          </Card>
        </Col>

        <Col style={{ marginBottom: 20 }}>
          <Card
            hoverable
            title="Productos menos vendido"
            style={{ width: "auto", height: 180 }}
          >
            <Title level={3}>Producto b</Title>
            <Text type="danger">x veces</Text>
          </Card>
        </Col>

        <Col style={{ marginBottom: 20 }}>
          {/* Perdidas por productos dañados, vencidos , robados, o consumidos internamente */}
          <Card
            hoverable
            title="Perdidas Stock"
            style={{ width: "auto", height: 180 }}
          >
            <Title level={3}>25.000.000</Title>
            <Text type="danger">Millones</Text>
          </Card>
        </Col>
      </Row>
    </>
  );
}
