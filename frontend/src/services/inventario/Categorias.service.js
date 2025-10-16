import axios from "axios";

const API_URL = "https://localhost:3443/api/categorias";

export default async function obtenerCategoria() {
  try {
    const response = await axios.get(`${API_URL}/buscar`);
    //console.log("Categorías obtenidas:", response);
    return response.data;
  } catch (error) {
    //console.error("Error al obtener categorias:", error.response.data.error);
    return error.response.data;
  }
}

export async function crearCategoria(datos) {
  try {
    const response = await axios.post(`${API_URL}/crear`, datos);
    //console.log("Productos obtenidos:", response);
    return response;
  } catch (error) {
    console.error("Error al crear productos:", error.response.data.error);
    return error.response.data;
  }
}

export async function editarCategoria(datos, id) {
  try {
    const response = await axios.put(`${API_URL}/actualizar/${id}`, datos);
    console.log("categoria obtenidos:", response);
    return response.data;
  } catch (error) {
    console.error("Error al editar categoria:", error.response.data.error);
    return error.response.data;
  }
}
