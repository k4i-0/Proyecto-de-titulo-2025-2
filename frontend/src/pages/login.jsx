import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import inicioSesion from "../services/Auth.services";
import { UserOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import {
  Layout,
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
  Row,
  Col,
} from "antd";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const Login = () => {
  const [flag, setFlag] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token || isAuthenticated) {
      if (user && user.rol === "Administrador") {
        navigate("/admin");
      } else if (user && user.rol === "Vendedor") {
        navigate("/vendedor");
      }
    }
  }, [isAuthenticated, navigate, user]);

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
    navigate("/");
  };

  return (
    <>
      {/* <Row justify="start" align="middle" style={{ padding: "20px" }}>
        <Col span={8} style={{ textAlign: "center" }}>
          Logo
        </Col>
        <Col span={8} offset={8} style={{ textAlign: "center" }}>
          Nombre Empresa
        </Col>
      </Row> */}
      <Row justify="center" align="middle" style={{ height: "100vh" }}>
        <Col>
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
              Acceso
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
        </Col>
      </Row>
    </>
  );
};

export default Login;
