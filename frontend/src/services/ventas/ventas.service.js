import axios from "axios";
import URL from "../Constante";

const API_URL = `${URL}/ventas`;

export async function buscarProductoVenta(codigo) {
  try {
    const response = await axios.get(
      `${API_URL}/buscar/producto/venta`,

      {
        params: { codigo },
        withCredentials: true,
      },
    );
    //console.log("Producto encontrado para venta:", response);
    return response;
  } catch (error) {
    //console.error("Error al buscar producto para venta:", error);

    return error;
  }
}

export async function aperturaCaja(
  deviceID,
  numeroCaja,
  sucursal,
  montoInicial,
  cantidadMontoInicial,
) {
  try {
    const response = await axios.post(
      `${API_URL}/apertura/caja/${deviceID}`,
      {
        numeroCaja: numeroCaja,
        sucursal: sucursal,
        montoInicial: montoInicial,
        cantidadMontoInicial: cantidadMontoInicial,
      },
      {
        withCredentials: true,
      },
    );
    console.log("Respuesta de apertura de caja:", response);
    return response;
  } catch (error) {
    console.error("Error al abrir caja:", error);
    return error.response;
  }
}

export async function registroCajaEnSucursal({
  numeroCaja,
  idPC,
  descripcionPC,
  idSucursal,
  idPOS,
  tipoMaquinaPOS,
  descripcionPOS,
}) {
  try {
    const response = await axios.post(
      `${API_URL}/registro/caja`,
      {
        numeroCaja,
        idPC,
        descripcionPC,
        idSucursal,
        idPOS,
        tipoMaquinaPOS,
        descripcionPOS,
      },
      {
        withCredentials: true,
      },
    );
    //console.log("Respuesta de registro de caja en sucursal:", response.status);
    return response;
  } catch (error) {
    console.error(
      "222Error al registrar caja en sucursal:",
      error.response?.data?.error,
    );
    return error.response;
  }
}

export async function consultarEstadoCaja(deviceID) {
  try {
    const response = await axios.get(
      `${API_URL}/consultar/datos/caja/${deviceID}`,
      {
        withCredentials: true,
      },
    );
    console.log("Respuesta de consulta de estado de caja:", response.status);
    return response;
  } catch (error) {
    console.error("Error al consultar estado de caja:", error);
    return error.response;
  }
}

export async function cierreCaja(valores) {
  console.log("Valores recibidos para cierre de caja:", valores.deviceID);
  try {
    const response = await axios.post(
      `${API_URL}/cierre/caja/${valores.deviceID}`,
      {
        montoArqueo: valores.totalCierre,
        cantidadMontoFinal: valores.cantidadMontoFinal,
        observacionesCierre: valores.observacionesCierre || " ",
      },
      {
        withCredentials: true,
      },
    );
    console.log("Respuesta de cierre de caja:", response.status);
    return response;
  } catch (error) {
    console.error("Error al cerrar caja:", error);
    return error.response;
  }
}

export async function solicitarPagoTarjeta(deviceID, datos) {
  try {
    const response = await axios.post(
      `${API_URL}/solicitud/pago/tarjeta/${deviceID}`,
      datos,
      {
        withCredentials: true,
      },
    );
    console.log("Respuesta de solicitud de pago con tarjeta:", response.status);
    return response;
  } catch (error) {
    console.error("Error al solicitar pago con tarjeta:", error);
    return error.response;
  }
}

export async function registroVenta(deviceID, datosVenta) {
  try {
    console.log("Datos recibidos para registro de venta:", datosVenta);
    const response = await axios.post(
      `${API_URL}/registro/venta/${deviceID}`,
      {
        idVentaCliente: datosVenta.idVentaCliente,
        idPOS: datosVenta.idPOS,
        idSucursal: datosVenta.idSucursal,

        tipoPago: datosVenta.tipoPago,
        detallePagos: datosVenta.detallePagos,

        productosVendidos: datosVenta.productosVendidos ?? datosVenta.items,
        totalVenta: datosVenta.totalVenta ?? datosVenta.total,
        metodoPago: datosVenta.metodoPago,
        idVentaVendedor: datosVenta.idVentaVendedor,
      },
      {
        withCredentials: true,
      },
    );
    console.log("Respuesta de registro de venta:", response.status);
    return response;
  } catch (error) {
    console.error("Error al registrar venta:", error);
    return error.response;
  }
}

export async function consultarEstadoMP(deviceID) {
  try {
    const response = await axios.get(
      `${API_URL}/consultar/estado/MP/${deviceID}`,
      {
        withCredentials: true,
      },
    );
    //console.log("Respuesta de consulta de estado de MP:", response.status);
    return response;
  } catch (error) {
    console.error("Error al consultar estado de MP:", error);
    return error.response;
  }
}

export async function consultarStatusVentas(idOrdenMP) {
  try {
    const response = await axios.get(
      `${API_URL}/consultar/estado/venta/${idOrdenMP}`,
      {
        withCredentials: true,
      },
    );
    //console.log("Respuesta de consulta de estado de venta:", response.status);
    return response;
  } catch (error) {
    console.error("Error al consultar status de venta:", error);
    return error.response;
  }
}

export async function cancelarVentaTarjeta(idOrdenMP) {
  try {
    const response = await axios.post(
      `${API_URL}/cancelar/venta/tarjeta/${idOrdenMP}`,
      {},
      {
        withCredentials: true,
      },
    );
    console.log(
      "Respuesta de cancelación de venta con tarjeta:",
      response.status,
    );
    return response;
  } catch (error) {
    console.error("Error al cancelar venta con tarjeta:", error);
    return error.response;
  }
}

export async function verVentasDelDia(deviceID) {
  try {
    const response = await axios.get(`${API_URL}/ver/ventas/dia/${deviceID}`, {
      withCredentials: true,
    });
    console.log("Respuesta de consulta de ventas del día:", response.status);
    return response;
  } catch (error) {
    console.error("Error al consultar ventas del día:", error);
    return error.response;
  }
}

export async function generarArqueoCaja(deviceID) {
  try {
    const response = await axios.get(
      `${API_URL}/generar/arqueo/caja/${deviceID}`,
      {
        withCredentials: true,
      },
    );
    console.log("Respuesta de generación de arqueo de caja:", response.status);
    return response;
  } catch (error) {
    console.error("Error al generar arqueo de caja:", error);
    return error.response;
  }
}

export async function guardarArqueoCaja(deviceID, datosArqueo) {
  try {
    const response = await axios.post(
      `${API_URL}/guardar/arqueo/caja/${deviceID}`,
      {
        montoCierreReal: datosArqueo.montoCierreReal,
        cantidadMontoCierreReal: datosArqueo.cantidadMontoCierreReal,
      },
      {
        withCredentials: true,
      },
    );
    console.log("Respuesta de guardado de arqueo de caja:", response.status);
    return response;
  } catch (error) {
    console.error("Error al guardar arqueo de caja:", error);
    return error.response;
  }
}

export async function consultaCierreCajaPendiente(deviceID) {
  try {
    const response = await axios.get(
      `${API_URL}/consultar/cierre/caja/dia/anterior/${deviceID}`,
      {
        withCredentials: true,
      },
    );
    console.log(
      "Respuesta de consulta de cierre de caja pendiente:",
      response.status,
    );
    return response;
  } catch (error) {
    console.error("Error al consultar cierre de caja pendiente:", error);
    return error.response;
  }
}

export async function cierreCajaPendienteAdmin(deviceID, datosCierre) {
  try {
    const response = await axios.post(
      `${API_URL}/registro/cierre/pendiente/admin/${deviceID}`,
      {
        idRegistroCaja: datosCierre.idRegistroCaja,
        cantidadMontoFinal: datosCierre.cantidadMontoFinal,
        observacionesCierre: datosCierre.observacionesCierre || " ",
        totalCierre: datosCierre.totalCierre,
      },
      {
        withCredentials: true,
      },
    );
    console.log(
      "Respuesta de cierre de caja pendiente admin:",
      response.status,
    );
    return response;
  } catch (error) {
    console.error("Error al cerrar caja pendiente admin:", error);
    return error.response;
  }
}

export async function ventaPendientePago(datosVenta) {
  try {
    console.log("Datos recibidos para venta pendiente de pago:", datosVenta);
    const response = await axios.post(
      `${API_URL}/crear/venta/pendiente`,
      {
        productosVendidos: datosVenta.productosVendidos,
        totalVenta: datosVenta.totalVenta,
        metodoPago: datosVenta.metodoPago,
        totalDescuentos: datosVenta.totalDescuentos,
      },
      {
        withCredentials: true,
      },
    );
    //console.log("Respuesta de creación de venta pendiente:", response.status);
    return response;
  } catch (error) {
    console.error("Error al crear venta pendiente:", error);
    return error.response;
  }
}

export async function consultarVentaPendiente() {
  try {
    const response = await axios.get(`${API_URL}/consultar/venta/pendiente`, {
      withCredentials: true,
    });
    console.log("Respuesta de consulta de venta pendiente:", response.status);
    return response;
  } catch (error) {
    console.error("Error al consultar venta pendiente:", error);
    return error.response;
  }
}

export async function consultarVentasPendientesCaja(idVentaPendiente) {
  try {
    const response = await axios.get(
      `${API_URL}/consultar/venta/pendiente/caja/${idVentaPendiente}`,
      {
        withCredentials: true,
      },
    );
    console.log(
      "Respuesta de consulta de ventas pendientes de caja:",
      response.status,
    );
    return response;
  } catch (error) {
    console.error("Error al consultar ventas pendientes de caja:", error);
    return error.response;
  }
}
