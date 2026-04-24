import { useCallback, useEffect, useState } from "react";

import {
  Typography,
  notification,
  Tag,
  Modal,
  Drawer,
  Button,
  Descriptions,
  InputNumber,
  Popconfirm,
  Divider,
  Card,
  Form,
  Timeline,
} from "antd";

import DataTable from "../../../components/Tabla.jsx";
import ModalNuevaOrdenCompra from "../../../components/ModalNuevaOrdenCompra.jsx";
import {
  obtenerOrdenesCompraAdmin,
  anularOrdenCompraAdmin,
  aprobarOrdenCompraAdmin,
  modificarOrdenCompraAdmin,
  eliminarOrdenCompraAdmin,
  crearOrdenCompraVendedor,
} from "../../../services/inventario/CompraProveedor.service.js";
import {
  getAllProveedores,
  getAllProveedoresVendedor,
} from "../../../services/inventario/Proveedor.service.js";
import obtenerProductos from "../../../services/inventario/Productos.service.js";
import { obtenerQuienSoy } from "../../../services/usuario/funcionario.service.js";

import obtenerSucursales from "../../../services/inventario/Sucursal.service.js";

export default function OrdenesCompra() {
  const [ordenes, setOrdenes] = useState([]);
  const [modalDetalle, setModalDetalle] = useState({
    open: false,
    orden: null,
  });
  const [drawerEdicion, setDrawerEdicion] = useState({
    open: false,
    orden: null,
    productos: [],
  });

  // Estados para modal nueva orden
  const [visibleCompraNueva, setVisibleCompraNueva] = useState(false);
  const [drawerSelectProductoOrdenCompra, setDrawerSelectProductoOrdenCompra] =
    useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState(null);
  const [
    productosSeleccionadosOrdenCompra,
    setProductosSeleccionadosOrdenCompra,
  ] = useState([]);
  const [miDatos, setMiDatos] = useState(null);
  const [loading, setLoading] = useState(false);

  // Formularios
  const [formOrdenCompra] = Form.useForm();
  const [formSeleccionarProducto] = Form.useForm();

  const ordenesTabla = ordenes.map((orden) => ({
    ...orden,
    proveedorNombre: orden.creaOrdenCompra?.proveedor?.nombre || "—",
    proveedorRut: orden.creaOrdenCompra?.proveedor?.rut || "—",
    sucursalNombre: orden.creaOrdenCompra?.sucursal?.nombre || "—",
    solicitanteNombre: orden.creaOrdenCompra?.vendedor?.nombre || "—",
    cantidadProductos: Array.isArray(orden.compraproveedordetalles)
      ? orden.compraproveedordetalles.length
      : 0,
  }));

  const normalizarEstado = (estado) =>
    String(estado || "")
      .toLowerCase()
      .trim();

  const obtenerEtiquetaEstado = (estado) => {
    if (!estado) return "Sin estado";
    return estado
      .split(" ")
      .map((palabra) =>
        palabra ? palabra.charAt(0).toUpperCase() + palabra.slice(1) : "",
      )
      .join(" ");
  };

  const obtenerTimelineEstados = (estadoActual) => {
    const estado = normalizarEstado(estadoActual);
    const estadosBase = [
      "creada",
      "pendiente de aprobacion",
      "aprobada",
      "pendiente recibir",
    ];
    const estadosTerminales = [
      "aceptada con modificaciones",
      "rechazada",
      "cancelada",
    ];

    const esTerminal = estadosTerminales.includes(estado);

    if (esTerminal) {
      const colorTerminal =
        estado === "aceptada con modificaciones" ? "orange" : "red";
      return [
        {
          color: "green",
          children: "Creada",
        },
        {
          color: "green",
          children: "Pendiente de aprobacion",
        },
        {
          color: colorTerminal,
          children: (
            <Typography.Text strong>
              {obtenerEtiquetaEstado(estado)}
            </Typography.Text>
          ),
        },
      ];
    }

    const indiceActual = estadosBase.indexOf(estado);

    return estadosBase.map((paso, index) => {
      let color = "gray";

      if (indiceActual >= 0) {
        if (index < indiceActual) color = "green";
        else if (index === indiceActual) color = "blue";
      }

      return {
        color,
        children:
          index === indiceActual ? (
            <Typography.Text strong>
              {obtenerEtiquetaEstado(paso)}
            </Typography.Text>
          ) : (
            obtenerEtiquetaEstado(paso)
          ),
      };
    });
  };

  const buscarOrdenesCompra = useCallback(async () => {
    try {
      const response = await obtenerOrdenesCompraAdmin();
      // console.log(
      //   "Respuesta al obtener ordenes de compra a proveedor para admin:",
      //   response.data,
      // );
      if (response.status === 200) {
        setOrdenes(response.data);

        notification.success({
          message: "Órdenes de compra a proveedor obtenidas exitosamente",
        });
        return;
      }
      if (response.status === 204) {
        setOrdenes([]);
        notification.info({
          message: "No se encontraron órdenes de compra a proveedor",
        });
        return;
      }
      notification.error({
        message: "Error al obtener las órdenes de compra a proveedor1",
        description: response.error || "Error desconocido",
      });
    } catch (error) {
      console.log(
        "Error al obtener las ordenes de compra a proveedor para admin:",
        error,
      );
      notification.error({
        message:
          "Error al obtener las ordenes de compra a proveedor para admin",
      });
    }
  }, []);

  const buscarSucursales = async () => {
    try {
      const respuesta = await obtenerSucursales();
      //console.log("Respuesta del inventario:", respuesta);
      if (respuesta.status === 200) {
        setSucursales(Array.isArray(respuesta.data) ? respuesta.data : []);
        return;
      }
      if (respuesta.sttus === 204) {
        setSucursales([]);
        notification.info({
          message: "No se encontraron sucursales",
        });
      }
      notification.error({
        message: respuesta.error || "Error al obtener las sucursales",
      });
    } catch (error) {
      console.log("Error al obtener las sucursales:", error);
      notification.error({
        message: "Error al obtener las sucursales",
      });
    }
  };

  const anularOrdenCompra = async (nombreOrden) => {
    try {
      const response = await anularOrdenCompraAdmin(nombreOrden);
      if (response.status === 200) {
        notification.success({
          message: "Orden de compra anulada exitosamente",
        });
        buscarOrdenesCompra();
        return;
      }
      notification.error({
        message: "Error al anular la orden de compra",
        description: response.error || "Error desconocido",
      });
    } catch (error) {
      console.log("Error al anular la orden de compra:", error);
      notification.error({
        message: "Error al anular la orden de compra",
      });
    }
  };

  const aprobarOrdenCompra = async (nombreOrden) => {
    try {
      const response = await aprobarOrdenCompraAdmin(nombreOrden);
      if (response.status === 200) {
        notification.success({
          message: "Orden de compra aprobada exitosamente",
        });
        buscarOrdenesCompra();
        return;
      }
      notification.error({
        message: "Error al aprobar la orden de compra",
        description: response.error || "Error desconocido",
      });
    } catch (error) {
      console.log("Error al aprobar la orden de compra:", error);
      notification.error({
        message: "Error al aprobar la orden de compra",
      });
    }
  };
  useEffect(() => {
    buscarOrdenesCompra();
  }, [buscarOrdenesCompra]);

  const abrirModalDetalle = (orden) => {
    setModalDetalle({ open: true, orden });
  };

  const cerrarModalDetalle = () => {
    setModalDetalle({ open: false, orden: null });
  };

  const abrirDrawerEdicion = (orden) => {
    const productosIniciales = Array.isArray(orden.compraproveedordetalles)
      ? orden.compraproveedordetalles.map((item) => ({
          ...item,
          eliminado: false,
        }))
      : [];

    setDrawerEdicion({
      open: true,
      orden,
      productos: productosIniciales,
    });
  };

  const cerrarDrawerEdicion = () => {
    setDrawerEdicion({ open: false, orden: null, productos: [] });
  };

  const actualizarProductoEdicion = (
    idCompraProveedorDetalle,
    campo,
    valor,
  ) => {
    setDrawerEdicion((prev) => ({
      ...prev,
      productos: prev.productos.map((producto) =>
        producto.idCompraProveedorDetalle === idCompraProveedorDetalle
          ? { ...producto, [campo]: valor }
          : producto,
      ),
    }));
  };

  const eliminarProductoEdicion = (idCompraProveedorDetalle) => {
    setDrawerEdicion((prev) => ({
      ...prev,
      productos: prev.productos.map((producto) =>
        producto.idCompraProveedorDetalle === idCompraProveedorDetalle
          ? { ...producto, eliminado: true }
          : producto,
      ),
    }));
  };

  const guardarCambiosProductos = async () => {
    const productosActualizados = drawerEdicion.productos.map((p) => {
      const { producto, ...resto } = p;

      return {
        ...resto,
        subtotal: Number(p.cantidad || 0) * Number(p.precioUnitario || 0),
      };
    });
    const datos = {
      observaciones: "Modificación de productos realizada por admin",
      productos: productosActualizados,
    };
    //console.log("productos luego de guardar", datos);

    try {
      const respuesta = await modificarOrdenCompraAdmin(
        drawerEdicion.orden.nombreOrden,
        datos,
      );
      if (respuesta.status === 200) {
        notification.success({
          message: "Orden de compra modificada exitosamente",
        });

        cerrarModalDetalle();
        cerrarDrawerEdicion();
        buscarOrdenesCompra();
        return;
      }
      notification.error({
        message: "Error al modificar la orden de compra",
        description: respuesta.error || "Error desconocido",
      });
    } catch (error) {
      console.error(
        "Error al guardar los cambios de productos en la orden:",
        error,
      );
      notification.error({
        message: "Error al guardar los cambios de productos en la orden",
      });
      return;
    }
  };

  const handleAprobarOrden = (orden) => {
    //console.log("Aprobar orden:", orden);
    aprobarOrdenCompra(orden);
    setModalDetalle({ open: false, orden: null });
  };

  const handleRechazarOrden = (orden) => {
    //console.log("Rechazar orden:", orden);
    anularOrdenCompra(orden);
    setModalDetalle({ open: false, orden: null });
  };

  const handleModificarOrden = (orden) => {
    //console.log("Modificar orden:", orden);
    abrirDrawerEdicion(orden);
  };

  const eliminarOrdenCompra = async (nombreOrden) => {
    try {
      const response = await eliminarOrdenCompraAdmin(nombreOrden);
      if (response.status === 200 || response.status === 204) {
        setOrdenes((prevOrdenes) =>
          prevOrdenes.filter((orden) => orden.nombreOrden !== nombreOrden),
        );

        if (modalDetalle.orden?.nombreOrden === nombreOrden) {
          cerrarModalDetalle();
        }

        if (drawerEdicion.orden?.nombreOrden === nombreOrden) {
          cerrarDrawerEdicion();
        }

        notification.success({
          message: "Orden de compra eliminada exitosamente",
        });
        return;
      }
      notification.error({
        message: "Error al eliminar la orden de compra",
        description: response.error || "Error desconocido",
      });
    } catch (error) {
      console.log("Error al eliminar la orden de compra:", error);
      notification.error({
        message: "Error al eliminar la orden de compra",
      });
    }
  };

  // Funciones para modal nueva orden
  const buscarMiDatos = async () => {
    try {
      setLoading(true);
      const respuesta = await obtenerQuienSoy();
      if (respuesta.status === 200) {
        setMiDatos(respuesta.data || {});
        formOrdenCompra.setFieldsValue({
          idFuncionario: respuesta.data?.idFuncionario,
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

  const obtenerProveedores = async () => {
    try {
      setLoading(true);
      const respuesta = await getAllProveedores();
      if (respuesta.status === 200) {
        setProveedores(Array.isArray(respuesta.data) ? respuesta.data : []);
        setLoading(false);
        return;
      }
      if (respuesta.status === 204) {
        notification.info({
          message: "No existe proveedores",
          duration: 3.5,
        });
        setProveedores([]);
        setLoading(false);
        return;
      }
      notification.error({
        message: respuesta.error || "Error al obtener los proveedores",
      });
    } catch (error) {
      notification.error({
        message: "Error al obtener los proveedores",
      });
      console.error("Error al obtener los proveedores:", error);
    } finally {
      setLoading(false);
    }
  };

  const buscarProductos = async () => {
    try {
      setLoading(true);
      const respuesta = await obtenerProductos();
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
        return;
      }
      notification.error({
        message: respuesta.error || "Error al obtener los productos",
      });
    } catch (error) {
      notification.error({
        message: "Error al obtener los productos",
      });
      console.error("Error al obtener los productos:", error);
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
          message: "No existe vendedores disponibles",
          duration: 3.5,
        });
        setVendedorSeleccionado(null);
        formOrdenCompra.setFieldsValue({
          idVendedorProveedor: undefined,
          vendedorAsociado: undefined,
        });
        setLoading(false);
        return;
      }
      notification.error({
        message: respuesta.error || "Error al obtener los vendedores",
      });
    } catch (error) {
      notification.error({
        message: "Error al obtener los vendedores",
      });
      console.error("Error al obtener los vendedores:", error);
    } finally {
      setLoading(false);
    }
  };

  const seleccionProveedor = async (idProveedorSeleccionado) => {
    const proveedorSeleccionadoData = proveedores.find(
      (p) => p.idProveedor === idProveedorSeleccionado,
    );
    if (proveedorSeleccionadoData) {
      setProveedorSeleccionado(proveedorSeleccionadoData);
      formOrdenCompra.setFieldsValue({
        rutProveedor: proveedorSeleccionadoData.rut,
        nombreProveedor: proveedorSeleccionadoData.nombre,
      });
      await buscarVenedoresPorProveedor(proveedorSeleccionadoData.rut);
    } else {
      setProveedorSeleccionado(null);
      setVendedorSeleccionado(null);
      formOrdenCompra.setFieldsValue({
        rutProveedor: undefined,
        nombreProveedor: undefined,
        idVendedorProveedor: undefined,
        vendedorAsociado: undefined,
      });
    }
  };

  const handleAgregarProductoOrdenCompra = async () => {
    await buscarProductos();
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

  const agregarProductoOrdenCompra = (values) => {
    console.log("Valores en OC ADMIN", values);
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
        rutProveedor: proveedorSeleccionado?.rut,
        idSucursal: miDatos?.idSucursal,
        observaciones: values.observaciones,
        idFuncionario: miDatos?.idFuncionario,
        productos: productosPayload,
        total: productosSeleccionadosOrdenCompra.reduce(
          (acumulado, producto) =>
            acumulado +
            (producto.cantidadProducto || 0) *
              (producto.valorUnitarioProducto || 0),
          0,
        ),
      };

      setLoading(true);
      const respuesta = await crearOrdenCompraVendedor(ordenCompleta);
      if (respuesta.status === 201) {
        notification.success({
          message: "Orden de compra creada con éxito",
          duration: 3.5,
        });
        handleCerrarCompraNueva();
        buscarOrdenesCompra();
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

  return (
    <div>
      {/* <Typography.Title level={2}>Órdenes de Compra</Typography.Title> */}
      <DataTable
        title="Órdenes de compra"
        description={`Total: ${ordenesTabla.length} órdenes`}
        data={ordenesTabla}
        columns={[
          {
            title: "N° Orden",
            dataIndex: "nombreOrden",
            key: "nombreOrden",
          },

          {
            title: "Fecha",
            dataIndex: "fechaOrden",
            key: "fechaOrden",
            render: (fecha) =>
              fecha ? new Date(fecha).toLocaleDateString("es-CL") : "—",
          },
          {
            title: "Proveedor",
            dataIndex: "proveedorNombre",
            key: "proveedorNombre",
          },
          {
            title: "RUT Proveedor",
            dataIndex: "proveedorRut",
            key: "proveedorRut",
          },
          {
            title: "Sucursal",
            dataIndex: "sucursalNombre",
            key: "sucursalNombre",
          },
          {
            title: "Solicitante",
            dataIndex: "solicitanteNombre",
            key: "solicitanteNombre",
          },
          {
            title: "Estado",
            dataIndex: "estado",
            key: "estado",
            render: (estado) => {
              let color = "default";
              if (estado === "pendiente de aprobacion") color = "gold";
              else if (estado === "creada") color = "blue";
              else if (estado === "aprobada") color = "green";
              else if (estado === "aceptada con modificaciones")
                color = "orange";
              else if (estado === "rechazada" || estado === "cancelada") {
                color = "red";
              } else if (estado === "pendiente recibir") {
                color = "purple";
              }
              return <Tag color={color}>{estado?.toUpperCase() || "—"}</Tag>;
            },
          },

          {
            title: "Total",
            dataIndex: "total",
            key: "total",
            render: (total) => `$${Number(total || 0).toLocaleString("es-CL")}`,
          },
          {
            title: "Acciones",
            key: "acciones",
            render: (_, record) => (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {/* <Button type="link" onClick={() => abrirModalDetalle(record)}>
                  Ver detalles
                </Button> */}
                <Button
                  type="primary"
                  danger
                  disabled={
                    record.estado === "aceptada con modificaciones" ||
                    record.estado === "aprobada" ||
                    record.estado === "rechazada" ||
                    record.estado === "recepcionada"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    eliminarOrdenCompra(record.nombreOrden);
                  }}
                >
                  Eliminar
                </Button>
              </div>
            ),
          },
        ]}
        rowKey="idOrdenCompra"
        searchableFields={[
          "idOrdenCompra",
          "nombreOrden",
          "estado",
          "tipo",
          "proveedorNombre",
          "proveedorRut",
          "sucursalNombre",
          "solicitanteNombre",
          "detalleEstado",
          "observaciones",
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
        ]}
        headerButtons={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button onClick={handleAbrirCompraNueva}> + Nueva Orden</Button>
            <Button type="primary" onClick={buscarOrdenesCompra}>
              Refrescar
            </Button>
          </div>
        }
        onRowClick={abrirModalDetalle}
      />
      {/**Modal Detalle */}
      <Modal
        title="Detalle de la orden de compra"
        open={modalDetalle.open}
        onCancel={cerrarModalDetalle}
        footer={[
          <Button
            key="aprobar"
            color="green"
            variant="solid"
            disabled={modalDetalle.orden?.estado !== "pendiente de aprobacion"}
            onClick={() => handleAprobarOrden(modalDetalle.orden.nombreOrden)}
          >
            Aprobar
          </Button>,
          <Button
            key="rechazar"
            color="red"
            variant="solid"
            disabled={modalDetalle.orden?.estado !== "pendiente de aprobacion"}
            onClick={() => handleRechazarOrden(modalDetalle.orden.nombreOrden)}
          >
            Rechazar
          </Button>,
          <Button
            key="modificar"
            color="orange"
            variant="solid"
            disabled={modalDetalle.orden?.estado !== "pendiente de aprobacion"}
            onClick={() => handleModificarOrden(modalDetalle.orden)}
          >
            Modificar
          </Button>,
        ]}
        width={900}
      >
        {modalDetalle.orden && (
          <>
            <Descriptions
              bordered
              column={2}
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Descriptions.Item label="N° Orden">
                {modalDetalle.orden.nombreOrden || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="ID Orden">
                {modalDetalle.orden.idOrdenCompra || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha">
                {modalDetalle.orden.fechaOrden
                  ? new Date(modalDetalle.orden.fechaOrden).toLocaleDateString(
                      "es-CL",
                    )
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                {modalDetalle.orden.estado || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Tipo">
                {modalDetalle.orden.tipo || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Total">
                ${Number(modalDetalle.orden.total || 0).toLocaleString("es-CL")}
              </Descriptions.Item>
              <Descriptions.Item label="Proveedor">
                {modalDetalle.orden.creaOrdenCompra?.proveedor?.nombre || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Sucursal">
                {modalDetalle.orden.creaOrdenCompra?.sucursal?.nombre || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Solicitante">
                {modalDetalle.orden.creaOrdenCompra?.vendedor?.nombre || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Detalle estado">
                {modalDetalle.orden.detalleEstado || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Observaciones" span={2}>
                {modalDetalle.orden.observaciones || "Sin observaciones"}
              </Descriptions.Item>
            </Descriptions>

            <Typography.Title level={5}>Productos</Typography.Title>
            {(modalDetalle.orden.compraproveedordetalles || []).length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(modalDetalle.orden.compraproveedordetalles || []).map(
                  (item) => {
                    const subtotal =
                      Number(item.subtotal || 0) ||
                      Number(item.cantidad || 0) *
                        Number(item.precioUnitario || 0);
                    return (
                      <Card
                        key={item.idCompraProveedorDetalle}
                        size="small"
                        style={{ backgroundColor: "#fafafa", borderRadius: 8 }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 8,
                          }}
                        >
                          <span style={{ fontWeight: 600, fontSize: 14 }}>
                            {item.producto?.nombre || "Producto"}
                          </span>
                          <div style={{ display: "flex", gap: 16 }}>
                            <span>
                              <Typography.Text type="secondary">
                                Cantidad:{" "}
                              </Typography.Text>
                              <Typography.Text strong>
                                {item.cantidad || 0}
                              </Typography.Text>
                            </span>
                            <span>
                              <Typography.Text type="secondary">
                                Precio:{" "}
                              </Typography.Text>
                              <Typography.Text strong>
                                $
                                {Number(
                                  item.precioUnitario || 0,
                                ).toLocaleString("es-CL")}
                              </Typography.Text>
                            </span>
                            <span>
                              <Typography.Text type="secondary">
                                Subtotal:{" "}
                              </Typography.Text>
                              <Typography.Text
                                strong
                                style={{ color: "#52c41a" }}
                              >
                                ${subtotal.toLocaleString("es-CL")}
                              </Typography.Text>
                            </span>
                          </div>
                        </div>
                      </Card>
                    );
                  },
                )}
              </div>
            ) : (
              <Typography.Text type="secondary">
                Esta orden no tiene productos asociados.
              </Typography.Text>
            )}

            <Divider style={{ margin: "18px 0 14px" }} />
            <Typography.Title level={5} style={{ marginBottom: 8 }}>
              Línea de estados
            </Typography.Title>
            <Timeline
              items={obtenerTimelineEstados(modalDetalle.orden.estado)}
              style={{ marginBottom: 0 }}
            />
          </>
        )}
      </Modal>

      {/** Drawer para editar productos de la orden */}
      <Drawer
        title={"Editar productos de la orden "}
        open={drawerEdicion.open}
        onClose={cerrarDrawerEdicion}
        width={600}
        footer={[
          <Button key="cancelar" onClick={cerrarDrawerEdicion}>
            Cancelar
          </Button>,
          <Button
            key="guardar"
            type="primary"
            onClick={guardarCambiosProductos}
          >
            Aprobar Orden Con Modificaciones
          </Button>,
        ]}
      >
        <Descriptions
          size="small"
          bordered
          column={2}
          style={{ marginBottom: 18 }}
        >
          <Descriptions.Item label="N° Orden" span={2}>
            Detalles Orden: {drawerEdicion.orden?.nombreOrden || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Fecha">
            {drawerEdicion.orden?.fechaOrden
              ? new Date(modalDetalle.orden.fechaOrden).toLocaleDateString(
                  "es-CL",
                )
              : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Vendedor">
            {drawerEdicion.orden?.creaOrdenCompra?.vendedor?.nombre || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Proveedor">
            {drawerEdicion.orden?.creaOrdenCompra?.proveedor?.nombre || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Tipo">
            {drawerEdicion.orden?.tipo || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            {drawerEdicion.orden?.estado || "—"}
          </Descriptions.Item>
        </Descriptions>
        {drawerEdicion.orden && (
          <>
            <Typography.Text type="secondary">
              Solo se pueden modificar cantidad, precio unitario y eliminar
              productos.
            </Typography.Text>
            <Divider />

            {(drawerEdicion.productos || []).length > 0 ? (
              <div style={{ display: "grid", gap: 12 }}>
                {drawerEdicion.productos.map((item) => {
                  const subtotalCalculado =
                    Number(item.cantidad || 0) *
                    Number(item.precioUnitario || 0);

                  return (
                    <div
                      key={item.idCompraProveedorDetalle}
                      style={{
                        border: "1px solid #f0f0f0",
                        borderRadius: 8,
                        padding: 16,
                        background: "#fff",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 16,
                          marginBottom: 12,
                        }}
                      >
                        <div>
                          <Typography.Text strong>
                            {item.producto?.nombre || "Producto"}
                          </Typography.Text>
                          <div>
                            <Typography.Text type="secondary">
                              {item.producto?.marca || "Sin marca"}
                            </Typography.Text>
                          </div>
                        </div>
                        <Popconfirm
                          title="¿Eliminar producto de la orden?"
                          description="Esta acción quitará el producto de la edición actual."
                          okText="Sí"
                          cancelText="No"
                          onConfirm={() =>
                            eliminarProductoEdicion(
                              item.idCompraProveedorDetalle,
                            )
                          }
                        >
                          <Button danger type="link">
                            Eliminar
                          </Button>
                        </Popconfirm>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                          gap: 12,
                        }}
                      >
                        <div>
                          <Typography.Text>Producto</Typography.Text>
                          <div>{item.producto?.nombre || "—"}</div>
                        </div>
                        <div>
                          <Typography.Text>Cantidad</Typography.Text>
                          <InputNumber
                            min={1}
                            style={{ width: "100%" }}
                            value={item.cantidad}
                            onChange={(value) =>
                              actualizarProductoEdicion(
                                item.idCompraProveedorDetalle,
                                "cantidad",
                                Number(value || 0),
                              )
                            }
                          />
                        </div>
                        <div>
                          <Typography.Text>Precio unitario</Typography.Text>
                          <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            value={item.precioUnitario}
                            onChange={(value) =>
                              actualizarProductoEdicion(
                                item.idCompraProveedorDetalle,
                                "precioUnitario",
                                Number(value || 0),
                              )
                            }
                          />
                        </div>
                      </div>

                      <div style={{ marginTop: 12, textAlign: "right" }}>
                        <Typography.Text strong>
                          Subtotal: ${subtotalCalculado.toLocaleString("es-CL")}
                        </Typography.Text>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Typography.Text type="secondary">
                No hay productos para editar en esta orden.
              </Typography.Text>
            )}
          </>
        )}
      </Drawer>

      {/* modificar orden compra */}

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
        onAgregarProductoOrden={agregarProductoOrdenCompra}
        onGuardarOrden={enviarOrdenCompra}
        onEditarProducto={editarProductoOrdenCompra}
        loading={loading}
        drawerSelectProductoOpen={drawerSelectProductoOrdenCompra}
        setDrawerSelectProductoOpen={setDrawerSelectProductoOrdenCompra}
      />
    </div>
  );
}
