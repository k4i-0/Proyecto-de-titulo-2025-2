import axios from "axios";
import URL from "../Constante";

const API_URL = `${URL}/funcionarios`;

export default async function obtenerTodosFuncionarios() {
  try {
    const response = await axios.get(`${API_URL}/buscar`, {
      withCredentials: true,
    });
    //console.log("funcionarios obtenidos:", response);
    return response;
  } catch (error) {
    //console.error("Error al obtener funcionarios:", error.response.data.error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response?.data;
  }
}

export async function crearFuncionario(datos) {
  try {
    const response = await axios.post(`${API_URL}/crear`, datos, {
      withCredentials: true,
    });
    //console.log("funcionarios creados:", response);
    return response;
  } catch (error) {
    console.error("Error al crear funcionarios:", error.response.data.error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response?.data;
  }
}

export async function editarFuncionario(datos) {
  try {
    const respuesta = await axios.put(`${API_URL}/editar`, datos, {
      withCredentials: true,
    });
    return respuesta;
  } catch (error) {
    console.error("Error al editar funcionario:", error.response.data.error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
  }
}

export async function obtenerColaboradoresSucursal(idSucursal) {
  try {
    const response = await axios.get(`${API_URL}/colaboradores/${idSucursal}`, {
      withCredentials: true,
    });
    //console.log("colaboradores obtenidos:", response);
    return response;
  } catch (error) {
    //console.error("Error al obtener colaboradores:", error.response.data.error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response?.data;
  }
}

export async function eliminarFuncionario(idFuncionario) {
  try {
    const response = await axios.delete(
      `${API_URL}/eliminar/${idFuncionario}`,
      { withCredentials: true }
    );
    //console.log("funcionario desvinculado:", response);
    return response;
  } catch (error) {
    //console.error("Error al desvincular funcionario:", error.response.data.error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response?.data;
  }
}

export async function obtenerQuienSoy() {
  try {
    const response = await axios.get(`${API_URL}/quienSoy`, {
      withCredentials: true,
    });
    //console.log("quienSoy obtenido:", response);
    return response;
  } catch (error) {
    //console.error("Error al obtener quienSoy:", error.response.data.error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response?.data;
  }
}
