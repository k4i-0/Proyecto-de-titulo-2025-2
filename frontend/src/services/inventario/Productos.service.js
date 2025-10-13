import axios from "axios";

const API_URL = "https://localhost:3443/api/productos";

export default async function obtenerProductos() {
  try {
    const response = await axios.get(API_URL);
    console.log("Productos obtenidos:", response);
    return { data: response.data };
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
}
