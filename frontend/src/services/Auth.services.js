import axios from "axios";

const API_URL = "https://localhost:3443/api";

export default async function inicioSesion(email, password) {
  try {
    const response = await axios.post(
      `${API_URL}/auth/login`,
      {
        email,
        password,
      },
      { withCredentials: true }
    );
    if (!response.data) {
      return "No se recibió respuesta del servidor";
    }
    return response.data;
  } catch (error) {
    console.log(error);
    return error.response.data;
  }
}

export async function finSesion() {
  try {
    const response = await axios.post(`${API_URL}/auth/logout`, {
      withCredentials: true,
    });
    if (!response.data) {
      return "No se recibió respuesta del servidor";
    }
    console.log(response);
    return response.data;
  } catch (error) {
    console.log(error);
    return error.response.data;
  }
}

export async function verificarToken() {
  try {
    const response = await axios.get(`${API_URL}/auth/yo`, {
      withCredentials: true,
    });
    if (!response.data) {
      return "No se recibió respuesta del servidor";
    }
    console.log("Respuesta verificación token:", response.data);
    return response;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}
