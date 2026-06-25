import { useState, useEffect, useMemo } from "react";

import {
  Button,
  Descriptions,
  Divider,
  Modal,
  notification,
  Table,
  Tag,
  Typography,
  Form,
  Input,
  Tabs,
  Card,
} from "antd";

import DataTable from "../../components/Tabla";

import { useParams } from "react-router-dom";

import {
  obtenerDespachosPorOrden,
  obtenerTodosDespachos,
  obtenerDespachosPorRutProveedor,
} from "../../services/inventario/Despacho.service";

import obtenerSucursales from "../../services/inventario/Sucursal.service";
import { obtenerBodegasPorSucursal } from "../../services/inventario/Bodega.service";
import {
  buscarOrdenesCompraSucursalVendedor,
  crearOrdenCompraSucursalVendedor,
} from "../../services/inventario/CompraProveedor.service";

import ModalRecepcionDespachos from "../../components/ModalRecepcionDespachos";
import DrawerDetalleDespachos from "../../components/drawerdetalleDespachos";

export default function GestionDespachos() {
  const { nombreOrden, rutProveedor } = useParams();
  const [form] = Form.useForm();
  const [formRutProveedor] = Form.useForm();
  const [formRecepcion] = Form.useForm();
  const [despachosOc, setDespachosOc] = useState([]);
  const [todosDespachos, setTodoDespachos] = useState([]);
  const [todoDespachosRutProveedor, setTodoDespachosRutProveedor] = useState(
    [],
  );
  const [ordenes, setOrdenes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [modalDetalleAbiertoDespacho, setModalDetalleAbiertoDespacho] =
    useState(false);
  const [modalRecepcionAbierto, setModalRecepcionAbierto] = useState(false);
  const [drawerDespachos, setDrawerDespachos] = useState(false);
  const [ordenDrawer, setOrdenDrawer] = useState(null);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [ordenSeleccionadaRecepcion, setOrdenSeleccionadaRecepcion] =
    useState(null);

  const [despachoSeleccionado, setDespachoSeleccionado] = useState(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);

  const [modalLoading, setModalLoading] = useState(false);
  const idSucursalSeleccionada = Form.useWatch("idSucursal", formRecepcion);

  const buscarSucursales = async () => {
    try {
      const respuesta = await obtenerSucursales();
      if (respuesta.status === 200) {
        const sucursales = Array.isArray(respuesta.data)
          ? respuesta.data
          : respuesta.data?.sucursales || [];
        setSucursales(sucursales);
        // notification.success({
        //   message: "Éxito",
        //   description: "Sucursales encontradas",
        // });
        return;
      }
      if (respuesta.status === 204) {
        setSucursales([]);
        notification.info({
          message: "Información",
          description: "No se encontraron sucursales",
        });
        return;
      }
      notification.error({
        message: "Error",
        description: respuesta.error || "Error al buscar las sucursales",
      });
    } catch (error) {
      console.log("Error", error);
      notification.error({
        message: "Error",
        description: "Error al buscar las sucursales",
      });
    }
  };

  const buscarBodegas = async (idSucursal) => {
    try {
      const respuesta = await obtenerBodegasPorSucursal(idSucursal);
      console.log("Respuesta de bodegas", respuesta);
      if (respuesta.status === 200) {
        setBodegas(respuesta.data);
        // notification.success({
        //   message: "Éxito",
        //   description: "Bodegas encontradas",
        // });
        return;
      }
      notification.error({
        message: "Error",
        description: respuesta.error || "Error al buscar las bodegas",
      });
      setBodegas([]);
    } catch (error) {
      console.log("Error", error);
      notification.error({
        message: "Error",
        description: "Error al buscar las bodegas",
      });
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleString("es-CL");
  };

  // Filtros dinámicos basados en los datos
  const filtrosTodos = useMemo(() => {
    const uniqueOptions = (data, field) => {
      return [...new Set(data.map((item) => item[field]).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "es"))
        .map((value) => ({ value, label: value }));
    };

    return [
      {
        key: "tipoDocumento",
        placeholder: "Tipo Documento",
        options: uniqueOptions(todosDespachos, "tipoDocumento"),
      },
      {
        key: "tipoDespacho",
        placeholder: "Tipo Despacho",
        options: uniqueOptions(todosDespachos, "tipoDespacho"),
      },
      {
        key: "estado",
        placeholder: "Estado",
        options: uniqueOptions(todosDespachos, "estado"),
      },
    ];
  }, [todosDespachos]);

  const detallesProductos =
    ordenSeleccionada?.ordencompra?.compraproveedordetalles || [];

  const cantidadItems = detallesProductos.length;

  const cantidadTotalProductos = detallesProductos.reduce(
    (acumulador, detalle) => acumulador + (Number(detalle.cantidad) || 0),
    0,
  );

  const columnasProductos = [
    {
      title: "Producto",
      dataIndex: ["producto", "nombre"],
      key: "productoNombre",
      render: (nombre) => nombre || "-",
    },
    {
      title: "Código",
      dataIndex: ["producto", "codigo"],
      key: "productoCodigo",
      render: (codigo) => codigo || "-",
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
      render: (cantidad) => Number(cantidad) || 0,
    },
  ];

  const columns = [
    {
      title: "Orden",
      dataIndex: ["ordencompra", "nombreOrden"],
      key: "nombreOrden",
    },
    {
      title: "Fecha",
      dataIndex: ["ordencompra", "fechaOrden"],
      key: "fechaOrden",
      render: (fecha) => new Date(fecha).toLocaleDateString("es-CL"),
    },
    {
      title: "Estado",
      dataIndex: ["ordencompra", "estado"],
      key: "estado",
      render: (estado) => <Tag color="orange">{estado}</Tag>,
    },
    {
      title: "Tipo",
      dataIndex: ["ordencompra", "tipo"],
      key: "tipo",
    },
    {
      title: "Total",
      dataIndex: ["ordencompra", "total"],
      key: "total",
      render: (total) => `$${total.toLocaleString("es-CL")}`,
    },
    {
      title: "Sucursal",
      dataIndex: ["sucursal", "nombre"],
      key: "sucursal",
    },
    {
      title: "Solicitante",
      dataIndex: ["vendedor", "nombre"],
      key: "vendedor",
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            disabled={record.ordencompra.estado === "recepcionada"}
            onClick={(e) => {
              e.stopPropagation();
              handleRecepcionar(record);
            }}
          >
            Recepcionar
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handelAbrirDrawerDespachos(record.ordencompra);
              // navigate(
              //   `/vendedor/gestion/despachos/${record.ordencompra.nombreOrden}`,
              // );
            }}
          >
            Despachos
          </Button>
        </div>
      ),
    },
  ];

  const columnasDespachos = [
    {
      title: "Codigo",
      dataIndex: "codigoDespacho",
      key: "codigoDespacho",
    },
    {
      title: "Fecha",
      dataIndex: "fechaDespacho",
      key: "fechaDespacho",
      render: (fecha) => formatearFecha(fecha),
    },
    {
      title: "Tipo Documento",
      dataIndex: "tipoDocumento",
      key: "tipoDocumento",
      render: (tipo) => tipo || "-",
    },
    {
      title: "Tipo Despacho",
      dataIndex: "tipoDespacho",
      key: "tipoDespacho",
      render: (tipo) => tipo || "-",
    },
    {
      title: "Nro Documento",
      dataIndex: "numeroDocumento",
      key: "numeroDocumento",
      render: (numero) => numero || "-",
    },
    {
      title: "Repartidor",
      dataIndex: "repartidor",
      key: "repartidor",
      render: (repartidor) => repartidor || "-",
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado) => {
        if (!estado) return "-";
        const color = estado.toLowerCase().includes("inventario")
          ? "green"
          : "blue";
        return <Tag color={color}>{estado}</Tag>;
      },
    },
  ];

  const columnasDespachosRutProveedor = [
    {
      title: "Nombre OC",
      dataIndex: ["ordencompra", "nombreOrden"],
      key: "nombreOrden",
      render: (nombreOrden) => nombreOrden || "-",
    },
    {
      title: "Codigo",
      dataIndex: "codigoDespacho",
      key: "codigoDespacho",
    },
    {
      title: "Fecha",
      dataIndex: "fechaDespacho",
      key: "fechaDespacho",
      render: (fecha) => formatearFecha(fecha),
    },
    {
      title: "Tipo Documento",
      dataIndex: "tipoDocumento",
      key: "tipoDocumento",
      render: (tipo) => tipo || "-",
    },
    {
      title: "Tipo Despacho",
      dataIndex: "tipoDespacho",
      key: "tipoDespacho",
      render: (tipo) => tipo || "-",
    },
    {
      title: "Nro Documento",
      dataIndex: "numeroDocumento",
      key: "numeroDocumento",
      render: (numero) => numero || "-",
    },
    {
      title: "Repartidor",
      dataIndex: "repartidor",
      key: "repartidor",
      render: (repartidor) => repartidor || "-",
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado) => {
        if (!estado) return "-";
        const color = estado.toLowerCase().includes("inventario")
          ? "green"
          : "blue";
        return <Tag color={color}>{estado}</Tag>;
      },
    },
  ];

  const columnasDetalleDespacho = [
    {
      title: "Codigo Detalle",
      dataIndex: "codigoDetalleDespacho",
      key: "codigoDetalleDespacho",
      render: (codigo) => codigo || "-",
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
      render: (cantidad) => cantidad ?? 0,
    },
    {
      title: "Recibida",
      dataIndex: "cantidadRecibida",
      key: "cantidadRecibida",
      render: (cantidad) => cantidad ?? 0,
    },
    {
      title: "Rechazada",
      dataIndex: "cantidadRechazada",
      key: "cantidadRechazada",
      render: (cantidad) => cantidad ?? 0,
    },
    {
      title: "Observaciones",
      dataIndex: "observaciones",
      key: "observaciones",
      render: (observaciones) => observaciones || "-",
    },
  ];

  const columnasLotes = [
    {
      title: "Codigo Lote",
      dataIndex: "codigoLote",
      key: "codigoLote",
      render: (codigo) => codigo || "-",
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
      render: (cantidad) => cantidad ?? 0,
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado) => estado || "-",
    },
    {
      title: "Fecha Vencimiento",
      dataIndex: "fechaVencimiento",
      key: "fechaVencimiento",
      render: (fecha) => formatearFecha(fecha),
    },
    {
      title: "Codigo Producto",
      key: "codigoProducto",
      render: (_, lote) => lote.producto?.codigo || "-",
    },
    {
      title: "Nombre Producto",
      key: "nombreProducto",
      render: (_, lote) => lote.producto?.nombre || "-",
    },
    {
      title: "Precio Venta",
      key: "precioVentaProducto",
      render: (_, lote) => {
        const precio = lote.producto?.precioVenta;
        if (precio === null || precio === undefined || precio === "")
          return "-";
        return `$${Number(precio).toLocaleString("es-CL")}`;
      },
    },
    {
      title: "ID Producto",
      dataIndex: "idProducto",
      key: "idProducto",
      render: (idProducto) => idProducto || "-",
    },
    {
      title: "ID Bodega",
      dataIndex: "idBodega",
      key: "idBodega",
      render: (idBodega) => idBodega || "-",
    },
  ];

  const handleAbrirDetalleDespacho = (despacho) => {
    console.log("Despacho seleccionado para detalle:", despacho);
    setDespachoSeleccionado(despacho);
    setModalDetalleAbiertoDespacho(true);
  };

  const handleCerrarDetalleDespacho = () => {
    setModalDetalleAbiertoDespacho(false);
    setDespachoSeleccionado(null);
  };

  const handleBuscarDespachosOC = async (values) => {
    const numeroOrden = values.numeroOrden?.toString().trim();
    console.log("numero orden", numeroOrden);
    // const numeroOrdenNormalizado = normalizarNumeroOrdenCompra(numeroOrden);

    // if (!numeroOrdenNormalizado) {
    //   notification.warning({
    //     message: "Busqueda incompleta",
    //     description: "Ingresa numero de orden",
    //   });
    //   return;
    // }

    const payload = {};

    // if (numeroOrdenNormalizado) {
    //   payload.numeroOrden = numeroOrdenNormalizado;
    // }

    try {
      console.log("Payload de busqueda de despachos:", payload);
      const respuesta = await obtenerDespachosPorOrden(numeroOrden);
      console.log("Respuesta de despacho por orden", respuesta.data);
      if (respuesta.status === 200) {
        setDespachosOc(respuesta.data);
        return;
      }
      notification.error({
        message: "Error",
        description:
          "No se pudieron obtener los despachos para esta orden, verifica el numero ingresado.",
      });
      // Se mantiene el comportamiento actual para busqueda por numero de orden.
    } catch (error) {
      console.error("Error al buscar despachos:", error);
      notification.error({
        message: "Error",
        description:
          "No se pudieron buscar despachos con los filtros ingresados.",
      });
    }
  };

  const handleBuscarDespachosRutProveedor = async (values) => {
    const rutProveedor = values.rutProveedor?.trim();

    if (!rutProveedor) {
      notification.warning({
        message: "Busqueda incompleta",
        description: "Ingresa RUT proveedor.",
      });
      return;
    }

    try {
      console.log("Payload de busqueda de despachos:", rutProveedor);
      const respuesta = await obtenerDespachosPorRutProveedor(rutProveedor);
      console.log("Respuesta de despacho por RUT proveedor", respuesta.data);
      if (respuesta.status === 200) {
        setTodoDespachosRutProveedor(respuesta.data);
        return;
      }
      notification.error({
        message: "Error",
        description:
          "No se pudieron obtener los despachos para este RUT de proveedor, verifica el RUT ingresado.",
      });

      // Se mantiene el comportamiento actual para busqueda por numero de orden.
    } catch (error) {
      console.error("Error al buscar despachos:", error);
      notification.error({
        message: "Error",
        description:
          "No se pudieron buscar despachos con los filtros ingresados.",
      });
    }
  };

  const handleBuscarTodosDespachos = async () => {
    try {
      const respuesta = await obtenerTodosDespachos();
      console.log("Respuesta de todos los despachos", respuesta.data);
      if (respuesta.status === 200) {
        setTodoDespachos(respuesta.data);
        return;
      }
      notification.error({
        message: "Error",
        description: "No se pudieron obtener todos los despachos.",
      });
    } catch (error) {
      console.error("Error al buscar todos los despachos:", error);
      notification.error({
        message: "Error",
        description: "No se pudieron obtener todos los despachos.",
      });
    }
  };

  //Funciones del drawer
  const handelAbrirDrawerDespachos = (ordenCompra) => {
    console.log("Orden Compra", ordenCompra.despachos);
    setOrdenDrawer(ordenCompra);
    setDrawerDespachos(true);
  };

  const handleCerrarDrawerDespachos = () => {
    setDrawerDespachos(false);
  };

  const handleBuscar = async (values) => {
    try {
      const respuesta = await buscarOrdenesCompraSucursalVendedor(
        values.rutProveedor,
      );
      console.log("Respuesta de la búsqueda:", respuesta);
      if (respuesta.status === 200) {
        const ordenesCompra = Array.isArray(respuesta.data)
          ? respuesta.data
          : respuesta.data?.ordenesCompra || [];

        setOrdenes(ordenesCompra);
        //console.log("Órdenes de compra encontradas:", ordenesCompra);
        notification.success({
          message: "Éxito",
          description: "Órdenes de compra encontradas",
        });
        return;
      }
      if (respuesta.status === 204) {
        setOrdenes([]);
        notification.info({
          message: "Información",
          description:
            "No se encontraron órdenes de compra pendientes para el proveedor",
        });
        return;
      }
      notification.error({
        message: "Error",
        description: respuesta.error || "Error al buscar las órdenes de compra",
      });
    } catch (error) {
      console.error("Error al buscar las órdenes de compra:", error);
      notification.error({
        message: "Error",
        description: "Error al buscar las órdenes de compra",
      });
    }
  };

  const handleVerDetalle2 = (record) => {
    setOrdenSeleccionada(record);
    setModalDetalleAbierto(true);
  };

  const handleCerrarDetalle2 = () => {
    setModalDetalleAbierto(false);
    setOrdenSeleccionada(null);
  };

  const ordenesConNombreOrden = ordenes.map((orden) => ({
    ...orden,
    nombreOrden: orden.ordencompra?.nombreOrden || "",
  }));

  const handleRecepcionar = async (record) => {
    console.log("orden seleccionada", record);

    buscarSucursales();
    setOrdenSeleccionadaRecepcion(record);
    formRecepcion.resetFields();

    const despachos = record?.ordencompra?.despachos || [];

    const detallesIniciales =
      record?.ordencompra?.compraproveedordetalles?.map((detalle, index) => {
        const detalleDespachoPorProducto = despachos.reduce(
          (acumulador, despacho) => {
            const detalleDespacho = despacho?.detalledespachos?.[index];

            if (!detalleDespacho) {
              return acumulador;
            }
            console.log(
              "Cantidade recibida:",
              detalleDespacho.cantidadRecibida,
            );
            return {
              cantidadRecibida:
                acumulador.cantidadRecibida +
                (Number(
                  detalleDespacho.cantidadRecibida ?? detalleDespacho.cantidad,
                ) || 0),
              cantidadRechazada:
                acumulador.cantidadRechazada +
                (Number(detalleDespacho.cantidadRechazada) || 0),
            };
          },
          {
            cantidadRecibida: 0,
            cantidadRechazada: 0,
          },
        );

        return {
          idProducto: detalle.producto?.idProducto,
          productoNombre: detalle.producto?.nombre || "",
          productoCodigo: detalle.producto?.codigo || "",
          cantidadSolicitada: Number(detalle.cantidad) || 0,
          cantidadRecibida: detalleDespachoPorProducto.cantidadRecibida,
          cantidadRechazada: detalleDespachoPorProducto.cantidadRechazada,
        };
      }) || [];

    formRecepcion.setFieldsValue({
      tipoDocumento: undefined,
      tipoDespacho: undefined,
      numeroDocumento: "",
      repartidor: "",
      idSucursal: record?.sucursal?.idSucursal,
      observacionesRecepcion: "",
      detalles: detallesIniciales,
    });

    console.log("orden recuperada", formRecepcion.getFieldValue());
    setModalRecepcionAbierto(true);
  };

  const handleCerrarRecepcion = () => {
    setModalRecepcionAbierto(false);
    formRecepcion.resetFields();
  };

  const handleConfirmarRecepcion = async (values) => {
    setModalLoading(true);
    const payloadRecepcion = {
      idOrdenCompra: ordenSeleccionadaRecepcion?.ordencompra?.idOrdenCompra,
      idProveedor: ordenSeleccionadaRecepcion?.idProveedor,
      tipoDocumento: values.tipoDocumento,
      tipoDespacho: values.tipoDespacho,
      numeroDocumento: values.numeroDocumento,
      repartidor: values.repartidor,
      observaciones: values.observacionesRecepcion,
      idSucursal: values.idSucursal,
      idBodega: values.idBodega,
      productos: (values.detalles || []).map((detalle) => ({
        idProducto: detalle.idProducto,
        productoCodigo: detalle.productoCodigo,
        cantidadSolicitada: Number(detalle.cantidadSolicitada) || 0,
        cantidadRecibida: Number(detalle.cantidadRecibida) || 0,
        cantidadRechazada: Number(detalle.cantidadRechazada) || 0,
      })),
    };

    console.log("Payload recepción:", payloadRecepcion);
    try {
      const respuesta =
        await crearOrdenCompraSucursalVendedor(payloadRecepcion);
      if (respuesta.status === 200) {
        notification.success({
          message: "Recepción registrada",
          description: "La recepción del despacho fue preparada correctamente.",
        });
        handleCerrarRecepcion();
        handleBuscar({
          rutProveedor: ordenSeleccionadaRecepcion?.proveedor?.rut,
        });
        setModalLoading(false);
        return;
      }
      notification.error({
        message: "Error",
        description:
          respuesta.error || "Error al registrar la recepción del despacho",
      });
      setModalLoading(false);
      return;
    } catch (error) {
      console.error("Error al crear la recepción del despacho:", error);
      notification.error({
        message: "Error",
        description: "Error al registrar la recepción del despacho",
      });
      setModalLoading(false);
      return;
    }
  };

  useEffect(() => {
    if (nombreOrden) {
      form.setFieldValue("numeroOrden", nombreOrden.slice(6));
      form.submit();
    }
    if (rutProveedor) {
      console.log("Despachos:", rutProveedor);
      form.setFieldsValue({ rutProveedor: rutProveedor });
      handleBuscar({ rutProveedor: rutProveedor });
    }
  }, [nombreOrden, form, rutProveedor]);

  useEffect(() => {
    if (!modalRecepcionAbierto) return;

    if (!idSucursalSeleccionada) {
      setBodegas([]);
      return;
    }

    buscarBodegas(idSucursalSeleccionada);
  }, [idSucursalSeleccionada, modalRecepcionAbierto]);

  return (
    <div>
      <Typography.Title>Gestion De Despachos</Typography.Title>

      <Tabs
        onChange={(key) => {
          console.log("Tab activo:", key);
          if (key === "todos") {
            console.log("todos");
            handleBuscarTodosDespachos();
          }
        }}
        items={[
          {
            key: "recepcion_despachos",
            label: "Recepción de Despachos",
            children: (
              <>
                <div>
                  <Typography.Title level={3}>
                    Recepción de Despachos
                  </Typography.Title>

                  <Card style={{ marginTop: 20 }}>
                    <Form
                      layout="inline"
                      style={{ marginBottom: 20 }}
                      form={form}
                      onFinish={handleBuscar}
                    >
                      <Form.Item
                        label="Rut del Proveedor"
                        name="rutProveedor"
                        rules={[
                          {
                            required: true,
                            message: "Por favor ingrese el RUT del proveedor",
                          },
                        ]}
                      >
                        <Input placeholder="Ingrese el RUT del proveedor" />
                      </Form.Item>
                      <Button type="primary" htmlType="submit">
                        Buscar
                      </Button>
                    </Form>
                  </Card>
                  {ordenes.length > 0 && (
                    <DataTable
                      data={ordenesConNombreOrden}
                      columns={columns}
                      rowKey="idOrdenCompra"
                      searchableFields={["nombreOrden"]}
                      showFilters={false}
                      searchPlaceholder="Buscar por nombre de orden"
                      onRowClick={handleVerDetalle2}
                      sortField="nombreOrden"
                      sortOrder="desc"
                    />
                  )}
                </div>
              </>
            ),
          },
          {
            key: "buscar",
            label: "Buscar Despachos por OC",
            children: (
              <>
                <Typography.Title level={4} style={{ marginTop: 20 }}>
                  Buscar Despachos por Orden de Compra
                </Typography.Title>
                <Form
                  form={form}
                  layout="inline"
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                  onFinish={handleBuscarDespachosOC}
                >
                  <Form.Item
                    label="Numero de orden"
                    name="numeroOrden"
                    style={{ marginBottom: 0 }}
                    // rules={
                    //   [
                    //     // {
                    //     //   pattern: /^\d*$/,
                    //     //   message: "El numero de orden debe ser numerico",
                    //     // },
                    //   ]
                    // }
                  >
                    <Input
                      placeholder={`OC${new Date().getFullYear()}12345641`}
                      style={{ width: 220 }}
                      maxLength={14}
                    />
                  </Form.Item>

                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button type="primary" htmlType="submit">
                      Buscar
                    </Button>
                  </Form.Item>
                </Form>
                {despachosOc.length > 0 && (
                  <DataTable
                    data={despachosOc}
                    columns={columnasDespachos}
                    rowKey="idDespacho"
                    searchableFields={[
                      "codigoDespacho",
                      "tipoDocumento",
                      "repartidor",
                    ]}
                    filterConfig={filtrosTodos}
                    showFilters={true}
                    searchPlaceholder="Buscar por codigo"
                    onRowClick={handleAbrirDetalleDespacho}
                  />
                )}
              </>
            ),
          },
          {
            key: "busqueda_rutProveedor",
            label: "Buscar Despachos por RUT Proveedor",
            children: (
              <>
                <Typography.Title level={4} style={{ marginTop: 20 }}>
                  Buscar Despachos por RUT del Proveedor
                </Typography.Title>
                <Form
                  form={formRutProveedor}
                  layout="inline"
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                  onFinish={handleBuscarDespachosRutProveedor}
                >
                  <Form.Item
                    label="RUT proveedor"
                    name="rutProveedor"
                    style={{ marginBottom: 0 }}
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          const rutRegex = /^\d{7,8}-[\dkK]$/;
                          if (!rutRegex.test(value)) {
                            return Promise.reject(
                              new Error("El RUT debe tener formato XXXXXXXX-X"),
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input
                      placeholder="Ingrese RUT del proveedor"
                      style={{ width: 220 }}
                      maxLength={10}
                      onChange={(e) => {
                        // Permite solo números, guión y K
                        const valor = e.target.value.replace(/[^0-9kK-]/g, "");
                        e.target.value = valor;
                      }}
                    />
                  </Form.Item>

                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button type="primary" htmlType="submit">
                      Buscar
                    </Button>
                  </Form.Item>
                </Form>

                {todoDespachosRutProveedor.length > 0 && (
                  <DataTable
                    data={todoDespachosRutProveedor}
                    columns={columnasDespachosRutProveedor}
                    rowKey="idDespacho"
                    searchableFields={["codigoDespacho", "nombreOrden"]}
                    showFilters={false}
                    searchPlaceholder="Buscar Codigo Despacho"
                    onRowClick={handleAbrirDetalleDespacho}
                  />
                )}
              </>
            ),
          },
          {
            key: "todos",
            label: "Ver Todos los Despachos",

            children: (
              <>
                <Typography.Title level={4} style={{ marginTop: 20 }}>
                  Todos los Despachos
                </Typography.Title>
                <DataTable
                  data={todosDespachos}
                  columns={columnasDespachos}
                  rowKey="idDespacho"
                  searchableFields={[
                    "codigoDespacho",
                    "tipoDocumento",
                    "repartidor",
                  ]}
                  filterConfig={filtrosTodos}
                  showFilters={true}
                  searchPlaceholder="Buscar por codigo"
                  onRowClick={handleAbrirDetalleDespacho}
                />
              </>
            ),
          },
        ]}
      />

      {/**Modal Detalles */}
      <Modal
        title="Detalle del despacho"
        open={modalDetalleAbiertoDespacho}
        width={900}
        onCancel={handleCerrarDetalleDespacho}
        footer={[
          <Button key="cerrar" onClick={handleCerrarDetalleDespacho}>
            Cerrar
          </Button>,
        ]}
      >
        {despachoSeleccionado && (
          <>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Codigo Despacho">
                {despachoSeleccionado.codigoDespacho || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Orden Compra">
                {despachoSeleccionado.ordencompra?.nombreOrden || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha Despacho">
                {formatearFecha(despachoSeleccionado.fechaDespacho)}
              </Descriptions.Item>
              <Descriptions.Item label="Tipo Documento">
                {despachoSeleccionado.tipoDocumento || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Tipo Despacho">
                {despachoSeleccionado.tipoDespacho || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Numero Documento">
                {despachoSeleccionado.numeroDocumento || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Repartidor">
                {despachoSeleccionado.repartidor || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Proveedor">
                {despachoSeleccionado.ordencompra?.creaOrdenCompra?.proveedor
                  ?.nombre || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Rut Proveedor">
                {despachoSeleccionado.ordencompra?.creaOrdenCompra?.proveedor
                  ?.rut || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Estado">
                {despachoSeleccionado.estado || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Observaciones" span={2}>
                {despachoSeleccionado.observaciones || "-"}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: "16px 0" }} />

            <Typography.Text strong>
              Detalles del despacho (
              {despachoSeleccionado.detalledespachos?.length || 0})
            </Typography.Text>

            <Table
              size="small"
              dataSource={despachoSeleccionado.detalledespachos || []}
              columns={columnasDetalleDespacho}
              rowKey={(detalle, index) =>
                `${detalle.idDetalledespacho || "detalle"}-${index}`
              }
              pagination={false}
              expandable={{
                expandedRowRender: (detalle) => (
                  <Table
                    size="small"
                    dataSource={detalle.lotes || []}
                    columns={columnasLotes}
                    rowKey={(lote, index) =>
                      `${lote.idLote || "lote"}-${index}`
                    }
                    pagination={false}
                    locale={{ emptyText: "Sin lotes asociados" }}
                  />
                ),
                rowExpandable: (detalle) =>
                  Array.isArray(detalle.lotes) && detalle.lotes.length > 0,
              }}
              locale={{ emptyText: "No hay detalles para este despacho" }}
            />
          </>
        )}
      </Modal>
      {/**Modal Detalle */}
      <Modal
        title="Detalle de orden de compra"
        open={modalDetalleAbierto}
        width={700}
        onCancel={handleCerrarDetalle2}
        footer={[
          <Button key="cerrar" onClick={handleCerrarDetalle2}>
            Cerrar
          </Button>,
        ]}
      >
        {ordenSeleccionada && (
          <>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Rut Proveedor">
                {ordenSeleccionada.proveedor?.rut || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="ID orden compra">
                {ordenSeleccionada.ordencompra?.idOrdenCompra || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Nombre orden">
                {ordenSeleccionada.ordencompra?.nombreOrden || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha">
                {ordenSeleccionada.ordencompra?.fechaOrden
                  ? new Date(
                      ordenSeleccionada.ordencompra.fechaOrden,
                    ).toLocaleDateString("es-CL")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag color="purple">
                  {ordenSeleccionada.ordencompra?.estado?.toUpperCase() || "-"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Sucursal">
                {ordenSeleccionada.sucursal?.nombre || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="RUT solicitante">
                {ordenSeleccionada.vendedor?.rut || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Total" span={2}>
                $
                {Number(
                  ordenSeleccionada.ordencompra?.total || 0,
                ).toLocaleString("es-CL")}
              </Descriptions.Item>
              <Descriptions.Item label="Observaciones" span={2}>
                <div style={{ whiteSpace: "pre-line" }}>
                  {ordenSeleccionada.ordencompra?.observaciones || "-"}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Detalle estado" span={2}>
                {ordenSeleccionada.ordencompra?.detalleEstado || "-"}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: "16px 0" }} />

            <Typography.Text strong>
              Productos ({cantidadItems} ítems, {cantidadTotalProductos}{" "}
              unidades)
            </Typography.Text>

            <Table
              size="small"
              style={{ marginTop: 10 }}
              dataSource={detallesProductos}
              columns={columnasProductos}
              rowKey={(detalle, index) =>
                `${detalle.producto?.codigo || "sin-codigo"}-${index}`
              }
              pagination={false}
              locale={{ emptyText: "No hay productos en el detalle" }}
            />
          </>
        )}
      </Modal>
      {/**Modal Recepción de despachos */}
      <ModalRecepcionDespachos
        open={modalRecepcionAbierto}
        onCancel={handleCerrarRecepcion}
        ordenSeleccionada={ordenSeleccionadaRecepcion}
        sucursales={sucursales}
        bodegas={bodegas}
        form={formRecepcion}
        onFinish={handleConfirmarRecepcion}
        loading={modalLoading}
      />

      <DrawerDetalleDespachos
        open={drawerDespachos}
        onClose={handleCerrarDrawerDespachos}
        ordenDrawer={ordenDrawer}
      />
    </div>
  );
}
