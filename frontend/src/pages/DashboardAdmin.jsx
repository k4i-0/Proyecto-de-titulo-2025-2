import { useAuth } from "../context/AuthContext";
// import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navegacion from "../components/Navegacion";
// import Home from "../components/Home";
import { finSesion } from "../services/Auth.services";

import { Layout, theme, Typography, Image, Menu } from "antd";

const { Title } = Typography;

function Dashboard() {
  const { user, logout } = useAuth();
  // const [vistaActual, setVistaActual] = useState("home");
  const { Content, Header } = Layout;

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const cerrarSesion = async () => {
    try {
      const response = await finSesion();
      console.log(response);
      logout();
    } catch (error) {
      console.log(error);
    }
  };

  // const cambiarVista = (nuevaVista) => {
  // setVistaActual(nuevaVista);
  // };
  return (
    <>
      <Layout style={{ width: "100%", height: "100vh", margin: 0, padding: 0 }}>
        {/* <Header style={{ display: "flex", alignItems: "center" }}>
          <Button
            type="link"
            onClick={() => navigate("/")}
            style={{ color: "white", padding: 0 }}
          >
            <Title level={4} style={{ color: "white", margin: 0 }}>
              Panel de Administración
            </Title>
          </Button>
        </Header> */}
        <Header style={{ display: "flex", alignItems: "center" }}>
          <div className="demo-logo" />
          {/* <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={["2"]}
            items={[
              {
                key: "1",
                label: "Inicio",
                onClick: () => navigate("/"),
              },
              {
                key: "2",
                label: "Proveedores",
              },
              {
                key: "3",
                label: "Inventario",
              },
            ]}
            style={{ flex: 1, minWidth: 0, marginLeft: 200 }}
          /> */}
        </Header>

        <Layout>
          <Navegacion
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

export default Dashboard;
