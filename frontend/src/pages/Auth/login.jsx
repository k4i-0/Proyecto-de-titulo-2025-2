import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import inicioSesion from "../../services/Auth.services";
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  ScanOutlined,
  SafetyCertificateFilled,
} from "@ant-design/icons";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  notification,
  theme,
} from "antd";

const { Title, Text } = Typography;

const Login = () => {
  // const [flag, setFlag] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token } = theme.useToken();

  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  useEffect(() => {
    //console.log("autenticado:", isAuthenticated, "usuario:", user);
    if (isAuthenticated) {
      if (user && user.nombreRol === "Administrador") {
        navigate("/admin");
      } else if (user && user.nombreRol === "Vendedor") {
        navigate("/vendedor");
      } else if (user && user.nombreRol === "Cajero") {
        navigate("/cajero");
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
    setLoading(true);
    try {
      const usuario = await inicioSesion(values.email, values.password);
      console.log("Usuario dentro de login", usuario);
      if (usuario.status === 200) {
        login(usuario.data.datos, usuario.data.token);
        notification.success({
          message: "Inicio de sesión exitoso",
          description: `Bienvenido, ${usuario.data.datos.nombre}`,
          placement: "topRight",
        });
        navigate("/");
        return;
      }
      notification.error({
        message: usuario.data.message,
        placement: "topRight",
      });
    } catch (error) {
      console.error("Error durante el inicio de sesión:", error);
      notification.error({
        message: "ALERTA",
        description:
          "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
    // if (usuario.code) {
    //   setShowAlert(true);
    //   setFlag(usuario.message);
    //   //alert(usuario.message);
    //   return;
    // }
    //console.log(usuario.token.token);
    // Redirigir a la página de inicio después del inicio de sesión
  };

  return (
    // <>
    //   <Row
    //     justify="start"
    //     align="middle"
    //     style={{
    //       padding: "10px",
    //       paddingLeft: "50px",
    //       backgroundColor: "rgb(57, 57, 239)",
    //     }}
    //   >
    //     <Col span={8} style={{ display: "flex", alignItems: "center" }}>
    //       <img
    //         src="../../public/Logo.jpeg"
    //         alt="Logo"
    //         style={{
    //           borderRadius: "8px",
    //           alignItems: "start",
    //           width: "150px",
    //         }}
    //       />
    //       <Title
    //         level={3}
    //         style={{
    //           color: "white",
    //           marginTop: "10px",
    //           marginLeft: "50px",
    //         }}
    //       >
    //         Sistema de Ventas
    //       </Title>
    //     </Col>
    //   </Row>
    //   <Row
    //     justify="center"
    //     align="middle"
    //     style={{ height: "100vh", backgroundColor: "#f0f2f5" }}
    //   >
    //     <Col style={{ marginBottom: "80px" }}>
    //       <Card
    //         style={{
    //           width: 400,
    //           boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    //           borderRadius: "8px",
    //         }}
    //       >
    //         <Title
    //           level={2}
    //           style={{ textAlign: "center", marginBottom: "24px" }}
    //         >
    //           Acceso
    //         </Title>
    //         {/* {showAlert && (
    //           <div>
    //             <Alert message={flag} type="error" showIcon />
    //           </div>
    //         )} */}

    //         <Form
    //           onFinish={handleSubmit}
    //           onFinishFailed={onFinishFailed}
    //           layout="vertical"
    //           initialValues={{ remember: true }}
    //           autoComplete="off"
    //         >
    //           <Form.Item
    //             label="Correo"
    //             name="email"
    //             rules={[
    //               { required: true, message: "¡Por favor ingresa tu correo!" },
    //               { type: "email", message: "¡Ese no es un correo válido!" },
    //             ]}
    //           >
    //             <Input
    //               id="email"
    //               //onChange={(e) => setEmail(e.target.value)}
    //               placeholder="tu@email.com"
    //               className="mb-3"
    //             />
    //           </Form.Item>

    //           <Form.Item
    //             label="Contraseña"
    //             name="password"
    //             rules={[
    //               {
    //                 required: true,
    //                 message: "¡Por favor ingresa tu contraseña!",
    //               },
    //             ]}
    //           >
    //             <Input.Password
    //               id="password"
    //               //onChange={(e) => setPassword(e.target.value)}
    //               placeholder="Ingresa tu contraseña"
    //               className="w-100"
    //             />
    //           </Form.Item>
    //           <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
    //             <Button type="primary" htmlType="submit">
    //               Iniciar Sesión
    //             </Button>
    //           </Form.Item>

    //           {/* <p className="text-center mb-2">Presiona ESC para salir</p>
    //     <Alert className="text-center text-muted small">
    //       Pantalla Completa: {isFullscreen ? "✓ Activo" : "✗ Inactivo"}
    //     </Alert> */}
    //         </Form>
    //       </Card>
    //     </Col>
    //   </Row>
    // </>
    <div
      style={{
        minHeight: "100vh",

        background:
          "radial-gradient(circle at top left, rgba(167, 199, 231, 0.26), transparent 28%), radial-gradient(circle at bottom right, rgba(168, 213, 186, 0.22), transparent 24%), linear-gradient(135deg, #f8fbff 0%, #eef4fb 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        padding: "20px",
      }}
    >
      {/* --- Botón Flotante para volver a Caja/Kiosco --- */}
      <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
        <Button
          type="text"
          icon={<ScanOutlined />}
          onClick={() => navigate("/cajas/login")}
          style={{ color: token.colorPrimary, fontSize: "14px" }}
        >
          Ir a Caja / Vendedor
        </Button>
      </div>

      <Card
        className="contrast-card"
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 16,

          boxShadow: "0 20px 50px rgba(61, 82, 118, 0.12)",
          padding: "10px",
          backgroundColor: "rgba(255,255,255,0.92)",
          border: "1px solid rgba(167, 199, 231, 0.18)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          {/* Logo / Icono Principal */}
          <div
            style={{
              width: "60px",
              height: "60px",
              background: "rgba(167, 199, 231, 0.18)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px auto",
              color: token.colorPrimary,
            }}
          >
            <SafetyCertificateFilled style={{ fontSize: "32px" }} />
          </div>

          <Title
            level={3}
            style={{
              margin: 0,
              fontWeight: 700,
              color: token.colorTextHeading,
            }}
          >
            Administración
          </Title>
          <Text type="secondary">Gestión y Control del Sistema</Text>
        </div>

        <Form
          name="login_admin"
          onFinish={handleSubmit}
          onFinishFailed={onFinishFailed}
          layout="vertical"
          size="large"
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Ingresa tu correo" },
              { type: "email", message: "Formato de correo inválido" },
            ]}
          >
            <Input
              prefix={
                <UserOutlined style={{ color: token.colorTextQuaternary }} />
              }
              placeholder="Correo electrónico"
              style={{ borderRadius: "12px" }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Ingresa tu contraseña" }]}
          >
            <Input.Password
              prefix={
                <LockOutlined style={{ color: token.colorTextQuaternary }} />
              }
              placeholder="Contraseña"
              style={{ borderRadius: "12px" }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: "20px" }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              icon={!loading && <LoginOutlined />}
              style={{
                height: "48px", // Botón un poco más alto
                fontSize: "16px",
                fontWeight: 600,
                borderRadius: "999px",
                backgroundColor: token.colorPrimary,
                borderColor: token.colorPrimary,
              }}
            >
              {loading ? "Validando..." : "Ingresar al Panel"}
            </Button>
          </Form.Item>
        </Form>

        {/* Footer Discreto */}
        {/* <div
          style={{
            textAlign: "center",
            marginTop: "20px",
            borderTop: "1px solid #f0f0f0",
            paddingTop: "15px",
          }}
        >
          <Text type="secondary" style={{ fontSize: "12px" }}>
            © 2024 Tu Empresa. Acceso restringido.
          </Text>
        </div> */}
      </Card>
    </div>
  );
};

export default Login;
