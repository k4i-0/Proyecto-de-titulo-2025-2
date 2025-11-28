import { useAuth } from "../context/AuthContext";
import { Outlet, useNavigate } from "react-router-dom";
import Navegacion from "../components/Navegacion";
import { finSesion } from "../services/Auth.services";
import { Layout, theme, Typography, Button, Badge, Avatar } from "antd";
import { BellOutlined, UserOutlined } from "@ant-design/icons";
import { HomeOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  return (
    <>
      <Layout
        style={{
          width: "100%",
          maxWidth: "auto",
          maxHeight: "auto",
          height: "100vh",
          margin: 0,
          padding: 0,
        }}
      >
        <Header style={{ display: "flex", alignItems: "center" }}>
          {/* Logo y título del sistema */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Button
              type="link"
              onClick={() => navigate("/admin")}
              style={{
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div>
                <HomeOutlined style={{ fontSize: "24px", color: "white" }} />
              </div>
            </Button>
          </div>
        </Header>

        <Layout>
          <Navegacion
            nombreRol={user.nombreRol}
            onLogout={cerrarSesion}
            colorBgContainer={colorBgContainer}
          />
          <Content
            style={{
              marginLeft: "15px",
              marginRight: "15px",
              padding: 24,
              minHeight: 280,
              background: "white",
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
