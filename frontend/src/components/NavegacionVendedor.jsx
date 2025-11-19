import React, { useState } from "react";
import { Layout, Menu } from "antd";
import { useNavigate } from "react-router-dom";
const { Sider } = Layout;
import {
  AreaChartOutlined,
  ProductOutlined,
  UserOutlined,
} from "@ant-design/icons";

export default function NavegacionVendedor({
  nombreRol,
  onLogout,
  colorBgContainer,
}) {
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();

  return (
    <>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={200}
        style={{ background: colorBgContainer }}
      >
        <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          defaultOpenKeys={["sub1"]}
          style={{ height: "100%", borderInlineEnd: 0 }}
          items={[
            {
              key: "0",
              icon: <AreaChartOutlined />,
              label: "Inventario",

              children: [
                {
                  key: "Compra_Proveedores",
                  label: "Compra a Proveedores",
                  onClick: () => navigate("compra"),
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
