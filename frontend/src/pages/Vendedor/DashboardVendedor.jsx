import { Layout, theme, Typography, Image, Menu, notification } from "antd";

const { Title } = Typography;

import { Outlet } from "react-router-dom";

import { finSesion } from "../../services/Auth.services";
import { useAuth } from "../../context/AuthContext";

import NavegacionVendedor from "../../components/NavegacionVendedor";

export default function DashboardVendedor() {
  const { user, logout } = useAuth();
  const { Content, Header } = Layout;

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const cerrarSesion = async () => {
    try {
      const response = await finSesion();
      notification.success({
        message: "Éxito",
        description: response.message || "Sesión cerrada correctamente.",
        placement: "topRight",
      });
      logout();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <Layout style={{ width: "100%", height: "100vh", margin: 0, padding: 0 }}>
        <Header style={{ display: "flex", alignItems: "center" }}></Header>
        <Layout>
          <NavegacionVendedor
            nombreRol={user.nombreRol}
            onLogout={cerrarSesion}
            // onCambiarVista={cambiarVista}
            colorBgContainer={colorBgContainer}
          />
          <Content
            style={{
              margin: "24px 16px",
              padding: 24,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              overflow: "auto",
            }}
          >
            <Outlet context={{ nombreUsuario: user.nombreRol }} />
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
