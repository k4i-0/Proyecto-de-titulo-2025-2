import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import inicioSesion from "../services/Auth.services";
import { UserOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import { Layout, Form, Input, Button, Card, Typography, Alert } from "antd";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const Login = () => {
  const [flag, setFlag] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token || isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const onFinishFailed = (errorInfo) => {
    console.log("Falló:", errorInfo);
  };

  const handleSubmit = async (values) => {
    const usuario = await inicioSesion(values.email, values.password);
    console.log("Usuario dentro de login", usuario);
    if (usuario.code) {
      setShowAlert(true);
      setFlag(usuario.message);
      //alert(usuario.message);
      return;
    }
    //console.log(usuario.token.token);
    login(usuario.datos, usuario.token.token);
    // Redirigir a la página de inicio después del inicio de sesión
    navigate("/dashboard");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "48px 24px",
          background: "#f0f2f5", // Un fondo gris claro
        }}
      >
        <Card
          style={{
            width: 400,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: "8px",
          }}
        >
          <Title
            level={2}
            style={{ textAlign: "center", marginBottom: "24px" }}
          >
            Iniciar Sesión
          </Title>
          {showAlert && (
            <div>
              <Alert message={flag} type="error" showIcon />
            </div>
          )}

          <Form
            onFinish={handleSubmit}
            onFinishFailed={onFinishFailed}
            layout="vertical"
            initialValues={{ remember: true }}
            autoComplete="off"
          >
            <Form.Item
              label="Correo"
              name="email"
              rules={[
                { required: true, message: "¡Por favor ingresa tu correo!" },
                { type: "email", message: "¡Ese no es un correo válido!" },
              ]}
            >
              <Input
                id="email"
                //onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="mb-3"
              />
            </Form.Item>

            <Form.Item
              label="Contraseña"
              name="password"
              rules={[
                {
                  required: true,
                  message: "¡Por favor ingresa tu contraseña!",
                },
              ]}
            >
              <Input.Password
                id="password"
                //onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-100"
              />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit">
                Iniciar Sesión
              </Button>
            </Form.Item>

            {/* <p className="text-center mb-2">Presiona ESC para salir</p>
        <Alert className="text-center text-muted small">
          Pantalla Completa: {isFullscreen ? "✓ Activo" : "✗ Inactivo"}
        </Alert> */}
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default Login;
