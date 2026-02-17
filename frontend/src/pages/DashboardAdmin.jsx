import { useAuth } from "../context/AuthContext";
import { Outlet, useNavigate } from "react-router-dom";
import Navegacion from "../components/Navegacion";
import { finSesion } from "../services/Auth.services";
import {
  Layout,
  theme,
  Typography,
  Button,
  Badge,
  Avatar,
  Space,
  Dropdown,
} from "antd";
import {
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
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
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Mi Perfil",
      onClick: () => navigate("/admin/perfil"),
      disabled: true,
    },

    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Cerrar Sesión",
      onClick: cerrarSesion,
      danger: true,
    },
  ];

  return (
    <>
      <Layout
        style={{
          width: "100%",
          maxHeight: "100vh",
          maxWidth: "100vw",
          height: "100vh",
          margin: 0,
          padding: 0,
          background: "#fff",
        }}
      >
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
            background: "linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            zIndex: 10,
            height: "72px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <Button
              type="text"
              icon={
                <HomeOutlined style={{ fontSize: "22px", color: "#1890ff" }} />
              }
              onClick={() => navigate("/admin")}
              style={{
                display: "flex",
                alignItems: "center",
                height: "48px",
                width: "48px",
                borderRadius: "12px",
              }}
              className="hover-lift"
            />
            <div>
              <Title
                level={3}
                style={{
                  margin: 0,
                  color: "#1890ff",
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                }}
              >
                Sistema de Gestión
              </Title>
              <Text
                type="secondary"
                style={{ fontSize: "13px", display: "block", marginTop: "2px" }}
              >
                Panel de Administración
              </Text>
            </div>
          </div>

          <Space size="large" align="center">
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* Información del usuario */}
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
              >
                <Space
                  style={{
                    cursor: "pointer",
                    padding: "8px 16px",
                    borderRadius: "12px",
                    transition: "all 0.3s",
                    border: "1px solid #f0f0f0",
                    background: "#ffffff",
                  }}
                  className="user-menu-trigger"
                  align="center"
                >
                  <Avatar
                    icon={<UserOutlined />}
                    style={{
                      backgroundColor: "#1890ff",
                      boxShadow: "0 2px 8px rgba(24,144,255,0.3)",
                    }}
                    size={40}
                  />
                  <Space
                    direction="vertical"
                    size={0}
                    style={{ lineHeight: 1.2 }}
                  >
                    <Text
                      strong
                      style={{
                        color: "#000",
                        fontSize: "14px",
                        display: "block",
                      }}
                    >
                      {user.nombreCompleto || user.nombre || "Usuario"}
                    </Text>
                    <Text
                      type="secondary"
                      style={{ fontSize: "12px", display: "block" }}
                    >
                      {user.nombreRol}
                    </Text>
                  </Space>
                </Space>
              </Dropdown>
            </div>
          </Space>
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
              // minHeight: 280,
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
