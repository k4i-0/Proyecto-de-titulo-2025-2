import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Input,
  InputNumber,
  Menu,
  Row,
  Space,
  Table,
  Tag,
  Typography,
  Form,
  notification,
  Modal,
  Descriptions,
  Select,
  List,
  Badge,
  Spin,
  Empty,
} from "antd";
import React, { useEffect, useMemo, useState, useRef } from "react";

import { useAuth } from "../../context/AuthContext";

import {
  BarcodeOutlined,
  CheckOutlined,
  DeleteOutlined,
  HistoryOutlined,
  LogoutOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  PlusOutlined,
  DollarOutlined,
  CreditCardOutlined,
  BankOutlined,
  IdcardOutlined,
  ClockCircleOutlined,
  UnlockOutlined,
  LockOutlined,
  AuditOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  AccountBookOutlined,
  SaveOutlined,
} from "@ant-design/icons";

import {
  buscarProductoVenta,
  aperturaCaja,
  registroCajaEnSucursal,
  consultarEstadoCaja,
  cierreCaja,
  registroVenta,
  consultarEstadoMP,
  consultarStatusVentas,
  solicitarPagoTarjeta,
  cancelarVentaTarjeta,
  verVentasDelDia,
  generarArqueoCaja,
} from "../../services/ventas/ventas.service";

import { buscarTodasSucursales } from "../../services/functions/Sucursales";
import { buscarTodosProductos } from "../../services/functions/Productos";

const estiloBoton = {
  height: "80px",
  fontSize: "16px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: "8px", // Espacio entre el ícono y el texto
  borderRadius: "8px",
};

const METODO_PAGO_DIFERIDO = "Pago diferido";

const denominaciones = [
  { label: "$ 20.000", name: "d20000", valor: 20000 },
  { label: "$ 10.000", name: "d10000", valor: 10000 },
  { label: "$ 5.000", name: "d5000", valor: 5000 },
  { label: "$ 2.000", name: "d2000", valor: 2000 },
  { label: "$ 1.000", name: "d1000", valor: 1000 },
  { label: "$ 500", name: "d500", valor: 500 },
  { label: "$ 100", name: "d100", valor: 100 },
  { label: "$ 50", name: "d50", valor: 50 },
  { label: "$ 10", name: "d10", valor: 10 },
];

const datosResumen = {
  montoApertura: 50000,
  ventasEfectivo: 125000,
  retiros: 15000,
  ventasTarjeta: 85000, // Se muestra como info, pero no suma al efectivo esperado
  efectivoEsperado: 160000, // (Apertura + Ventas Efectivo - Retiros)
};

export default function MenuPrincipal() {
  const { user, logout } = useAuth();
  const [productos, setProductos] = useState([]);
  const [busquedaProductos, setBusquedaProductos] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [sucursales, setSucursales] = useState([]);
  const [ahora, setAhora] = useState(() => new Date());
  const [modalMetodoPago, setModalMetodoPago] = useState(false);
  const [modalAperturaCaja, setModalAperturaCaja] = useState(false);
  const [modalRegistroCaja, setModalRegistroCaja] = useState(false);
  const [modalCierreCaja, setModalCierreCaja] = useState(false);
  const [modalBusquedaProducto, setModalBusquedaProducto] = useState(false);
  const [totalMetodoPagoActual, setTotalMetodoPagoActual] = useState(0);
  const [cantidades, setCantidades] = useState(
    Object.fromEntries(denominaciones.map((d) => [d.name, 0])),
  );
  const [cajaNoRegistrada, setCajaNoRegistrada] = useState(false);
  const [cajaAperturada, setCajaAperturada] = useState(false);
  const [informacionCaja, setInformacionCaja] = useState({});
  const [infoPagosDiferidos, setInfoPagosDiferidos] = useState([]);
  const [esperandoPago, setEsperandoPago] = useState(false);

  const [modalVentasDia, setModalVentasDia] = useState(false);
  const [ventasDelDia, setVentasDelDia] = useState([]);

  const [resumenCaja, setResumenCaja] = useState(datosResumen);
  const [modalArqueoCaja, setModalArqueoCaja] = useState(false);

  const [formVentaProducto] = Form.useForm();
  const [formAperturaCaja] = Form.useForm();
  const [formRegistroCaja] = Form.useForm();
  const [formCierreCaja] = Form.useForm();
  const [formMetodoPago] = Form.useForm();
  const [formArqueoCaja] = Form.useForm();

  const inputRef = useRef(null);

  const fecha = ahora.toLocaleDateString("es-CL");
  const hora = ahora.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const obtenerSucursales = async () => {
    await buscarTodasSucursales(setSucursales);
  };

  const obtenerProductos = async () => {
    await buscarTodosProductos(setBusquedaProductos);
  };

  const obtenerDatosCaja = async (deviceID) => {
    try {
      const datos = await consultarEstadoCaja(deviceID);
      //console.log("Datos de estado de caja obtenidos:", datos.data);
      if (datos.status === 200) {
        localStorage.setItem("numeroCaja", datos.data.numeroCaja);
        localStorage.setItem("idSucursal", datos.data.idSucursal);
        localStorage.setItem("nombreSucursal", datos.data.nombreSucursal);
        localStorage.setItem("estadoCaja", datos.data.estadoRegistroCaja);
        localStorage.setItem("idPOS", datos.data.idPOS);
        localStorage.setItem("tipoMaquinaPOS", datos.data.tipoMaquinaPOS);
        setInformacionCaja({
          numeroCaja: datos.data.numeroCaja,
          idSucursal: datos.data.idSucursal,
          nombreSucursal: datos.data.nombreSucursal,
          estadoCaja: datos.data.estadoRegistroCaja,
          idPOS: datos.data.idPOS,
          tipoMaquinaPOS: datos.data.tipoMaquinaPOS,
          estadoPoint: false,
        });
        await obtenerDatosMP(deviceID);
        if (datos.data.estadoRegistroCaja === "Abierta") {
          setCajaAperturada(true);
        }
        setCajaNoRegistrada(true);
      } else {
        localStorage.clear();
        setCajaNoRegistrada(false);
        notification.error({
          message: datos.data.message || " Error ",
        });
        window.location.reload();
      }
    } catch (error) {
      console.error("Error al consultar estado de caja:", error);
      notification.error({
        message: "222Error al consultar estado de caja",
        description: "Recargue Pagina Para Intentar Nuevamente",
      });
    }
  };

  const obtenerDatosMP = async (deviceID) => {
    try {
      //console.log("Consultando estado de MP para deviceID:", deviceID);
      const respuesta = await consultarEstadoMP(deviceID);
      //console.log("Respuesta de consulta de estado de MP:", respuesta);
      if (respuesta.status === 200) {
        console.log("Datos de estado de MP obtenidos:", respuesta.data);
        if (respuesta.data.estadoTerminal === "active") {
          setInformacionCaja((prev) => ({
            ...prev,
            estadoPoint: true,
            estadoOperacional: respuesta.data.estadoOperacion,
          }));
        }
        return;
      }

      notification.warning({
        message: respuesta.data.error || "No se encontró información Point MP",
      });
    } catch (error) {
      console.error("Error al consultar estado de MP:", error);
      notification.error({
        message: error?.message || "Error al consultar estado de MP",
      });
    }
  };

  useEffect(() => {
    const deviceID = localStorage.getItem("deviceID");
    if (!deviceID) {
      obtenerSucursales();
      setModalRegistroCaja(true);
    } else {
      obtenerProductos();
      //console.log("DeviceID al cargar el componente:", deviceID);
      obtenerDatosCaja(deviceID);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const eliminarProducto = (idProducto) => {
    setProductos((listaActual) =>
      listaActual.filter((producto) => producto.idProducto !== idProducto),
    );
  };

  const limpiarVenta = () => {
    setProductos([]);
  };

  const confirmarVenta = () => {
    setTotalMetodoPagoActual(total);
    formMetodoPago.setFieldsValue({ totalMetodoPago: 0 });
    setModalMetodoPago(true);
  };

  //funciones para ingresar productos
  const agregarProductoCodigo = async () => {
    //console.log("Valores formulario", formVentaProducto.getFieldsValue());
    const codigo = formVentaProducto.getFieldValue("codigo");
    try {
      const respuesta = await buscarProductoVenta(codigo);
      console.log(
        "Respuesta de búsqueda de producto para venta:",
        respuesta.data,
      );
      if (respuesta.status === 200) {
        const producto = respuesta.data;
        //console.log("AgregarProducto", formVentaProducto.getFieldValue());
        const nuevaCantidad =
          Number(formVentaProducto.getFieldValue("cantidad")) || 1;
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
          subtotal: producto.precioVenta * nuevaCantidad - descuentoTotalLinea,
        };
        setProductos((listaActual) => [...listaActual, nuevoProducto]);
        notification.success({
          message: "Producto agregado",
          description: `Se agregó ${producto.nombre} x${nuevaCantidad}`,
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
      formVentaProducto.resetFields();
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus({ cursor: "end" });
        }
      }, 10);
    }
  };

  // Transformamos el estado "productos" en filas visuales para Ant Design
  const filasParaTabla = productos.reduce((acumulador, prod) => {
    // 1. Fila principal del producto (mostrando el subtotal original sin rebaja)
    acumulador.push({
      ...prod,
      key: `prod-${prod.idProducto}`, // Clave única obligatoria para Ant Design
      esFilaDescuento: false,
      subtotalVisual: prod.precio * prod.cantidad, // Subtotal original $2000
    });

    // 2. Filas secundarias para los descuentos (si es que tiene)
    if (prod.descuentosAplicados && prod.descuentosAplicados.length > 0) {
      prod.descuentosAplicados.forEach((desc, index) => {
        acumulador.push({
          ...prod, // Heredamos el idProducto para que el botón eliminar funcione si hiciera falta
          key: `desc-${prod.idProducto}-${index}`,
          esFilaDescuento: true,
          // Sobrescribimos lo visual para la fila de descuento:
          codigo: "",
          nombre: `↳ Descuento ${desc.origen} (${desc.detalle})`,
          cantidad: "",
          precio: "",
          subtotalVisual: -desc.montoDescontado, // Lo volvemos negativo para restar visualmente
        });
      });
    }

    return acumulador;
  }, []);

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

  const totalNeto = Math.round(total / 1.19);
  const impuesto = total - totalNeto;

  //funcioens modal apertura caja
  const totalApertura = denominaciones.reduce(
    (acc, d) => acc + (cantidades[d.name] || 0) * d.valor,
    0,
  );

  const confirmarAperturaCaja = async () => {
    console.log("Total apertura calculado:", totalApertura);
    console.log("Cantidades ingresadas:", cantidades);
    try {
      const response = await aperturaCaja(
        localStorage.getItem("deviceID"),
        informacionCaja.numeroCaja,
        informacionCaja.idSucursal,
        totalApertura,
        cantidades,
      );
      if (response.status === 200) {
        notification.success({
          message: "Caja abierta",
          description: "La caja se ha abierto exitosamente",
        });
        obtenerDatosCaja(localStorage.getItem("deviceID"));
        setCajaAperturada(true);
        setModalAperturaCaja(false);
      } else {
        notification.error({
          message: "Error",
          description: "No se pudo abrir la caja",
        });
      }
    } catch (error) {
      console.error("Error al abrir la caja:", error);
      notification.error({
        message: error.message || "Error",
        description: "No se pudo abrir la caja",
      });
    }
  };

  //funciones modal registro caja
  const confirmarRegistroCaja = async () => {
    try {
      const values = await formRegistroCaja.validateFields();
      console.log("Valores formulario registro caja:", values);
      const response = await registroCajaEnSucursal(values);
      console.log("Respuesta de registro de caja en sucursal:", response.data);
      if (response.status === 200) {
        formRegistroCaja.resetFields();
        setModalRegistroCaja(false);
        setCajaNoRegistrada(false);
        localStorage.setItem("deviceID", response.data.deviceID);
        localStorage.setItem("numeroCaja", response.data.nuevaCajaId);
        localStorage.setItem("idSucursal", response.data.idSucursal);
        localStorage.setItem("nombreSucursal", response.data.nombreSucursal);
        notification.success({
          message: response.data.message || "Caja vinculada correctamente",
        });
        obtenerDatosCaja(localStorage.getItem("deviceID"));
        return;
      }
      notification.error({
        message: "Error",
        description:
          response.data.message ||
          response.data.error ||
          "No se pudo registrar la caja",
      });
    } catch (error) {
      console.log("E333rror al registrar la caja:", error.data.error);
      notification.error({
        message: error.data.error || "Error al registrar la caja",
      });
    }
  };

  //funciones cierre de caja
  const totalCierre = denominaciones.reduce(
    (acc, d) => acc + (cantidades[d.name] || 0) * d.valor,
    0,
  );

  const confirmarCierreCaja = async () => {
    const denominacionesEnviar = formCierreCaja.getFieldsValue();
    const { observacionesCierre, ...rest } = denominacionesEnviar;
    const values = {
      deviceID: localStorage.getItem("deviceID"),
      cantidadMontoFinal: {
        ...rest,
      },
      observacionesCierre: observacionesCierre,
      totalCierre,
    };
    try {
      const respuesta = await cierreCaja(values);
      console.log("Respuesta de cierre de caja:", respuesta);
      if (respuesta.status === 200) {
        notification.success({
          message: "Caja cerrada exitosamente",
        });
        obtenerDatosCaja(localStorage.getItem("deviceID"));
        setCajaAperturada(false);
        setModalCierreCaja(false);
      } else {
        notification.error({
          message: "Error al cerrar caja",
          description: respuesta.data.message || "Intente nuevamente",
        });
      }
    } catch (error) {
      console.error("Error al cerrar caja:", error);
      notification.error({
        message: "Error al cerrar caja",
        description: error.response?.data?.message || "Intente nuevamente",
      });
    }
  };
  //funciones modal buscar
  const normalizarTexto = (texto = "") => String(texto).trim().toLowerCase();

  const productosFiltrados = Array.isArray(busquedaProductos)
    ? busquedaProductos.filter((producto) => {
        const busqueda = normalizarTexto(terminoBusqueda);
        if (!busqueda) return true;

        return [producto.nombre, producto.codigo, producto.codigoProducto]
          .filter(Boolean)
          .some((valor) => normalizarTexto(valor).includes(busqueda));
      })
    : [];

  const handleSeleccionarProducto = async (productoSeleccionado) => {
    const codigo =
      productoSeleccionado.codigo || productoSeleccionado.codigoProducto;

    try {
      const respuesta = await buscarProductoVenta(codigo);

      if (respuesta.status === 200) {
        const producto = respuesta.data;

        const nuevaCantidad = formVentaProducto.getFieldValue("cantidad") || 1;

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
          subtotal: producto.precioVenta * nuevaCantidad - descuentoTotalLinea,
          descuentosAplicados: detalleDescuentosMultiplicados,
        };

        setProductos((listaActual) => [...listaActual, nuevoProducto]);

        setTerminoBusqueda("");
        setModalBusquedaProducto(false);

        notification.success({
          message: "Producto agregado",
          description: `Se agregó ${producto.nombre} al detalle de venta`,
        });
      } else {
        notification.error({
          message: "Error al agregar",
          description:
            "No se encontró la información del producto en la base de datos.",
        });
      }
    } catch (error) {
      console.error("Error al seleccionar producto desde el modal:", error);
      notification.error({
        message: "Error de conexión",
        description: "No se pudieron obtener los descuentos del producto.",
      });
    }
  };

  //funciones metodo de pago

  const confirmarPago = async (metodo) => {
    //console.log("Método de pago seleccionado:", metodo);
    if (metodo === "Efectivo") {
      //llamamos a la funcion de registrar venta
      const deviceID = localStorage.getItem("deviceID");
      const datosVenta = {
        idVentaCliente: " ",
        idPOS: informacionCaja.idPOS,
        idSucursal: informacionCaja.idSucursal,
        tipoPago: "Efectivo",
        detallePagos: null,
        productosVendidos: productos,
        totalVenta: total,
        metodoPago: "Efectivo",
      };
      try {
        const response = await registroVenta(deviceID, datosVenta);
        //console.log("Respuesta de registro de venta en efectivo:", response);
        if (response.status === 200) {
          notification.success({
            message: "Venta registrada exitosamente",
          });
          limpiarVenta();
          setModalMetodoPago(false);
          formVentaProducto.resetFields();
          return;
        }
        notification.error({
          message: "Error al registrar venta en efectivo",
          description: response.data.message || "Intente nuevamente",
        });
      } catch (error) {
        //console.error("Error al registrar venta en efectivo:", error);
        notification.error({
          message: "Error al registrar venta en efectivo",
          description: error.response?.data?.message || "Intente nuevamente",
        });
      }
    }
    if (metodo === "Tarjeta Debito" || metodo === "Tarjeta Credito") {
      //console.log("Tarjeta dentro de if");
      //crear orden de pago
      let idOrdendePago = null;
      let idVentaCliente = null;
      const deviceID = localStorage.getItem("deviceID");
      setEsperandoPago(true);
      try {
        const response = await solicitarPagoTarjeta(deviceID, total, metodo);
        //console.log("Respuesta de solicitud de pago con tarjeta:", response);
        if (response.status === 200) {
          idOrdendePago = response.data.idOrdenMP;
          idVentaCliente = response.data.idVentaCliente;
          let intentos = 0;
          let maximos_intentos = 20;
          let pagoAprobado = false;

          while (intentos < maximos_intentos && !pagoAprobado) {
            const res = await consultarStatusVentas(idOrdendePago);
            // console.log(
            //   "Respuesta de consulta de estado de venta para orden de pago:",
            //   res.data,
            // );
            if (res.status === 200) {
              if (res.data.estado === "processed") {
                pagoAprobado = true;
                setEsperandoPago(false);
                //registrar venta
                const datosVenta = {
                  idVentaCliente: idVentaCliente,
                  idPOS: informacionCaja.idPOS,
                  idSucursal: informacionCaja.idSucursal,
                  tipoPago: metodo,
                  detallePagos: null,
                  productosVendidos: productos,
                  totalVenta: total,
                  metodoPago: metodo,
                };
                try {
                  const response = await registroVenta(deviceID, datosVenta);
                  // console.log(
                  //   "Respuesta de registro de venta con pago aprobado:",
                  //   response,
                  // );
                  if (response.status === 200) {
                    notification.success({
                      message: "Venta registrada exitosamente",
                    });
                    limpiarVenta();
                    setModalMetodoPago(false);
                    return;
                  }
                  notification.error({
                    message: "Error al registrar venta en efectivo",
                    description: response.data.message || "Intente nuevamente",
                  });
                  // if (idOrdendePago) {
                  //   await cancelarVentaTarjeta(idOrdendePago);
                  // }
                  return;
                } catch (error) {
                  console.error(
                    "Error al registrar venta con pago aprobado:",
                    error,
                  );
                  // if (idOrdendePago) {
                  //   await cancelarVentaTarjeta(idOrdendePago);
                  // }
                  notification.error({
                    message:
                      error.response?.data?.message ||
                      "Error al registrar venta con pago aprobado",
                  });
                  return;
                }
              }
              if (res.data.estado === "failed") {
                pagoAprobado = true;
                setEsperandoPago(false);
                notification.error({
                  message: "Error al registrar venta con pago rechazado",
                  description: res.data.message || "Intente nuevamente",
                });
                // if (idOrdendePago) {
                //   await cancelarVentaTarjeta(idOrdendePago);
                // }
                return;
              }
              if (res.data.estado === "canceled") {
                notification.warning({
                  message: "Pago cancelado",
                  description: res.data.message || "Intente nuevamente",
                });
                pagoAprobado = true;
                setEsperandoPago(false);
              }
              if (res.data.estado === "action_required") {
                notification.info({
                  message: "Pago en proceso",
                  description:
                    "El pago está siendo procesado. Por favor espere.",
                });
              }

              await new Promise((resolve) => setTimeout(resolve, 3000));
              intentos++;
              console.log("intentos", intentos);
            } else {
              notification.error({
                message:
                  res.data.message || "Error al consultar estado de pago",

                description: "Intente nuevamente",
              });
              setEsperandoPago(false);
              break;
            }
            if (intentos == maximos_intentos && pagoAprobado == false) {
              setEsperandoPago(false);
              notification.warning({
                message: "Tiempo de espera agotado",
                description:
                  "No se recibió confirmación de pago. Intente nuevamente.",
              });
              // if (idOrdendePago) {
              //   await cancelarVentaTarjeta(idOrdendePago);
              // }
              break;
            }
          }
        }
        notification.error({
          message:
            response.data.message || "Error al solicitar pago con tarjeta",
        });
        console.log(
          "Error al solicitar pago con tarjeta, respuesta:",
          response,
        );
      } catch (error) {
        setEsperandoPago(false);
        if (idOrdendePago) {
          await cancelarVentaTarjeta(idOrdendePago);
        }
        console.error("Error al solicitar pago con tarjeta:", error);
        notification.error({
          message: "Error al solicitar pago con tarjeta",
          description: error.response?.data?.message || "Intente nuevamente",
        });
      } finally {
        setEsperandoPago(false);
      }
    }
  };

  //funciones para ver ventas del dia
  const obtenerVentasDelDia = async () => {
    try {
      const res = await verVentasDelDia(localStorage.getItem("deviceID"));
      console.log("Respuesta de consulta de ventas del día:", res.data);
      if (res.status === 200) {
        setVentasDelDia(res.data);
      } else {
        notification.error({
          message: "Error al obtener ventas del día",
          description: res.data.message || "Intente nuevamente",
        });
      }
    } catch (error) {
      console.error("Error al obtener ventas del día:", error);
      notification.error({
        message: "Error al obtener ventas del día",
        description: error.response?.data?.message || "Intente nuevamente",
      });
    }
  };
  const abrirModalVentasDelDia = async () => {
    obtenerVentasDelDia();
    setModalVentasDia(true);
  };
  const cerrarModalVentasDelDia = () => {
    setModalVentasDia(false);
    setVentasDelDia([]);
  };

  const columnasVentasDia = [
    {
      title: "N° Venta",
      dataIndex: "idVentaCliente",
      key: "idVentaCliente",
      width: 90,
      render: (id) => <Typography.Text strong>#{id}</Typography.Text>,
    },
    {
      title: "Hora",
      dataIndex: "fechaVenta",
      key: "fechaVenta",
      render: (fecha) => {
        // Extraemos solo la hora para que la tabla no se sature de fechas repetidas (ya sabemos que son de hoy)
        return new Date(fecha).toLocaleTimeString("es-CL", {
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      title: "Método de Pago",
      dataIndex: "metodoPago",
      key: "metodoPago",
      render: (metodo) => (
        <Tag color={metodo === "Efectivo" ? "green" : "blue"}>
          {metodo || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalVenta",
      key: "totalVenta",
      align: "right",
      render: (total) => (
        <Typography.Text strong>
          ${Number(total).toLocaleString("es-CL")}
        </Typography.Text>
      ),
    },
  ];

  // Columnas para el detalle que se despliega
  const columnasDetalle = [
    {
      title: "Producto",

      dataIndex: ["producto", "nombre"],
      key: "nombreProducto",
    },
    {
      title: "Cant.",
      dataIndex: "cantidad",
      key: "cantidad",
      align: "center",
      width: 80,
    },
    {
      title: "Precio Unit.",

      dataIndex: "precio",
      key: "precio",
      align: "right",
      render: (precio) => `$${Number(precio || 0).toLocaleString("es-CL")}`,
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      key: "subtotal",
      align: "right",
      render: (sub) => (
        <Typography.Text strong>
          ${Number(sub || 0).toLocaleString("es-CL")}
        </Typography.Text>
      ),
    },
  ];
  const hayVentas = Array.isArray(ventasDelDia) && ventasDelDia.length > 0;

  const sumaTotalDia = hayVentas
    ? ventasDelDia.reduce(
        (total, venta) => total + Number(venta.totalVenta || 0),
        0,
      )
    : 0;

  //funciones arqueo de caja

  const obtenerDatosArqueoCaja = async () => {
    try {
      const res = await generarArqueoCaja(localStorage.getItem("deviceID"));
      console.log("Respuesta de consulta de arqueo de caja:", res.data);
      if (res.status === 200) {
        setResumenCaja(res.data);
        return;
      } else {
        notification.error({
          message: "Error al obtener datos de arqueo de caja",
          description: res.data.message || "Intente nuevamente",
        });
      }
    } catch (error) {
      console.error("Error al obtener datos de arqueo de caja:", error);
      notification.error({
        message: "Error al obtener datos de arqueo de caja",
        description: error.response?.data?.message || "Intente nuevamente",
      });
    }
  };
  const abrirModalArqueoCaja = () => {
    const exito = obtenerDatosArqueoCaja();
    if (exito) {
      setModalArqueoCaja(true);
    }
  };

  const cerrarModalArqueoCaja = () => {
    setModalArqueoCaja(false);

    setTimeout(() => {
      formArqueoCaja.resetFields();
      setCantidades({});
    }, 200);
  };

  const resumen = resumenCaja?.resumenVentas || {
    totalEfectivo: 0,
    totalDebito: 0,
    totalCredito: 0,
    totalGeneral: 0,
  };

  const registroActual = resumenCaja?.registrosCaja?.[0];
  const totalTarjetas = resumen.totalDebito + resumen.totalCredito;
  const diferenciaEfectivo = totalApertura - resumen.totalEfectivo;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background:
          "linear-gradient(180deg, #f5f7fb 0%, #f8fafc 45%, #eef2f7 100%)",
      }}
    >
      {/*Columna Lateral Izquierda */}
      <div
        style={{
          width: 260,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <Card
          style={{
            margin: "1vh",
            height: "calc(100vh - 2vh)",
            borderRadius: 12,
            header: { borderBottom: "none", paddingBottom: 0 },
          }}
          bodyStyle={{
            display: "flex",
            flexDirection: "column",
            padding: 0,
            height: "100%",
          }}
        >
          {/**Información del usuario */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              margin: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar
                size={44}
                style={{
                  backgroundColor: "#1890ff",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {user?.nombre ? user.nombre.charAt(0).toUpperCase() : "U"}
              </Avatar>
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    fontWeight: 500,
                    fontSize: 14,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.nombre || "Usuario"}
                </div>
                <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                  {user?.cargo || "Cajero"}
                </div>
              </div>
            </div>
          </div>
          {/**Menú de navegación */}
          <div style={{ flex: 1, overflow: "auto" }}>
            <Menu
              mode="inline"
              style={{ border: 0, paddingTop: 8 }}
              items={[
                {
                  key: "1",
                  icon: <UnlockOutlined />,
                  label: "Apertura de caja",
                  disabled: !cajaNoRegistrada || cajaAperturada,
                  onClick: () => setModalAperturaCaja(true),
                },
                {
                  key: "4",
                  icon: <AccountBookOutlined />,
                  label: "Arqueo de caja",
                  disabled: !cajaNoRegistrada || !cajaAperturada,
                  onClick: () => abrirModalArqueoCaja(),
                },
                {
                  key: "2",
                  icon: <AuditOutlined />,
                  disabled: !cajaNoRegistrada || !cajaAperturada,
                  onClick: () => setModalCierreCaja(true),
                  label: "Cierre de Caja",
                },
                {
                  key: "3",
                  icon: <HistoryOutlined />,
                  disabled: !cajaNoRegistrada || !cajaAperturada,
                  onClick: abrirModalVentasDelDia,
                  label: "Historial Ventas Hoy",
                },
              ]}
            />
          </div>

          <div
            style={{ padding: "12px 16px", borderTop: "0.5px solid #f0f0f0" }}
          >
            <Button
              block
              danger
              icon={<LogoutOutlined />}
              onClick={() => logout()}
            >
              Cerrar sesión
            </Button>
          </div>
        </Card>
      </div>
      {/*Columna Principal  y lateral Izquierdo*/}
      <div
        style={{
          flex: 1,
          display: "flex",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <Card
          style={{
            width: "100%",
            height: "calc(100vh - 2vh)",
            margin: "1vh",
            display: "flex",
            flexDirection: "column",
            borderRadius: 16,
            boxShadow: "0 18px 48px rgba(15, 23, 42, 0.08)",
          }}
          bodyStyle={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            padding: 16,
            height: "100%",
          }}
        >
          <Row gutter={16} style={{ flex: 1, minHeight: 0 }}>
            <Col
              span={16}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                minHeight: 0,
              }}
            >
              {/**Tarjeta superior informacion */}
              <Card
                size="small"
                style={{ background: "#f8fafc", borderRadius: 12 }}
              >
                <Row
                  gutter={[16, 0]}
                  align="middle"
                  justify="space-between"
                  style={{ marginBottom: 12 }}
                >
                  <Col>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      Estado Caja
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {informacionCaja.estadoCaja || "-"}
                    </div>
                  </Col>
                  <Col>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      Máquina POS
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {informacionCaja.tipoMaquinaPOS || "-"}
                    </div>
                  </Col>
                  <Col>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      NCC POS
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {informacionCaja.idPOS || "-"}
                    </div>
                  </Col>
                  <Col>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      Estado Caja MP
                    </div>
                    <div style={{ marginTop: "4px" }}>
                      {informacionCaja.estadoPoint === true ? (
                        <Badge
                          className="latido-antd-verde"
                          status="success"
                          text={
                            <span style={{ fontWeight: 600, fontSize: 13 }}>
                              Activa
                            </span>
                          }
                        />
                      ) : informacionCaja.estadoPoint === false ? (
                        <Badge
                          className="latido-antd-rojo"
                          status="error"
                          text={
                            <span style={{ fontWeight: 600, fontSize: 13 }}>
                              Inactiva
                            </span>
                          }
                        />
                      ) : (
                        <span style={{ fontWeight: 600, fontSize: 13 }}>-</span>
                      )}
                    </div>
                  </Col>
                </Row>

                <Row gutter={[16, 0]} align="middle" justify="space-between">
                  <Col>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      Sucursal
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {informacionCaja.nombreSucursal || "-"}
                    </div>
                  </Col>
                  <Col>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Caja</div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {informacionCaja.numeroCaja || "Caja 01"}
                    </div>
                  </Col>
                  <Col>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Cajero</div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {informacionCaja.nombreCajero || "Cajero"}
                    </div>
                  </Col>

                  <Col>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Fecha</div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{fecha}</div>
                  </Col>
                  <Col>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Hora</div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{hora}</div>
                  </Col>
                </Row>
              </Card>
              {/**Tabla de productos agregados */}
              <Card
                title={
                  <Space>
                    <ShoppingCartOutlined />
                    Productos agregados
                  </Space>
                }
                extra={<Tag color="blue">{productos.length} ítems</Tag>}
                style={{ borderRadius: 14, flex: 1, minHeight: 0 }}
                bodyStyle={{ height: "100%", padding: 0 }}
              >
                <div style={{ height: "100%", overflow: "auto" }}>
                  <Table
                    size="middle"
                    pagination={false}
                    dataSource={filasParaTabla}
                    rowKey={(record) =>
                      `${record.idProducto}-${record.codigo}-${record.cantidad}`
                    }
                    locale={{ emptyText: "Sin productos agregados" }}
                    columns={[
                      {
                        title: "Código",
                        dataIndex: "codigo",
                        key: "codigo",
                        width: 120,
                      },
                      {
                        title: "Producto",
                        dataIndex: "nombre",
                        key: "nombre",
                        render: (nombre, record) => (
                          <Typography.Text
                            // Si es descuento, se pone rojo y cursiva. Si es producto, negrita.
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
                        width: 90,
                        align: "center",
                      },
                      {
                        title: "Precio",
                        dataIndex: "precio",
                        key: "precio",
                        width: 110,
                        align: "right",
                        render: (valor, record) =>
                          // Ocultamos el precio unitario en la fila del descuento
                          record.esFilaDescuento || !valor
                            ? ""
                            : `$${Number(valor).toLocaleString("es-CL")}`,
                      },
                      {
                        title: "Subtotal",
                        key: "subtotal",
                        width: 120,
                        align: "right",
                        render: (_, record) => {
                          const valor = record.subtotalVisual;
                          const esNegativo = valor < 0;
                          return (
                            <Typography.Text
                              type={esNegativo ? "danger" : undefined}
                            >
                              {esNegativo ? "-" : ""}$
                              {Math.abs(valor).toLocaleString("es-CL")}
                            </Typography.Text>
                          );
                        },
                      },
                      {
                        title: "",
                        key: "acciones",
                        width: 56,
                        align: "center",
                        render: (_, registro) => {
                          if (registro.esFilaDescuento) return null;

                          return (
                            <Button
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() =>
                                eliminarProducto(registro.idProducto)
                              }
                            />
                          );
                        },
                      },
                    ]}
                  />
                </div>
              </Card>
              {/**Tarjeta de resumen venta*/}
              <Card
                size="small"
                style={{
                  borderRadius: 14,
                  background: "#f8fafc",
                  borderTop: "2px solid #1890ff",
                }}
                bodyStyle={{ padding: 16 }}
              >
                {/* Totales tipo tabla */}
                <Row justify="space-between" style={{ marginBottom: 6 }}>
                  <Col style={{ fontSize: 13, color: "#64748b" }}>
                    Total de productos
                  </Col>
                  <Col style={{ fontSize: 13, fontWeight: 600 }}>
                    {productos.length}
                  </Col>
                </Row>

                {totalDescuentos > 0 && (
                  <Row justify="space-between" style={{ marginBottom: 6 }}>
                    <Col style={{ fontSize: 13, color: "#64748b" }}>
                      Descuentos aplicados
                    </Col>
                    <Col
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#52c41a",
                      }}
                    >
                      -${Number(totalDescuentos).toLocaleString("es-CL")}
                    </Col>
                  </Row>
                )}
                <Row justify="space-between" style={{ marginBottom: 6 }}>
                  <Col style={{ fontSize: 13, color: "#64748b" }}>
                    Total neto
                  </Col>
                  <Col style={{ fontSize: 13, fontWeight: 600 }}>
                    ${Number(totalNeto).toLocaleString("es-CL")}
                  </Col>
                </Row>
                <Row justify="space-between" style={{ marginBottom: 6 }}>
                  <Col style={{ fontSize: 13, color: "#64748b" }}>
                    Impuesto (19%)
                  </Col>
                  <Col style={{ fontSize: 13, fontWeight: 600 }}>
                    ${Number(impuesto).toLocaleString("es-CL")}
                  </Col>
                </Row>
                <Divider style={{ margin: "10px 0" }} />
                <Row justify="space-between" style={{ marginBottom: 16 }}>
                  <Col
                    style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}
                  >
                    Total
                  </Col>
                  <Col
                    style={{ fontSize: 15, fontWeight: 700, color: "#1890ff" }}
                  >
                    ${Number(total).toLocaleString("es-CL")}
                  </Col>
                </Row>

                <Row gutter={8}>
                  <Col span={12}>
                    <Button
                      block
                      danger
                      icon={<DeleteOutlined />}
                      onClick={limpiarVenta}
                    >
                      Limpiar
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      block
                      type="primary"
                      icon={<CheckOutlined />}
                      disabled={
                        productos.length === 0 || total < 100 || total > 8000000
                      }
                      onClick={confirmarVenta}
                    >
                      Cobrar
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col span={8} style={{ display: "flex", minHeight: 0 }}>
              {/**Tarjeta lateral derecha con acciones y informacion productos */}
              <Card
                title={
                  <Space>
                    <BarcodeOutlined />
                    Ingreso de código
                  </Space>
                }
                style={{ borderRadius: 14, width: "100%" }}
              >
                {/**Input para ingresar el código del producto (Agregar Form) */}
                <Form
                  form={formVentaProducto}
                  layout="vertical"
                  onFinish={agregarProductoCodigo}
                >
                  <Row gutter={8} align="bottom" gutter={[8, 16]}>
                    <Col flex="auto">
                      <Form.Item
                        name="codigo"
                        label="Código"
                        style={{ marginBottom: 0 }}
                      >
                        <Input
                          //value={codigoProducto}
                          //   onChange={(e) => setCodigoProducto(e.target.value)}
                          //   onPressEnter={agregarProducto}
                          disabled={!cajaNoRegistrada || !cajaAperturada}
                          ref={inputRef}
                          placeholder="Escribe o escanea el código"
                          prefix={<BarcodeOutlined />}
                          allowClear
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    <Col flex="auto">
                      <Form.Item
                        name="cantidad"
                        label="Cantidad"
                        style={{ marginBottom: 0 }}
                        initialValue={1}
                      >
                        <InputNumber
                          min={0.01}
                          step={0.01}
                          precision={3}
                          //value={cantidadProducto}
                          //onChange={(valor) => setCantidadProducto(valor || 1)}
                          style={{ width: "100%" }}
                          size="large"
                          disabled={!cajaNoRegistrada || !cajaAperturada}
                        />
                      </Form.Item>
                    </Col>
                    <Col flex="auto">
                      <Form.Item style={{ marginBottom: 0 }}>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          htmlType="submit"
                          size="large"
                          disabled={!cajaNoRegistrada || !cajaAperturada}
                        >
                          Agregar
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row style={{ marginTop: 16 }}>
                    <Col span={24}>
                      <Button
                        block
                        icon={<ShopOutlined />}
                        onClick={() => setModalBusquedaProducto(true)}
                        disabled={!cajaNoRegistrada || !cajaAperturada}
                      >
                        Buscar producto
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
      {/** Modal para seleccionar método de pago */}
      <Modal
        title="Seleccionar Método de Pago"
        open={modalMetodoPago}
        onCancel={() => {
          // if (Number(totalMetodoPagoActual) > 0) {
          //   notification.warning({
          //     message: "Pago pendiente",
          //     description:
          //       "No puede cerrar el modal hasta completar el total a pagar.",
          //   });
          //   return;
          // }
          // setTotalMetodoPagoActual(total);
          // formMetodoPago.setFieldsValue({ totalMetodoPago: 0 });
          setModalMetodoPago(false);
        }}
        footer={null}
        maskClosable={false}
        centered
        width={500}
      >
        {/* gutter={[espacioHorizontal, espacioVertical]} */}
        <Spin spinning={esperandoPago} tip="Procesando pago..." fullScreen>
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              backgroundColor: "#f0f0f0",
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            <InfoCircleOutlined style={{ color: "#1890ff", marginRight: 8 }} />
            Ingrese el monto entregado por el cliente para el método de pago
            seleccionado.
          </div>
          <Row gutter={[16, 16]} justify="center" style={{ marginTop: "20px" }}>
            <Form
              form={formMetodoPago}
              layout="vertical"
              style={{ width: "100%" }}
            >
              <Row justify="center" gutter={16} style={{ marginBottom: 10 }}>
                <Col>
                  <Form.Item style={{ marginBottom: 0 }} label="Total Venta">
                    <Input
                      value={`$${Number(total).toLocaleString("es-CL")}`}
                      disabled
                      style={{ fontSize: 16, fontWeight: 600 }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16} style={{ margin: 3 }}>
                <Col span={12}>
                  <Form.Item label="Total a pagar">
                    <Input
                      value={`$${Number(totalMetodoPagoActual).toLocaleString("es-CL")}`}
                      disabled
                      style={{ fontSize: 16, fontWeight: 600 }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Monto A Pagar"
                    name="montoPago"
                    initialValue={0}
                    rules={[
                      {
                        required: true,
                        message: "Ingrese el monto a pagar",
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      size="large"
                      placeholder="Ingrese el monto a pagar"
                      formatter={(value) =>
                        value
                          ? `$ ${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
                          : ""
                      }
                      parser={(value) =>
                        value ? value.replace(/\$\s?|\./g, "") : ""
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Row>
          <Card
            size="small"
            title="Historial de Pagos"
            style={{ marginBottom: 16 }}
          >
            {infoPagosDiferidos && infoPagosDiferidos.length > 0 ? (
              infoPagosDiferidos.map((pago, index) => (
                <Row
                  justify="space-between"
                  key={index}
                  style={{ marginBottom: 4 }}
                >
                  <Col style={{ color: "#595959" }}>{pago.metodo}</Col>
                  <Col style={{ fontWeight: 500 }}>
                    ${pago.montoPagado.toLocaleString("es-CL")}
                  </Col>
                </Row>
              ))
            ) : (
              <div style={{ color: "#bfbfbf", textAlign: "center" }}>
                No hay pagos registrados aún
              </div>
            )}
          </Card>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Button
                block
                icon={<DollarOutlined />}
                size="large"
                style={estiloBoton}
                onClick={() => confirmarPago("Efectivo")}
              >
                Efectivo
              </Button>
            </Col>

            <Col xs={24} sm={12}>
              <Button
                block
                icon={<CreditCardOutlined />}
                size="large"
                style={estiloBoton}
                onClick={() => confirmarPago("Tarjeta Debito")}
              >
                Tarjeta Debito
              </Button>
            </Col>

            <Col xs={24} sm={12}>
              <Button
                block
                icon={<CreditCardOutlined />}
                size="large"
                style={estiloBoton}
                onClick={() => confirmarPago("Tarjeta Credito")}
              >
                Tarjeta Crédito
              </Button>
            </Col>

            <Col xs={24} sm={12}>
              <Button
                block
                icon={<IdcardOutlined />}
                size="large"
                style={estiloBoton}
                onClick={() => confirmarPago("Funcionario")}
                disabled={true}
              >
                Funcionario
              </Button>
            </Col>

            {/* Este botón lo centramos usando un offset o dejándolo ocupar el ancho total si prefieres */}
            <Col xs={24} sm={24}>
              <Button
                block
                icon={<ClockCircleOutlined />}
                size="large"
                disabled={true}
                style={{
                  ...estiloBoton,
                  borderColor: "#d9d9d9",
                  backgroundColor: "#fafafa",
                }} // Un estilo sutilmente distinto
                onClick={() => confirmarPago("Fiado")}
              >
                Fiado
              </Button>
            </Col>
          </Row>
        </Spin>
      </Modal>
      {/** Modal Apertura de Caja */}
      <Modal
        title={
          <Space>
            <UnlockOutlined style={{ color: "#1890ff" }} />
            Apertura de Caja
          </Space>
        }
        open={modalAperturaCaja}
        onCancel={() => setModalAperturaCaja(false)}
        centered
        width={480}
        footer={[
          <Button key="cancelar" onClick={() => setModalAperturaCaja(false)}>
            Cancelar
          </Button>,
          <Button
            key="confirmar"
            type="primary"
            icon={<UnlockOutlined />}
            disabled={totalApertura == 0}
            onClick={() => formAperturaCaja.submit()}
          >
            Confirmar apertura
          </Button>,
        ]}
      >
        <Form
          form={formAperturaCaja}
          layout="horizontal"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={confirmarAperturaCaja}
        >
          {/* Billetes */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "rgba(0,0,0,0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
            }}
          >
            Billetes
          </div>
          {denominaciones
            .filter((d) => d.valor >= 1000)
            .map((d) => (
              <Form.Item
                key={d.name}
                label={d.label}
                name={d.name}
                initialValue={0}
                style={{ marginBottom: 8 }}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter={
                    <span
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                        minWidth: 80,
                        display: "inline-block",
                        textAlign: "right",
                      }}
                    >
                      = $
                      {((cantidades[d.name] || 0) * d.valor).toLocaleString(
                        "es-CL",
                      )}
                    </span>
                  }
                  onChange={(val) =>
                    setCantidades((prev) => ({ ...prev, [d.name]: val || 0 }))
                  }
                />
              </Form.Item>
            ))}

          <Divider style={{ margin: "12px 0" }} />

          {/* Monedas */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "rgba(0,0,0,0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
            }}
          >
            Monedas
          </div>
          {denominaciones
            .filter((d) => d.valor < 1000)
            .map((d) => (
              <Form.Item
                key={d.name}
                label={d.label}
                name={d.name}
                initialValue={0}
                style={{ marginBottom: 8 }}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter={
                    <span
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                        minWidth: 80,
                        display: "inline-block",
                        textAlign: "right",
                      }}
                    >
                      = $
                      {((cantidades[d.name] || 0) * d.valor).toLocaleString(
                        "es-CL",
                      )}
                    </span>
                  }
                  onChange={(val) =>
                    setCantidades((prev) => ({ ...prev, [d.name]: val || 0 }))
                  }
                />
              </Form.Item>
            ))}

          <Divider style={{ margin: "12px 0" }} />

          {/* Total */}
          <div
            style={{
              background: "#f0f7ff",
              borderRadius: 8,
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 500, fontSize: 14 }}>
              Total a declarar
            </span>
            <span style={{ fontWeight: 700, fontSize: 22, color: "#1890ff" }}>
              ${totalApertura.toLocaleString("es-CL")}
            </span>
          </div>
        </Form>
      </Modal>
      {/**Modal de registro de caja */}
      <Modal
        title={
          <Space>
            <ShopOutlined style={{ color: "#1890ff" }} />
            Registro de Caja
          </Space>
        }
        open={modalRegistroCaja}
        //onCancel={() => logout()}
        width={520}
        centered
        footer={[
          <Button key="cancelar" onClick={() => logout()}>
            Cerrar sesión
          </Button>,
          user.nombreRol === "Administrador" && (
            <Button
              key="guardar"
              type="primary"
              onClick={() => formRegistroCaja.submit()}
            >
              Registrar caja
            </Button>
          ),
        ].filter(Boolean)}
      >
        {user.nombreRol === "Administrador" ? (
          <Form
            form={formRegistroCaja}
            layout="vertical"
            onFinish={confirmarRegistroCaja}
          >
            <Divider
              orientation="left"
              style={{ fontSize: 12, color: "#64748b" }}
            >
              Datos del equipo
            </Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Número de caja"
                  name="numeroCaja"
                  rules={[
                    { required: true, message: "Ingrese el número de caja" },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={1}
                    placeholder="Ej: 1"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Código PC"
                  name="idPC"
                  rules={[
                    { required: true, message: "Ingrese el código del PC" },
                  ]}
                >
                  <Input placeholder="Ej: PC-001" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Descripción del equipo"
              name="descripcionPC"
              rules={[
                {
                  required: true,
                  message: "Ingrese una descripción del equipo",
                },
              ]}
            >
              <Input placeholder="Ej: PC escritorio sala de ventas" />
            </Form.Item>

            <Form.Item
              label="Sucursal"
              name="idSucursal"
              rules={[{ required: true, message: "Seleccione una sucursal" }]}
            >
              <Select placeholder="Selecciona una sucursal">
                {sucursales.map((sucursal) => (
                  <Select.Option
                    key={sucursal.idSucursal}
                    value={sucursal.idSucursal}
                  >
                    {sucursal.nombre}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Divider
              orientation="left"
              style={{ fontSize: 12, color: "#64748b" }}
            >
              Terminal POS
            </Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="N° NCC Mercado Pago"
                  name="idPOS"
                  rules={[{ required: true, message: "Ingrese el número NCC" }]}
                  getValueFromEvent={(e) => "N950" + e.target.value}
                  getValueProps={(value) => ({
                    value: value?.replace(/^N950/, "") ?? "",
                  })}
                >
                  <Input placeholder="Ej: NCC-123456" addonBefore="N950" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Tipo de terminal"
                  name="tipoMaquinaPOS"
                  rules={[
                    {
                      required: true,
                      message: "Seleccione el tipo de terminal",
                    },
                  ]}
                >
                  <Select placeholder="Selecciona tipo">
                    <Select.Option value="Point Smart">
                      Point Smart
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Descripción adicional POS"
              name="descripcionPOS"
              rules={[
                {
                  required: true,
                  message: "Ingrese una descripción para el POS",
                },
              ]}
            >
              <Input.TextArea
                rows={2}
                placeholder="Información adicional del terminal"
              />
            </Form.Item>
          </Form>
        ) : (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <LockOutlined
              style={{ fontSize: 40, color: "#faad14", marginBottom: 16 }}
            />
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
              Acceso restringido
            </div>
            <div style={{ color: "#64748b", fontSize: 13 }}>
              Por favor contacte a un administrador para habilitar la caja para
              su uso.
            </div>
          </div>
        )}
      </Modal>
      {/**Modal de cierre de caja */}
      <Modal
        title={
          <Space>
            <AuditOutlined style={{ color: "#1890ff" }} />
            Cierre de Caja
          </Space>
        }
        open={modalCierreCaja}
        onCancel={() => setModalCierreCaja(false)}
        width={480}
        centered
        footer={[
          <Button key="cancelar" onClick={() => setModalCierreCaja(false)}>
            Cancelar
          </Button>,
          <Button
            key="confirmar"
            type="primary"
            icon={<AuditOutlined />}
            onClick={() => confirmarCierreCaja()}
          >
            Confirmar cierre
          </Button>,
        ]}
      >
        {/* --- INICIO DEL RESUMEN DE VENTAS --- */}
        <div
          style={{
            background: "#fafafa",
            border: "1px solid #f0f0f0",
            borderRadius: 8,
            padding: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(0,0,0,0.45)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 12,
            }}
          >
            Resumen del Turno
          </div>

          <Row gutter={[16, 8]}>
            <Col span={14}>
              <span style={{ color: "#595959" }}>Fondo de apertura:</span>
            </Col>
            <Col span={10} style={{ textAlign: "right", fontWeight: 500 }}>
              ${datosResumen.montoApertura.toLocaleString("es-CL")}
            </Col>

            <Col span={14}>
              <span style={{ color: "#595959" }}>Ventas en Efectivo:</span>
            </Col>
            <Col
              span={10}
              style={{ textAlign: "right", color: "#389e0d", fontWeight: 500 }}
            >
              + ${datosResumen.ventasEfectivo.toLocaleString("es-CL")}
            </Col>

            <Col span={14}>
              <span style={{ color: "#595959" }}>Retiros manuales:</span>
            </Col>
            <Col
              span={10}
              style={{ textAlign: "right", color: "#cf1322", fontWeight: 500 }}
            >
              - ${datosResumen.retiros.toLocaleString("es-CL")}
            </Col>
          </Row>

          <Divider style={{ margin: "12px 0" }} dashed />

          <Row>
            <Col span={14}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>
                Efectivo Esperado:
              </span>
            </Col>
            <Col
              span={10}
              style={{
                textAlign: "right",
                fontWeight: 700,
                fontSize: 14,
                color: "#1890ff",
              }}
            >
              ${datosResumen.efectivoEsperado.toLocaleString("es-CL")}
            </Col>
          </Row>

          {/* Opcional: Mostrar ventas digitales separadas del efectivo */}
          <div
            style={{
              marginTop: 12,
              fontSize: 12,
              color: "#8c8c8c",
              textAlign: "right",
            }}
          >
            *Ventas con tarjeta/otros: $
            {datosResumen.ventasTarjeta.toLocaleString("es-CL")}
          </div>
        </div>
        {/* --- FIN DEL RESUMEN DE VENTAS --- */}
        <Form
          form={formCierreCaja}
          layout="horizontal"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={confirmarCierreCaja}
        >
          {/* Billetes */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "rgba(0,0,0,0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
            }}
          >
            Billetes
          </div>
          {denominaciones
            .filter((d) => d.valor >= 1000)
            .map((d) => (
              <Form.Item
                key={d.name}
                label={d.label}
                name={d.name}
                initialValue={0}
                style={{ marginBottom: 8 }}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter={
                    <span
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                        minWidth: 80,
                        display: "inline-block",
                        textAlign: "right",
                      }}
                    >
                      = $
                      {((cantidades[d.name] || 0) * d.valor).toLocaleString(
                        "es-CL",
                      )}
                    </span>
                  }
                  onChange={(val) =>
                    setCantidades((prev) => ({ ...prev, [d.name]: val || 0 }))
                  }
                />
              </Form.Item>
            ))}

          <Divider style={{ margin: "12px 0" }} />

          {/* Monedas */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "rgba(0,0,0,0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
            }}
          >
            Monedas
          </div>
          {denominaciones
            .filter((d) => d.valor < 1000)
            .map((d) => (
              <Form.Item
                key={d.name}
                label={d.label}
                name={d.name}
                initialValue={0}
                style={{ marginBottom: 8 }}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter={
                    <span
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                        minWidth: 80,
                        display: "inline-block",
                        textAlign: "right",
                      }}
                    >
                      = $
                      {((cantidades[d.name] || 0) * d.valor).toLocaleString(
                        "es-CL",
                      )}
                    </span>
                  }
                  onChange={(val) =>
                    setCantidades((prev) => ({ ...prev, [d.name]: val || 0 }))
                  }
                />
              </Form.Item>
            ))}

          <Divider style={{ margin: "12px 0" }} />

          <Form.Item
            label="Observaciones"
            name="observacionesCierre"
            wrapperCol={{ span: 24 }}
          >
            <Input.TextArea
              rows={3}
              placeholder="Ingrese cualquier observación relevante para el cierre de caja"
            />
          </Form.Item>
          {/* Total */}
          <div
            style={{
              background: "#f0f7ff",
              borderRadius: 8,
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 500, fontSize: 14 }}>
              Total a declarar
            </span>
            <span style={{ fontWeight: 700, fontSize: 22, color: "#1890ff" }}>
              ${totalCierre.toLocaleString("es-CL")}
            </span>
          </div>
        </Form>
      </Modal>
      {/** Modal de búsqueda de productos */}

      <Modal
        title={
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            Búsqueda de Productos
          </span>
        }
        open={modalBusquedaProducto} // 👈 'visible' está deprecado en las nuevas versiones de Antd
        onCancel={() => setModalBusquedaProducto(false)}
        footer={null}
        centered
        width={650} // Un poco más ancho para que respiren los elementos
        styles={{ body: { padding: "20px 0px" } }} // Quitamos padding lateral para que la lista use todo el ancho
      >
        <div style={{ padding: "0 24px" }}>
          <Input
            prefix={
              <SearchOutlined style={{ color: "#bfbfbf", fontSize: 16 }} />
            }
            placeholder="Buscar por nombre, código o marca..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            allowClear
            autoFocus
            size="large"
            style={{ marginBottom: 20, borderRadius: 8 }}
          />
        </div>

        <List
          itemLayout="horizontal"
          dataSource={productosFiltrados}
          locale={{ emptyText: "No se encontraron productos con ese término" }}
          style={{ maxHeight: "450px", overflowY: "auto", padding: "0 24px" }}
          renderItem={(producto) => {
            // Evaluamos de forma segura si el objeto de búsqueda trae algún indicio de descuento
            const tieneDescuento =
              producto.descuentosobres?.length > 0 ||
              producto.categoria?.descuentosobres?.length > 0;

            return (
              <List.Item
                style={{
                  padding: "16px",
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  border: "1px solid #f0f0f0",
                  transition: "all 0.2s", // Animación suave al pasar el mouse
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#1890ff";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#f0f0f0";
                  e.currentTarget.style.boxShadow = "none";
                }}
                actions={[
                  <Button
                    type="primary"
                    shape="round" // Botón redondeado se ve más moderno
                    icon={<PlusOutlined />}
                    onClick={() => handleSeleccionarProducto(producto)}
                  >
                    Agregar
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space size="small" wrap>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: "15px",
                          color: "#1f2937",
                        }}
                      >
                        {producto.nombre}
                      </span>
                      {producto.marca && producto.marca !== "N/A" && (
                        <Tag color="default" bordered={false}>
                          {producto.marca}
                        </Tag>
                      )}
                      {/* 🚀 Etiqueta visual si hay un descuento detectado */}
                      {tieneDescuento && (
                        <Tag color="red" style={{ fontWeight: 600 }}>
                          🔥 Oferta
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    <span style={{ color: "#6b7280", fontSize: "13px" }}>
                      Cód: {producto.codigo}
                    </span>
                  }
                />

                <div style={{ textAlign: "right", marginRight: 16 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "#111827",
                      fontSize: "16px",
                    }}
                  >
                    $
                    {Number(
                      producto.precioVenta ?? producto.precio ?? 0,
                    ).toLocaleString("es-CL")}
                  </div>
                  {tieneDescuento && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#ef4444",
                        fontWeight: 500,
                      }}
                    >
                      Se calculará al agregar
                    </div>
                  )}
                </div>
              </List.Item>
            );
          }}
        />
      </Modal>
      {/** Modal ventas del día */}
      <Modal
        title={
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            Ventas del día
          </span>
        }
        open={modalVentasDia}
        onCancel={cerrarModalVentasDelDia}
        footer={null}
        centered
        width={700}
        styles={{ body: { padding: "24px 0 0 0" } }} // Limpiamos padding para que la tabla ocupe todo
      >
        <div style={{ padding: "0 24px 24px 24px" }}>
          {hayVentas ? (
            <>
              <Table
                dataSource={ventasDelDia}
                columns={columnasVentasDia}
                rowKey="idVentaCliente"
                pagination={{ pageSize: 6 }} // Pagina para que el modal no crezca infinitamente
                size="middle"
                expandable={{
                  expandedRowRender: (record) => {
                    if (
                      !record.detalleventa ||
                      record.detalleventa.length === 0
                    ) {
                      return (
                        <Typography.Text type="secondary" italic>
                          No hay detalles de productos para esta venta.
                        </Typography.Text>
                      );
                    }

                    return (
                      <Table
                        columns={columnasDetalle}
                        dataSource={record.detalleventa}
                        rowKey="idDetalleVenta"
                        pagination={false}
                        size="small"
                        style={{ margin: "10px 20px" }}
                      />
                    );
                  },
                }}
              />

              <Divider style={{ margin: "16px 0" }} />

              <Row justify="space-between" align="middle">
                <Col>
                  <Typography.Text type="secondary">
                    Total transacciones: {ventasDelDia.length}
                  </Typography.Text>
                </Col>
                <Col>
                  <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>
                    Recaudación Total:{" "}
                    <span style={{ color: "#1890ff" }}>
                      ${sumaTotalDia.toLocaleString("es-CL")}
                    </span>
                  </Typography.Text>
                </Col>
              </Row>
            </>
          ) : (
            <div style={{ padding: "40px 0" }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Typography.Text type="secondary" style={{ fontSize: 16 }}>
                    {/* Leemos el mensaje del backend o ponemos uno por defecto */}
                    {ventasDelDia?.message ||
                      "No hay ventas registradas para hoy en esta caja"}
                  </Typography.Text>
                }
              />
            </div>
          )}
        </div>
      </Modal>
      {/** Modal arqueo de caja */}
      <Modal
        title={
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            Arqueo y Cierre de Caja
          </span>
        }
        open={modalArqueoCaja}
        onCancel={cerrarModalArqueoCaja}
        footer={null} // Ocultamos el footer por defecto para usar el botón del Form
        centered
        width={750}
        styles={{ body: { padding: "0" } }} // Body sin padding para dividir visualmente
      >
        {/* ==========================================
          SECCIÓN 1: LO QUE DICE EL SISTEMA (BACKEND)
          ========================================== */}
        <div
          style={{
            padding: "24px 24px 16px 24px",
            backgroundColor: "#f8fafc",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: 16 }}
          >
            <Col>
              <Typography.Text
                type="secondary"
                style={{
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {resumenCaja?.nombreSucursal || "Sucursal"} • Caja{" "}
                {resumenCaja?.numeroCaja || "-"}
              </Typography.Text>
              <div style={{ marginTop: 4 }}>
                <Typography.Text strong>
                  Apertura:{" "}
                  {registroActual?.fechaApertura
                    ? new Date(registroActual.fechaApertura).toLocaleTimeString(
                        "es-CL",
                        { hour: "2-digit", minute: "2-digit" },
                      )
                    : "N/A"}
                </Typography.Text>
                <Tag color="green" style={{ marginLeft: 8, border: 0 }}>
                  {registroActual?.estadoRegistroCaja || "Abierta"}
                </Tag>
              </div>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={8}>
              <Card
                size="small"
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
              >
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  <DollarOutlined style={{ marginRight: 4 }} />
                  Efectivo Esperado
                </Typography.Text>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#0f172a",
                    marginTop: 4,
                  }}
                >
                  ${resumen.totalEfectivo.toLocaleString("es-CL")}
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card
                size="small"
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
              >
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  <CreditCardOutlined style={{ marginRight: 4 }} />
                  Transbank / Tarjetas
                </Typography.Text>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#0f172a",
                    marginTop: 4,
                  }}
                >
                  ${totalTarjetas.toLocaleString("es-CL")}
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card
                size="small"
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
              >
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Total Sistema
                </Typography.Text>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#1890ff",
                    marginTop: 4,
                  }}
                >
                  ${resumen.totalGeneral.toLocaleString("es-CL")}
                </div>
              </Card>
            </Col>
          </Row>

          <div style={{ marginTop: 12 }}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              <InfoCircleOutlined style={{ marginRight: 4 }} />
              Ingresa el detalle del efectivo físico encontrado en la gaveta
              para cuadrar la caja.
            </Typography.Text>
          </div>
        </div>

        {/* ==========================================
          SECCIÓN 2: FORMULARIO DE CONTEO FÍSICO
          ========================================== */}
        <div style={{ padding: "20px 24px" }}>
          <Form
            form={formAperturaCaja}
            layout="horizontal"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            onFinish={confirmarAperturaCaja}
          >
            {/* --- Billetes --- */}
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "rgba(0,0,0,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 12,
              }}
            >
              Billetes en Gaveta
            </div>
            {denominaciones
              .filter((d) => d.valor >= 1000)
              .map((d) => (
                <Form.Item
                  key={d.name}
                  label={d.label}
                  name={d.name}
                  initialValue={0}
                  style={{ marginBottom: 8 }}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    addonAfter={
                      <span
                        style={{
                          fontSize: 12,
                          color: "#64748b",
                          minWidth: 80,
                          display: "inline-block",
                          textAlign: "right",
                        }}
                      >
                        = $
                        {((cantidades[d.name] || 0) * d.valor).toLocaleString(
                          "es-CL",
                        )}
                      </span>
                    }
                    onChange={(val) =>
                      setCantidades((prev) => ({ ...prev, [d.name]: val || 0 }))
                    }
                  />
                </Form.Item>
              ))}

            <Divider style={{ margin: "16px 0" }} />

            {/* --- Monedas --- */}
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "rgba(0,0,0,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 12,
              }}
            >
              Monedas en Gaveta
            </div>
            {denominaciones
              .filter((d) => d.valor < 1000)
              .map((d) => (
                <Form.Item
                  key={d.name}
                  label={d.label}
                  name={d.name}
                  initialValue={0}
                  style={{ marginBottom: 8 }}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    addonAfter={
                      <span
                        style={{
                          fontSize: 12,
                          color: "#64748b",
                          minWidth: 80,
                          display: "inline-block",
                          textAlign: "right",
                        }}
                      >
                        = $
                        {((cantidades[d.name] || 0) * d.valor).toLocaleString(
                          "es-CL",
                        )}
                      </span>
                    }
                    onChange={(val) =>
                      setCantidades((prev) => ({ ...prev, [d.name]: val || 0 }))
                    }
                  />
                </Form.Item>
              ))}

            <Divider style={{ margin: "16px 0" }} />

            {/* --- Resultado Dinámico y Botón --- */}
            <div
              style={{
                background:
                  diferenciaEfectivo === 0
                    ? "#f6ffed"
                    : diferenciaEfectivo < 0
                      ? "#fff2f0"
                      : "#e6f7ff",
                border: `1px solid ${
                  diferenciaEfectivo === 0
                    ? "#b7eb8f"
                    : diferenciaEfectivo < 0
                      ? "#ffccc7"
                      : "#91caff"
                }`,
                borderRadius: 8,
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <Row
                justify="space-between"
                align="middle"
                style={{ marginBottom: 8 }}
              >
                <Col>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>
                    Efectivo Físico Declarado
                  </span>
                </Col>
                <Col>
                  <span style={{ fontWeight: 700, fontSize: 20 }}>
                    ${totalApertura.toLocaleString("es-CL")}
                  </span>
                </Col>
              </Row>

              <Row justify="space-between" align="middle">
                <Col>
                  <span style={{ fontSize: 13, color: "#64748b" }}>
                    Descuadre:
                  </span>
                </Col>
                <Col>
                  {diferenciaEfectivo === 0 ? (
                    <Tag color="success" style={{ margin: 0 }}>
                      ✓ Caja Cuadrada ($0)
                    </Tag>
                  ) : diferenciaEfectivo < 0 ? (
                    <Tag color="error" style={{ margin: 0 }}>
                      Faltante: -$
                      {Math.abs(diferenciaEfectivo).toLocaleString("es-CL")}
                    </Tag>
                  ) : (
                    <Tag color="processing" style={{ margin: 0 }}>
                      Sobrante: +${diferenciaEfectivo.toLocaleString("es-CL")}
                    </Tag>
                  )}
                </Col>
              </Row>
            </div>

            <Row justify="end">
              <Col>
                <Button
                  onClick={cerrarModalArqueoCaja}
                  style={{ marginRight: 8 }}
                >
                  Cancelar
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                >
                  Guardar Arqueo
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>
    </div>
  );
}
