import axios from "axios";
import URL from "../Constante";

const API_URL = `${URL}/inventario`;

export default async function obtenerInventarios() {
  try {
    const response = await axios.get(`${API_URL}/buscar`, null, {
      withCredentials: true,
    });
    //console.log("inventarios obtenidas:", response);
    return response.data;
  } catch (error) {
    //console.error("Error al obtener inventarios:", error.response.data.error);
    if (error.response.data.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function crearInventarios(datos) {
  try {
    const response = await axios.post(`${API_URL}/crear`, datos, {
      withCredentials: true,
    });
    //console.log("inventarios creados:", response);
    return response;
  } catch (error) {
    console.error("Error al crear inventarios:", error.response.data.error);
    if (error.response.data.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function editarInventario(datos, id) {
  try {
    const response = await axios.put(`${API_URL}/actualizar/${id}`, datos, {
      withCredentials: true,
    });
    console.log("inventarios obtenidos:", response);
    return response;
  } catch (error) {
    console.error("Error al editar inventarios:", error.response.data.error);
    if (error.response.data.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function eliminarInventario(id) {
  try {
    const response = await axios.delete(`${API_URL}/eliminar/${id}`, null, {
      withCredentials: true,
    });
    console.log("inventario eliminado:", response);
    return response;
  } catch (error) {
    console.error("Error al eliminar inventario:", error.response.data.error);
    if (error.response.data.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}
