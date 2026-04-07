import React, { useState } from "react";
import { Layout, Menu } from "antd";
import { useNavigate } from "react-router-dom";
const { Sider } = Layout;
import {
  AreaChartOutlined,
  ProductOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";

export default function NavegacionVendedor({ nombreRol, onLogout }) {
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();

  return (
    <>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={250}
        style={{
          background: "#ffffff",
          boxShadow: "2px 0 8px rgba(0,0,0,0.06)",
          borderRight: "1px solid #f0f0f0",
        }}
      >
        <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          defaultOpenKeys={["sub1"]}
          theme="light"
          style={{
            height: "100%",
            borderInlineEnd: 0,
            padding: "8px 0",
          }}
          items={[
            {
              key: "0",
              icon: <AreaChartOutlined />,
              label: "Inventario",

              children: [
                {
                  key: "Compra_Proveedores",
                  icon: <ShoppingCartOutlined />,
                  label: "Compra a Proveedores",
                  onClick: () => navigate("compra"),
                },
                {
                  key: "Inventario_Productos",
                  icon: <ProductOutlined />,
                  label: "Inventario de Productos",
                  onClick: () => navigate("inventario"),
                },
              ],
            },
            {
              key: "1",
              icon: <UserOutlined />,
              label: `${nombreRol}`,
              children: [
                {
                  key: "Perfil",
                  label: "Perfil",
                  disabled: true,
                },
                {
                  key: "Cerrar_Sesion",
                  label: "Cerrar Sesión",
                  onClick: () => onLogout(),
                },
              ],
            },
          ]}
        />
      </Sider>
    </>
  );
}
