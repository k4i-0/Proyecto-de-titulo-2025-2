import { useState, useRef, useMemo, useEffect } from "react";

import {
  Layout,
  Button,
  Avatar,
  Space,
  Typography,
  Menu,
  Dropdown,
  Row,
  Form,
  Col,
  Input,
  InputNumber,
  notification,
  Card,
  Table,
  Divider,
  Select,
  Spin,
  Tag,
  Modal,
  Descriptions,
} from "antd";

import {
  UserOutlined,
  ShoppingCartOutlined,
  FileSearchOutlined,
  LogoutOutlined,
  DeleteOutlined,
  PlusOutlined,
  BuildFilled,
  EyeOutlined,
} from "@ant-design/icons";

import DataTable from "../../components/Tabla";

import { useAuth } from "../../context/AuthContext";

import {
  buscarProductoVenta,
  ventaPendientePago,
  consultarVentaPendiente,
} from "../../services/ventas/ventas.service";

import { buscarTodosProductos } from "../../services/functions/Productos";

const { Header, Content } = Layout;

export default function MenuVendedorCaja() {
  const { user, logout } = useAuth();
  const inputRef = useRef(null);

  //State
  const [verRealizarVenta, setVerRealizarVenta] = useState(false);
  const [verConsultarVentas, setVerConsultarVentas] = useState(false);
  const [productos, setProductos] = useState([]);
  const [listadoProductos, setListadoProductos] = useState([]);
  const [listaVentasPendientes, setListaVentasPendientes] = useState([]);
  const [cargando, setCargando] = useState(false);

  const [modalDetalleVentaVisible, setModalDetalleVentaVisible] =
    useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  const [formProductos] = Form.useForm();

  const esCelular = window.innerWidth <= 768;

  useEffect(() => {
    setCargando(true);
    buscarTodosProductos(setListadoProductos).finally(() => setCargando(false));
  }, []);

  const cerrarSesion = () => {
    logout();
  };
  const funcionaVerRealizarVenta = () => {
    setVerRealizarVenta(true);
    setVerConsultarVentas(false);
  };

  const funcionaVerConsultarVentas = () => {
    funcionConsultarVentaPendiente();
    setVerRealizarVenta(false);
    setVerConsultarVentas(true);
  };

  //funciones realizar pre venta
  const total = useMemo(
    () =>
      productos.reduce(
        (acumulado, producto) => acumulado + producto.subtotal,
        0,
      ),
    [productos],
  );

  const totalDescuentos = useMemo(
    () =>
      productos.reduce(
        (acumulado, producto) => acumulado + (producto.descuento || 0),
        0,
      ),
    [productos],
  );

  const filasParaTabla = productos.reduce((acumulador, prod) => {
    acumulador.push({
      ...prod,
      key: `prod-${prod.idProducto}`,
      esFilaDescuento: false,
      subtotalVisual: prod.precio * prod.cantidad,
    });

    if (prod.descuentosAplicados && prod.descuentosAplicados.length > 0) {
      prod.descuentosAplicados.forEach((desc, index) => {
        acumulador.push({
          ...prod,
          key: `desc-${prod.idProducto}-${index}`,
          esFilaDescuento: true,
          // Sobrescribimos lo visual para la fila de descuento:
          codigo: "",
          nombre: `↳ Descuento ${desc.origen} (${desc.detalle})`,
          cantidad: "",
          precio: "",
          subtotalVisual: -desc.montoDescontado,
        });
      });
    }

    return acumulador;
  }, []);

  const agregarProductoCodigo = async () => {
    setCargando(true);
    let codigo;
    if (formProductos.getFieldValue("codigoSelect")) {
      codigo = formProductos.getFieldValue("codigoSelect");
    } else if (formProductos.getFieldValue("codigo")) {
      codigo = formProductos.getFieldValue("codigo");
    } else {
      notification.warning({
        message: "Ingrese un código o seleccione un producto",
      });
      return;
    }

    try {
      const respuesta = await buscarProductoVenta(codigo);
      //console.log("Respuesta al buscar producto para venta:", respuesta.data);
      if (respuesta.status === 200) {
        const producto = respuesta.data;
        const nuevaCantidad =
          Number(formProductos.getFieldValue("cantidad")) || 1;

        setProductos((listaActual) => {
          const indiceExistente = listaActual.findIndex(
            (p) => p.idProducto === producto.id,
          );

          if (indiceExistente >= 0) {
            const productoExistente = listaActual[indiceExistente];
            const cantidadTotal = productoExistente.cantidad + nuevaCantidad;
            const descuentoTotalLinea =
              (producto.montoDescuento || 0) * cantidadTotal;

            const detalleDescuentosMultiplicados = (
              producto.descuentosAplicados || []
            ).map((desc) => ({
              ...desc,
              montoDescontado: desc.montoDescontado * cantidadTotal,
            }));

            const listaActualizada = [...listaActual];
            listaActualizada[indiceExistente] = {
              ...productoExistente,
              cantidad: cantidadTotal,
              descuento: descuentoTotalLinea,
              descuentosAplicados: detalleDescuentosMultiplicados,
              subtotal:
                producto.precioVenta * cantidadTotal - descuentoTotalLinea,
            };

            return listaActualizada;
          } else {
            const descuentoTotalLinea =
              (producto.montoDescuento || 0) * nuevaCantidad;

            const detalleDescuentosMultiplicados = (
              producto.descuentosAplicados || []
            ).map((desc) => ({
              ...desc,
              montoDescontado: desc.montoDescontado * nuevaCantidad,
            }));

            const nuevoProducto = {
              idProducto: producto.id,
              codigo: producto.codigo,
              nombre: producto.nombre,
              precio: producto.precioVenta,
              cantidad: nuevaCantidad,
              descuento: descuentoTotalLinea,
              descuentosAplicados: detalleDescuentosMultiplicados,
              subtotal:
                Number(producto.precioVenta) * Number(nuevaCantidad) -
                Number(descuentoTotalLinea),
            };

            return [...listaActual, nuevoProducto];
          }
        });

        notification.success({
          message: "Producto registrado",
          description: `Se procesó ${producto.nombre} (+${nuevaCantidad})`,
        });
      } else {
        notification.error({
          message: "Error",
          description: "Producto no encontrado",
        });
      }
    } catch (error) {
      console.error("Error al agregar producto por código:", error);
      notification.error({
        message: "Error",
        description: "No se pudo agregar el producto",
      });
    } finally {
      formProductos.resetFields();
      setCargando(false);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus({ cursor: "end" });
        }
      }, 10);
    }
  };

  const eliminarProducto = (idProducto) => {
    setCargando(true);
    setProductos((listaActual) =>
      listaActual.filter((producto) => producto.idProducto !== idProducto),
    );
    setCargando(false);
  };

  const funcionaEnviarACaja = async () => {
    setCargando(true);
    try {
      if (productos.length === 0) {
        notification.warning({
          message: "No hay productos",
          description: "Agrega al menos un producto para enviar a caja",
        });
        return;
      }
      const datos = {
        productosVendidos: filasParaTabla

          .filter((fila) => !fila.esFilaDescuento)

          .map((fila) => ({
            idProducto: fila.idProducto,
            codigo: fila.codigo,
            nombre: fila.nombre,
            precio: fila.precio,
            cantidad: fila.cantidad,

            montoDescuento: fila.descuento || 0,

            descuentosAplicados: fila.descuentosAplicados,

            subtotal: fila.subtotal,
          })),
        totalVenta: total,
        totalDescuentos: totalDescuentos,
      };
      console.log("Datos que se enviarán a caja:", datos);
      const respuesta = await ventaPendientePago(datos);
      console.log("Respuesta al enviar venta pendiente a caja:", respuesta);
      if (respuesta.status === 200) {
        notification.success({
          message: respuesta.data.message || "Venta enviada a caja",
          description: `ID de Venta: ${respuesta.data.idVenta}`,
          duration: 0,
          placement: "top",
        });
        setProductos([]);

        return;
      } else {
        notification.error({
          message: "Error",
          description: "No se pudo enviar la venta a caja",
        });
      }
    } catch (error) {
      console.error("Error al enviar a caja:", error);
      notification.error({
        message: "Error",
        description: "No se pudo enviar la venta a caja",
      });
    } finally {
      setCargando(false);
    }
  };

  //funciones ver consultar ventas
  const columnasVentasPendientes = [
    {
      title: "N° Venta",

      dataIndex: "idVentaVendedor",
      key: "idVentaVendedor",
      width: 100,
      render: (id) => <Typography.Text strong>#{id}</Typography.Text>,
    },
    {
      title: "Fecha",

      dataIndex: "fechaHoraEmision",
      key: "fechaHoraEmision",
      width: 160,
      render: (fechaISO) => {
        if (!fechaISO) return "-";
        const fecha = new Date(fechaISO);
        return fecha.toLocaleString("es-CL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      title: "Vendedor",
      key: "vendedor",

      render: (_, record) => {
        return record.funcionario?.nombre || `ID: ${record.idFuncionario}`;
      },
    },
    {
      title: "Artículos",

      dataIndex: "detalleVentaVendedors",
      key: "articulos",
      align: "center",
      width: 100,
      render: (detalleArray) => {
        if (!detalleArray || !Array.isArray(detalleArray)) return "0 un.";
        const productosReales = detalleArray.filter(
          (item) => item.descripcion && !item.descripcion.includes("Descuento"),
        );
        return `${productosReales.length} un.`;
      },
    },
    {
      title: "Total",

      dataIndex: "total",
      key: "total",
      align: "right",
      width: 130,
      render: (total) => {
        // 🛡️ Como tu JSON trae "total": null, lo convertimos a 0 de forma segura
        const valorSeguro = Number(total) || 0;
        const esNegativo = valorSeguro < 0;

        return (
          <Typography.Text
            strong
            type={esNegativo ? "danger" : undefined}
            style={{ color: !esNegativo ? "#1890ff" : undefined }}
          >
            {esNegativo ? "-" : ""}$
            {Math.abs(valorSeguro).toLocaleString("es-CL")}
          </Typography.Text>
        );
      },
    },
    {
      title: "Estado",

      dataIndex: "estadoVentaVendedor",
      key: "estadoVentaVendedor",
      align: "center",
      width: 120,
      render: (estado) => {
        let color = "default";
        if (estado === "Pendiente") color = "warning";
        if (estado === "Pagado" || estado === "Completada") color = "success";
        // Agregué Cancelada por si acaso, basándome en tu modelo de BD
        if (estado === "Anulada" || estado === "Cancelada") color = "error";

        return <Tag color={color}>{estado}</Tag>;
      },
    },
    {
      title: "Acciones",
      key: "acciones",
      align: "center",
      width: 90,

      render: (_, record) => (
        <Button
          type="primary"
          shape="circle"
          icon={<EyeOutlined />}
          onClick={() => abrirModalDetalleVenta(record)}
          title="Ver Detalle"
        />
      ),
    },
  ];
  const funcionConsultarVentaPendiente = async () => {
    try {
      const respuesta = await consultarVentaPendiente();
      console.log("Respuesta al consultar venta pendiente:", respuesta);
      if (respuesta.status === 200) {
        notification.info({
          message: "Venta Pendiente Encontrada",

          duration: 2,
          placement: "top",
        });
        setListaVentasPendientes(respuesta.data);
        return;
      }
      if (respuesta.status === 204) {
        notification.info({
          message: "No hay ventas pendientes",
          description: "No hay ventas pendientes para consultar",
          duration: 0,
          placement: "top",
        });
        setListaVentasPendientes([]);
        return;
      } else {
        notification.error({
          message: "Error",
          description: "No se pudo consultar la venta pendiente",
        });
      }
    } catch (error) {
      console.error("Error al consultar venta pendiente:", error);
      notification.error({
        message: "Error",
        description: "No se pudo consultar la venta pendiente",
      });
    }
  };

  //funciones modal detalle venta pendiente
  const abrirModalDetalleVenta = (venta) => {
    setVentaSeleccionada(venta);
    setModalDetalleVentaVisible(true);
  };
  const cerrarModalDetalleVenta = () => {
    setVentaSeleccionada(null);
    setModalDetalleVentaVisible(false);
  };

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      <Spin
        spinning={cargando}
        tip="Cargando..."
        size="large"
        style={{ zIndex: 9999 }}
        fullscreen
      />
      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          padding: esCelular ? "0 12px" : "0 24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Typography.Title
            level={esCelular ? 5 : 4}
            style={{ margin: 0, color: "#1890ff" }}
          >
            {esCelular ? "Caja" : "Caja - Vendedor"}
          </Typography.Title>
        </div>

        <Space size={esCelular ? "small" : "large"}>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            size={esCelular ? "middle" : "large"}
            shape={esCelular ? "circle" : "default"}
            onClick={funcionaVerRealizarVenta}
            title="Realizar Solicitud Venta" // Agrega un tooltip nativo
          >
            {!esCelular && "Realizar Venta"}
          </Button>
          <Button
            type="default"
            icon={<FileSearchOutlined />}
            size={esCelular ? "middle" : "large"}
            shape={esCelular ? "circle" : "default"}
            onClick={funcionaVerConsultarVentas}
            title="Consultar Ventas"
          >
            {!esCelular && "Consultar Solicitudes De Ventas"}
          </Button>
        </Space>

        <Dropdown
          menu={{
            items: [
              {
                key: "logout",
                label: "Cerrar Sesión",
                icon: <LogoutOutlined />,
                danger: true,
                onClick: cerrarSesion,
              },
            ],
          }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Space align="center" size="small" style={{ cursor: "pointer" }}>
            {!esCelular && (
              <Typography.Text strong>
                {user?.nombre || "Vendedor"} {user?.apellido || ""}
              </Typography.Text>
            )}
            <Avatar
              size={esCelular ? "default" : "large"}
              style={{ backgroundColor: "#1890ff" }}
              icon={<UserOutlined />}
            />
          </Space>
        </Dropdown>
      </Header>

      {/* CONTENIDO PRINCIPAL */}
      <Content
        style={{
          padding: esCelular ? "12px" : "24px",
          margin: "0 auto",
          maxWidth: 1200,
          width: "100%",
        }}
      >
        {verRealizarVenta && (
          <Card
            title="Realizar Venta"
            style={{
              marginBottom: "24px",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
            extra={
              <Button
                type="primary"
                icon={<BuildFilled />}
                disabled={productos.length === 0}
                onClick={funcionaEnviarACaja}
              >
                Enviar a Caja
              </Button>
            }
          >
            <Form
              form={formProductos}
              layout="vertical"
              onFinish={agregarProductoCodigo}
              initialValues={{ cantidad: 1 }}
              style={{ marginBottom: 16 }}
            >
              {/* wrap={false} mantiene todo en 1 línea. overflowX permite deslizar en móviles si es necesario */}
              <Row
                gutter={8}
                align="bottom"
                wrap={false}
                style={{ overflowX: "auto", paddingBottom: 2 }}
              >
                <Col flex="80px">
                  <Form.Item
                    label="Cant."
                    name="cantidad"
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      size="large"
                      min={1}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>

                <Col flex="1 1 35%" style={{ minWidth: 140 }}>
                  <Form.Item
                    label="Código rápido"
                    name="codigo"
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      size="large"
                      placeholder="Ej: 780123..."
                      allowClear
                    />
                  </Form.Item>
                </Col>

                <Col flex="1 1 45%" style={{ minWidth: 200 }}>
                  <Form.Item
                    label="Buscar en lista"
                    name="codigoSelect"
                    style={{ marginBottom: 0 }}
                  >
                    <Select
                      showSearch
                      size="large"
                      placeholder="Nombre o código..."
                      allowClear
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={listadoProductos.map((producto) => ({
                        value: producto.codigo,
                        label: `${producto.codigo} - ${producto.nombre}`,
                      }))}
                    />
                  </Form.Item>
                </Col>

                {/* 4. BOTÓN */}
                <Col flex="100px">
                  <Form.Item label=" " style={{ marginBottom: 0 }}>
                    <Button type="primary" htmlType="submit" size="large" block>
                      Agregar
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            <Table
              dataSource={filasParaTabla}
              size="middle"
              pagination={false}
              scroll={{ y: 300, x: "max-content" }}
              locale={{ emptyText: "Sin productos agregados" }}
              rowKey="key"
              columns={[
                {
                  title: "Código",
                  dataIndex: "codigo",
                  key: "codigo",
                  width: 100, // Ajuste de anchos para optimizar espacio
                },
                {
                  title: "Producto",
                  dataIndex: "nombre",
                  key: "nombre",
                  render: (nombre, record) => (
                    <Typography.Text
                      strong={!record.esFilaDescuento}
                      type={record.esFilaDescuento ? "danger" : undefined}
                      italic={record.esFilaDescuento}
                    >
                      {nombre}
                    </Typography.Text>
                  ),
                },
                {
                  title: "Cant.",
                  dataIndex: "cantidad",
                  key: "cantidad",
                  width: 70,
                  align: "center",
                },
                {
                  title: "Precio",
                  dataIndex: "precio",
                  key: "precio",
                  width: 90,
                  align: "right",
                  render: (valor, record) =>
                    record.esFilaDescuento || !valor
                      ? ""
                      : `$${Number(valor).toLocaleString("es-CL")}`,
                },
                {
                  title: "Subtotal",
                  key: "subtotal",
                  width: 100,
                  align: "right",
                  render: (_, record) => {
                    const valor = record.subtotalVisual;
                    const esNegativo = valor < 0;
                    return (
                      <Typography.Text type={esNegativo ? "danger" : undefined}>
                        {esNegativo ? "-" : ""}$
                        {Math.abs(valor).toLocaleString("es-CL")}
                      </Typography.Text>
                    );
                  },
                },
                {
                  title: "",
                  key: "acciones",
                  width: 50,
                  align: "center",
                  // fixed: 'right', // 💡 OPCIONAL: Descomenta esto si quieres que el basurero siempre esté visible al hacer scroll
                  render: (_, registro) => {
                    if (registro.esFilaDescuento) return null;
                    return (
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          eliminarProducto(registro.idProducto);
                        }}
                      />
                    );
                  },
                },
              ]}
            />
            <Card
              size="small"
              style={{
                borderRadius: 14,
                background: "#f8fafc",
                borderLeft: "4px solid #1890ff",
                borderTop: "none",
              }}
            >
              <Row
                justify="space-between"
                align="middle"
                wrap={false}
                style={{ overflowX: "auto" }}
              >
                <Space
                  split={
                    <Divider
                      type="vertical"
                      style={{ borderColor: "#cbd5e1" }}
                    />
                  }
                  style={{ whiteSpace: "nowrap" }}
                >
                  <span style={{ fontSize: 14, color: "#64748b" }}>
                    Productos:{" "}
                    <strong style={{ color: "#0f172a" }}>
                      {productos.length}
                    </strong>
                  </span>

                  {totalDescuentos > 0 && (
                    <span style={{ fontSize: 14, color: "#64748b" }}>
                      Descuentos:{" "}
                      <strong style={{ color: "#52c41a" }}>
                        -${Number(totalDescuentos).toLocaleString("es-CL")}
                      </strong>
                    </span>
                  )}
                </Space>

                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#0f172a",
                    marginLeft: 16,
                    whiteSpace: "nowrap",
                  }}
                >
                  Total:{" "}
                  <span style={{ color: "#1890ff" }}>
                    ${Number(total).toLocaleString("es-CL")}
                  </span>
                </span>
              </Row>
            </Card>
          </Card>
        )}
        {verConsultarVentas && (
          <>
            <DataTable
              title="Ventas Pendientes"
              data={listaVentasPendientes}
              columns={columnasVentasPendientes}
              searchableFields={["idVentaVendedor"]}
              description="Consulta las ventas pendientes realizadas desde tu dispositivo. Haz clic en el ícono de ojo para ver más detalles."
              searchPlaceholder="Buscar por N° de Venta..."
              rowKey="idVentaCliente"
              filterConfig={[
                {
                  key: "estadoVentaVendedor",
                  placeholder: "Estado",
                  options: [
                    { value: "Pendiente", label: "Pendiente" },
                    { value: "Cancelada", label: "Cancelada" },
                    { value: "Completada", label: "Completada" },
                  ],
                },
              ]}
              locale={{ emptyText: "No hay ventas pendientes para mostrar" }}
            />
          </>
        )}
      </Content>
      {/**Modal Detalle venta pendiente */}
      <Modal
        title={`Detalle de Venta #${ventaSeleccionada?.idVentaVendedor || ""}`}
        open={modalDetalleVentaVisible}
        onCancel={cerrarModalDetalleVenta}
        footer={[
          <Button key="cerrar" onClick={cerrarModalDetalleVenta}>
            Cerrar
          </Button>,
        ]}
        width={700}
      >
        {ventaSeleccionada && (
          <>
            <Descriptions
              bordered
              size="small"
              column={{ xs: 1, sm: 2 }} // Mantenemos el diseño responsivo
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="N° de Venta">
                <Typography.Text strong>
                  #{ventaSeleccionada.idVentaVendedor}
                </Typography.Text>
              </Descriptions.Item>

              <Descriptions.Item label="Fecha">
                {ventaSeleccionada.fechaHoraEmision
                  ? new Date(ventaSeleccionada.fechaHoraEmision).toLocaleString(
                      "es-CL",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )
                  : "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Vendedor">
                {/* Usamos directamente la relación funcionario si existe, sino mostramos su ID */}
                {ventaSeleccionada.funcionario?.nombre ||
                  `ID Funcionario: ${ventaSeleccionada.idFuncionario}`}
              </Descriptions.Item>

              <Descriptions.Item label="Estado">
                <Tag
                  color={
                    ventaSeleccionada.estadoVentaVendedor === "Pendiente"
                      ? "warning"
                      : ventaSeleccionada.estadoVentaVendedor === "Cancelada"
                        ? "error"
                        : "success"
                  }
                >
                  {ventaSeleccionada.estadoVentaVendedor}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Total Venta" span={2}>
                <Typography.Text
                  strong
                  style={{ color: "#1890ff", fontSize: "16px" }}
                >
                  {/* Si total viene nulo, mostramos 0 por seguridad */}$
                  {Number(ventaSeleccionada.total || 0).toLocaleString("es-CL")}
                </Typography.Text>
              </Descriptions.Item>
            </Descriptions>

            {/* 2. LISTA DE PRODUCTOS (Table) */}
            <Typography.Title level={5} style={{ marginBottom: 16 }}>
              Artículos de la Venta
            </Typography.Title>

            <Table
              // 🚀 Actualizado al nuevo array que envía Sequelize
              dataSource={ventaSeleccionada.detalleVentaVendedors || []}
              // 🚀 Actualizado a la nueva Primary Key de tu tabla de detalles
              rowKey="idDetalleVentaVendedor"
              pagination={false}
              size="small"
              scroll={{ x: 400 }}
              locale={{ emptyText: "Sin artículos registrados" }}
              columns={[
                {
                  title: "Descripción",
                  dataIndex: "descripcion",
                  key: "descripcion",
                  render: (texto) => {
                    if (!texto) return "-";
                    return (
                      <Typography.Text italic={texto.includes("Descuento")}>
                        {texto.replace(" (Pendiente)", "")}
                      </Typography.Text>
                    );
                  },
                },
                {
                  title: "Cant.",
                  dataIndex: "cantidad",
                  key: "cantidad",
                  align: "center",
                  width: 80,
                  render: (cant) => Number(cant) || "",
                },
                {
                  title: "Subtotal",
                  dataIndex: "subtotal",
                  key: "subtotal",
                  align: "right",
                  width: 110,
                  render: (valor) => {
                    const num = Number(valor) || 0;
                    return (
                      <Typography.Text type={num < 0 ? "danger" : undefined}>
                        {num < 0 ? "-" : ""}$
                        {Math.abs(num).toLocaleString("es-CL")}
                      </Typography.Text>
                    );
                  },
                },
              ]}
            />
          </>
        )}
      </Modal>
    </Layout>
  );
}
