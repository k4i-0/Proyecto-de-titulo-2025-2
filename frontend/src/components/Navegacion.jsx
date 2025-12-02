//import React, { useState } from "react";
import { Layout, Menu } from "antd";
import { useNavigate } from "react-router-dom";
const { Sider } = Layout;
import {
  AreaChartOutlined,
  ProductOutlined,
  UserOutlined,
  HomeOutlined,
} from "@ant-design/icons";

export default function Navegacion({ nombreRol, onLogout, colorBgContainer }) {
  //const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  return (
    <>
      <Sider
        ///collapsible
        collapsed={false}
        //onCollapse={(value) => setCollapsed(value)}
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
              key: "Inicio",
              icon: <HomeOutlined />,
              label: "Inicio",
              onClick: () => navigate("/admin"),
            },
            {
              key: "Ventas",
              icon: <AreaChartOutlined />,
              label: "Ventas",
              disabled: true,
              children: [
                {
                  key: "gestionar_ventas",
                  label: "Gestionar Ventas",
                  onClick: () => navigate("gestionar_ventas"),
                },
                {
                  key: "clientes",
                  label: "Clientes",
                  onClick: () => navigate("clientes"),
                },
              ],
            },
            {
              key: "Inventario",
              icon: <AreaChartOutlined />,
              label: "Inventario",

              children: [
                {
                  key: "Compra_Proveedores",
                  label: "Gestionar Compras",
                  onClick: () => navigate("aprovisionamiento"),
                },
              ],
            },
            {
              key: "Configuracion",
              icon: <AreaChartOutlined />,
              label: "Configuración",
              onClick: () => navigate("sucursales"),
              // children: [
              //   {
              //     key: "productos",
              //     label: "Productos",
              //     onClick: () => navigate("productos"),
              //   },
              //   {
              //     key: "inventario",
              //     label: "Inventario",
              //     onClick: () => navigate("inventario"),
              //   },
              //   {
              //     key: "sucursal",
              //     label: "Sucursal",
              //     onClick: () => navigate("sucursal"),
              //   },
              //   {
              //     key: "proveedores",
              //     label: "Proveedores",
              //     onClick: () => navigate("proveedores"),
              //   },
              // ],
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

    //</><Navbar
    //   className="justify-content-center"
    //   style={{
    //     padding: "10px",
    //     paddingLeft: "100px",
    //     paddingRight: "100px",
    //     margin: "40px",
    //   }}
    // >
    //   <Container className="justify-content-left">
    //     <Navbar.Brand href="/dashboard" onClick={() => onCambiarVista("home")}>
    //       Negocios Rancaguinos
    //     </Navbar.Brand>
    //   </Container>

    //   <Navbar.Toggle aria-controls="basic-navbar-nav" />
    //   <Navbar.Collapse id="basic-navbar-nav">
    //     <Nav className="me-auto">
    //       <Nav.Link onClick={() => onCambiarVista("home")}>Home</Nav.Link>

    //       <NavDropdown title="Inventario" id="inventario-dropdown">
    //         <NavDropdown.Item onClick={() => onCambiarVista("productos")}>
    //           Productos
    //         </NavDropdown.Item>
    //         <NavDropdown.Item onClick={() => onCambiarVista("categorias")}>
    //           Categorías
    //         </NavDropdown.Item>
    //         <NavDropdown.Item onClick={() => onCambiarVista("inventario")}>
    //           Inventario
    //         </NavDropdown.Item>
    //         <NavDropdown.Item onClick={() => onCambiarVista("sucursal")}>
    //           Sucursal
    //         </NavDropdown.Item>
    //         <NavDropdown.Item onClick={() => onCambiarVista("bodega")}>
    //           Bodega
    //         </NavDropdown.Item>
    //       </NavDropdown>

    //       <NavDropdown title="Ventas" id="ventas-dropdown">
    //         <NavDropdown.Item disabled onClick={() => onCambiarVista("ventas")}>
    //           Gestionar Ventas
    //         </NavDropdown.Item>
    //         <NavDropdown.Item
    //           disabled
    //           onClick={() => onCambiarVista("clientes")}
    //         >
    //           Clientes
    //         </NavDropdown.Item>
    //       </NavDropdown>
    //       <NavDropdown title={nombreRol} id="basic-nav-dropdown">
    //         <NavDropdown.Item href="#action/3.1">Perfil</NavDropdown.Item>
    //         <NavDropdown.Divider />
    //         <NavDropdown.Item onClick={() => onLogout()}>
    //           Cerrar Sesión
    //         </NavDropdown.Item>
    //       </NavDropdown>
    //     </Nav>
    //   </Navbar.Collapse>
    // </Navbar>
  );
}
