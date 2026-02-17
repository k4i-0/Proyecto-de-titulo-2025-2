import {
  Layout,
  theme,
  Typography,
  Menu,
  notification,
  Space,
  Avatar,
  Dropdown,
  Button,
} from "antd";

const { Title, Text } = Typography;

import { Outlet, useNavigate } from "react-router-dom";

import { finSesion } from "../../services/Auth.services";
import { useAuth } from "../../context/AuthContext";

import NavegacionVendedor from "../../components/NavegacionVendedor";
import {
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
} from "@ant-design/icons";

export default function DashboardVendedor() {
  const { user, logout } = useAuth();
  const { Content, Header } = Layout;
  const navigate = useNavigate();

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

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Mi Perfil",
      onClick: () => navigate("/vendedor/perfil"),
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
                <HomeOutlined style={{ fontSize: "22px", color: "#52c41a" }} />
              }
              onClick={() => navigate("/vendedor")}
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
                  color: "#52c41a",
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
                Panel de Vendedor
              </Text>
            </div>
          </div>

          <Space size="large" align="center">
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
                      backgroundColor: "#52c41a",
                      boxShadow: "0 2px 8px rgba(82,196,26,0.3)",
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
          <NavegacionVendedor
            nombreRol={user.nombreRol}
            onLogout={cerrarSesion}
            colorBgContainer={colorBgContainer}
          />
          <Content
            style={{
              marginLeft: "15px",
              marginRight: "15px",
              padding: 24,
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
