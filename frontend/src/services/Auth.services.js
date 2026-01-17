import axios from "axios";
import URL from "./Constante";

const API_URL = `${URL}/auth`;

export default async function inicioSesion(email, password) {
  try {
    const response = await axios.post(
      `${API_URL}/login`,
      {
        email,
        password,
      },
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    console.log(error);
    return error?.message;
  }
}

export async function inicioSesionCodigo(codigo) {
  try {
    const response = await axios.post(
      `${API_URL}/login-codigo`,
      { codigo },
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    console.log(error);
    return error?.message;
  }
}

export async function finSesion() {
  try {
    const response = await axios.post(`${API_URL}/logout`, null, {
      withCredentials: true,
    });
    //console.log("Respuesta logout", response);
    if (!response.data) {
      return "No se recibió respuesta del servidor";
    }

    return response.data;
  } catch (error) {
    console.log(error);
    return error.message;
  }
}

export async function miEstado() {
  try {
    const response = await axios.get(`${API_URL}/yo`, {
      withCredentials: true,
    });
    if (!response) {
      return "No se recibió respuesta del servidor";
    }
    //console.log("Respuesta verificación token:", response);
    return response;
  } catch (error) {
    console.log("Error en miEstado:", error);
    return error.message;
  }
}
