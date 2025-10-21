import axios from "axios";

const API_URL = "https://localhost:3443/api/bodegas";

export default async function obtenerBodegas() {
  try {
    const response = await axios.get(`${API_URL}/buscar`, {
      withCredentials: true,
    });
    //console.log("bodegas obtenidas:", response);
    return response.data;
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
    const response = await axios.delete(`${API_URL}/eliminar/${id}`, {
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
