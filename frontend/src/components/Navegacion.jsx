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

export default function Navegacion({ nombreRol, onLogout, colorBgContainer }) {
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
        width={380}
        ref={siderRef}
        style={{
          background: colorBgContainer,
        }}
      >
        <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          defaultOpenKeys={["sub1"]}
          theme="dark"
          style={{
            height: "100%",
            borderInlineEnd: 0,
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
                      key: "ordenes_directas",
                      label: "Órdenes De Compra Directas",
                      icon: <InboxOutlined />,
                      onClick: () => navigate("gestion/oc_directa"),
                    },
                    {
                      key: "ordenes_compra_proveedores",
                      label: "Órdenes De Compra a Proveedores",
                      icon: <InboxOutlined />,
                    },
                    {
                      key: "orden_compra_colaboradores",
                      label: "Órdenes De Compra de Colaboradores",
                      icon: <InboxOutlined />,
                      onClick: () => navigate("gestion/ordenes_compra"),
                    },
                    {
                      key: "anular_ordenes_compra",
                      label: "Anular Órdenes De Compra",
                      icon: <InboxOutlined />,
                    },

                    {
                      key: "cuestionar_ordenes_compra",
                      label: "Cuestionar Órdenes De Compra",
                      icon: <InboxOutlined />,
                    },
                    {
                      key: "historial_ordenes_compra",
                      label: "Historial de Órdenes de Compra",
                      icon: <InboxOutlined />,
                    },
                  ],
                },
                {
                  key: "recepcion_proveedores",
                  label: "Recepción de Proveedores",
                  icon: <ReconciliationOutlined />,
                  children: [
                    {
                      key: "recepcionar_ordenes_compra",
                      label: "Recepcionar Órdenes De Compra",
                      icon: <InboxOutlined />,
                    },
                    {
                      key: "devolucion_ordenes_compra",
                      label: "Devolución Órdenes De Compra",
                      icon: <InboxOutlined />,
                    },
                    {
                      key: "incidentes_ordenes_compra",
                      label: "Incidentes Órdenes De Compra",
                      icon: <InboxOutlined />,
                    },
                  ],
                },
                {
                  key: "inventario",
                  label: "Inventario",
                  icon: <InboxOutlined />,
                  onClick: () => navigate("inventario"),
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
                  onClick: () => navigate("sucursales"),
                },
                {
                  key: "productos",
                  label: "Productos",
                  icon: <ProductOutlined />,
                  onClick: () => navigate("productos"),
                },
                {
                  key: "categorias",
                  label: "Categorías",
                  icon: <TagsOutlined />,
                  onClick: () => navigate("categorias"),
                },
                {
                  key: "proveedores",
                  label: "Proveedores",
                  icon: <InboxOutlined />,
                  onClick: () => navigate("proveedores"),
                },
                {
                  key: "colaboradores",
                  label: "Colaboradores",
                  icon: <UserSwitchOutlined />,
                  children: [
                    {
                      icon: <UserAddOutlined />,
                      key: "Gestion_colaboradores",
                      label: "Gestion Colaborador",
                      onClick: () => navigate("gestion/colaboradores"),
                    },
                    {
                      icon: <UsergroupAddOutlined />,
                      key: "Contratos_colaboradores",
                      label: "Trabajadores por sucursal",
                      onClick: () => navigate("gestion/colaboradores/sucursal"),
                    },
                    {
                      key: "Roles_Permisos",
                      label: "Roles y Permisos",
                      icon: <UserOutlined />,
                      disabled: true,
                    },
                    {
                      key: "Administracion Cajas",
                      label: "Administración de Cajas",
                      icon: <InboxOutlined />,
                      disabled: true,
                    },
                  ],
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
