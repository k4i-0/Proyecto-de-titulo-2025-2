import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import inicioSesion from "../services/Auth.services";
import { UserOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import { Layout, Form, Input, Button, Card, Typography, Alert } from "antd";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const Login = () => {
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");

  // const [isFullscreen, setIsFullscreen] = useState(false);
  //const [autoAttempted, setAutoAttempted] = useState(false);
  //
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token || isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // useEffect(() => {
  //   const handleFullscreenChange = () => {
  //     setIsFullscreen(!!document.fullscreenElement);
  //   };

  //   document.addEventListener("fullscreenchange", handleFullscreenChange);
  //   document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

  //   return () => {
  //     document.removeEventListener("fullscreenchange", handleFullscreenChange);
  //     document.removeEventListener(
  //       "webkitfullscreenchange",
  //       handleFullscreenChange
  //     );
  //   };
  // }, []);

  // const enterFullscreen = () => {
  //   const elem = document.documentElement;

  //   if (elem.requestFullscreen) {
  //     elem.requestFullscreen().catch((err) => {
  //       console.log("Error al activar pantalla completa:", err);
  //     });
  //   } else if (elem.webkitRequestFullscreen) {
  //     elem.webkitRequestFullscreen();
  //   } else if (elem.msRequestFullscreen) {
  //     elem.msRequestFullscreen();
  //   }

  //   setIsFullscreen(true);
  // };

  // const handleFirstClick = () => {
  //   if (!autoAttempted) {
  //     enterFullscreen();
  //     setAutoAttempted(true);
  //   }
  //   if (document.fullscreenElement == null) setAutoAttempted(false);
  //   console.log(document.fullscreenElement);
  // };

  const onFinishFailed = (errorInfo) => {
    console.log("Falló:", errorInfo);
  };

  const handleSubmit = async (values) => {
    //values.preventDefault();
    //llamada backend para autenticar
    const usuario = await inicioSesion(values.email, values.password);
    console.log("Usuario dentro de login", usuario);
    if (usuario.code) {
      alert(usuario.message);
      return;
    }
    //console.log(usuario.token.token);
    login(usuario.datos, usuario.token.token);
    // Redirigir a la página de inicio después del inicio de sesión
    navigate("/dashboard");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Title level={3} style={{ margin: 0, color: "#001529" }}>
          Mi Aplicación
        </Title>
      </Header>
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
          <Alert
            message="Usuario o contraseña incorrectos"
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
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
