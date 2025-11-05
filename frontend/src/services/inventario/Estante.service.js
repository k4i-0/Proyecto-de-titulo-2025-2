import axios from "axios";
import URL from "../Constante";

const API_URL = `${URL}/estantes`;

export async function getAllEstantes() {
  try {
    const response = await axios.get(`${API_URL}/buscar`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error al obtener los estantes:", error);
    if (error.response.data.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function getAllEstantesBodega(idBodega) {
  try {
    const response = await axios.get(`${API_URL}/buscar/${idBodega}`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error al obtener los estantes:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function crearEstante(estanteData) {
  try {
    const response = await axios.post(`${API_URL}/crear`, estanteData, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error al crear el estante:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function editarEstante(estanteData, id) {
  try {
    const response = await axios.put(
      `${API_URL}/actualizar/${id}`,
      estanteData,
      {
        withCredentials: true,
      }
    );
    return response;
  } catch (error) {
    console.error("Error al actualizar el estante:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function eliminarEstante(id) {
  try {
    const response = await axios.delete(`${API_URL}/eliminar/${id}`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error al eliminar el estante:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}
