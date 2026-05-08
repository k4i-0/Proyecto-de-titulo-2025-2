import axios from "axios";
import URL from "../Constante";

export async function obtenerDespachosPorOrden(nombreOrden) {
  try {
    const response = await axios.get(
      `${URL}/despachos/${nombreOrden}/ver-orden`,
    );
    return response;
  } catch (error) {
    console.error("Error al obtener despachos por orden:", error);
    return error.response;
  }
}

export async function obtenerTodosDespachos() {
  try {
    const respuesta = await axios.get(`${URL}/despachos/ver-despachos`, {
      withCredentials: true,
    });
    return respuesta;
  } catch (error) {
    console.log("Error fun: obtenerTodosDespachos", error);
    return error.response;
  }
}

export async function obtenerDespachosPorRutProveedor(rutProveedor) {
  try {
    const respuesta = await axios.get(
      `${URL}/despachos/${rutProveedor}/ver-proveedor`,
      {
        withCredentials: true,
      },
    );
    return respuesta;
  } catch (error) {
    console.log("Error fun: obtenerDespachosPorRutProveedor", error);
    return error.response;
  }
}
