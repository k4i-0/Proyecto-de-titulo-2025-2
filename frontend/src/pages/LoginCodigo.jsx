import React, { useEffect, useRef, useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Form,
  Input,
  notification,
  Button,
  Tag,
  theme,
} from "antd";
import {
  ScanOutlined,
  LoadingOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

import { inicioSesionCodigo } from "../services/Auth.services.js";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const pulseAnimation = `
  @keyframes pulse-blue {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(24, 144, 255, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(24, 144, 255, 0); }
  }
`;

const { Title, Text } = Typography;

export default function LoginCodigo() {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 1. Referencia para controlar el input
  const inputRef = useRef(null);

  const { token } = theme.useToken();

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
        console.log("Respuesta del servidor:", respuesta);
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
          description: respuesta.message || "No se pudo iniciar sesión",
        });
      }
    } catch (error) {
      console.log("Error al enviar el código:", error);
      notification.error({
        message: "Error de lectura",
        description:
          error.error.message ||
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
    // <div style={{ margin: 0, backgroundColor: "#8a919b" }}>
    //   <Row justify="end" style={{ padding: 16 }}>
    //     <Button type="primary" onClick={() => navigate("/login")}>
    //       Inicio Administrador
    //     </Button>
    //   </Row>
    //   <Row
    //     justify="center"
    //     align="middle"
    //     style={{
    //       minHeight: "100vh",
    //     }}
    //   >
    //     <Col
    //       span={6}
    //       style={{
    //         textAlign: "center",
    //         padding: 24,
    //         borderRadius: 8,
    //       }}
    //     >
    //       <Card
    //         style={{ justifyItems: "center", padding: 24 }}
    //         onClick={mantenerFoco}
    //       >
    //         <div style={{ marginBottom: 20 }}>
    //           {loading ? (
    //             <LoadingOutlined
    //               style={{ fontSize: "48px", color: "#1890ff" }}
    //             />
    //           ) : (
    //             <ScanOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
    //           )}
    //           <Title level={4} style={{ marginTop: 10 }}>
    //             {loading ? "Verificando..." : "Escanea tu Credencial"}
    //           </Title>
    //         </div>

    //         <Form form={form} layout="vertical">
    //           <Form.Item name="codigo" style={{ margin: 0 }}>
    //             <Input
    //               ref={inputRef}
    //               autoFocus
    //               autoComplete="off"
    //               onPressEnter={handleScan}
    //               style={{
    //                 opacity: 0,
    //                 position: "absolute",
    //                 zIndex: -1,
    //                 height: 1,
    //                 width: 1,
    //               }}
    //             />
    //           </Form.Item>
    //         </Form>

    //         {/* <Input
    //         placeholder="Esperando escáner..."
    //         readOnly
    //         style={{ textAlign: "center", pointerEvents: "none" }}
    //         value={codigoLeido ? "••••••••" : ""}
    //         /> */}
    //       </Card>
    //     </Col>
    //   </Row>
    // </div>
    <>
      <style>{pulseAnimation}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1c2e4a 0%, #324a6e 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
        onClick={mantenerFoco}
      >
        {/* --- Botón Administrador Flotante --- */}
        <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
          <Button
            type="text"
            icon={<SafetyCertificateOutlined />}
            onClick={() => navigate("/login")}
            style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}
          >
            Acceso Administrativo
          </Button>
        </div>

        {/* --- Tarjeta Principal --- */}
        <Card
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 16,
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
            textAlign: "center",
            padding: "20px 10px",
            backgroundColor: "rgba(255, 255, 255, 0.98)",
          }}
        >
          {/* Indicador de Estado */}
          <div style={{ marginBottom: 30 }}>
            <Tag
              color={loading ? "processing" : "success"}
              style={{ border: "none", padding: "4px 12px" }}
            >
              {loading ? "PROCESANDO..." : "• SISTEMA LISTO"}
            </Tag>
          </div>

          {/* Icono Animado */}
          <div
            style={{
              width: 100,
              height: 100,
              background: loading ? "#f0f5ff" : "#e6f7ff",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px auto",

              animation: loading ? "none" : "pulse-blue 2s infinite",
              transition: "all 0.3s ease",
            }}
          >
            {loading ? (
              <LoadingOutlined
                style={{ fontSize: "48px", color: token.colorPrimary }}
              />
            ) : (
              <ScanOutlined
                style={{ fontSize: "48px", color: token.colorPrimary }}
              />
            )}
          </div>

          <Title level={3} style={{ marginBottom: 8, color: "#1f1f1f" }}>
            {loading ? "Validando Credencial" : "Escanea tu Código"}
          </Title>

          <Text
            type="secondary"
            style={{ fontSize: "15px", display: "block", marginBottom: 30 }}
          >
            {loading
              ? "Por favor espera un momento..."
              : "Acerca tu tarjeta o código al lector para ingresar"}
          </Text>

          {/* Input Invisible (Lógica de Foco) */}
          <Form form={form}>
            <Form.Item name="codigo" style={{ margin: 0 }}>
              <Input
                ref={inputRef}
                autoFocus
                autoComplete="off"
                onBlur={mantenerFoco}
                onPressEnter={handleScan}
                style={{
                  opacity: 0,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: 1,
                  width: 1,
                  zIndex: -1,
                }}
              />
            </Form.Item>
          </Form>

          {/* Decoración Visual Inferior
          <div
            style={{
              borderTop: "1px solid #f0f0f0",
              paddingTop: 15,
              marginTop: 10,
            }}
          >
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Sistema de Control de Acceso v1.0
            </Text>
          </div> */}
        </Card>
      </div>
    </>
  );
}
