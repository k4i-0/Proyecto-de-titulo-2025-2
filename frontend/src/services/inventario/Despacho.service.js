import axios from "axios";
import URL from "../Constante";

export async function obtenerDespachosPorOrden(idOrdenCompra) {
  try {
    const response = await axios.get(`${URL}/despachos/${idOrdenCompra}/ver`);
    return response;
  } catch (error) {
    console.error("Error al obtener despachos por orden:", error);
    return error.response;
  }
}
