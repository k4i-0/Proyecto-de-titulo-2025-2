import axios from "axios";
import URL from "../Constante";

const API_URL = `${URL}/productos`;

export default async function obtenerProductos() {
  try {
    const response = await axios.get(`${API_URL}/buscar`, {
      withCredentials: true,
    });
    //console.log("Productos Status:", response.status);
    return response;
  } catch (error) {
    //console.error("Error al obtener productos:", error.response.data.error);
    return error.response.data;
  }
}

export async function obtenerProductosId(id) {
  try {
    const response = await axios.get(`${API_URL}/buscar/${id}`, {
      withCredentials: true,
    });
    //console.log("Productos obtenidos:", response);
    return response.data;
  } catch (error) {
    console.error("Error al obtener productos:", error.response.data.error);
    return error.response.data;
  }
}

export async function crearProducto(datos) {
  try {
    const response = await axios.post(`${API_URL}/crear`, datos, {
      withCredentials: true,
    });
    //console.log("Productos obtenidos:", response);
    return response;
  } catch (error) {
    console.error("Error al crear productos:", error.response.data.error);
    return error.response.data;
  }
}

export async function editarProducto(datos, id) {
  try {
    const response = await axios.put(`${API_URL}/actualizar/${id}`, datos, {
      withCredentials: true,
    });
    //console.log("Productos obtenidos:", response);
    return response;
  } catch (error) {
    console.error("Error al editar productos:", error.response.data.error);
    return error.response.data;
  }
}

export async function eliminarProducto(id) {
  try {
    const response = await axios.delete(`${API_URL}/eliminar/${id}`, null, {
      withCredentials: true,
    });
    // console.log("Productos obtenidos:", response);
    return response;
  } catch (error) {
    console.error("Error al editar productos:", error.response.data.error);
    return error.response;
  }
}
