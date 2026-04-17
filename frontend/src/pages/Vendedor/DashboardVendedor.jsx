import {
  Layout,
  theme,
  Typography,
  notification,
  Space,
  Avatar,
  Dropdown,
  Button,
} from "antd";

const { Title, Text } = Typography;

import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { finSesion } from "../../services/Auth.services";
import { useAuth } from "../../context/AuthContext";

import NavegacionVendedor from "../../components/NavegacionVendedor";
import VendedorPageHeader from "../../components/VendedorPageHeader";
import {
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  ProductOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

export default function DashboardVendedor() {
  const { user, logout } = useAuth();
  const { Content, Header } = Layout;
  const navigate = useNavigate();
  const location = useLocation();

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

  const pageHeaderConfig = (() => {
    if (location.pathname.includes("/vendedor/compra")) {
      return {
        title: "Compra a Proveedores",
        description: "Gestiona ordenes de compra de tu sucursal",
        icon: (
          <ShoppingCartOutlined style={{ fontSize: 28, color: "#52c41a" }} />
        ),
        extra: (
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/vendedor")}
          >
            Volver al inicio
          </Button>
        ),
      };
    }

    if (location.pathname.includes("/vendedor/inventario")) {
      return {
        title: "Inventario de Productos",
        description: "Consulta el stock y detalle de productos por sucursal",
        icon: <ProductOutlined style={{ fontSize: 28, color: "#52c41a" }} />,
        extra: (
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/vendedor")}
          >
            Volver al inicio
          </Button>
        ),
      };
    }

    return {
      title: "Dashboard de Vendedor",
      description: `Resumen operativo de ${user.nombre || "vendedor"}`,
      icon: <DashboardOutlined style={{ fontSize: 28, color: "#52c41a" }} />,
      extra: null,
    };
  })();

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
                    padding: "auto 16px",
                    borderRadius: "12px",
                    transition: "all 0.3s",
                    border: "1px solid #f0f0f0",
                    background: "#ffffff",
                    marginBottom: "4px",
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
          />
          <Content
            style={{
              margin: "15px",

              padding: 24,
              background: "white",
              borderRadius: borderRadiusLG,
              overflow: "auto",
            }}
          >
            {/* <VendedorPageHeader
              title={pageHeaderConfig.title}
              description={pageHeaderConfig.description}
              icon={pageHeaderConfig.icon}
              extra={pageHeaderConfig.extra}
            /> */}
            <Outlet context={{ nombreUsuario: user.nombreRol }} />
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
