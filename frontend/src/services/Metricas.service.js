import axios from "axios";
import URL from "./Constante";

const API_URL = `${URL}/metricas`;

export const obtenerMetricasDashboard = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error al obtener métricas del dashboard:", error);
    return (
      error.response || { error: "Error al obtener métricas del dashboard" }
    );
  }
};

export const obtenerMetricasSucursalDashboard = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/dashboard/metricas/sucursales`,
      {
        withCredentials: true,
      },
    );
    return response;
  } catch (error) {
    console.error("Error al obtener métricas del dashboard:", error);
    return (
      error.response || { error: "Error al obtener métricas del dashboard" }
    );
  }
};

export const obtenerDashboardSucursal = async (idSucursal) => {
  try {
    const response = await axios.get(
      `${API_URL}/dashboard/sucursal/${idSucursal}`,
      {
        withCredentials: true,
      },
    );
    return response;
  } catch (error) {
    console.error("Error al obtener métricas del dashboard:", error);
    return (
      error.response || { error: "Error al obtener métricas del dashboard" }
    );
  }
};

export const obtenerInformesVentas = async (
  idSucursal,
  fechaInicio,
  fechaFin,
) => {
  try {
    const response = await axios.get(`${API_URL}/informes/ventas`, {
      params: { idSucursal, fechaInicio, fechaFin },
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error al obtener informes de ventas:", error);
    return error.response || { error: "Error al obtener informes de ventas" };
  }
};

export const obtenerInformeInventario = async ({
  idBodega,
  estadoStock,
  busqueda,
}) => {
  try {
    const response = await axios.get(`${API_URL}/informes/inventario`, {
      params: { idBodega, estadoStock, busqueda },
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error al obtener informe de inventario:", error);
    return (
      error.response || { error: "Error al obtener informe de inventario" }
    );
  }
};

export const obtenerInformeCaja = async ({
  idSucursal,
  fechaInicio,
  fechaFin,
}) => {
  try {
    const response = await axios.get(`${API_URL}/informes/caja`, {
      params: { idSucursal, fechaInicio, fechaFin },
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error al obtener informe de caja:", error);
    return error.response || { error: "Error al obtener informe de caja" };
  }
};
