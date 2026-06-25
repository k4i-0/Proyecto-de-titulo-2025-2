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
  Tabs,
  Statistic,
  Popconfirm,
} from "antd";
import React, { useEffect, useMemo, useState, useRef } from "react";

import { useAuth } from "../../context/AuthContext.jsx";

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
  ExclamationCircleOutlined,
  FileSearchOutlined,
  SettingOutlined,
  NumberOutlined,
  PercentageOutlined,
  SafetyCertificateOutlined,
  EyeOutlined,
  TagOutlined,
  InboxOutlined,
  UserAddOutlined,
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
  consultaCierreCajaPendiente,
  cierreCajaPendienteAdmin,
  guardarArqueoCaja,
  consultarVentasPendientesCaja,
  generarRetiroCaja,
  imprimirComprobanteVenta,
  imprimirComprobanteRetiro,
  consultarStockProductos,
  imprimirArqueoCaja,
  consultarSiSePuedeVenderProducto,
} from "../../services/ventas/ventas.service.js";

import {
  bloquearFuncionamientoCaja,
  desbloquearFuncionamientoCaja,
} from "../../services/ventas/caja.service.js";

import { inicioSesionCajaAlternativo } from "../../services/Auth.services.js";

import { buscarTodasSucursales } from "../../services/functions/Sucursales.js";
import { buscarTodosProductos } from "../../services/functions/Productos.js";

import { crearDescuentoUnico } from "../../services/ventas/descuento.service.js";

import { actualizarContraseñaCaja } from "../../services/Auth.services.js";

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
  { label: "$ 1", name: "d1", valor: 1 },
];

const datosResumen = {
  montoApertura: 0,
  ventasEfectivo: 0,
  retiros: 0,
  ventasTarjeta: 0,
  efectivoEsperado: 0,
};

const { Text, Title } = Typography;

export default function MenuPrincipalCaja() {
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
  const [modalCierreCajaAdmin, setModalCierreCajaAdmin] = useState(false);
  const [modalRetiros, setModalRetiros] = useState(false);
  const [infoCierreCajaAdmin, setInfoCierreCajaAdmin] = useState(null);
  const [modalBusquedaProducto, setModalBusquedaProducto] = useState(false);
  const [totalPendientePagar, setTotalPendientePagar] = useState(0);
  const [cantidades, setCantidades] = useState(
    Object.fromEntries(denominaciones.map((d) => [d.name, 0])),
  );
  const [cajaNoRegistrada, setCajaNoRegistrada] = useState(false);
  const [cajaAperturada, setCajaAperturada] = useState(false);
  const [informacionCaja, setInformacionCaja] = useState({});
  const [infoPagosDiferidos, setInfoPagosDiferidos] = useState([]);
  const [montoVuelto, setMontoVuelto] = useState(0);
  const [esperandoPago, setEsperandoPago] = useState(false);
  //const [idVentaTemporal, setIdVentaTemporal] = useState(null);

  const [modalVentasDia, setModalVentasDia] = useState(false);
  const [ventasDelDia, setVentasDelDia] = useState([]);

  const [resumenCaja, setResumenCaja] = useState(datosResumen);
  const [modalArqueoCaja, setModalArqueoCaja] = useState(false);

  const [mensajeLoading, setMensajeLoading] = useState("Procesando pago...");
  const [clavesSeleccionadas, setClavesSeleccionadas] = useState([]);

  const [modalDescuentoVisible, setModalDescuentoVisible] = useState(false);
  const [modalAutorizacionVisible, setModalAutorizacionVisible] =
    useState(false);
  const [modalConsultarStockVisible, setModalConsultarStockVisible] =
    useState(false);
  const [stockProducto, setStockProducto] = useState(null);

  const [modalNuevoUsuarioVisible, setModalNuevoUsuarioVisible] =
    useState(false);

  const [formDescuentoProducto] = Form.useForm();
  const [formAutorizacion] = Form.useForm();
  const [formVentaProducto] = Form.useForm();
  const [formAperturaCaja] = Form.useForm();
  const [formRegistroCaja] = Form.useForm();
  const [formCierreCaja] = Form.useForm();
  const [formMetodoPago] = Form.useForm();
  const [formArqueoCaja] = Form.useForm();
  const [formCierreCajaAdmin] = Form.useForm();
  const [formRecuperarVentaCaja] = Form.useForm();
  const [formRetiros] = Form.useForm();
  const [formConsultarStock] = Form.useForm();
  const [formNuevoUsuario] = Form.useForm();

  const inputRef = useRef(null);

  const fecha = ahora.toLocaleDateString("es-CL");
  const hora = ahora.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
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
          estadoCaja: datos.data.estadoCaja,
          estadoCierreDiaAnterior: datos.data.estadoCierreDiaAnterior,
          idPOS: datos.data.idPOS,
          tipoMaquinaPOS: datos.data.tipoMaquinaPOS,
          estadoPoint: datos.data.estadoPOS === "Operativo" ? true : false,
        });

        if (
          datos.data.estadoRegistroCaja == "Sin Apertura" ||
          datos.data.estadoRegistroCaja == "Cerrada"
        ) {
          setCajaAperturada(false);
        } else {
          setCajaAperturada(true);
        }

        await obtenerDatosMP(deviceID);

        setCajaNoRegistrada(false);
      } else {
        manejarCajaDesvinculada(datos.data.message);
      }
    } catch (error) {
      console.error("Error al consultar estado de caja:", error);
      // Atrapamos errores reales como 404 (Caja no encontrada) o 500
      manejarCajaDesvinculada(
        error.response?.data?.message ||
          "La caja no está configurada o no existe.",
      );
    }
  };

  const manejarCajaDesvinculada = (mensajeError) => {
    localStorage.removeItem("numeroCaja");
    localStorage.removeItem("idSucursal");
    localStorage.removeItem("idPOS");

    setCajaNoRegistrada(true);

    notification.warning({
      message: "Atención",
      description:
        mensajeError || "Por favor, registre esta caja para comenzar.",
    });
  };

  const obtenerDatosMP = async (deviceID) => {
    try {
      //console.log("Consultando estado de MP para deviceID:", deviceID);
      const respuesta = await consultarEstadoMP(deviceID);
      //console.log("Respuesta de consulta de estado de MP:", respuesta);
      if (respuesta.status === 200) {
        //console.log("Datos de estado de MP obtenidos:", respuesta.data);
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
    //console.log("Usuario actual:", user.esUsuarioNuevoCaja);
    if (user.esUsuarioNuevoCaja) {
      setModalNuevoUsuarioVisible(true);
    }

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

  //funciones para ingresar productos
  const agregarProductoCodigo = async () => {
    const codigo = formVentaProducto.getFieldValue("codigo");

    try {
      const respuesta = await buscarProductoVenta(codigo);
      //console.log("Respuesta de búsqueda de producto por código:", respuesta);
      if (respuesta.status === 200) {
        const producto = respuesta.data;
        if (
          Number(producto.precioVenta) <= 0 ||
          producto.precioVenta === null ||
          producto.precioVenta === undefined
        ) {
          notification.error({
            message: "Precio inválido",
            description: `El precio del producto ${producto.nombre} es inválido.`,
          });
          return;
        }
        const nuevaCantidad =
          Number(formVentaProducto.getFieldValue("cantidad")) || 1;

        setProductos((listaActual) => {
          const indiceExistente = listaActual.findIndex(
            (p) => p.idProducto === producto.id,
          );
          console.log("Indice existente:", indiceExistente);
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
            console.log(
              "Valor",
              Number(producto.precioVenta) * Number(cantidadTotal),
            );
            if (Number(producto.precioVenta) * Number(cantidadTotal) <= 0) {
              notification.error({
                message: "Precio inválido",
                description: `El precio del producto ${producto.nombre} es inválido.`,
              });
              return;
            }

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
            console.log(
              "Valor",
              Number(producto.precioVenta) * Number(nuevaCantidad),
            );
            if (Number(producto.precioVenta) * Number(nuevaCantidad) <= 0) {
              notification.error({
                message: "Precio inválido",
                description: `El precio del producto ${producto.nombre} es inválido.`,
              });
              return;
            }

            const nuevoProducto = {
              idProducto: producto.id,
              codigo: producto.codigo,
              nombre: producto.nombre,
              precio: producto.precioVenta,
              cantidad: nuevaCantidad,
              descuento: descuentoTotalLinea,
              descuentosAplicados: detalleDescuentosMultiplicados,
              subtotal:
                producto.precioVenta * nuevaCantidad - descuentoTotalLinea,
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
          message: respuesta.data.message || "Error",
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
  const totalDenominaciones = denominaciones.reduce(
    (acc, d) => acc + (cantidades[d.name] || 0) * d.valor,
    0,
  );

  const confirmarAperturaCaja = async () => {
    //console.log("Total apertura calculado:", totalDenominaciones);
    //console.log("Cantidades ingresadas:", cantidades);
    try {
      const response = await aperturaCaja(
        localStorage.getItem("deviceID"),
        informacionCaja.numeroCaja,
        informacionCaja.idSucursal,
        totalDenominaciones,
        cantidades,
      );
      console.log("Respuesta de apertura de caja:", response.data.message);
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
          description: response.data.message,
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
      console.log(
        "Respuesta de registro de caja en sucursal menu:",
        response.data,
      );
      if (response.status === 200) {
        localStorage.setItem("deviceID", response.data.deviceID);
        localStorage.setItem("numeroCaja", response.data.nuevaCajaId);
        localStorage.setItem("idSucursal", response.data.idSucursal);
        localStorage.setItem("nombreSucursal", response.data.nombreSucursal);
        notification.success({
          message: response.data.message || "Caja vinculada correctamente",
        });
        await obtenerDatosCaja(localStorage.getItem("deviceID"));
        formRegistroCaja.resetFields();
        setModalRegistroCaja(false);
        setCajaNoRegistrada(false);
        return;
      }
      notification.error({
        // Usamos el 'message' del backend como título principal
        message: response?.data?.message || response?.data?.error || "Error",
        duration: 5,
        // Usamos el 'detalle' del backend como la descripción larga
        //description: response?.data?.detalle || "No se pudo registrar la caja",
      });
    } catch (error) {
      const errorData = error.response?.data || error.data || {};

      console.log("E333rror al registrar la caja:", errorData);

      notification.error({
        message: errorData.message || "Error crítico al registrar la caja",
        description:
          errorData.detalle || "Hubo un problema de conexión con el servidor.",
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
        if (
          Number(producto.precioVenta) <= 0 ||
          producto.precioVenta === null ||
          producto.precioVenta === undefined
        ) {
          notification.error({
            message: "Precio inválido",
            description: `El precio del producto ${producto.nombre} es inválido.`,
          });
          return;
        }

        const nuevaCantidad =
          Number(formVentaProducto.getFieldValue("cantidad")) || 1;
        setProductos((listaActual) => {
          const indiceExistente = listaActual.findIndex(
            (p) => p.idProducto === producto.id,
          );
          console.log("Indice existente:", indiceExistente);
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
            console.log(
              "Valor",
              Number(producto.precioVenta) * Number(cantidadTotal),
            );
            if (Number(producto.precioVenta) * Number(cantidadTotal) <= 0) {
              notification.error({
                message: "Precio inválido",
                description: `El precio del producto ${producto.nombre} es inválido.`,
              });
              return;
            }

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
            console.log(
              "Valor",
              Number(producto.precioVenta) * Number(nuevaCantidad),
            );
            if (Number(producto.precioVenta) * Number(nuevaCantidad) <= 0) {
              notification.error({
                message: "Precio inválido",
                description: `El precio del producto ${producto.nombre} es inválido.`,
              });
              return;
            }

            const nuevoProducto = {
              idProducto: producto.id,
              codigo: producto.codigo,
              nombre: producto.nombre,
              precio: producto.precioVenta,
              cantidad: nuevaCantidad,
              descuento: descuentoTotalLinea,
              descuentosAplicados: detalleDescuentosMultiplicados,
              subtotal:
                producto.precioVenta * nuevaCantidad - descuentoTotalLinea,
            };

            return [...listaActual, nuevoProducto];
          }
        });

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
  const esMetodoTarjeta = (metodo) =>
    metodo === "Tarjeta Debito" || metodo === "Tarjeta Credito";

  const limpiarEstadoPago = () => {
    setInfoPagosDiferidos([]);
    setMontoVuelto(0);
    setTotalPendientePagar(0);
    //setIdVentaTemporal(null);
    formMetodoPago.resetFields();
    formMetodoPago.setFieldsValue({ montoPago: 0 });
  };

  const registrarVentaFinal = async ({
    idVentaCliente,
    metodoPago,
    tipoPago,
    detallePagos,
  }) => {
    const deviceID = localStorage.getItem("deviceID");
    const codigo = formRecuperarVentaCaja.getFieldValue("idVentaPendiente");
    const datosVenta = {
      idVentaCliente,
      idPOS: informacionCaja.idPOS,
      idSucursal: informacionCaja.idSucursal,
      tipoPago,
      detallePagos,
      productosVendidos: productos,
      totalVenta: total,
      metodoPago,
      idVentaVendedor: codigo ? Number(codigo) : null,
    };

    const response = await registroVenta(deviceID, datosVenta);
    if (response?.status !== 200) {
      throw new Error(response?.data?.message || "Intente nuevamente");
    } else {
      Modal.confirm({
        title: "Venta Registrada Exitosamente",
        content: "¿Desea imprimir el comprobante de venta en la terminal?",
        okText: "Imprimir Comprobante",
        cancelText: "No imprimir",
        centered: true,

        maskClosable: false,

        async onOk() {
          try {
            notification.info({ message: "Enviando a impresora..." });
            const res = await imprimirComprobanteVenta(
              response.data.idVenta, // Asegúrate que el backend envíe este ID
              deviceID,
            );

            if (res?.status === 200) {
              notification.success({ message: "Comprobante impreso" });
            } else {
              notification.error({
                message: "Error al imprimir comprobante",
                description: res?.data?.message || "Intente nuevamente",
              });
            }
          } catch (error) {
            console.error("Error al imprimir comprobante:", error);
            notification.error({
              message: "Error al imprimir comprobante",
              description:
                error.response?.data?.message || "Intente nuevamente",
            });
          } finally {
            finalizarVentaExito();
          }
        },

        onCancel() {
          finalizarVentaExito();
        },
      });
    }
  };

  const procesarPagoTarjeta = async (monto, metodoTarjeta, idVenta) => {
    let idOrdendePago = null;
    const deviceID = localStorage.getItem("deviceID");
    setEsperandoPago(true);

    try {
      // AJUSTE: Pasamos un objeto con totalVenta y montoTarjeta al frontend API
      const datosPagoMP = {
        totalVenta: total, // El total del carrito
        montoTarjeta: monto, // Solo lo que se cobrará en la tarjeta
        metodoPago: metodoTarjeta,
        idVentaCliente: idVenta,
      };

      const response = await solicitarPagoTarjeta(deviceID, datosPagoMP);

      if (response?.status !== 200) {
        notification.error({
          message:
            response?.data?.message || "Error al solicitar pago con tarjeta",
        });
        return null;
      }

      idOrdendePago = response.data.idOrdenMP;
      const idVentaCliente = response.data.idVentaCliente;
      let intentos = 0;
      const maximosIntentos = 20;

      while (intentos < maximosIntentos) {
        const res = await consultarStatusVentas(idOrdendePago);

        if (res?.data?.estado === "created")
          setMensajeLoading("Orden creada, enviada a terminal");
        if (res?.data?.estado === "at_terminal")
          setMensajeLoading("Orden en terminal, esperando cliente");
        if (res?.data?.estado === "action_required")
          setMensajeLoading("Revise la terminal para completar el pago");
        if (res?.data?.estado === "failed") setMensajeLoading("Pago fallido");
        if (res?.data?.estado === "canceled")
          setMensajeLoading("Pago cancelado");
        if (res?.data?.estado === "processed")
          setMensajeLoading("Pago aprobado, procesando...");

        if (res?.status !== 200) {
          notification.error({
            message: res?.data?.message || "Error al consultar estado",
            description: "Intente nuevamente",
          });
          return null;
        }

        if (res.data.estado === "processed") {
          return idVentaCliente; // Retornamos el ID de la venta creada
        }

        if (res.data.estado === "failed") {
          notification.error({
            message: "Pago rechazado",
            description: "Intente nuevamente",
          });
          return null;
        }

        if (res.data.estado === "canceled") {
          notification.warning({ message: "Pago cancelado en terminal" });
          return null;
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
        intentos += 1;
      }

      notification.warning({ message: "Tiempo de espera agotado" });
      return null;
    } catch (error) {
      if (idOrdendePago) {
        await cancelarVentaTarjeta(idOrdendePago);
      }
      notification.error({
        message: "Error al solicitar pago con tarjeta",
        description: error.response?.data?.message || "Intente nuevamente",
      });
      return null;
    } finally {
      setEsperandoPago(false);
      setMensajeLoading("Procesando pago...");
    }
  };

  const borrarUltimoPago = () => {
    if (!infoPagosDiferidos || infoPagosDiferidos.length === 0) {
      return;
    }

    const pagosActualizados = infoPagosDiferidos.slice(0, -1);
    const totalPagado = pagosActualizados.reduce(
      (acumulado, pago) =>
        acumulado + Number(pago.montoPagado ?? pago.monto ?? 0),
      0,
    );

    setInfoPagosDiferidos(pagosActualizados);
    setTotalPendientePagar(Math.max(0, Number(total) - totalPagado));
    setMontoVuelto(0);
    formMetodoPago.setFieldsValue({ montoPago: 0 });
    notification.info({
      message: "Se eliminó el último pago",
    });
  };

  const confirmarVenta = async () => {
    for (const producto of productos) {
      try {
        const stockDisponible = await consultarSiSePuedeVenderProducto(
          producto.codigo,
          producto.cantidad,
        );
        console.log("Respuesta de stock disponible:", stockDisponible.data);
        if (stockDisponible.status !== 200) {
          notification.error({
            message: stockDisponible.data.message || "Stock insuficiente",
            //description: `No hay suficiente stock para el producto ${producto.nombre}. Cantidad solicitada: ${producto.cantidad}.`,
          });
          setModalMetodoPago(false);
          limpiarEstadoPago();
          return;
        }
      } catch (error) {
        notification.error({
          message: "Error al verificar stock",
          description: `No se pudo verificar el stock del producto ${producto.nombre}. Intente nuevamente.`,
        });

        return;
      }
    }
    setTotalPendientePagar(total);
    setInfoPagosDiferidos([]);
    setMontoVuelto(0);
    //setIdVentaTemporal(null); // Reseteamos ID
    formMetodoPago.setFieldsValue({ montoPago: 0 });
    setModalMetodoPago(true);
  };

  const finalizarVentaExito = () => {
    notification.success({ message: "Venta registrada exitosamente" });
    limpiarVenta();
    setModalMetodoPago(false);
    limpiarEstadoPago();
    formVentaProducto.resetFields();
  };

  const confirmarPago = async (metodo) => {
    if (!esMetodoTarjeta(metodo) && metodo !== "Efectivo") {
      notification.warning({ message: "Método no habilitado" });
      return;
    }

    // 🚀 NUEVA VALIDACIÓN: Solo una tarjeta por transacción
    const yaTieneTarjeta = infoPagosDiferidos.some((p) =>
      esMetodoTarjeta(p.metodo),
    );
    if (yaTieneTarjeta && esMetodoTarjeta(metodo)) {
      notification.warning({
        message: "Tarjeta ya ingresada",
        description:
          "Solo se permite un pago con tarjeta. El resto del saldo debe ser pagado en efectivo.",
      });
      return;
    }

    const montoIngresado = Number(
      formMetodoPago.getFieldValue("montoPago") || 0,
    );
    const montoSeleccionado =
      montoIngresado === 0 ? Number(totalPendientePagar) : montoIngresado;

    if (montoSeleccionado <= 0) {
      notification.warning({ message: "Ingrese un monto mayor a 0" });
      return;
    }

    let montoRegistrado = montoSeleccionado;
    let vuelto = 0;

    // Lógica de cálculo de vuelto y topes
    if (
      metodo === "Efectivo" &&
      montoSeleccionado > Number(totalPendientePagar)
    ) {
      vuelto = montoSeleccionado - Number(totalPendientePagar);
      montoRegistrado = Number(totalPendientePagar);
    } else if (
      esMetodoTarjeta(metodo) &&
      montoSeleccionado > Number(totalPendientePagar)
    ) {
      notification.warning({
        message: "El monto en tarjeta no puede superar el pendiente",
      });
      return;
    }

    const nuevoPago = {
      metodo,
      monto: montoRegistrado,
      montoPagado: montoRegistrado,
      montoIngresado,
    };

    const nuevosPagos = [...infoPagosDiferidos, nuevoPago];
    const nuevoPendiente = Number(totalPendientePagar) - montoRegistrado;

    // -------------------------------------------------------------------
    // CASO 1: AÚN QUEDA SALDO PENDIENTE
    // -------------------------------------------------------------------
    if (nuevoPendiente > 0) {
      setInfoPagosDiferidos(nuevosPagos);
      setTotalPendientePagar(nuevoPendiente);
      setMontoVuelto(vuelto);
      formMetodoPago.setFieldsValue({ montoPago: 0 });
      notification.info({
        message: "Pago agregado",
        description: `Falta abonar $${nuevoPendiente.toLocaleString("es-CL")} para completar la venta.`,
      });
      return;
    }

    // -------------------------------------------------------------------
    // CASO 2: SE COMPLETÓ EL TOTAL
    // -------------------------------------------------------------------
    setInfoPagosDiferidos(nuevosPagos);
    setTotalPendientePagar(0);
    setMontoVuelto(vuelto);

    try {
      let idVentaRecibido = null;
      const pagoConTarjeta = nuevosPagos.find((p) => esMetodoTarjeta(p.metodo));

      if (pagoConTarjeta) {
        notification.info({
          message: "Procesando pago en terminal Mercado Pago...",
        });

        idVentaRecibido = await procesarPagoTarjeta(
          pagoConTarjeta.monto,
          pagoConTarjeta.metodo,
          null,
        );

        if (!idVentaRecibido) {
          setInfoPagosDiferidos(infoPagosDiferidos); // Revertir
          setTotalPendientePagar(montoRegistrado);
          setMontoVuelto(0);
          return;
        }
      }

      const metodoVenta =
        nuevosPagos.length > 1 ? "Pago Mixto" : nuevosPagos[0].metodo;

      await registrarVentaFinal({
        idVentaCliente: idVentaRecibido,
        metodoPago: metodoVenta,
        tipoPago: metodoVenta,
        detallePagos: nuevosPagos,
      });

      finalizarVentaExito();
    } catch (error) {
      notification.error({
        message: "Error al finalizar la venta",
        description: error.message || "Intente nuevamente",
      });
    }
  };

  // Variable para saber si ya hay una tarjeta en la cola
  const yaTieneTarjeta = infoPagosDiferidos.some(
    (p) => p.metodo === "Tarjeta Debito" || p.metodo === "Tarjeta Credito",
  );

  //funciones para ver ventas del dia
  const obtenerVentasDelDia = async () => {
    try {
      const res = await verVentasDelDia(localStorage.getItem("deviceID"));
      // console.log("Respuesta de consulta de ventas del día:", res.data);
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

  const resumen = resumenCaja?.resumenVentas || {
    totalEfectivo: 0,
    totalDebito: 0,
    totalCredito: 0,
    totalGeneral: 0,
    cantidadVentas: 0,
  };

  const obtenerDatosArqueoCaja = async () => {
    try {
      const res = await generarArqueoCaja(localStorage.getItem("deviceID"));
      // console.log("Resumen Caja State:", res.data);
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

  const enviarArqueoCaja = async () => {
    const datosEnviar = {
      cantidadMontoCierreReal: {
        ...formArqueoCaja.getFieldsValue(),
      },

      montoCierreReal: totalDenominaciones,
    };
    const deviceID = localStorage.getItem("deviceID");
    console.log("Datos a enviar para arqueo de caja:", datosEnviar);
    try {
      const res = await guardarArqueoCaja(deviceID, datosEnviar);
      console.log("Respuesta al enviar arqueo de caja:", res);
      if (res.status === 200) {
        notification.success({
          message: "Arqueo de caja enviado",
          description:
            res.data.message || "El arqueo de caja se ha enviado exitosamente",
        });
        try {
          const idArqueo = res.data.idRegistroCaja;
          const response = await imprimirArqueoCaja(idArqueo, deviceID);
          console.log("response al imprimir arqueo de caja:", response);
          if (response.status === 200) {
            notification.success({
              message: "Arqueo de caja impreso",
              description:
                response.data.message ||
                "El arqueo de caja se ha impreso exitosamente",
            });
          } else {
            notification.error({
              message: "Error al imprimir arqueo de caja",
              description: response.data.message || "Intente nuevamente",
            });
          }
        } catch (error) {
          console.error("Error al enviar arqueo de caja:", error);
          notification.error({
            message: "Error al enviar arqueo de caja",
            description: error.response?.data?.message || "Intente nuevamente",
          });
        }
        cerrarModalArqueoCaja();
        obtenerDatosCaja(localStorage.getItem("deviceID"));
        formArqueoCaja.resetFields();
        return;
      }
      notification.error({
        message: "Error al enviar arqueo de caja",
        description: res.data.message || "Intente nuevamente",
      });
    } catch (error) {
      console.error("Error al enviar arqueo de caja:", error);
      notification.error({
        message: "Error al enviar arqueo de caja",
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
    setResumenCaja(null);
    setTimeout(() => {
      formArqueoCaja.resetFields();
      setCantidades({});
    }, 200);
  };

  //const diferenciaEfectivo = totalDenominaciones - resumen.totalEfectivo;

  //ciere de caja especial solo administradores

  const abrirModalCierreCajaAdmin = async () => {
    try {
      const deviceID = localStorage.getItem("deviceID");
      const res = await consultaCierreCajaPendiente(deviceID);
      // console.log("Abriendo modal de cierre de caja administrativo...", res);
      if (res.status === 200) {
        setInfoCierreCajaAdmin(res.data.registroPendiente);
        notification.info({
          message: res.data.message || "Ventas del día cargadas",
        });
        return;
      }
      notification.error({
        message: "Error al cargar ventas del día",
        description: res.data.message || "Intente nuevamente",
      });
    } catch (error) {
      console.error("Error al abrir modal de ventas del día:", error);
      notification.error({
        message: "Error al abrir ventas del día",
        description: error.response?.data?.message || "Intente nuevamente",
      });
    } finally {
      {
        setModalCierreCajaAdmin(true);
      }
    }
  };

  const cerrarModalCierreCajaAdmin = () => {
    setModalCierreCajaAdmin(false);
  };

  const confirmarCierreCajaAdmin = async (valoresFormulario) => {
    // Calculamos el total usando la misma lógica que ya tienes
    const totalCierreAdmin = denominaciones.reduce(
      (acc, d) => acc + (cantidades[d.name] || 0) * d.valor,
      0,
    );

    const { observacionesCierre, ...cantidadesMontoFinal } = valoresFormulario;

    const datosCierre = {
      idRegistroCaja: infoCierreCajaAdmin.idRegistroCaja,
      cantidadMontoFinal: cantidadesMontoFinal,
      observacionesCierre: observacionesCierre || "Cierre administrativo",
      totalCierre: totalCierreAdmin,
    };

    try {
      const res = await cierreCajaPendienteAdmin(
        localStorage.getItem("deviceID"),
        datosCierre,
      );
      if (res.status === 200) {
        notification.success({
          message: res.data.message || "Turno pendiente cerrado",
        });
        return;
      }

      notification.error({
        message: res.data.message || "Error al cerrar turno pendiente",
        description: "Intente nuevamente",
      });
    } catch (error) {
      notification.error({
        message: error.message || "Error al cerrar el turno pendiente",
      });
    } finally {
      cerrarModalCierreCajaAdmin();
      formCierreCajaAdmin.resetFields();
      setCantidades({});
    }
  };

  //bloqueo y desbloqueo de caja

  const bloquearCaja = async () => {
    const deviceID = localStorage.getItem("deviceID");
    try {
      const res = await bloquearFuncionamientoCaja(deviceID);
      if (res.status === 200) {
        notification.success({
          message: res.data.message || "Caja bloqueada",
        });
        obtenerDatosCaja(deviceID);
        limpiarVenta();
        return;
      }
      notification.error({
        message: res.data.message || "Error al bloquear la caja",
        description: "Intente nuevamente",
      });
    } catch (error) {
      console.error("Error al bloquear la caja:", error);
      notification.error({
        message: "Error al bloquear la caja",
        description: error.response?.data?.message || "Intente nuevamente",
      });
    }
  };

  const desbloquearCaja = async () => {
    const deviceID = localStorage.getItem("deviceID");
    try {
      const res = await desbloquearFuncionamientoCaja(deviceID);
      if (res.status === 200) {
        notification.success({
          message: res.data.message || "Caja desbloqueada",
        });
        obtenerDatosCaja(deviceID);
        return;
      }
      notification.error({
        message: res.data.message || "Error al desbloquear la caja",
        description: "Intente nuevamente",
      });
    } catch (error) {
      console.error("Error al desbloquear la caja:", error);
      notification.error({
        message: "Error al desbloquear la caja",
        description: error.response?.data?.message || "Intente nuevamente",
      });
    }
  };

  const seleccionUnicaConfig = {
    type: "radio",
    selectedRowKeys: clavesSeleccionadas,

    onChange: (nuevasClaves) => {
      const productoSeleccionado = filasParaTabla.find(
        (p) => p.key === nuevasClaves[0],
      );

      setClavesSeleccionadas(nuevasClaves);
      console.log("Fila seleccionada:", productoSeleccionado);
    },

    getCheckboxProps: (record) => ({
      disabled: record.esFilaDescuento,
    }),
  };

  //funciones recuparar venta para caja
  const buscarVentaParaCaja = async () => {
    const codigo = formRecuperarVentaCaja.getFieldValue("idVentaPendiente");

    if (!codigo) {
      notification.warning({
        message: "Ingrese un código de venta",
        description:
          "Por favor, ingrese el código de la venta pendiente que desea recuperar.",
      });
      return;
    }
    try {
      const respuesta = await consultarVentasPendientesCaja(codigo);

      console.log(
        "Respuesta al buscar venta pendiente para caja:",
        respuesta.data,
      );
      if (respuesta.status === 200) {
        const productosVenta = respuesta.data.map((prod) => ({
          key: prod.idDetalleVenta,
          idProducto: prod.idProducto,
          codigo: prod.codigo,
          nombre: prod.nombre,
          precio: prod.precio,
          cantidad: prod.cantidad,
          descuento: prod.descuento,
          descuentosAplicados: prod.descuentosAplicados,
          subtotal: prod.precio * prod.cantidad - prod.descuento,
        }));
        setProductos(productosVenta);

        notification.success({
          message: "Venta cargada",
          description: `Se cargó la venta para continuar con el proceso de pago`,
        });
        return;
      } else {
        notification.error({
          message: "Error al cargar la venta",
          description: respuesta.data.message || "Intente nuevamente",
        });
      }
    } catch (error) {
      console.error("Error al buscar venta para caja:", error);
      notification.error({
        message: "Error al buscar venta",
        description: error.response?.data?.message || "Intente nuevamente",
      });
    }
  };

  //funciones modal retiros
  const abrirModalRetiros = () => {
    setModalRetiros(true);
  };

  const cerrarModalRetiros = () => {
    setModalRetiros(false);
  };

  const funcionRetiro = async (values) => {
    try {
      const deviceID = localStorage.getItem("deviceID");
      const { motivoRetiro, ...denominacionesRetiro } = values;
      const datosEnviar = {
        monto: totalDenominaciones,
        motivo: motivoRetiro,
        denominaciones: denominacionesRetiro,
      };
      //console.log("Datos a enviar para retiro/consignación:", datosEnviar);
      const respuesta = await generarRetiroCaja(deviceID, datosEnviar);
      //console.log("Respuesta al realizar retiro/consignación:", respuesta);
      if (respuesta.status === 200) {
        notification.success({
          message: respuesta.data.message || "Operación realizada",
        });

        const idRetiro = respuesta.data.nuevoRetiroCaja.idRetiro;

        const finalizarOperacion = () => {
          cerrarModalRetiros();
          formRetiros.resetFields();
          setCantidades({});
          obtenerDatosCaja(deviceID);
        };

        notification.info({
          message: "Enviando comprobante a la impresora...",
        });

        try {
          const resImpresion = await imprimirComprobanteRetiro(
            idRetiro,
            deviceID,
          );

          if (resImpresion?.status === 200) {
            notification.success({
              message: "Comprobante impreso exitosamente",
            });
          } else {
            // Usamos warning en vez de error porque el retiro SÍ se hizo
            notification.warning({
              message: "Retiro exitoso, pero falló la impresión",
              description: resImpresion?.data?.message || "Revise la terminal.",
            });
          }
        } catch (errorImpresion) {
          console.error(
            "Error al imprimir comprobante de retiro:",
            errorImpresion,
          );
          notification.warning({
            message: "Retiro exitoso, pero no se pudo imprimir",
            description:
              errorImpresion.response?.data?.message ||
              "Revise la conexión con Mercado Pago.",
          });
        }

        // Limpiamos y cerramos el modal sin importar si imprimió bien o mal
        finalizarOperacion();
        return;
      }
      notification.error({
        message: respuesta.data.message || "Error al procesar la solicitud",
        description: "Intente nuevamente",
      });
    } catch (error) {
      console.error("Error al realizar retiro o consignación:", error);
      notification.error({
        message: "Error al procesar la solicitud",
        description: error.response?.data?.message || "Intente nuevamente",
      });
    }
  };

  //modal descuento
  const valorPorcentaje = Form.useWatch(
    "porcentajeDescuento",
    formDescuentoProducto,
  );
  const valorMonto = Form.useWatch("montoDescuento", formDescuentoProducto);

  const selectedProduct = filasParaTabla.find(
    (p) => p.key === clavesSeleccionadas[0],
  );

  const abrirModalDescuento = () => {
    formDescuentoProducto.resetFields();
    setModalDescuentoVisible(true);
  };

  const cerrarModalDescuento = () => {
    setModalDescuentoVisible(false);
    formDescuentoProducto.resetFields();
  };

  const confirmarDescuentoProducto = async (values) => {
    console.log("Aplicando descuento con valores:", values);

    // 1. Calculamos el dinero real a descontar en caso de que sea porcentaje
    const subtotalBase = selectedProduct.precio * selectedProduct.cantidad;
    let montoRealADescontar = 0;
    let detalleVisual = "";

    if (values.porcentajeDescuento > 0) {
      montoRealADescontar = subtotalBase * (values.porcentajeDescuento / 100);
      detalleVisual = `${values.porcentajeDescuento}%`;
    } else {
      montoRealADescontar = Number(values.montoDescuento) || 0;
      detalleVisual = `Monto fijo`;
    }

    const datosEnviar = {
      porcentajeDescuento: values.porcentajeDescuento || 0,
      montoDescuento: montoRealADescontar, // El valor ya en pesos
      descripcion: `Descuento Autorizado: ${detalleVisual}`,
    };

    try {
      const respuesta = await crearDescuentoUnico(datosEnviar);

      if (respuesta.status === 200) {
        setProductos((listaActual) =>
          listaActual.map((prod) => {
            // 🚀 CRÍTICO: Como tu estado original no tiene 'key', lo buscamos por 'idProducto'
            if (prod.idProducto === selectedProduct.idProducto) {
              const descuentoHistorico = prod.descuento || 0;
              const nuevoDescuentoTotal =
                descuentoHistorico + montoRealADescontar;

              return {
                ...prod,
                descuento: nuevoDescuentoTotal,
                descuentosAplicados: [
                  ...(prod.descuentosAplicados || []),
                  {
                    idDescuento: respuesta.data?.idDescuento || Math.random(),
                    // 🚀 Pasamos origen y detalle para que coincida con tu mapeo de filasParaTabla
                    origen: "Administrador",
                    detalle: detalleVisual,
                    montoDescontado: montoRealADescontar,
                  },
                ],
                subtotal: prod.precio * prod.cantidad - nuevoDescuentoTotal,
              };
            }
            return prod;
          }),
        );

        notification.success({
          message: "Descuento aplicado",
          description: `Se descontaron $${montoRealADescontar.toLocaleString("es-CL")} a ${selectedProduct.nombre}`,
        });

        cerrarModalDescuento();
        setClavesSeleccionadas([]); // Limpiamos la selección para evitar clics accidentales
      } else {
        notification.error({
          message: "Error",
          description: respuesta.data?.message || "Intente nuevamente",
        });
      }
    } catch (error) {
      console.error("Error al aplicar descuento:", error);
      notification.error({
        message: "Error",
        description: "Intente nuevamente",
      });
    }
  };
  const solicitarAutorizacion = () => {
    formAutorizacion.resetFields();
    setModalAutorizacionVisible(true);
  };

  // ----- Funciones para Consulta Stock -----
  const abrirModalConsultaStock = () => {
    formConsultarStock.resetFields();
    setModalConsultarStockVisible(true);
  };

  const cerrarModalConsultaStock = () => {
    setModalConsultarStockVisible(false);
    formConsultarStock.resetFields();
    setStockProducto(null);
  };

  const funcionConsultaStock = async (values) => {
    console.log("Consultando stock para código:", values.codigoProducto);

    try {
      const respuesta = await consultarStockProductos(values.codigoProducto);
      if (respuesta.status === 200) {
        setStockProducto(respuesta.data);
        notification.success({
          message: "Consulta exitosa",
          description: `El stock actual de ${respuesta.data.nombre} es ${respuesta.data.stock}`,
        });
        return;
      } else {
        notification.error({
          message: "Error",
          description: respuesta.data?.message || "Intente nuevamente",
        });
      }
    } catch (error) {
      console.error("Error al consultar stock:", error);
      notification.error({
        message: "Error",
        description: error.response?.data?.message || "Intente nuevamente",
      });
    }
  };

  // ------ Funcion nuevo usuario -------
  const handleNuevoUsuarioSubmit = async (values) => {
    const nuevaContraseña = values.newPassword;
    const confirmarContraseña = values.reNewPassword;
    console.log(
      "Datos del nuevo usuario:",
      nuevaContraseña,
      confirmarContraseña,
    );
    if (nuevaContraseña !== confirmarContraseña) {
      notification.error({
        message: "Error",
        description: "Las contraseñas no coinciden",
      });
      return;
    }
    try {
      const response = await actualizarContraseñaCaja(
        user?.email,
        nuevaContraseña,
      );
      if (response.status === 200) {
        notification.success({
          message: "Éxito",
          description: response.data?.message || "Contraseña actualizada",
        });
        setModalNuevoUsuarioVisible(false);
        formNuevoUsuario.resetFields();
      } else {
        notification.error({
          message: "Error",
          description: response.data?.message || "Intente nuevamente",
        });
      }
    } catch (error) {
      console.error("Error al crear nuevo usuario:", error);
      notification.error({
        message: "Error",
        description: error.response?.data?.message || "Intente nuevamente",
      });
    }
  };

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
          styles={{
            header: {
              borderBottom: "none",
              paddingBottom: 0,
            },
            body: {
              display: "flex",
              flexDirection: "column",
              padding: 0,
              height: "100%",
            },
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
                  disabled: cajaNoRegistrada || cajaAperturada,
                  onClick: () => setModalAperturaCaja(true),
                },
                {
                  key: "2",
                  icon: <AccountBookOutlined />,
                  label: "Arqueo de caja",
                  disabled:
                    cajaNoRegistrada ||
                    !cajaAperturada ||
                    informacionCaja.estadoCaja === "Bloqueada",
                  onClick: () => abrirModalArqueoCaja(),
                },
                // {
                //   key: "3",
                //   icon: <AuditOutlined />,
                //   disabled: cajaNoRegistrada || !cajaAperturada,
                //   onClick: () => setModalCierreCaja(true),
                //   label: "Cierre de Caja",
                // },
                {
                  key: "4",
                  icon: <LockOutlined />,
                  label: "Bloquear Caja",
                  disabled:
                    cajaNoRegistrada ||
                    !cajaAperturada ||
                    informacionCaja.estadoCaja === "Bloqueada",
                  onClick: bloquearCaja,
                },
                {
                  key: "5",
                  icon: <UnlockOutlined />,
                  label: "Desbloquear Caja",
                  disabled:
                    cajaNoRegistrada ||
                    !cajaAperturada ||
                    informacionCaja.estadoCaja !== "Bloqueada",
                  onClick: desbloquearCaja,
                },
                {
                  key: "6",
                  icon: <HistoryOutlined />,
                  disabled:
                    cajaNoRegistrada ||
                    !cajaAperturada ||
                    informacionCaja.estadoCaja === "Bloqueada",
                  onClick: abrirModalVentasDelDia,
                  label: "Historial Ventas Sesión",
                },
                {
                  key: "7",
                  icon: <FileSearchOutlined />,
                  label: "Retiros y Consignaciones",
                  disabled:
                    cajaNoRegistrada ||
                    !cajaAperturada ||
                    informacionCaja.estadoCaja === "Bloqueada",
                  onClick: abrirModalRetiros,
                },
                user?.nombreRol === "Administrador" && {
                  key: "8",
                  icon: <AuditOutlined />,
                  label: "Cierre Caja dia anterior",
                  onClick: abrirModalCierreCajaAdmin,
                },
                {
                  key: "9",
                  icon: <SettingOutlined />,
                  label: "Descuento Administrador",
                  disabled:
                    cajaNoRegistrada ||
                    !cajaAperturada ||
                    informacionCaja.estadoCaja === "Bloqueada" ||
                    clavesSeleccionadas.length === 0,
                  onClick: solicitarAutorizacion,
                },
                {
                  key: "10",
                  icon: <FileSearchOutlined />,
                  label: "Consultar Stock",
                  disabled:
                    cajaNoRegistrada ||
                    !cajaAperturada ||
                    informacionCaja.estadoCaja === "Bloqueada",
                  onClick: abrirModalConsultaStock,
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
          styles={{
            body: {
              display: "flex",
              flexDirection: "column",
              gap: 16,
              padding: 16,
              height: "100%",
            },
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
                  justify="space-around"
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
                  <Col>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      Sucursal
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {informacionCaja.nombreSucursal || "-"}
                    </div>
                  </Col>
                </Row>
              </Card>
              {/**Tarjeta de Recuparar Venta */}
              <Card
                size="small"
                style={{ background: "#f8fafc", borderRadius: 12 }}
              >
                <Row gutter={[16, 16]} align="middle" justify="space-between">
                  <Col xs={24} md={10}>
                    <Typography.Title
                      level={5}
                      style={{ margin: 0, color: "#1890ff" }}
                    >
                      Recuperar Venta
                    </Typography.Title>
                    <Typography.Text
                      type="secondary"
                      style={{ fontSize: "12px" }}
                    >
                      Ingresa N° de solicitud pendiente
                    </Typography.Text>
                  </Col>

                  <Col
                    xs={24}
                    md={14}
                    style={{ display: "flex", justifyContent: "flex-end" }}
                  >
                    <Form
                      layout="inline"
                      form={formRecuperarVentaCaja}
                      onFinish={() => {
                        buscarVentaParaCaja();
                      }}
                      style={{
                        flexWrap: "nowrap",
                        width: "100%",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Form.Item
                        name="idVenta"
                        style={{ marginEnd: 8, flex: 1, maxWidth: 160 }}
                        name="idVentaPendiente"
                        rules={[{ required: true, message: "Ingresa ID" }]}
                      >
                        <Input
                          disabled={
                            cajaNoRegistrada ||
                            !cajaAperturada ||
                            informacionCaja.estadoCaja === "Bloqueada"
                          }
                          placeholder="N° de venta"
                          prefix={
                            <NumberOutlined style={{ color: "#bfbfbf" }} />
                          }
                        />
                      </Form.Item>

                      <Form.Item style={{ marginEnd: 0 }}>
                        <Button
                          disabled={
                            cajaNoRegistrada ||
                            !cajaAperturada ||
                            informacionCaja.estadoCaja === "Bloqueada"
                          }
                          type="default"
                          icon={<SearchOutlined />}
                          htmlType="submit"
                        >
                          Buscar
                        </Button>
                      </Form.Item>
                    </Form>
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
                styles={{ body: { height: "100%", padding: 0 } }}
              >
                <div style={{ height: "100%", overflow: "auto" }}>
                  <Table
                    size="middle"
                    pagination={false}
                    dataSource={filasParaTabla}
                    rowKey="key"
                    locale={{ emptyText: "Sin productos agregados" }}
                    rowSelection={seleccionUnicaConfig}
                    scroll={{ y: 300 }}
                    // onRow={(record) => {
                    //   return {
                    //     onClick: () => {
                    //       // Solo ejecuta la acción si es administrador y no es una fila de descuento
                    //       if (
                    //         user.nombreRol === "Administrador" &&
                    //         !record.esFilaDescuento
                    //       ) {
                    //         console.log(
                    //           "Fila clickeada por Administrador:",
                    //           record,
                    //         );
                    //         // Aquí llamas a tu función, por ejemplo:
                    //         // abrirModalEdicionAdmin(record);
                    //       }
                    //     },
                    //     // Cambiamos el cursor a "pointer" solo para administradores
                    //     style: {
                    //       cursor:
                    //         user.nombreRol === "Administrador" &&
                    //         !record.esFilaDescuento
                    //           ? "pointer"
                    //           : "default",
                    //     },
                    //   };
                    // }}
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
                styles={{ body: { padding: 16 } }}
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

            <Col
              span={8}
              style={{
                display: "flex",
                minHeight: 0,
                flexDirection: "column",
                gap: 16,
                width: "400px",
                flex: "0 0 400px",
              }}
            >
              {/**Tarjeta Hora*/}
              <Card
                style={{
                  borderRadius: 14,
                  width: "100%",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
                styles={{ body: { padding: "16px 24px" } }}
              >
                <Row justify="space-between" align="middle">
                  <Col>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#64748b",
                        textTransform: "uppercase",
                      }}
                    >
                      Fecha
                    </div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#1e293b",
                      }}
                    >
                      {fecha}
                    </div>
                  </Col>
                  <Col style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#64748b",
                        textTransform: "uppercase",
                      }}
                    >
                      Hora
                    </div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#1e293b",
                      }}
                    >
                      {hora}
                    </div>
                  </Col>
                </Row>
              </Card>
              {/**Tarjeta para ingresar el código del producto */}
              <Card
                title={
                  <Space>
                    <BarcodeOutlined />
                    Ingreso de código
                  </Space>
                }
                style={{
                  borderRadius: 14,
                  width: "100%",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
                styles={{ body: { padding: "16px 24px" } }}
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
                          disabled={
                            cajaNoRegistrada ||
                            !cajaAperturada ||
                            informacionCaja.estadoCaja === "Bloqueada"
                          }
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
                          disabled={
                            cajaNoRegistrada ||
                            !cajaAperturada ||
                            informacionCaja.estadoCaja === "Bloqueada"
                          }
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
                          disabled={
                            cajaNoRegistrada ||
                            !cajaAperturada ||
                            informacionCaja.estadoCaja === "Bloqueada"
                          }
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
                        disabled={
                          cajaNoRegistrada ||
                          !cajaAperturada ||
                          informacionCaja.estadoCaja === "Bloqueada"
                        }
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
          setModalMetodoPago(false);
          limpiarEstadoPago();
        }}
        footer={null}
        maskClosable={false}
        centered
        width={550} // Ligeramente más ancho para mejor visualización
      >
        <Spin spinning={esperandoPago} tip={mensajeLoading}>
          {/* Mensaje Informativo */}
          <div
            style={{
              marginBottom: 16,
              padding: "10px 14px",
              backgroundColor: "#e6f7ff",
              border: "1px solid #91d5ff",
              borderRadius: 8,
              color: "#0050b3",
            }}
          >
            <InfoCircleOutlined style={{ marginRight: 8 }} />
            Ingrese el monto a cobrar. Si deja <strong>0</strong>, se cobrará el
            total pendiente automáticamente.
          </div>

          {/* Resumen de Montos (Total y Pendiente) */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <Card size="small" style={{ backgroundColor: "#fafafa" }}>
                <Statistic
                  title="Total Venta"
                  value={total}
                  prefix="$"
                  precision={0}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card
                size="small"
                style={{
                  backgroundColor:
                    totalPendientePagar > 0 ? "#fff1f0" : "#f6ffed",
                }}
              >
                <Statistic
                  title="Pendiente a Pagar"
                  value={totalPendientePagar}
                  prefix="$"
                  precision={0}
                  valueStyle={{
                    color: totalPendientePagar > 0 ? "#cf1322" : "#3f8600",
                    fontWeight: "bold",
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* Input para ingresar el monto a pagar */}
          <Form form={formMetodoPago} layout="vertical">
            <Form.Item
              label={
                <span style={{ fontWeight: 600 }}>
                  Monto a cobrar (Parcial o Total)
                </span>
              }
              name="montoPago"
              initialValue={0}
            >
              <InputNumber
                min={0}
                style={{ width: "100%", fontSize: "1.2rem" }}
                size="large"
                prefix="$"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                parser={(value) => value.replace(/\$\s?|\./g, "")}
                disabled={totalPendientePagar <= 0} // Se bloquea si ya no hay deuda
              />
            </Form.Item>
          </Form>

          {/* Historial de Pagos en Cola */}
          <Card
            size="small"
            title={
              <span>
                <ShoppingCartOutlined /> Pagos en cola
              </span>
            }
            style={{ marginBottom: 16 }}
            extra={
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={borrarUltimoPago}
                disabled={
                  !infoPagosDiferidos ||
                  infoPagosDiferidos.length === 0 ||
                  esperandoPago
                }
              >
                Deshacer último
              </Button>
            }
          >
            {infoPagosDiferidos && infoPagosDiferidos.length > 0 ? (
              <List
                size="small"
                dataSource={infoPagosDiferidos}
                renderItem={(pago) => (
                  <List.Item>
                    <Text strong>{pago.metodo}</Text>
                    <Text>${pago.monto.toLocaleString("es-CL")}</Text>
                  </List.Item>
                )}
              />
            ) : (
              <Text
                type="secondary"
                style={{ display: "block", textAlign: "center" }}
              >
                No hay pagos ingresados
              </Text>
            )}
          </Card>

          {/* Alerta de Vuelto */}
          {montoVuelto > 0 && (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 8,
                backgroundColor: "#f6ffed",
                border: "1px solid #b7eb8f",
                color: "#3f8600",
                fontSize: "1.2rem",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Vuelto a entregar: ${montoVuelto.toLocaleString("es-CL")}
            </div>
          )}

          {/* Botonera de Métodos de Pago */}
          <Divider plain>Seleccione método para el monto ingresado</Divider>

          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12}>
              <Button
                block
                type="primary"
                icon={<DollarOutlined />}
                size="large"
                style={{
                  height: "50px",
                  fontSize: "16px",
                  backgroundColor: "#52c41a",
                  borderColor: "#52c41a",
                }}
                onClick={() => confirmarPago("Efectivo")}
                disabled={totalPendientePagar <= 0 || esperandoPago}
              >
                Efectivo
              </Button>
            </Col>

            <Col xs={24} sm={12}>
              <Button
                block
                type="primary"
                icon={<CreditCardOutlined />}
                size="large"
                style={{
                  height: "50px",
                  fontSize: "16px",
                  backgroundColor: yaTieneTarjeta ? "#d9d9d9" : "#1890ff",
                  borderColor: yaTieneTarjeta ? "#d9d9d9" : "#1890ff",
                }}
                onClick={() => confirmarPago("Tarjeta Debito")}
                disabled={
                  totalPendientePagar <= 0 || esperandoPago || yaTieneTarjeta
                }
              >
                Débito
              </Button>
            </Col>

            <Col xs={24} sm={12}>
              <Button
                block
                type="primary"
                icon={<CreditCardOutlined />}
                size="large"
                style={{
                  height: "50px",
                  fontSize: "16px",
                  backgroundColor: yaTieneTarjeta ? "#d9d9d9" : "#722ed1",
                  borderColor: yaTieneTarjeta ? "#d9d9d9" : "#722ed1",
                }}
                onClick={() => confirmarPago("Tarjeta Credito")}
                disabled={
                  totalPendientePagar <= 0 || esperandoPago || yaTieneTarjeta
                }
              >
                Crédito
              </Button>
            </Col>

            <Col xs={24} sm={12}>
              <Button
                block
                icon={<IdcardOutlined />}
                size="large"
                style={{ height: "50px", fontSize: "16px" }}
                onClick={() => confirmarPago("Funcionario")}
                disabled={true}
              >
                Funcionario
              </Button>
            </Col>

            <Col xs={24}>
              <Button
                block
                icon={<ClockCircleOutlined />}
                size="large"
                style={{ height: "40px", backgroundColor: "#fafafa" }}
                onClick={() => confirmarPago("Fiado")}
                disabled={true}
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
            disabled={totalDenominaciones == 0}
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
              ${totalDenominaciones.toLocaleString("es-CL")}
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
              style={{
                textAlign: "right",
                color: "#389e0d",
                fontWeight: 500,
              }}
            >
              + ${datosResumen.ventasEfectivo.toLocaleString("es-CL")}
            </Col>

            <Col span={14}>
              <span style={{ color: "#595959" }}>Retiros manuales:</span>
            </Col>
            <Col
              span={10}
              style={{
                textAlign: "right",
                color: "#cf1322",
                fontWeight: 500,
              }}
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
                    setCantidades((prev) => ({
                      ...prev,
                      [d.name]: val || 0,
                    }))
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
                    setCantidades((prev) => ({
                      ...prev,
                      [d.name]: val || 0,
                    }))
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
            <span
              style={{
                fontWeight: 700,
                fontSize: 22,
                color: "#1890ff",
              }}
            >
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
        width={850} // Aumenté un poco el ancho para que quepan bien ambas tablas al expandir
        styles={{ body: { padding: "24px 0 0 0" } }}
      >
        <div style={{ padding: "0 24px 24px 24px" }}>
          {hayVentas ? (
            <>
              <Table
                dataSource={ventasDelDia}
                columns={columnasVentasDia}
                rowKey="idVentaCliente"
                pagination={{ pageSize: 6 }}
                size="middle"
                expandable={{
                  expandedRowRender: (record) => {
                    // Extraemos el nombre del funcionario si existe
                    const nombreFuncionario =
                      record.realizaVenta?.[0]?.funcionario?.nombre ||
                      "Desconocido";

                    return (
                      <div
                        style={{
                          margin: "10px 20px",
                          backgroundColor: "#fafafa",
                          padding: "16px",
                          borderRadius: "8px",
                          border: "1px solid #f0f0f0",
                        }}
                      >
                        <div style={{ marginBottom: "16px" }}>
                          <Typography.Text type="secondary">
                            Atendido por:{" "}
                            <Typography.Text strong>
                              {nombreFuncionario}
                            </Typography.Text>
                          </Typography.Text>
                        </div>

                        <Row gutter={[24, 16]}>
                          {/* Columna Izquierda: Productos */}
                          <Col xs={24} md={14}>
                            <Typography.Text
                              strong
                              style={{ display: "block", marginBottom: 8 }}
                            >
                              Detalle de Productos
                            </Typography.Text>
                            {!record.detalleventa ||
                            record.detalleventa.length === 0 ? (
                              <Typography.Text type="secondary" italic>
                                No hay productos registrados.
                              </Typography.Text>
                            ) : (
                              <Table
                                columns={columnasDetalle}
                                dataSource={record.detalleventa}
                                rowKey="idDetalleVenta"
                                pagination={false}
                                size="small"
                              />
                            )}
                          </Col>

                          {/* Columna Derecha: Pagos */}
                          <Col xs={24} md={10}>
                            <Typography.Text
                              strong
                              style={{ display: "block", marginBottom: 8 }}
                            >
                              Desglose de Pago
                            </Typography.Text>
                            {!record.detallepagos ||
                            record.detallepagos.length === 0 ? (
                              <Typography.Text type="secondary" italic>
                                No hay detalle de pagos.
                              </Typography.Text>
                            ) : (
                              <Table
                                dataSource={record.detallepagos}
                                rowKey="idDetallePago"
                                pagination={false}
                                size="small"
                                columns={[
                                  {
                                    title: "Método",
                                    dataIndex: "metodoPago",
                                    key: "metodoPago",
                                    render: (text) => (
                                      <Typography.Text type="secondary">
                                        {text}
                                      </Typography.Text>
                                    ),
                                  },
                                  {
                                    title: "Monto",
                                    dataIndex: "montoPagado",
                                    key: "montoPagado",
                                    align: "right",
                                    render: (val) => (
                                      <Typography.Text strong>
                                        ${Number(val).toLocaleString("es-CL")}
                                      </Typography.Text>
                                    ),
                                  },
                                ]}
                              />
                            )}
                          </Col>
                        </Row>
                      </div>
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
                  {resumenCaja?.fechaApertura
                    ? new Date(resumenCaja.fechaApertura).toLocaleTimeString(
                        "es-CL",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "N/A"}
                </Typography.Text>

                <Tag color="green" style={{ marginLeft: 8, border: 0 }}>
                  {resumenCaja?.estadoRegistroCaja || "Abierta"}
                </Tag>
              </div>
            </Col>
          </Row>

          <Row gutter={12}>
            {user.nombreRol == "Administrador" && (
              <Col span={6}>
                <Card
                  size="small"
                  style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
                >
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    <DollarOutlined style={{ marginRight: 4 }} />
                    Total Efectivo
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
            )}
            <Col span={user.nombreRol == "Administrador" ? 6 : 8}>
              <Card
                size="small"
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
              >
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  <CreditCardOutlined style={{ marginRight: 4 }} />
                  Tarjeta Debito
                </Typography.Text>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#0f172a",
                    marginTop: 4,
                  }}
                >
                  ${resumen.totalDebito.toLocaleString("es-CL")}
                </div>
              </Card>
            </Col>
            <Col span={user.nombreRol == "Administrador" ? 6 : 8}>
              <Card
                size="small"
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
              >
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  <CreditCardOutlined style={{ marginRight: 4 }} />
                  Tarjetas Credito
                </Typography.Text>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#0f172a",
                    marginTop: 4,
                  }}
                >
                  ${resumen.totalCredito.toLocaleString("es-CL")}
                </div>
              </Card>
            </Col>
            {/* <Col span={8}>
              <Card
                size="small"
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
              >
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Total Ventas
                </Typography.Text>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#1890ff",
                    marginTop: 4,
                  }}
                >
                  ${resumen?.totalGeneral.toLocaleString("es-CL")}
                </div>
              </Card>
            </Col> */}
            <Col span={user.nombreRol == "Administrador" ? 6 : 8}>
              <Card
                size="small"
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
              >
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Cantidad Ventas
                </Typography.Text>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#1890ff",
                    marginTop: 4,
                  }}
                >
                  {resumen?.cantidadVentas.toLocaleString("es-CL")}
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
            form={formArqueoCaja}
            layout="horizontal"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            //onFinish={confirmarArqueoCaja}
            onFinish={enviarArqueoCaja}
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
                background: "#f0f7ff",
                // background:
                //   diferenciaEfectivo === 0
                //     ? "#f6ffed"
                //     : diferenciaEfectivo < 0
                //       ? "#fff2f0"
                //       : "#e6f7ff",
                // border: `1px solid ${
                //   diferenciaEfectivo === 0
                //     ? "#b7eb8f"
                //     : diferenciaEfectivo < 0
                //       ? "#ffccc7"
                //       : "#91caff"
                // }`,
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
                    ${totalDenominaciones.toLocaleString("es-CL")}
                  </span>
                </Col>
              </Row>

              {/* <Row justify="space-between" align="middle">
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
              </Row> */}
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
      {/** Modal de cierre caja dia anterior administrador */}
      <Modal
        title={
          <Space>
            <AuditOutlined style={{ color: "#cf1322" }} />
            <span style={{ color: "#cf1322" }}>
              Cierre de Caja Atrasado (Administrador)
            </span>
          </Space>
        }
        open={modalCierreCajaAdmin}
        onCancel={cerrarModalCierreCajaAdmin}
        width={480}
        centered
        footer={[
          <Button key="cancelar" onClick={cerrarModalCierreCajaAdmin}>
            Cancelar
          </Button>,
          <Button
            key="confirmar"
            type="primary"
            danger
            icon={<AuditOutlined />}
            disabled={!infoCierreCajaAdmin}
            onClick={() => formCierreCajaAdmin.submit()}
          >
            Confirmar cierre pendiente
          </Button>,
        ]}
      >
        {/* --- ALERTA DE TURNO PENDIENTE --- */}
        {infoCierreCajaAdmin ? (
          <>
            <div
              style={{
                background: "#fff1f0",
                border: "1px solid #ffa39e",
                borderRadius: 8,
                padding: "12px 16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{ color: "#cf1322", fontWeight: 600, marginBottom: 4 }}
              >
                Atención: Cerrando turno anterior
              </div>
              <div style={{ fontSize: 13, color: "#5c2018" }}>
                Se está realizando el cierre manual del registro
                <strong> #{infoCierreCajaAdmin.idRegistroCaja}</strong>{" "}
                aperturado el{" "}
                <strong>
                  {new Date(
                    infoCierreCajaAdmin.fechaApertura,
                  ).toLocaleDateString("es-CL")}{" "}
                  a las{" "}
                  {new Date(
                    infoCierreCajaAdmin.fechaApertura,
                  ).toLocaleTimeString("es-CL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>
                .
              </div>
            </div>

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
                  {/* 🚀 Leemos el dato desde infoCierreCajaAdmin */}$
                  {Number(
                    infoCierreCajaAdmin?.montoApertura || 0,
                  ).toLocaleString("es-CL")}
                </Col>

                <Col span={14}>
                  <span style={{ color: "#595959" }}>Ventas en Efectivo:</span>
                </Col>
                <Col
                  span={10}
                  style={{
                    textAlign: "right",
                    color: "#389e0d",
                    fontWeight: 500,
                  }}
                >
                  {/* 🚀 Leemos el dato desde infoCierreCajaAdmin */}+ $
                  {Number(
                    infoCierreCajaAdmin?.ventasEfectivo || 0,
                  ).toLocaleString("es-CL")}
                </Col>

                {/* <Col span={14}>
              <span style={{ color: "#595959" }}>Retiros manuales:</span>
              </Col>
              <Col
              span={10}
              style={{
                textAlign: "right",
                color: "#cf1322",
                fontWeight: 500,
                }}
                >
                - ${resumenCaja.retiros.toLocaleString("es-CL")}
                </Col> */}
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
                  {/* 🚀 Leemos el dato desde infoCierreCajaAdmin */}$
                  {Number(
                    infoCierreCajaAdmin?.efectivoEsperado || 0,
                  ).toLocaleString("es-CL")}
                </Col>
              </Row>
            </div>
            {/* --- FIN DEL RESUMEN DE VENTAS --- */}

            <Form
              form={formCierreCajaAdmin}
              layout="horizontal"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              onFinish={(values) => confirmarCierreCajaAdmin(values)}
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
                        setCantidades((prev) => ({
                          ...prev,
                          [d.name]: val || 0,
                        }))
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
                        setCantidades((prev) => ({
                          ...prev,
                          [d.name]: val || 0,
                        }))
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
                  placeholder="Indique el motivo del cierre manual o descuadres (Ej: Cajero olvidó cerrar turno ayer)"
                />
              </Form.Item>
              {/* Total */}
              <div
                style={{
                  background: "#fff1f0",
                  border: "1px solid #ffa39e",
                  borderRadius: 8,
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{ fontWeight: 500, fontSize: 14, color: "#cf1322" }}
                >
                  Total a declarar
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 22,
                    color: "#cf1322",
                  }}
                >
                  ${totalCierre.toLocaleString("es-CL")}
                </span>
              </div>
            </Form>
          </>
        ) : (
          <div style={{ padding: "40px 0" }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Typography.Text type="secondary" style={{ fontSize: 16 }}>
                  No se encontró información del turno pendiente. Inicie
                  Apertura de Caja para registrar un nuevo turno o contacte al
                  administrador.
                </Typography.Text>
              }
            />
          </div>
        )}
      </Modal>
      {/**Modal Retiros */}
      <Modal
        title={
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            Retiro de Efectivo
          </span>
        }
        open={modalRetiros} // Ant Design v5 usa 'open' en lugar de 'visible'
        onCancel={cerrarModalRetiros}
        footer={null}
        centered
        width={600} // Un poco más angosto que el de arqueo para no verse tan vacío
        styles={{ body: { padding: "0" } }}
      >
        {/* ==========================================
      SECCIÓN 1: MOTIVO DEL RETIRO
      ========================================== */}
        <div
          style={{
            padding: "24px 24px 16px 24px",
            backgroundColor: "#f8fafc",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              <InfoCircleOutlined style={{ marginRight: 6 }} />
              Ingresa el motivo del retiro y el detalle exacto de los billetes y
              monedas que vas a sacar de la gaveta.
            </Typography.Text>
          </div>

          {/* Formulario envolvente para Motivo y Denominaciones */}
          <Form
            form={formRetiros}
            layout="vertical"
            onFinish={(values) => {
              funcionRetiro(values);
            }}
          >
            <Form.Item
              name="motivoRetiro"
              label={
                <span style={{ fontWeight: 500, color: "#475569" }}>
                  Motivo del Retiro
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Por favor, ingresa el motivo del retiro.",
                },
                {
                  min: 5,
                  message:
                    "El motivo debe ser más descriptivo (mín. 5 caracteres).",
                },
              ]}
            >
              <Input.TextArea
                placeholder="Ej: Pago a proveedor de agua, Retiro por exceso de efectivo en caja..."
                rows={3}
                style={{ borderRadius: 6 }}
              />
            </Form.Item>

            {/* ==========================================
          SECCIÓN 2: FORMULARIO DE CONTEO FÍSICO
          ========================================== */}
            <div
              style={{
                marginTop: 24,
                paddingTop: 16,
                borderTop: "1px solid #e2e8f0",
              }}
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
                Billetes a Retirar
              </div>

              {/* Usamos Row para mostrar Billetes a dos columnas y ahorrar espacio vertical */}
              <Row gutter={16}>
                {denominaciones
                  .filter((d) => d.valor >= 1000)
                  .map((d) => (
                    <Col span={12} key={d.name}>
                      {/* Cambiamos a layout horizontal solo para las denominaciones */}
                      <Form.Item
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
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
                                fontSize: 11,
                                color: "#64748b",
                                minWidth: 50,
                                display: "inline-block",
                                textAlign: "right",
                              }}
                            >
                              = $
                              {(
                                (cantidades[d.name] || 0) * d.valor
                              ).toLocaleString("es-CL")}
                            </span>
                          }
                          onChange={(val) =>
                            setCantidades((prev) => ({
                              ...prev,
                              [d.name]: val || 0,
                            }))
                          }
                        />
                      </Form.Item>
                    </Col>
                  ))}
              </Row>

              <Divider dashed style={{ margin: "16px 0" }} />

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
                Monedas a Retirar
              </div>

              <Row gutter={16}>
                {denominaciones
                  .filter((d) => d.valor < 1000)
                  .map((d) => (
                    <Col span={12} key={d.name}>
                      <Form.Item
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 14 }}
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
                                fontSize: 11,
                                color: "#64748b",
                                minWidth: 50,
                                display: "inline-block",
                                textAlign: "right",
                              }}
                            >
                              = $
                              {(
                                (cantidades[d.name] || 0) * d.valor
                              ).toLocaleString("es-CL")}
                            </span>
                          }
                          onChange={(val) =>
                            setCantidades((prev) => ({
                              ...prev,
                              [d.name]: val || 0,
                            }))
                          }
                        />
                      </Form.Item>
                    </Col>
                  ))}
              </Row>
            </div>

            {/* --- Resultado Dinámico y Botón --- */}
            <div
              style={{
                background: "#fff1f0", // 🚀 Fondo rojo claro para indicar que es una SALIDA de dinero
                border: "1px solid #ffccc7",
                borderRadius: 8,
                padding: "16px",
                marginTop: "24px",
                marginBottom: "24px",
              }}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <span
                    style={{ fontWeight: 500, fontSize: 14, color: "#cf1322" }}
                  >
                    Total Físico a Retirar
                  </span>
                </Col>
                <Col>
                  <span
                    style={{ fontWeight: 700, fontSize: 22, color: "#cf1322" }}
                  >
                    ${totalDenominaciones.toLocaleString("es-CL")}
                  </span>
                </Col>
              </Row>
            </div>

            <Row justify="end">
              <Col>
                <Button onClick={cerrarModalRetiros} style={{ marginRight: 8 }}>
                  Cancelar
                </Button>
                <Button
                  type="primary"
                  danger // 🚀 Botón rojo para acciones de egreso
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  // Deshabilitamos el botón si el total es 0
                  disabled={totalDenominaciones === 0}
                >
                  Registrar Retiro
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>
      {/** Modal Descuento */}
      <Modal
        title={
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            Aplicar Descuento Especial
          </span>
        }
        open={modalDescuentoVisible}
        onCancel={cerrarModalDescuento}
        footer={null} // Ocultamos el footer de AntD porque el Form tiene su propio botón submit
        centered
      >
        {selectedProduct ? (
          <Form
            form={formDescuentoProducto}
            layout="vertical"
            onFinish={(values) => {
              confirmarDescuentoProducto(values);
            }}
            initialValues={{
              porcentajeDescuento: 0,
              montoDescuento: 0,
            }}
          >
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "16px",
                borderRadius: 8,
                marginBottom: 24,
                border: "1px solid #f0f0f0",
              }}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Producto">
                  <Typography.Text strong>
                    {selectedProduct.nombre}
                  </Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="Código/SKU">
                  <Typography.Text type="secondary">
                    {selectedProduct.codigo}
                  </Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="Precio Actual">
                  <Typography.Text
                    style={{ color: "#1890ff", fontWeight: 600 }}
                  >
                    ${Number(selectedProduct.precio).toLocaleString("es-CL")}
                  </Typography.Text>
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Typography.Text
              type="secondary"
              style={{ display: "block", marginBottom: 16 }}
            >
              Ingresa el descuento como porcentaje <strong>O</strong> como monto
              fijo:
            </Typography.Text>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Descuento en Porcentaje"
                  name="porcentajeDescuento"
                >
                  <InputNumber
                    min={0}
                    max={100}
                    style={{ width: "100%" }}
                    addonAfter={<PercentageOutlined />}
                    // 🚀 Se deshabilita si el monto es mayor a 0
                    disabled={Number(valorMonto) > 0}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Descuento Fijo (Dinero)"
                  name="montoDescuento"
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    addonBefore={<DollarOutlined />}
                    // 🚀 Se deshabilita si el porcentaje es mayor a 0
                    disabled={Number(valorPorcentaje) > 0}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row justify="end" style={{ marginTop: 24 }}>
              <Space>
                <Button onClick={cerrarModalDescuento}>Cancelar</Button>
                <Button type="primary" htmlType="submit">
                  Aplicar Descuento
                </Button>
              </Space>
            </Row>
          </Form>
        ) : (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Typography.Text type="danger">
              No hay ningún producto válido seleccionado.
            </Typography.Text>
          </div>
        )}
      </Modal>
      {/** Modal Autorización */}
      <Modal
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: "#faad14" }} />
            Autorización Requerida
          </Space>
        }
        open={modalAutorizacionVisible}
        onCancel={() => setModalAutorizacionVisible(false)}
        footer={null}
        width={400}
        centered
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Typography.Text type="secondary">
            Esta acción requiere permisos de administrador. Por favor, ingresa
            tus credenciales.
          </Typography.Text>
        </div>

        <Form
          form={formAutorizacion}
          layout="vertical"
          onFinish={async (values) => {
            try {
              const respuesta = await inicioSesionCajaAlternativo(
                values.rut,
                values.password,
              );
              console.log("Respuesta de autorización:", respuesta.data);
              if (respuesta.status === 200) {
                if (respuesta.data.nombreRol !== "admin") {
                  notification.error({
                    message: "Acceso Denegado",
                    description:
                      "El usuario no tiene permisos de administrador para realizar esta acción.",
                  });
                  return;
                }
                setModalAutorizacionVisible(false);
                formAutorizacion.resetFields();
                formDescuentoProducto.resetFields();
                abrirModalDescuento();
                return;
              }
              notification.error({
                message: "Error de Autorización",
                description:
                  respuesta.data?.message ||
                  "Credenciales incorrectas o usuario no autorizado.",
              });
            } catch (error) {
              console.error("Error al autorizar:", error);
              notification.error({
                message: "Error de Autorización",
                description:
                  error.response?.data?.message ||
                  "Ocurrió un error al intentar autorizar. Intenta nuevamente.",
              });
            }
          }}
        >
          <Form.Item
            name="rut"
            rules={[
              {
                required: true,
                message: "Ingresa el usuario/RUT",
              },
              {
                pattern: /^\d{6,8}-[0-9Kk]$/,
                message:
                  "Formato inválido. Usa el formato 12345678-9 (sin puntos)",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="Ej: 12345678-9"
              size="large"
              autoFocus
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Ingresa la contraseña o PIN" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="Contraseña / PIN de Autorización"
              size="large"
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" block>
            Autorizar
          </Button>
        </Form>
      </Modal>
      {/** Modal Consulta Stock */}
      <Modal
        open={modalConsultarStockVisible}
        onCancel={cerrarModalConsultaStock}
        title={
          <Space>
            <EyeOutlined style={{ color: "#1890ff" }} />
            Consulta de Stock
          </Space>
        }
        width={500}
        centered
        footer={null}
      >
        <Form
          form={formConsultarStock}
          layout="vertical"
          onFinish={(values) => {
            funcionConsultaStock(values);
          }}
        >
          <Form.Item
            name="codigoProducto"
            label="Código o SKU del Producto"
            rules={[
              {
                required: true,
                message: "Ingresa el código o SKU del producto",
              },
            ]}
          >
            <Input
              placeholder="Ingrese Codigo Del Producto ..."
              prefix={<BarcodeOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              autoFocus
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Consultar Stock
          </Button>
        </Form>

        {stockProducto !== null && (
          <div
            style={{
              marginTop: 24,
              padding: 16,
              backgroundColor: "#f0f7ff",
              borderRadius: 8,
              border: "1px solid #d6e4ff",
            }}
          >
            <p style={{ margin: "4px 0", fontSize: "16px" }}>
              <strong>Producto:</strong> {stockProducto.nombre}
            </p>
            <p style={{ margin: "4px 0", fontSize: "16px" }}>
              {/* Apuntamos directamente a la propiedad stock */}
              <strong>Stock Disponible:</strong>{" "}
              <span style={{ color: "#1890ff", fontWeight: "bold" }}>
                {stockProducto.stock}
              </span>
            </p>
            <p style={{ margin: "4px 0", fontSize: "16px" }}>
              <strong>Precio Venta:</strong> $
              {Number(stockProducto.precioVenta || 0).toLocaleString("es-CL")}
            </p>
            <p style={{ margin: "4px 0", fontSize: "16px" }}>
              <strong>Estado:</strong> {stockProducto.estado}
            </p>
          </div>
        )}
      </Modal>
      {/** Modal Nuevo Usuario */}
      <Modal
        open={modalNuevoUsuarioVisible}
        closable={false}
        title={
          <Space>
            <UserAddOutlined style={{ color: "#1890ff" }} />
            Bienvenido al Sistema
          </Space>
        }
        width={500}
        centered
        footer={null}
      >
        <p>Por favor, cambia tu contraseña para continuar.</p>
        <Form
          form={formNuevoUsuario}
          layout="vertical"
          onFinish={handleNuevoUsuarioSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nombre"
                name="nombre"
                initialValue={user.nombre || ""}
              >
                <Input placeholder="Ingresa tu nombre completo" disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="email"
                name="email"
                initialValue={user.email || ""}
              >
                <Input placeholder="Ingresa tu email" disabled />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Nueva Contraseña"
            name="newPassword"
            rules={[
              {
                required: true,
                message: "Por favor ingresa una contraseña",
              },
            ]}
          >
            <Input.Password placeholder="Ingresa tu contraseña" />
          </Form.Item>
          <Form.Item
            label="Confirmar Contraseña"
            name="reNewPassword"
            rules={[
              {
                required: true,
                message: "Por favor confirma tu contraseña",
              },
            ]}
          >
            <Input.Password placeholder="Confirma tu contraseña" />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Actualizar Contraseña
          </Button>
          <Button onClick={logout} style={{ marginLeft: 8 }}>
            Salir
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
