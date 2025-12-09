import axios from "axios";
import URL from "../Constante";

const API_URL = `${URL}/compra-proveedor`;

export default async function crearOrdenCompraProveedor(ordenData) {
  try {
    const response = await axios.post(`${API_URL}/crear-orden`, ordenData, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error al crear la orden de compra a proveedor:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function obtenerOrdenesCompraProveedores() {
  try {
    const response = await axios.get(`${API_URL}/buscar-ordenes`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error(
      "Error al obtener las ordenes de compra a proveedores:",
      error
    );
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}
