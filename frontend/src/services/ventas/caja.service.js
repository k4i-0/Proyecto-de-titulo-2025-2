import axios from "axios";
import URL from "../Constante";

const API_URL = `${URL}/cajas`;

export async function buscarTodasLasCajas() {
  try {
    const response = await axios.get(`${API_URL}/buscar/todas/cajas`, {
      withCredentials: true,
    });
    //console.log("Todas las cajas obtenidas:", response);
    return response;
  } catch (error) {
    console.error(
      "Error al obtener todas las cajas:",
      error.response?.data?.error || error.message,
    );
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response?.data;
  }
}

export async function buscarCajasPorSucursal(idSucursal) {
  try {
    const response = await axios.get(
      `${API_URL}/buscar/por/sucursal/${idSucursal}`,
      {
        withCredentials: true,
      },
    );
    //console.log("Cajas obtenidas por sucursal:", response);
    return response;
  } catch (error) {
    console.error(
      "Error al obtener cajas por sucursal:",
      error.response?.data?.error || error.message,
    );
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response?.data;
  }
}

export async function buscarDatosCuadraturaCaja(deviceID) {
  try {
    const response = await axios.get(
      `${API_URL}/consultar/datos/cuadratura/${deviceID}`,
      {
        withCredentials: true,
      },
    );
    //console.log("Datos de cuadratura de caja obtenidos:", response);
    return response;
  } catch (error) {
    console.error(
      "Error al obtener datos de cuadratura de caja:",
      error.response?.data?.error || error.message,
    );
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response?.data;
  }
}

export async function bloquearFuncionamientoCaja(deviceID) {
  try {
    const response = await axios.post(
      `${API_URL}/bloquear/caja/${deviceID}`,
      {},
      {
        withCredentials: true,
      },
    );
    console.log("Respuesta de bloqueo de caja:", response.status);
    return response;
  } catch (error) {
    console.error("Error al bloquear caja:", error);
    return error.response;
  }
}

export async function desbloquearFuncionamientoCaja(deviceID) {
  try {
    const response = await axios.post(
      `${API_URL}/desbloquear/caja/${deviceID}`,
      {},
      {
        withCredentials: true,
      },
    );
    console.log("Respuesta de desbloqueo de caja:", response.status);
    return response;
  } catch (error) {
    console.error("Error al desbloquear caja:", error);
    return error.response;
  }
}

export async function cuadrarCaja(deviceID, observaciones) {
  try {
    const response = await axios.post(
      `${API_URL}/cuadrar/caja/${deviceID}`,
      { observaciones },
      {
        withCredentials: true,
      },
    );
    console.log("Respuesta de cuadratura de caja:", response.status);
    return response;
  } catch (error) {
    console.error("Error al cuadrar caja:", error);
    return error.response;
  }
}
