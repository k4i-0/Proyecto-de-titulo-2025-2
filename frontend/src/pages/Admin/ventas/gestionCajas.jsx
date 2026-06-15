import { useState, useEffect } from "react";

import {
  Row,
  Col,
  Card,
  Form,
  notification,
  Button,
  Select,
  Space,
  Modal,
  Descriptions,
  Input,
  Statistic,
  Divider,
  Tag,
  Typography,
} from "antd";

import {
  LockOutlined,
  UnlockOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  SearchOutlined,
  CalculatorOutlined,
} from "@ant-design/icons";

import DataTable from "../../../components/Tabla.jsx";

import { buscarTodasSucursales } from "../../../services/functions/Sucursales.js";

import {
  buscarCajasPorSucursal,
  buscarDatosCuadraturaCaja,
  bloquearFuncionamientoCaja,
  desbloquearFuncionamientoCaja,
  cuadrarCaja,
} from "../../../services/ventas/caja.service.js";

export default function GestionCajas() {
  const [sucursales, setSucursales] = useState([]);
  const [cajasSucursal, setCajasSucursal] = useState([]);
  const [datosCuadraturaCaja, setDatosCuadraturaCaja] = useState(null);

  //modales
  const [modalCadraturaCaja, setModalCadraturaCaja] = useState(false);

  const [formSucursales] = Form.useForm();
  const [formCuadraturaCaja] = Form.useForm();

  useEffect(() => {
    buscarTodasSucursales(setSucursales);
  }, []);

  //Funciones formulario sucursales

  const idSucursalSeleccionada = Form.useWatch("sucursal", formSucursales);

  const buscarCajasporSucursal = async () => {
    try {
      const response = await buscarCajasPorSucursal(idSucursalSeleccionada);
      //console.log("Respuesta de cajas por sucursal:", response);
      if (response.status === 200) {
        setCajasSucursal(response.data);
      } else {
        setCajasSucursal([]);
        notification.error({
          message: response.error || "Error al obtener cajas",
        });
      }
    } catch (error) {
      console.error("Error al buscar cajas por sucursal:", error);
      notification.error({
        message: "Error al buscar cajas",
        description: error.response?.data?.error || "Error del servidor",
      });
    }
  };

  //funciones modal cuadratura caja
  const formatearDinero = (monto) => {
    return Number(monto || 0).toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
    });
  };

  const obtenerDatosCuadraturaCaja = async () => {
    const deviceID = localStorage.getItem("deviceID");
    try {
      const response = await buscarDatosCuadraturaCaja(deviceID);
      //console.log("Respuesta de datos de cuadratura de caja:", response.data);
      if (response.status === 200) {
        setDatosCuadraturaCaja(response.data);
      } else {
        setDatosCuadraturaCaja(null);
        notification.error({
          message:
            response.error || "Error al obtener datos de cuadratura de caja",
        });
      }
    } catch (error) {
      console.error("Error al obtener datos de cuadratura de caja:", error);
      notification.error({
        message: "Error al obtener datos de cuadratura de caja",
        description: error.response?.data?.error || "Error del servidor",
      });
    }
  };

  const abrirModalCadraturaCaja = async () => {
    await obtenerDatosCuadraturaCaja();

    setModalCadraturaCaja(true);
  };

  const cerrarModalCadraturaCaja = () => {
    formCuadraturaCaja.resetFields();
    setModalCadraturaCaja(false);
  };

  const bloquearCaja = async () => {
    const deviceID = localStorage.getItem("deviceID");
    try {
      const response = await bloquearFuncionamientoCaja(deviceID);
      //console.log("Respuesta de bloqueo de caja:", response.data);
      if (response.status === 200) {
        notification.success({
          message: "Caja bloqueada exitosamente",
        });
        // Actualizar el estado de la caja en la tabla
        obtenerDatosCuadraturaCaja(deviceID);
      } else {
        notification.error({
          message: response?.data?.error || "Error al bloquear caja",
        });
      }
    } catch (error) {
      console.error("Error al bloquear caja:", error);
      notification.error({
        message: "Error al bloquear caja",
        description: error.response?.data?.error || "Error del servidor",
      });
    }
  };

  const desbloquearCaja = async () => {
    const deviceID = localStorage.getItem("deviceID");
    try {
      const response = await desbloquearFuncionamientoCaja(deviceID);
      //console.log("Respuesta de desbloqueo de caja:", response);
      if (response.status === 200) {
        notification.success({
          message: "Caja desbloqueada exitosamente",
        });
        // Actualizar el estado de la caja en la tabla
        obtenerDatosCuadraturaCaja(deviceID);
      } else {
        notification.error({
          message: response.data.error || "Error al desbloquear caja",
        });
      }
    } catch (error) {
      console.error("Error al desbloquear caja:", error);
      notification.error({
        message: "Error al desbloquear caja",
        description: error.response?.data?.error || "Error del servidor",
      });
    }
  };

  const cerrarCaja = async () => {
    const deviceID = localStorage.getItem("deviceID");
    const observaciones = formCuadraturaCaja.getFieldValue(
      "observacionesCierre",
    );
    //console.log("Valores para cierre de caja:", { deviceID, observaciones });
    try {
      const response = await cuadrarCaja(deviceID, observaciones);
      //console.log("Respuesta de cuadratura de caja:", response);
      if (response.status === 200) {
        notification.success({
          message: "Caja cuadrada exitosamente",
        });
        cerrarModalCadraturaCaja();
      } else {
        notification.error({
          message: response.data.error || "Error al cuadrar caja",
        });
      }
    } catch (error) {
      console.error("Error al cuadrar caja:", error);
      notification.error({
        message: "Error al cuadrar caja",
        description: error.response?.data?.error || "Error del servidor",
      });
    }
  };

  return (
    <>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 0" }}>
        <Typography.Title level={3} style={{ marginBottom: 24 }}>
          Gestión de Cajas
        </Typography.Title>

        <Card
          bordered={false}
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)", borderRadius: 8 }}
        >
          <div
            style={{
              marginBottom: 32,
              paddingBottom: 24,
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Typography.Text
              type="secondary"
              style={{ display: "block", marginBottom: 8, fontSize: 16 }}
            >
              Seleccione la sucursal que desea gestionar:
            </Typography.Text>

            <Form form={formSucursales} layout="inline">
              <Space.Compact style={{ width: "100%", maxWidth: 600 }}>
                {" "}
                {/* Limita el ancho para que no se deforme en pantallas gigantes */}
                <Form.Item name="sucursal" noStyle>
                  <Select
                    size="large" // <-- 🚀 Esto hace que el input sea más alto y la letra más grande
                    placeholder="Buscar sucursal..."
                    style={{ width: "100%" }}
                  >
                    {sucursales.map((sucursal) => (
                      <Select.Option
                        key={sucursal.idSucursal}
                        value={sucursal.idSucursal}
                      >
                        {sucursal.nombre}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Button
                  type="primary"
                  size="large" // <-- 🚀 Acompaña el tamaño del Select
                  icon={<SearchOutlined />}
                  onClick={buscarCajasporSucursal}
                  disabled={!idSucursalSeleccionada}
                  style={{ padding: "0 32px" }} // Botón un poco más ancho
                >
                  Buscar cajas
                </Button>
              </Space.Compact>
            </Form>
          </div>

          <DataTable
            data={cajasSucursal}
            rowKey="idCaja"
            columns={[
              {
                title: "Caja",
                dataIndex: "numeroCaja",
                render: (text) => (
                  <Typography.Text strong>#{text}</Typography.Text>
                ),
              },
              {
                title: "Efectivo",
                dataIndex: "montoCajaEfectivo",
              },
              {
                title: "Débito",
                dataIndex: "montoCajaDebito",
              },
              {
                title: "Crédito",
                dataIndex: "montoCajaCredito",
              },
              {
                title: "Estado",
                dataIndex: "estadoCaja",
                render: (estado) => (
                  <Tag
                    color={estado === "Abierta" ? "green" : "default"}
                    bordered={false}
                  >
                    {estado}
                  </Tag>
                ),
              },
              {
                title: "Acciones",
                key: "acciones",
                align: "right",
                render: (_, record) => (
                  <Button
                    type="primary"
                    icon={<CalculatorOutlined />}
                    disabled={record.estadoCaja === "Cerrada"}
                    onClick={() => abrirModalCadraturaCaja(record)}
                    style={{ color: "#1890ff" }}
                  >
                    Cuadrar
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      </div>
      {/**Modal Cuadratura */}
      <Modal
        title={
          <Space>
            <DollarOutlined style={{ color: "#1890ff" }} />
            <span>Cuadratura y Cierre de Caja</span>
          </Space>
        }
        open={modalCadraturaCaja}
        onCancel={cerrarModalCadraturaCaja}
        footer={null}
        centered
        width={750}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            padding: "12px 16px",
            backgroundColor: "#f5f5f5",
            borderRadius: 8,
          }}
        >
          <Space>
            <Typography.Text strong>N° Caja:</Typography.Text>
            <Tag>{datosCuadraturaCaja?.numeroCaja || "N/A"}</Tag>
            <Typography.Text strong>Estado de Caja:</Typography.Text>
            <Tag
              color={
                datosCuadraturaCaja?.estadoCaja === "Abierta" ? "green" : "red"
              }
            >
              {datosCuadraturaCaja?.estadoCaja || "Desconocido"}
            </Tag>
          </Space>
          <Space>
            <Button danger icon={<LockOutlined />} onClick={bloquearCaja}>
              Bloquear
            </Button>
            <Button icon={<UnlockOutlined />} onClick={desbloquearCaja}>
              Desbloquear
            </Button>
          </Space>
        </div>

        <Descriptions
          bordered
          size="small"
          column={2}
          style={{ marginBottom: 24 }}
        >
          <Descriptions.Item label="Funcionario">
            <Typography.Text strong>
              {datosCuadraturaCaja?.nombreFuncionario}{" "}
              {datosCuadraturaCaja?.apellidoFuncionario}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Fecha Arqueo">
            {datosCuadraturaCaja?.fechaGeneracionArqueo
              ? new Date(
                  datosCuadraturaCaja.fechaGeneracionArqueo,
                ).toLocaleString("es-CL", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Cantidad de Ventas">
            {datosCuadraturaCaja?.cantidadVentas || 0} transacciones
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Desglose de Ingresos</Divider>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card
              size="small"
              bordered={false}
              style={{ background: "#f6ffed" }}
            >
              <Statistic
                title="Total Efectivo"
                value={formatearDinero(datosCuadraturaCaja?.totalEfectivo)}
                valueStyle={{ color: "#3f8600", fontSize: "1.2rem" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              size="small"
              bordered={false}
              style={{ background: "#e6f7ff" }}
            >
              <Statistic
                title="Total Débito"
                value={formatearDinero(datosCuadraturaCaja?.totalDebito)}
                valueStyle={{ color: "#1890ff", fontSize: "1.2rem" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              size="small"
              bordered={false}
              style={{ background: "#fff0f6" }}
            >
              <Statistic
                title="Total Crédito"
                value={formatearDinero(datosCuadraturaCaja?.totalCredito)}
                valueStyle={{ color: "#eb2f96", fontSize: "1.2rem" }}
              />
            </Card>
          </Col>
        </Row>

        <Divider orientation="left">Resultado del Arqueo</Divider>
        <Row
          gutter={[16, 16]}
          justify="center"
          style={{ marginBottom: 24, textAlign: "center" }}
        >
          <Col xs={24} sm={8}>
            <Statistic
              title="Monto Inicial"
              value={formatearDinero(datosCuadraturaCaja?.montoInicial)}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Monto Cierre Real"
              value={formatearDinero(datosCuadraturaCaja?.montoCierre)}
            />
          </Col>
          <Col xs={24} sm={8}>
            {/* Lógica visual: Si falta plata (rojo), si sobra o está exacto (verde) */}
            <Statistic
              title="Diferencia (Sobrante/Faltante)"
              value={formatearDinero(datosCuadraturaCaja?.diferencia)}
              valueStyle={{
                color:
                  Number(datosCuadraturaCaja?.diferencia) < 0
                    ? "#cf1322"
                    : "#3f8600",
                fontWeight: "bold",
              }}
              prefix={
                Number(datosCuadraturaCaja?.diferencia) < 0 ? (
                  <WarningOutlined />
                ) : (
                  <CheckCircleOutlined />
                )
              }
            />
          </Col>
        </Row>

        <div
          style={{
            backgroundColor: "#fafafa",
            padding: 16,
            borderRadius: 8,
            border: "1px solid #d9d9d9",
          }}
        >
          <Form
            form={formCuadraturaCaja}
            layout="vertical"
            onFinish={cerrarCaja}
            style={{ margin: 0 }}
          >
            <Form.Item
              label={
                <Typography.Text strong>
                  Observaciones de cierre
                </Typography.Text>
              }
              name="observacionesCierre"
              style={{ marginBottom: 16 }}
            >
              <Input.TextArea
                rows={3}
                placeholder="Ej: Faltan $500 por error en vuelto, se retira efectivo para depósito..."
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Space>
                <Button onClick={cerrarModalCadraturaCaja}>Cancelar</Button>
                <Button type="primary" htmlType="submit" size="large">
                  Confirmar Cierre de Caja
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
}
