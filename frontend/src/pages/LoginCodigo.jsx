import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Card, Typography, Form, Input, notification } from "antd";
import { ScanOutlined, LoadingOutlined } from "@ant-design/icons";

import { inicioSesionCodigo } from "../services/Auth.services.js";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginCodigo() {
  const { Title, Text } = Typography;
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 1. Referencia para controlar el input
  const inputRef = useRef(null);

  const mantenerFoco = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  useEffect(() => {
    mantenerFoco();
    if (isAuthenticated) {
      navigate("/");
    }
    const handleClickAnywhere = () => mantenerFoco();
    document.addEventListener("click", handleClickAnywhere);

    return () => {
      document.removeEventListener("click", handleClickAnywhere);
    };
  }, [isAuthenticated, navigate]);

  const handleScan = async () => {
    try {
      const codigo = form.getFieldValue("codigo");
      if (!codigo || codigo.trim() === "") return;

      setLoading(true);

      const respuesta = await inicioSesionCodigo(codigo);

      if (respuesta.status === 200) {
        notification.success({
          message: "Inicio de sesión exitoso",
          description: `Bienvenido, ${respuesta.data.datos.nombre}`,
          duration: 2,
        });
        await login(respuesta.data.datos);
        navigate("/");
      } else {
        notification.error({
          message: "Error en inicio de sesión",
          description: respuesta.data.message || "No se pudo iniciar sesión",
        });
      }
    } catch (error) {
      console.log("Error al enviar el código:", error);
      notification.error({
        message: "Error de lectura",
        description:
          error.response?.data?.message ||
          error.message ||
          "No se pudo validar la credencial.",
      });

      form.resetFields();
    } finally {
      setLoading(false);
      mantenerFoco();
    }
  };

  return (
    <Row
      justify="center"
      align="middle"
      style={{
        minHeight: "100vh",
        backgroundColor: "#8a919b",
      }}
    >
      <Col
        span={8}
        style={{
          textAlign: "center",
          padding: 24,
          borderRadius: 8,
        }}
      >
        <Card
          style={{ justifyItems: "center", padding: 24 }}
          onClick={mantenerFoco}
        >
          <div style={{ marginBottom: 20 }}>
            {loading ? (
              <LoadingOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
            ) : (
              <ScanOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
            )}
            <Title level={4} style={{ marginTop: 10 }}>
              {loading ? "Verificando..." : "Escanea tu Credencial"}
            </Title>
          </div>

          <Form form={form} layout="vertical">
            <Form.Item name="codigo" style={{ margin: 0 }}>
              <Input
                ref={inputRef}
                autoFocus
                autoComplete="off"
                onPressEnter={handleScan}
                style={{
                  opacity: 0,
                  position: "absolute",
                  zIndex: -1,
                  height: 1,
                  width: 1,
                }}
              />
            </Form.Item>
          </Form>

          {/* <Input
            placeholder="Esperando escáner..."
            readOnly
            style={{ textAlign: "center", pointerEvents: "none" }}
            value={codigoLeido ? "••••••••" : ""}
          /> */}
        </Card>
      </Col>
    </Row>
  );
}
