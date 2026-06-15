import React, { useState, useEffect, useRef } from "react";
import { Layout, Menu, theme } from "antd";
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

export default function Navegacion({
  nombreRol,
  onLogout,
  collapsed: collapsedProp,
  setCollapsed: setCollapsedProp,
}) {
  const [collapsedLocal, setCollapsedLocal] = useState(true);
  const navigate = useNavigate();
  const siderRef = useRef(null);
  const {
    token: { colorBgContainer, colorBorderSecondary },
  } = theme.useToken();
  const isControlled =
    typeof collapsedProp === "boolean" &&
    typeof setCollapsedProp === "function";
  const collapsed = isControlled ? collapsedProp : collapsedLocal;
  const setCollapsed = isControlled ? setCollapsedProp : setCollapsedLocal;

  const handleNavigate = (path) => {
    if (path) navigate(path);
    setCollapsed(true);
  };
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
  }, [collapsed, setCollapsed]);
  return (
    <>
      <Sider
        className="contrast-surface"
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        collapsedWidth={80}
        width={350}
        // ref={siderRef}
        style={{
          background: colorBgContainer,
          border: `1px solid ${colorBorderSecondary}`,
          boxShadow: "2px 0 18px rgba(61, 82, 118, 0.06)",
          borderRight: `1px solid ${colorBorderSecondary}`,
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
            border: `1px solid ${colorBorderSecondary}`,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(247,249,255,0.96) 100%)",
          }}
          items={[
            {
              key: "Inicio",
              icon: <HomeOutlined />,
              label: "Inicio",
              onClick: () => handleNavigate("/admin"),
            },
            {
              key: "Ventas",
              icon: <AreaChartOutlined />,
              label: "Ventas",
              children: [
                {
                  key: "gestion_descuentos",
                  label: "Gestionar Descuentos",
                  onClick: () => handleNavigate("/admin/descuentos"),
                },
                {
                  key: "gestion_cajas",
                  label: "Gestionar Cajas",
                  onClick: () => handleNavigate("/admin/gestion/cajas"),
                },
                {
                  key: "clientes",
                  label: "Clientes",
                  onClick: () => handleNavigate("/admin/clientes"),
                },
              ],
            },
            {
              key: "Inventario",
              icon: <AreaChartOutlined />,
              label: "Inventario",

              children: [
                {
                  key: "inventario_general",
                  label: "Inventario General",
                  icon: <InboxOutlined />,
                  onClick: () => handleNavigate("/admin/inventario"),
                },
                {
                  key: "Ordendes_Compra",
                  label: "Ordenes de Compra",
                  icon: <OrderedListOutlined />,
                  children: [
                    {
                      key: "compra_sucursal",
                      label: "Solicitud de Compra Sucursal",
                      icon: <InboxOutlined />,
                      onClick: () =>
                        handleNavigate("/admin/gestion/solicitudes_compra"),
                    },
                    {
                      key: "compra_directa",
                      label: "Compra Directa",
                      icon: <InboxOutlined />,
                      onClick: () =>
                        handleNavigate("/admin/gestion/compra_directa"),
                    },
                    {
                      key: "ingreso_manual",
                      label: "Ingreso Manual",
                      icon: <InboxOutlined />,
                      onClick: () =>
                        handleNavigate(
                          "/admin/gestion/ingreso_manual_inventario",
                        ),
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
                      label: "Recepcionar Ordenes De Compra",
                      icon: <InboxOutlined />,
                      onClick: () =>
                        handleNavigate(
                          "/admin/gestion/recepcionar_orden_compra",
                        ),
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
                  onClick: () => handleNavigate("/admin/sucursales"),
                },
                {
                  key: "productos",
                  label: "Productos",
                  icon: <ProductOutlined />,
                  onClick: () => handleNavigate("/admin/productos"),
                },
                {
                  key: "categorias",
                  label: "Categorías",
                  icon: <TagsOutlined />,
                  onClick: () => handleNavigate("/admin/categorias"),
                },
                {
                  key: "proveedores",
                  label: "Proveedores",
                  icon: <InboxOutlined />,
                  onClick: () => handleNavigate("/admin/proveedores"),
                },
                {
                  key: "colaboradores",
                  label: "Colaboradores",
                  icon: <UserSwitchOutlined />,

                  children: [
                    {
                      key: "Gestion_Colaboradores",
                      label: "Gestionar Colaboradores",
                      icon: <UsergroupAddOutlined />,
                      onClick: () => navigate("/admin/gestion/colaboradores"),
                    },
                    {
                      key: "Registro_Actividades",
                      label: "Registro Actividades Funcionarios",
                      icon: <UserAddOutlined />,
                      onClick: () => navigate("/admin/bitacoras"),
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
