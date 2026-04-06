import React, { useState, useEffect, useRef } from "react";
import { Layout, Menu } from "antd";
import { useNavigate } from "react-router-dom";
const { Sider } = Layout;
import {
  AreaChartOutlined,
  TagsOutlined,
  ProductOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  HomeOutlined,
  UserSwitchOutlined,
  ShopOutlined,
  SettingOutlined,
  BankOutlined,
  UserAddOutlined,
  InboxOutlined,
  ReconciliationOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";

export default function Navegacion({ nombreRol, onLogout }) {
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();
  const siderRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Solo colapsar si el menú está expandido
      if (
        !collapsed &&
        siderRef.current &&
        !siderRef.current.contains(event.target)
      ) {
        setCollapsed(true);
      }
    };

    // Agregar event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [collapsed]);
  return (
    <>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={280}
        ref={siderRef}
        style={{
          background: "#ffffff",
          boxShadow: "2px 0 8px rgba(0,0,0,0.06)",
          borderRight: "1px solid #f0f0f0",
        }}
      >
        <Menu
          mode="inline"
          defaultSelectedKeys={["Inicio"]}
          defaultOpenKeys={["sub1"]}
          theme="light"
          style={{
            height: "100%",
            borderInlineEnd: 0,
            padding: "8px 0",
          }}
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
              key: "aprovicionamiento",
              icon: <AreaChartOutlined />,
              label: "Aprovicionamiento",

              children: [
                {
                  key: "Compra_Proveedores",
                  label: "Ordenes de Compra",
                  icon: <OrderedListOutlined />,
                  children: [
                    {
                      key: "compra_directa",
                      label: "Compra Directa",
                      icon: <InboxOutlined />,
                      onClick: () => navigate("/admin/gestion/compra_directa"),
                    },
                  ],
                },
                {
                  key: "recepcion_proveedores",
                  label: "Recepción de Proveedores",
                  icon: <ReconciliationOutlined />,
                  children: [
                    {
                      key: "recepcionar_compra_directa",
                      label: "Recepcionar Compra Directa",
                      icon: <InboxOutlined />,
                      onClick: () =>
                        navigate("/admin/gestion/recepcionar_compra_directa"),
                    },
                    {
                      key: "devolucion_ordenes_compra",
                      label: "Devolución Órdenes De Compra",
                      icon: <InboxOutlined />,
                      disabled: true,
                    },
                    {
                      key: "incidentes_ordenes_compra",
                      label: "Incidentes Órdenes De Compra",
                      icon: <InboxOutlined />,
                      disabled: true,
                    },
                  ],
                },
                {
                  key: "inventario",
                  label: "Inventario",
                  icon: <InboxOutlined />,
                  onClick: () => navigate("/admin/inventario"),
                },
              ],
            },
            {
              key: "conf_empresa",
              icon: <ShopOutlined />,
              label: "Configurar Empresa",
              children: [
                {
                  key: "sucursales",
                  label: "Sucursales",
                  icon: <BankOutlined />,
                  onClick: () => navigate("/admin/sucursales"),
                },
                {
                  key: "productos",
                  label: "Productos",
                  icon: <ProductOutlined />,
                  onClick: () => navigate("/admin/productos"),
                },
                {
                  key: "categorias",
                  label: "Categorías",
                  icon: <TagsOutlined />,
                  onClick: () => navigate("/admin/categorias"),
                },
                {
                  key: "proveedores",
                  label: "Proveedores",
                  icon: <InboxOutlined />,
                  onClick: () => navigate("/admin/proveedores"),
                },
                {
                  key: "colaboradores",
                  label: "Colaboradores",
                  icon: <UserSwitchOutlined />,
                  onClick: () => navigate("/admin/gestion/colaboradores"),
                },
              ],
            },
            {
              key: "Configuracion",
              icon: <SettingOutlined />,
              label: "Configuración",
              disabled: true,
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
