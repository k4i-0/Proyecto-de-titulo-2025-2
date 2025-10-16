import axios from "axios";

const API_URL = "https://localhost:3443/api/productos";

export default async function obtenerProductos() {
  try {
    const response = await axios.get(`${API_URL}/buscar`);
    //console.log("Productos obtenidos:", response);
    return response.data;
  } catch (error) {
    //console.error("Error al obtener productos:", error.response.data.error);
    return error.response.data;
  }
}

export async function obtenerProductosId(id) {
  try {
    const response = await axios.get(`${API_URL}/buscar/${id}`);
    //console.log("Productos obtenidos:", response);
    return response.data;
  } catch (error) {
    console.error("Error al obtener productos:", error.response.data.error);
    return error.response.data;
  }
}

export async function crearProducto(datos) {
  try {
    const response = await axios.post(`${API_URL}/crear`, datos);
    //console.log("Productos obtenidos:", response);
    return response;
  } catch (error) {
    console.error("Error al crear productos:", error.response.data.error);
    return error.response.data;
  }
}

export async function editarProducto(datos, id) {
  try {
    const response = await axios.put(`${API_URL}/actualizar/${id}`, datos);
    //console.log("Productos obtenidos:", response);
    return response;
  } catch (error) {
    console.error("Error al editar productos:", error.response.data.error);
    return error.response.data;
  }
}

export async function eliminarProducto(id) {
  try {
    const response = await axios.delete(`${API_URL}/eliminar/${id}`);
    console.log("Productos obtenidos:", response);
    return response;
  } catch (error) {
    console.error("Error al editar productos:", error.response.data.error);
    return error.response;
  }
}
