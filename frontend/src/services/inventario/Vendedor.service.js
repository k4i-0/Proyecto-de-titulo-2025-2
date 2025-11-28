// Vendedor.service.js
import axios from "axios";

const API_URL = "tu-url-base/vendedores";

export async function getVendedoresBySucursal(idSucursal) {
  try {
    const response = await axios.get(`${API_URL}/sucursal/${idSucursal}`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error:", error);
    return error.response?.data || { status: 500, error: "Error del servidor" };
  }
}

export async function crearVendedor(vendedorData) {
  try {
    const response = await axios.post(`${API_URL}/crear`, vendedorData, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error:", error);
    return error.response?.data || { status: 500, error: "Error del servidor" };
  }
}

export async function eliminarVendedor(idVendedor) {
  try {
    const response = await axios.delete(`${API_URL}/${idVendedor}`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error:", error);
    return error.response?.data || { status: 500, error: "Error del servidor" };
  }
}
