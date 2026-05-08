import {
  Avatar,
  Layout,
  theme,
  Typography,
  Space,
  notification,
  Dropdown,
} from "antd";
import React from "react";

import { LogoutOutlined } from "@ant-design/icons";

import { Outlet } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

import { finSesion } from "../../services/Auth.services";

export default function DashboardCajero() {
  const { user, logout } = useAuth();
  const {
    token: { borderRadiusLG },
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
    <Layout
      style={{
        width: "100%",
        maxHeight: "100vh",
        maxWidth: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        paddingTop: "5px",
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
              Panel de Cajero
            </Text>
          </div>
        </div>

        <Space size="large" align="center">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Dropdown
              menu={{
                items: [
                  {
                    key: "logout",
                    icon: <LogoutOutlined />,
                    label: "Cerrar Sesión",
                    onClick: cerrarSesion,
                    danger: true,
                  },
                ],
              }}
            >
              <Space
                style={{
                  cursor: "default",
                  padding: "auto 16px",
                  borderRadius: "12px",
                  transition: "all 0.3s",
                  border: "1px solid #f0f0f0",
                  background: "#ffffff",
                  marginBottom: "4px",
                }}
                align="center"
              >
                <Avatar
                  style={{
                    backgroundColor: "#1890ff",
                    boxShadow: "0 2px 8px rgba(24,144,255,0.3)",
                  }}
                  size={40}
                >
                  {user?.nombreCompleto?.charAt(0) ||
                    user?.nombre?.charAt(0) ||
                    "C"}
                </Avatar>
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
                    {user?.nombreCompleto || user?.nombre || "Cajero"}
                  </Text>
                  <Text
                    type="secondary"
                    style={{ fontSize: "12px", display: "block" }}
                  >
                    {user?.nombreRol || "Caja"}
                  </Text>
                </Space>
              </Space>
            </Dropdown>
          </div>
        </Space>
      </Header>

      <Content
        style={{
          margin: "15px",
          padding: 24,
          background: "white",
          borderRadius: borderRadiusLG,
          overflow: "auto",
          backgroundColor: "#e4e4e4",
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  );
}
