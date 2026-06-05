// import React, { useEffect, useRef, useState } from "react";
// import {
//   Row,
//   Col,
//   Card,
//   Typography,
//   Form,
//   Input,
//   notification,
//   Button,
//   Tag,
//   theme,
// } from "antd";
// import {
//   ScanOutlined,
//   LoadingOutlined,
//   SafetyCertificateOutlined,
// } from "@ant-design/icons";

// import { inicioSesionCodigo } from "../../services/Auth.services.js";
// import { useAuth } from "../../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// const pulseAnimation = `
//   @keyframes pulse-blue {
//     0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.7); }
//     70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(24, 144, 255, 0); }
//     100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(24, 144, 255, 0); }
//   }
// `;

// const { Title, Text } = Typography;

// export default function LoginCodigo() {
//   const [form] = Form.useForm();

//   const [loading, setLoading] = useState(false);

//   const { login, isAuthenticated } = useAuth();
//   const navigate = useNavigate();

//   // 1. Referencia para controlar el input
//   const inputRef = useRef(null);

//   const { token } = theme.useToken();

//   const mantenerFoco = () => {
//     setTimeout(() => {
//       inputRef.current?.focus();
//     }, 10);
//   };

//   useEffect(() => {
//     mantenerFoco();
//     if (isAuthenticated) {
//       navigate("/cajas");
//     }
//     const handleClickAnywhere = () => mantenerFoco();
//     document.addEventListener("click", handleClickAnywhere);

//     return () => {
//       document.removeEventListener("click", handleClickAnywhere);
//     };
//   }, [isAuthenticated, navigate]);

//   const handleScan = async () => {
//     try {
//       const codigo = form.getFieldValue("codigo");
//       if (!codigo || codigo.trim() === "") return;

//       setLoading(true);

//       const respuesta = await inicioSesionCodigo(codigo);
//       console.log("Respuesta del servidor:", respuesta.data);
//       if (respuesta.status === 200) {
//         console.log("Respuesta del servidor:", respuesta);
//         notification.success({
//           message: "Inicio de sesión exitoso",
//           description: `Bienvenido, ${respuesta.data.datos.nombre}`,
//           duration: 2,
//         });
//         await login(respuesta.data.datos);
//         navigate("/");
//       } else {
//         notification.error({
//           message: "Error en inicio de sesión",
//           description: respuesta.data.message || "No se pudo iniciar sesión",
//         });
//       }
//     } catch (error) {
//       console.log("Error al enviar el código:", error);
//       notification.error({
//         message: "Error de lectura",
//         description:
//           error.error.message ||
//           error.message ||
//           "No se pudo validar la credencial.",
//       });

//       form.resetFields();
//     } finally {
//       setLoading(false);
//       mantenerFoco();
//     }
//   };

//   return (
//     // <div style={{ margin: 0, backgroundColor: "#8a919b" }}>
//     //   <Row justify="end" style={{ padding: 16 }}>
//     //     <Button type="primary" onClick={() => navigate("/login")}>
//     //       Inicio Administrador
//     //     </Button>
//     //   </Row>
//     //   <Row
//     //     justify="center"
//     //     align="middle"
//     //     style={{
//     //       minHeight: "100vh",
//     //     }}
//     //   >
//     //     <Col
//     //       span={6}
//     //       style={{
//     //         textAlign: "center",
//     //         padding: 24,
//     //         borderRadius: 8,
//     //       }}
//     //     >
//     //       <Card
//     //         style={{ justifyItems: "center", padding: 24 }}
//     //         onClick={mantenerFoco}
//     //       >
//     //         <div style={{ marginBottom: 20 }}>
//     //           {loading ? (
//     //             <LoadingOutlined
//     //               style={{ fontSize: "48px", color: "#1890ff" }}
//     //             />
//     //           ) : (
//     //             <ScanOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
//     //           )}
//     //           <Title level={4} style={{ marginTop: 10 }}>
//     //             {loading ? "Verificando..." : "Escanea tu Credencial"}
//     //           </Title>
//     //         </div>

//     //         <Form form={form} layout="vertical">
//     //           <Form.Item name="codigo" style={{ margin: 0 }}>
//     //             <Input
//     //               ref={inputRef}
//     //               autoFocus
//     //               autoComplete="off"
//     //               onPressEnter={handleScan}
//     //               style={{
//     //                 opacity: 0,
//     //                 position: "absolute",
//     //                 zIndex: -1,
//     //                 height: 1,
//     //                 width: 1,
//     //               }}
//     //             />
//     //           </Form.Item>
//     //         </Form>

//     //         {/* <Input
//     //         placeholder="Esperando escáner..."
//     //         readOnly
//     //         style={{ textAlign: "center", pointerEvents: "none" }}
//     //         value={codigoLeido ? "••••••••" : ""}
//     //         /> */}
//     //       </Card>
//     //     </Col>
//     //   </Row>
//     // </div>
//     <>
//       <style>{pulseAnimation}</style>

//       <div
//         style={{
//           minHeight: "100vh",
//           background: "linear-gradient(135deg, #1c2e4a 0%, #324a6e 100%)",
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           position: "relative",
//           overflow: "hidden",
//         }}
//         onClick={mantenerFoco}
//       >
//         {/* --- Botón Administrador Flotante --- */}
//         <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
//           <Button
//             type="text"
//             icon={<SafetyCertificateOutlined />}
//             onClick={() => navigate("/login")}
//             style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}
//           >
//             Acceso Administrativo
//           </Button>
//         </div>

//         {/* --- Tarjeta Principal --- */}
//         <Card
//           style={{
//             width: "100%",
//             maxWidth: 420,
//             borderRadius: 16,
//             boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
//             textAlign: "center",
//             padding: "20px 10px",
//             backgroundColor: "rgba(255, 255, 255, 0.98)",
//           }}
//         >
//           {/* Indicador de Estado */}
//           <div style={{ marginBottom: 30 }}>
//             <Tag
//               color={loading ? "processing" : "success"}
//               style={{ border: "none", padding: "4px 12px" }}
//             >
//               {loading ? "PROCESANDO..." : "• SISTEMA LISTO"}
//             </Tag>
//           </div>

//           {/* Icono Animado */}
//           <div
//             style={{
//               width: 100,
//               height: 100,
//               background: loading ? "#f0f5ff" : "#e6f7ff",
//               borderRadius: "50%",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               margin: "0 auto 24px auto",

//               animation: loading ? "none" : "pulse-blue 2s infinite",
//               transition: "all 0.3s ease",
//             }}
//           >
//             {loading ? (
//               <LoadingOutlined
//                 style={{ fontSize: "48px", color: token.colorPrimary }}
//               />
//             ) : (
//               <ScanOutlined
//                 style={{ fontSize: "48px", color: token.colorPrimary }}
//               />
//             )}
//           </div>

//           <Title level={3} style={{ marginBottom: 8, color: "#1f1f1f" }}>
//             {loading ? "Validando Credencial" : "Escanea tu Código"}
//           </Title>

//           <Text
//             type="secondary"
//             style={{ fontSize: "15px", display: "block", marginBottom: 30 }}
//           >
//             {loading
//               ? "Por favor espera un momento..."
//               : "Acerca tu tarjeta o código al lector para ingresar"}
//           </Text>

//           {/* Input Invisible (Lógica de Foco) */}
//           <Form form={form}>
//             <Form.Item name="codigo" style={{ margin: 0 }}>
//               <Input
//                 ref={inputRef}
//                 autoFocus
//                 autoComplete="off"
//                 onBlur={mantenerFoco}
//                 onPressEnter={handleScan}
//                 style={{
//                   opacity: 0,
//                   position: "absolute",
//                   top: 0,
//                   left: 0,
//                   height: 1,
//                   width: 1,
//                   zIndex: -1,
//                 }}
//               />
//             </Form.Item>
//           </Form>

//           {/* Decoración Visual Inferior
//           <div
//             style={{
//               borderTop: "1px solid #f0f0f0",
//               paddingTop: 15,
//               marginTop: 10,
//             }}
//           >
//             <Text type="secondary" style={{ fontSize: "12px" }}>
//               Sistema de Control de Acceso v1.0
//             </Text>
//           </div> */}
//         </Card>
//       </div>
//     </>
//   );
// }
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
  Tabs, // 👈 Nuevo import
} from "antd";
import {
  ScanOutlined,
  LoadingOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";

// 💡 Recuerda importar tu servicio manual (ejemplo: inicioSesionManual)
import {
  inicioSesionCodigo,
  inicioSesionCajaAlternativo,
} from "../../services/Auth.services.js";
import { useAuth } from "../../context/AuthContext";
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
  const [formEscaner] = Form.useForm();
  const [formManual] = Form.useForm();

  const [loading, setLoading] = useState(false);
  // 🚀 Estado para saber en qué pestaña estamos
  const [modoIngreso, setModoIngreso] = useState("escaner");

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const inputRef = useRef(null);
  const { token } = theme.useToken();

  const mantenerFoco = () => {
    // Solo forzamos el foco si estamos en la pestaña del escáner
    if (modoIngreso === "escaner") {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  };

  const salirModoCaja = () => {
    localStorage.removeItem("modoCaja");
    navigate("/login");
  };

  useEffect(() => {
    localStorage.setItem("modoCaja", "true");

    if (isAuthenticated) {
      navigate("/cajas");
    }

    if (modoIngreso === "escaner") {
      mantenerFoco();
      const handleClickAnywhere = () => mantenerFoco();
      document.addEventListener("click", handleClickAnywhere);

      return () => {
        document.removeEventListener("click", handleClickAnywhere);
      };
    }
  }, [isAuthenticated, navigate, modoIngreso]); // 👈 Reacciona al cambio de modo

  // --- LÓGICA DE ESCÁNER ---
  const handleScan = async () => {
    try {
      const codigo = formEscaner.getFieldValue("codigo");
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
      notification.error({
        message: "Error de lectura",
        description:
          error.response?.data?.message || "No se pudo validar la credencial.",
      });
      formEscaner.resetFields();
    } finally {
      setLoading(false);
      mantenerFoco();
    }
  };

  // --- LÓGICA DE INGRESO MANUAL ---
  const handleManualLogin = async (valores) => {
    try {
      setLoading(true);

      const respuesta = await inicioSesionCajaAlternativo(
        valores.rut,
        valores.passwordCajaAlternativo,
      );
      console.log("Respuesta del servidor en login manual:", respuesta);
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

      // Simulación temporal
      // if (respuesta.status === 200) { ... login() ... navigate() }
    } catch (error) {
      console.log("Error en login manual:", error);
      notification.error({
        message: "Error de autenticación",
        description: "Credenciales inválidas.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
        // Movemos el clic general al contenedor principal para no bloquear las tarjetas
        onClick={() => modoIngreso === "escaner" && mantenerFoco()}
      >
        <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
          <Button
            type="text"
            icon={<SafetyCertificateOutlined />}
            onClick={salirModoCaja}
            style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}
          >
            Acceso Administrativo
          </Button>
        </div>

        <Card
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 16,
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
            padding: "10px 10px 20px 10px",
            backgroundColor: "rgba(255, 255, 255, 0.98)",
          }}
        >
          {/* Indicador de Estado */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <Tag
              color={loading ? "processing" : "success"}
              style={{ border: "none", padding: "4px 12px" }}
            >
              {loading ? "PROCESANDO..." : "• SISTEMA LISTO"}
            </Tag>
          </div>

          <Tabs
            centered
            activeKey={modoIngreso}
            onChange={(key) => {
              setModoIngreso(key);
              if (key === "escaner") {
                setTimeout(() => inputRef.current?.focus(), 100);
              }
            }}
            items={[
              {
                key: "escaner",
                label: "Escanear Credencial",
                children: (
                  <div style={{ textAlign: "center", marginTop: 20 }}>
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
                          style={{
                            fontSize: "48px",
                            color: token.colorPrimary,
                          }}
                        />
                      ) : (
                        <ScanOutlined
                          style={{
                            fontSize: "48px",
                            color: token.colorPrimary,
                          }}
                        />
                      )}
                    </div>

                    <Title
                      level={3}
                      style={{ marginBottom: 8, color: "#1f1f1f" }}
                    >
                      {loading ? "Validando Credencial" : "Escanea tu Código"}
                    </Title>

                    <Text
                      type="secondary"
                      style={{
                        fontSize: "15px",
                        display: "block",
                        marginBottom: 10,
                      }}
                    >
                      {loading
                        ? "Por favor espera un momento..."
                        : "Acerca tu tarjeta o código al lector para ingresar"}
                    </Text>

                    <Form form={formEscaner}>
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
                  </div>
                ),
              },
              {
                key: "manual",
                label: "Ingreso Manual",
                children: (
                  <div style={{ padding: "10px 10px 0 10px" }}>
                    <Title
                      level={4}
                      style={{ textAlign: "center", marginBottom: 24 }}
                    >
                      Ingresa tus datos
                    </Title>
                    <Form
                      form={formManual}
                      layout="vertical"
                      onFinish={handleManualLogin}
                      requiredMark={false}
                    >
                      <Form.Item
                        name="rut"
                        rules={[
                          {
                            required: true,
                            message: "Por favor ingresa tu usuario o RUT",
                          },
                        ]}
                      >
                        <Input
                          size="large"
                          prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
                          placeholder="12345678-9"
                        />
                      </Form.Item>

                      <Form.Item
                        name="passwordCajaAlternativo"
                        rules={[
                          {
                            required: true,
                            message: "Por favor ingresa tu contraseña",
                          },
                        ]}
                      >
                        <Input.Password
                          size="large"
                          prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                          placeholder="Contraseña"
                        />
                      </Form.Item>

                      <Form.Item style={{ marginTop: 10, marginBottom: 0 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          size="large"
                          block
                          loading={loading}
                        >
                          Ingresar
                        </Button>
                      </Form.Item>
                    </Form>
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </>
  );
}
