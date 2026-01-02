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
            padding: "0 24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            zIndex: 10,
            backgroundColor: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Button
              type="text"
              icon={
                <HomeOutlined style={{ fontSize: "20px", color: "#000" }} />
              }
              onClick={() => navigate("/admin")}
              style={{
                display: "flex",
                alignItems: "center",
                color: "white",
              }}
            />
            <Title
              level={4}
              style={{
                margin: 0,
                color: "#000",
                fontWeight: 600,
              }}
            >
              Sistema de Gestión
            </Title>
          </div>

          <Space size="middle" align="center">
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
                    padding: "8px 12px",
                    borderRadius: "8px",
                    transition: "background-color 0.3s",
                    height: "40px",
                  }}
                  className="user-menu-trigger"
                  align="center"
                >
                  <Space
                    direction="vertical"
                    size={0}
                    style={{ lineHeight: 1 }}
                  >
                    <Text
                      strong
                      style={{
                        color: "#000",
                        fontSize: "14px",
                        display: "block",
                      }}
                    >
                      {user.nombreCompleto || user.nombre || "Usuario"} -{" "}
                      {user.nombreRol}
                    </Text>
                  </Space>
                  <Avatar
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#1890ff" }}
                    size={32}
                  />
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
