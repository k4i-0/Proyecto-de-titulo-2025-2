import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Space,
  Tag,
  Card,
  Row,
  Col,
  InputNumber,
  notification,
  Popconfirm,
  Empty,
  Spin,
  Typography,
  Modal,
  Form,
  Select,
  Divider,
  Alert,
  Descriptions,
} from "antd";

import {
  ShoppingCartOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

import {
  getAllProveedores,
  getAllProveedoresVendedor,
} from "../../services/inventario/Proveedor.service";

import obtenerProductos from "../../services/inventario/Productos.service";

import { obtenerQuienSoy } from "../../services/usuario/funcionario.service";

import obtenerSucursales from "../../services/inventario/Sucursal.service";

import DataTable from "../../components/Tabla";
import ModalNuevaOrdenCompra from "../../components/ModalNuevaOrdenCompra";

import {
  obtenerOrdenesCompraVendedor,
  crearOrdenCompraVendedor,
} from "../../services/inventario/CompraProveedor.service";

import { useNavigate } from "react-router-dom";

const AprovicionamientoProveedor = () => {
  const navigation = useNavigate();
  // const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [miDatos, setMiDatos] = useState(null);
  const [ordenesCompra, setOrdenesCompra] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState(null);
  const [
    productosSeleccionadosOrdenCompra,
    setProductosSeleccionadosOrdenCompra,
  ] = useState([]);

  const [modalDetalle, setModalDetalle] = useState({
    visible: false,
    compraProveedor: null,
  });

  const [visibleCompraNueva, setVisibleCompraNueva] = useState(false);
  const [drawerSelectProductoOrdenCompra, setDrawerSelectProductoOrdenCompra] =
    useState(false);
  const [loading, setLoading] = useState(false);

  //Formulario
  const [formOrdenCompra] = Form.useForm();
  const [formSeleccionarProducto] = Form.useForm();

  //Funciones de Api

  const buscarMiDatos = async () => {
    try {
      setLoading(true);
      const respuesta = await obtenerQuienSoy();
      //console.log("QuienSoy ", respuesta);
      if (respuesta.status === 200) {
        setMiDatos(respuesta.data || {});
        formOrdenCompra.setFieldsValue({
          idFuncionario: respuesta.data?.idFuncionario,
          idSucursal: respuesta.data?.idSucursal,
        });
        setLoading(false);
        return;
      }
      if (respuesta.status === 204) {
        notification.info({
          message: "No hay datos disponibles",
          duration: 3.5,
        });
        setMiDatos(null);
        setLoading(false);
        return;
      }
      notification.error({
        message: respuesta.error || "Error al obtener los datos",
        duration: 3.5,
      });
    } catch (error) {
      notification.error({
        message: "Error al obtener los datos",
        duration: 3.5,
      });
      console.error("Error al obtener los datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const buscarSucursales = async () => {
    try {
      const respuesta = await obtenerSucursales();
      if (respuesta.status === 200) {
        setSucursales(Array.isArray(respuesta.data) ? respuesta.data : []);
        return;
      }
    } catch (error) {
      notification.error({
        message: "Error al obtener las sucursales",
        duration: 3.5,
      });
      console.error("Error al obtener las sucursales:", error);
    }
  };

  const buscarOrdenesCompraProveedores = async () => {
    try {
      setLoading(true);
      const respuesta = await obtenerOrdenesCompraVendedor();
      //console.log("Respuesta del ordenes de compra a proveedores:",respuesta.data);
      if (respuesta.status === 200) {
        notification.success({
          message: "Ordenes de compra a proveedores obtenidas con éxito",
          duration: 3.5,
        });
        setOrdenesCompra(respuesta.data);
        setLoading(false);
        return;
      }
      if (respuesta.status === 204) {
        notification.info({
          message: "No existe ordenes de compra a proveedores",
          duration: 3.5,
        });
        setOrdenesCompra([]);
        setLoading(false);
        return;
      }
      notification.error({
        message:
          respuesta.error ||
          "Error al obtener las ordenes de compra a proveedores",
        duration: 3.5,
      });
    } catch (error) {
      notification.error({
        message: "Error al obtener las ordenes de compra a proveedores",
        duration: 3.5,
      });
      console.error(
        "Error al obtener las ordenes de compra a proveedores:",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  const obtenerProveedores = async () => {
    try {
      setLoading(true);
      const respuesta = await getAllProveedores();
      // console.log("Respuesta del inventario:", respuesta.data);
      if (respuesta.status === 200) {
        setProveedores(Array.isArray(respuesta.data) ? respuesta.data : []);
        setLoading(false);
        return;
      }
      if (respuesta.status === 204) {
        notification.info({
          message: "No existe productos en el inventario",
          duration: 3.5,
        });
        setProveedores([]);
        setLoading(false);
        return;
      }
      notification.error({
        message: respuesta.error || "Error al obtener el inventario",
        duration: 3.5,
      });
    } catch (error) {
      notification.error({
        message: "Error al obtener el inventario",
        duration: 3.5,
      });
      console.error("Error al obtener el inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  const buscarVenedoresPorProveedor = async (rutProveedor) => {
    try {
      setLoading(true);

      const respuesta = await getAllProveedoresVendedor(rutProveedor);

      if (respuesta.status === 200) {
        const vendedoresEncontrados = Array.isArray(respuesta.data)
          ? respuesta.data
          : [];
        const vendedorInicial = vendedoresEncontrados[0] || null;
        setVendedorSeleccionado(vendedorInicial);
        formOrdenCompra.setFieldsValue({
          idVendedorProveedor: vendedorInicial?.idVendedorProveedor,
          vendedorAsociado: vendedorInicial?.nombre,
        });
        setLoading(false);
        return;
      }
      if (respuesta.status === 204) {
        notification.info({
          message: "No existe productos en el inventario",
          duration: 3.5,
        });
        setVendedorSeleccionado(null);
        formOrdenCompra.setFieldsValue({
          idVendedorProveedor: undefined,
          vendedorAsociado: undefined,
        });
        setLoading(false);
        // return;
      }
      notification.error({
        message: respuesta.error || "Error al obtener el inventario",
        duration: 3.5,
      });
    } catch (error) {
      notification.error({
        message: "Error al obtener el inventario",
        duration: 3.5,
      });
      console.error("Error al obtener el inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  const buscarProductos = async () => {
    try {
      setLoading(true);

      const respuesta = await obtenerProductos();
      // console.log("Respuesta del productos:", respuesta.data);
      if (respuesta.status === 200) {
        setProductos(Array.isArray(respuesta.data) ? respuesta.data : []);
        setLoading(false);
        return;
      }
      if (respuesta.status === 204) {
        notification.info({
          message: "No existe productos en el inventario",
          duration: 3.5,
        });
        setProductos([]);
        setLoading(false);
        // return;
      }
      notification.error({
        message: respuesta.error || "Error al obtener los productos",
        duration: 3.5,
      });
    } catch (error) {
      notification.error({
        message: "Error al obtener los productos",
        duration: 3.5,
      });
      console.error("Error al obtener los productos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarOrdenesCompraProveedores();
  }, []);

  const totalOrdenCompra = productosSeleccionadosOrdenCompra.reduce(
    (acumulado, producto) =>
      acumulado +
      (producto.cantidadProducto || 0) * (producto.valorUnitarioProducto || 0),
    0,
  );

  const ordenesCompraTabla = ordenesCompra.map((orden) => ({
    ...orden,
    proveedorNombre: orden.creaOrdenCompra?.proveedor?.nombre || "—",
    sucursalNombre: orden.creaOrdenCompra?.sucursal?.nombre || "—",
    vendedorNombre: orden.creaOrdenCompra?.vendedor?.nombre || "—",
  }));

  const handleCerrarCompraNueva = () => {
    formOrdenCompra.resetFields();
    formSeleccionarProducto.resetFields();
    setProductosSeleccionadosOrdenCompra([]);
    setProveedorSeleccionado(null);
    setVendedorSeleccionado(null);
    setVisibleCompraNueva(false);
  };

  const handleAbrirCompraNueva = async () => {
    await buscarSucursales();
    await buscarProductos();
    await buscarMiDatos();
    await obtenerProveedores();
    setVisibleCompraNueva(true);
  };

  const seleccionProveedor = async (idProveedorSeleccionado) => {
    const proveedorSeleccionado = proveedores.find(
      (p) => p.idProveedor === idProveedorSeleccionado,
    );
    if (proveedorSeleccionado) {
      setProveedorSeleccionado(proveedorSeleccionado);
      formOrdenCompra.setFieldsValue({
        rutProveedor: proveedorSeleccionado.rut,
        nombreProveedor: proveedorSeleccionado.nombre,
      });
      await buscarVenedoresPorProveedor(proveedorSeleccionado.rut);
    } else {
      setProveedorSeleccionado(null);
      setVendedorSeleccionado(null);
      formOrdenCompra.setFieldsValue({
        rutProveedor: undefined,
        nombreProveedor: undefined,
        idVendedorProveedor: undefined,
        vendedorAsociado: undefined,
      });
      console.warn(
        "Proveedor no encontrado para el ID:",
        idProveedorSeleccionado,
      );
    }
  };

  const handleAgregarProductoOrdenCompra = async () => {
    //await buscarProductos();
    setDrawerSelectProductoOrdenCompra(true);
  };
  const eliminarProductoOrdenCompra = (key) => {
    setProductosSeleccionadosOrdenCompra(
      productosSeleccionadosOrdenCompra.filter((item) => item.key !== key),
    );
    notification.success({ message: "Producto eliminado de la orden" });
  };

  const editarProductoOrdenCompra = (key, campo, valor) => {
    const valorNormalizado = Number(valor || 0);

    if (campo === "cantidadProducto" && valorNormalizado < 1) return;
    if (campo === "valorUnitarioProducto" && valorNormalizado < 1) return;

    setProductosSeleccionadosOrdenCompra((prevProductos) =>
      prevProductos.map((item) => {
        if (item.key !== key) return item;

        const actualizado = { ...item, [campo]: valorNormalizado };
        return {
          ...actualizado,
          total:
            (actualizado.cantidadProducto || 0) *
            (actualizado.valorUnitarioProducto || 0),
        };
      }),
    );
  };

  const AgregarProductoOrdenCompra = (values) => {
    console.log("Valores del formulario producto agregado:", values);
    const productoExiste = productosSeleccionadosOrdenCompra.some(
      (item) => item.productoSeleccionado === values.productoSeleccionado,
    );

    if (productoExiste) {
      notification.warning({
        message: "Este producto ya está en la orden de compra",
      });
      return;
    }
    setProductosSeleccionadosOrdenCompra((prevProductos) => {
      const maxKey =
        prevProductos.length > 0
          ? Math.max(...prevProductos.map((p) => p.key))
          : 0;

      const newKey = maxKey + 1;
      const productoSeleccionado = productos.find(
        (producto) => producto.idProducto === values.productoSeleccionado,
      );

      return [
        ...prevProductos,
        {
          ...values,
          nombreProducto: productoSeleccionado?.nombre,
          codigoProducto:
            productoSeleccionado?.codigoProducto ||
            productoSeleccionado?.codigo,
          cantidadProducto: values.cantidadProducto,
          valorUnitarioProducto: values.valorUnitarioProducto,
          total:
            (values.cantidadProducto || 0) *
            (values.valorUnitarioProducto || 0),
          key: newKey,
        },
      ];
    });
    formSeleccionarProducto.resetFields();
    setDrawerSelectProductoOrdenCompra(false);
  };

  const enviarOrdenCompra = async (values) => {
    try {
      const productosPayload = productosSeleccionadosOrdenCompra.map(
        (item) => ({
          idProducto: item.productoSeleccionado,
          cantidad: item.cantidadProducto,
          precioUnitario: item.valorUnitarioProducto,
        }),
      );

      const ordenCompleta = {
        rutProveedor: values?.rutProveedor,
        idSucursal: values?.idSucursal,
        observaciones: values.observaciones,
        idFuncionario: values?.idFuncionario,
        productos: productosPayload,
        total: totalOrdenCompra,
      };
      console.log("Orden de compra completa:", ordenCompleta);
      setLoading(true);
      const respuesta = await crearOrdenCompraVendedor(ordenCompleta);
      if (respuesta.status === 201) {
        notification.success({
          message: "Orden de compra creada con éxito",
          duration: 3.5,
        });
        handleCerrarCompraNueva();
        buscarOrdenesCompraProveedores();
        setLoading(false);
        return;
      }
      notification.error({
        message: respuesta.error || "Error al crear la orden de compra",
        duration: 3.5,
      });
      setLoading(false);
    } catch (error) {
      notification.error({
        message: "Error al crear la orden de compra",
        duration: 3.5,
      });
      console.error("Error al crear la orden de compra:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const columnas = [
    {
      title: "N° Orden",
      dataIndex: "nombreOrden",
      key: "nombreOrden",
      onCell: () => ({
        onClick: (e) => e.stopPropagation(),
      }),
    },
    {
      title: "Proveedor",
      dataIndex: "proveedorNombre",
      key: "proveedorNombre",
    },
    {
      title: "Sucursal",
      dataIndex: "sucursalNombre",
      key: "sucursalNombre",
    },
    {
      title: "Solicitante",
      dataIndex: "vendedorNombre",
      key: "vendedorNombre",
    },
    {
      title: "Fecha",
      dataIndex: "fechaOrden",
      key: "fechaOrden",
      render: (fecha) => new Date(fecha).toLocaleDateString("es-CL"),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado) => {
        let color = "default";
        if (estado === "pendiente de aprobacion") {
          color = "gold";
        } else if (estado === "creada") {
          color = "blue";
        } else if (estado === "aprobada") {
          color = "green";
        } else if (estado === "aceptada con modificaciones") {
          color = "orange";
        } else if (estado === "rechazada" || estado === "cancelada") {
          color = "red";
        }
        return <Tag color={color}>{estado?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      render: (tipo) => tipo || "—",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total) => `$${Number(total || 0).toLocaleString("es-CL")}`,
    },
    {
      title: "Detalle",
      dataIndex: "detalleEstado",
      key: "detalleEstado",
      render: (detalleEstado) => detalleEstado || "—",
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {/* <Button type="link" onClick={() => handleAbrirModalDetalles(record)}>
            Ver Detalles
          </Button> */}
          <Button
            disabled={record.estado !== "pendiente recibir"}
            onClick={() =>
              navigation(
                `/vendedor/despachos/${record.creaOrdenCompra.proveedor.rut}`,
              )
            }
          >
            Recepcionar
          </Button>
        </div>
      ),
    },
  ];

  const handleAbrirModalDetalles = (compraProveedor) => {
    //console.log("Detalles de la compra proveedor:", compraProveedor);
    setModalDetalle({ visible: true, compraProveedor: compraProveedor });
  };

  return (
    <>
      {/* Tabla de Ordenes de Compra */}
      <Row>
        <Col span={24} style={{ marginTop: 16 }}>
          <DataTable
            title="Ordenes de compra"
            description={`Total: ${ordenesCompra.length} ordenes de compra`}
            data={ordenesCompraTabla}
            columns={columnas}
            loading={loading}
            rowKey="idOrdenCompra"
            searchableFields={[
              "nombreOrden",
              "estado",
              "tipo",
              "observaciones",
              "detalleEstado",
              "proveedorNombre",
              "sucursalNombre",
              "vendedorNombre",
            ]}
            filterConfig={[
              {
                key: "estado",
                placeholder: "Estado",
                options: [
                  { value: "creada", label: "Creada" },
                  {
                    value: "pendiente de aprobacion",
                    label: "Pendiente de aprobación",
                  },
                  { value: "aprobada", label: "Aprobada" },
                  { value: "rechazada", label: "Rechazada" },
                  { value: "cancelada", label: "Cancelada" },
                ],
              },
              {
                key: "tipo",
                placeholder: "Tipo",
                options: [
                  { value: "compra sucursal", label: "Compra sucursal" },
                ],
              },
            ]}
            headerButtons={
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAbrirCompraNueva}
                >
                  Crear orden de compra
                </Button>
              </div>
            }
            onRowClick={handleAbrirModalDetalles}
          />
        </Col>
      </Row>
      {/* Modal Nueva Orden de Compra */}
      <ModalNuevaOrdenCompra
        visible={visibleCompraNueva}
        onCancel={handleCerrarCompraNueva}
        formOrdenCompra={formOrdenCompra}
        formSeleccionarProducto={formSeleccionarProducto}
        proveedores={proveedores}
        sucursales={sucursales}
        productos={productos}
        proveedorSeleccionado={proveedorSeleccionado}
        vendedorSeleccionado={vendedorSeleccionado}
        productosSeleccionados={productosSeleccionadosOrdenCompra}
        onSeleccionarProveedor={seleccionProveedor}
        onAgregarProducto={handleAgregarProductoOrdenCompra}
        onEliminarProducto={eliminarProductoOrdenCompra}
        onAgregarProductoOrden={AgregarProductoOrdenCompra}
        onGuardarOrden={enviarOrdenCompra}
        onEditarProducto={editarProductoOrdenCompra}
        loading={loading}
        drawerSelectProductoOpen={drawerSelectProductoOrdenCompra}
        setDrawerSelectProductoOpen={setDrawerSelectProductoOrdenCompra}
      />

      {/* Modal Detalles Orden de Compra */}
      <Modal
        title="Detalles de la Orden de Compra"
        open={modalDetalle.visible}
        onCancel={() =>
          setModalDetalle({ visible: false, compraProveedor: null })
        }
        footer={[
          <Button
            key="close"
            onClick={() =>
              setModalDetalle({ visible: false, compraProveedor: null })
            }
          >
            Cerrar
          </Button>,
        ]}
        width={800}
      >
        {modalDetalle.compraProveedor && (
          <>
            {(() => {
              const orden = modalDetalle.compraProveedor;
              const creaOrden = orden.creaOrdenCompra;
              const proveedor = creaOrden?.proveedor;
              const sucursal = creaOrden?.sucursal;
              const vendedor = creaOrden?.vendedor;
              const fechaOrden = orden.fechaOrden
                ? new Date(orden.fechaOrden)
                : null;
              const detallesOrden =
                orden.compraproveedordetalles ||
                orden.compraproveedordetalle ||
                [];
              const productosOrden = Array.isArray(detallesOrden)
                ? detallesOrden
                : [];
              const totalProductos = productosOrden.reduce((sum, record) => {
                const subtotalCalculado =
                  Number(record.subtotal || 0) ||
                  Number(record.cantidad || 0) *
                    Number(record.precioUnitario || 0);
                return sum + subtotalCalculado;
              }, 0);

              const colorEstado = () => {
                if (orden.estado === "pendiente de aprobacion") {
                  return "gold";
                }
                if (orden.estado === "creada") {
                  return "blue";
                }
                if (orden.estado === "aprobada") {
                  return "green";
                }
                if (
                  orden.estado === "rechazada" ||
                  orden.estado === "cancelada"
                ) {
                  return "red";
                }
                return "default";
              };

              return (
                <>
                  <Card
                    style={{
                      marginBottom: 16,
                      background:
                        "linear-gradient(135deg, #f8fbff 0%, #eef5ff 100%)",
                    }}
                  >
                    <Row
                      justify="space-between"
                      align="middle"
                      gutter={[16, 16]}
                    >
                      <Col>
                        <Title level={4} style={{ margin: 0 }}>
                          {orden.nombreOrden || "Orden de compra"}
                        </Title>
                        <Text type="secondary">
                          {orden.detalleEstado || "Sin detalle de estado"}
                        </Text>
                      </Col>
                      <Col>
                        <Tag color={colorEstado()} style={{ marginRight: 0 }}>
                          {orden.estado?.toUpperCase() || "SIN ESTADO"}
                        </Tag>
                      </Col>
                    </Row>
                  </Card>

                  {/* Resumen de la orden */}
                  <Descriptions
                    bordered
                    column={2}
                    size="small"
                    style={{ marginBottom: 16 }}
                  >
                    <Descriptions.Item label="N° Orden">
                      {orden.idOrdenCompra || "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Código interno">
                      {orden.nombreOrden || "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Fecha">
                      {fechaOrden
                        ? fechaOrden.toLocaleDateString("es-CL")
                        : "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Hora">
                      {fechaOrden
                        ? fechaOrden.toLocaleTimeString("es-CL", {
                            hour12: false,
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tipo">
                      {orden.tipo || "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Estado">
                      <Tag color={colorEstado()}>
                        {orden.estado?.toUpperCase() || "SIN ESTADO"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Total">
                      <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
                        ${Number(orden.total || 0).toLocaleString("es-CL")}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Detalle estado">
                      {orden.detalleEstado || "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Observaciones" span={2}>
                      {orden.observaciones || "Sin observaciones"}
                    </Descriptions.Item>
                  </Descriptions>

                  <Card
                    title="Origen de la orden"
                    size="small"
                    style={{ marginBottom: 16 }}
                  >
                    <Descriptions bordered column={2} size="small">
                      <Descriptions.Item label="Proveedor">
                        {proveedor?.nombre || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="RUT proveedor">
                        {proveedor?.rut || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Email proveedor">
                        {proveedor?.email || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Sucursal">
                        {sucursal?.nombre || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Dirección sucursal" span={2}>
                        {sucursal?.direccion || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Solicitante">
                        {vendedor?.nombre || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="RUT solicitante">
                        {vendedor?.rut || "—"}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>

                  {/* Detalles de Productos */}
                  <Divider>Productos</Divider>

                  {productosOrden.length > 0 ? (
                    <>
                      <DataTable
                        data={productosOrden}
                        rowKey="idCompraProveedorDetalle"
                        pagination={false}
                        showSearch={false}
                        showFilters={false}
                        columns={[
                          {
                            title: "Producto",
                            key: "producto",
                            render: (_, record) => (
                              <div>
                                <Text strong>
                                  {record.producto?.nombre || "—"}
                                </Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {record.producto?.marca || "Sin marca"}
                                </Text>
                              </div>
                            ),
                          },
                          {
                            title: "Descripción",
                            dataIndex: ["producto", "descripcion"],
                            key: "descripcion",
                            render: (descripcion) => descripcion || "—",
                          },
                          {
                            title: "Cantidad",
                            dataIndex: "cantidad",
                            key: "cantidad",
                            align: "center",
                          },
                          {
                            title: "Precio unitario",
                            dataIndex: "precioUnitario",
                            key: "precioUnitario",
                            align: "right",
                            render: (precio) =>
                              `$${Number(precio || 0).toLocaleString("es-CL")}`,
                          },
                          {
                            title: "Subtotal",
                            key: "subtotalCalculado",
                            align: "right",
                            render: (_, record) => {
                              const subtotalCalculado =
                                Number(record.subtotal || 0) ||
                                Number(record.cantidad || 0) *
                                  Number(record.precioUnitario || 0);
                              return (
                                <Text strong>
                                  ${subtotalCalculado.toLocaleString("es-CL")}
                                </Text>
                              );
                            },
                          },
                        ]}
                      />
                      <Card
                        size="small"
                        style={{ marginTop: 12, textAlign: "right" }}
                      >
                        <Text strong>Total productos: </Text>
                        <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
                          ${totalProductos.toLocaleString("es-CL")}
                        </Text>
                      </Card>
                    </>
                  ) : (
                    <Empty description="No hay productos asociados a esta orden" />
                  )}
                </>
              );
            })()}
          </>
        )}
      </Modal>
    </>
  );
};

export default AprovicionamientoProveedor;
