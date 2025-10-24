import axios from "axios";
import URL from "../Constante";

const API_URL = `${URL}/categorias`;

export default async function obtenerCategoria() {
  try {
    const response = await axios.get(`${API_URL}/buscar`, null, {
      withCredentials: true,
    });
    //console.log("Categorías obtenidas:", response);
    return response.data;
  } catch (error) {
    //console.error("Error al obtener categorias:", error.response.data.error);
    return error.response.data;
  }
}

export async function crearCategoria(datos) {
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

export async function editarCategoria(datos, id) {
  try {
    const response = await axios.put(`${API_URL}/actualizar/${id}`, datos, {
      withCredentials: true,
    });
    console.log("categoria obtenidos:", response);
    return response;
  } catch (error) {
    console.error("Error al editar categoria:", error.response.data.error);
    return error.response.data;
  }
}

export async function eliminarCategoria(id) {
  try {
    const response = await axios.delete(`${API_URL}/eliminar/${id}`, null, {
      withCredentials: true,
    });
    console.log("categoria eliminada:", response);
    return response;
  } catch (error) {
    console.error("Error al eliminar categoria:", error.response.data.error);
    return error.response.data;
  }
}
