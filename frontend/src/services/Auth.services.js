import axios from "axios";

const API_URL = "https://localhost:3443/api";

export default async function inicioSesion(email, password) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    if (!response.data) {
      return "No se recibió respuesta del servidor";
    }
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    return error.response.data;
  }
}
