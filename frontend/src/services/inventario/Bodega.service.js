import axios from "axios";
import URL from "../Constante";

const API_URL = `${URL}/bodegas`;

export default async function obtenerBodegas() {
  try {
    const response = await axios.get(`${API_URL}/buscar`, {
      withCredentials: true,
    });
    //console.log("bodegas obtenidas:", response);
    return response;
  } catch (error) {
    //console.error("Error al obtener bodegas:", error.response.data.error);
    if (error.response.data.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function crearBodega(datos) {
  try {
    const response = await axios.post(`${API_URL}/crear`, datos, {
      withCredentials: true,
    });
    //console.log("bodegas creadas:", response);
    return response;
  } catch (error) {
    console.error("Error al crear bodegas:", error.response.data.error);
    if (error.response.data.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function editarBodega(datos, id) {
  try {
    const response = await axios.put(`${API_URL}/actualizar/${id}`, datos, {
      withCredentials: true,
    });
    console.log("bodegas obtenidas:", response);
    return response;
  } catch (error) {
    console.error("Error al editar bodegas:", error.response.data.error);
    if (error.response.data.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function eliminarBodega(id) {
  try {
    const response = await axios.delete(`${API_URL}/eliminar/${id}`, null, {
      withCredentials: true,
    });
    console.log("bodega eliminada:", response);
    return response;
  } catch (error) {
    console.error("Error al eliminar bodega:", error.response.data.error);
    if (error.response.data.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function obtenerBodegasPorSucursal(idSucursal) {
  try {
    const response = await axios.get(`${API_URL}/buscar/${idSucursal}`, {
      withCredentials: true,
    });
    //console.log("bodegas obtenidas por sucursal:", response);
    return response;
  } catch (error) {
    console.error(
      "Error al obtener bodegas por sucursal:",
      error.response.data.error
    );
    if (error.response.data.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}
