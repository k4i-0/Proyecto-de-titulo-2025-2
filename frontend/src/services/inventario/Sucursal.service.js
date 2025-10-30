import axios from "axios";
import URL from "../Constante";

const API_URL = `${URL}/sucursales`;

export default async function obtenerSucursales() {
  try {
    const response = await axios.get(`${API_URL}/buscar`, null, {
      withCredentials: true,
    });
    //console.log("Sucursales obtenidas:", response.status);
    return response;
  } catch (error) {
    console.error("Error al obtener sucursales:", error.response);
    return error.response.data;
  }
}

export async function crearSucursal(datos) {
  try {
    const response = await axios.post(`${API_URL}/crear`, datos, {
      withCredentials: true,
    });
    //console.log("Sucursales creadas:", response);
    return response;
  } catch (error) {
    console.error("Error al crear sucursales:", error.response);
    return error.response.data;
  }
}

export async function editarSucursal(datos, id) {
  try {
    const response = await axios.put(`${API_URL}/actualizar/${id}`, datos, {
      withCredentials: true,
    });
    //console.log("Sucursal obtenida:", response);
    return response;
  } catch (error) {
    console.error("Error al editar sucursal:", error.response.data.error);
    return error.response.data;
  }
}

export async function eliminarSucursal(id) {
  try {
    const response = await axios.delete(`${API_URL}/eliminar/${id}`, {
      withCredentials: true,
    });
    //console.log("Sucursal eliminada:", response);
    return response;
  } catch (error) {
    console.error("Error al eliminar sucursal:", error.response.data.error);
    return error.response.data;
  }
}
