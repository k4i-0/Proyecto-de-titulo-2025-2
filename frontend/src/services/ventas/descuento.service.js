import axios from "axios";
import URL from "../Constante";

const API_URL = `${URL}/descuentos`;

export async function registrarDescuentoSobreProducto(datos) {
  try {
    const response = await axios.post(
      `${API_URL}/registrar/descuento/producto`,
      datos,
      {
        withCredentials: true,
      },
    );
    console.log("Respuesta de registro de descuento sobre producto:", response);
    return response;
  } catch (error) {
    console.error("Error al registrar descuento sobre producto:", error);
    return error;
  }
}

export async function obtenerProductosCategoriaYDescuentos() {
  try {
    const response = await axios.get(`${API_URL}/categoria/descuento/buscar`, {
      withCredentials: true,
    });
    //console.log("Productos con descuentos obtenidos:", response);
    return response;
  } catch (error) {
    console.error("Error al obtener los productos con descuentos:", error);
    return error.response.data;
  }
}

export async function buscarDescuentoProducto(idProducto) {
  try {
    const respuesta = await axios.get(
      `${API_URL}/producto/buscar/${idProducto}`,
      {
        withCredentials: true,
      },
    );
    //console.log("Respuesta obtener decuento producto:", respuesta);
    return respuesta;
  } catch (error) {
    console.log("Error al traer producto:", error);
    return error.response.data;
  }
}

export async function cambiarEstadoDescuento(datos) {
  try {
    const response = await axios.post(
      `${API_URL}/cambiar/estado/descuento`,
      datos,
      {
        withCredentials: true,
      },
    );
    console.log("Respuesta de cambio de estado de descuento:", response);
    return response;
  } catch (error) {
    console.error("Error al cambiar el estado del descuento:", error);
    return error.response.data;
  }
}

export async function buscarDescuentoCategoria(idCategoria) {
  try {
    const respuesta = await axios.get(
      `${API_URL}/categoria/buscar/descuentos/${idCategoria}`,
      {
        withCredentials: true,
      },
    );
    //console.log("Respuesta obtener decuento categoria:", respuesta);
    return respuesta;
  } catch (error) {
    console.log("Error al traer categoria:", error);
    return error.response.data;
  }
}

export async function crearDescuentoCategoria(datos) {
  try {
    const response = await axios.post(
      `${API_URL}/crear/descuento/categoria`,
      datos,
      {
        withCredentials: true,
      },
    );
    console.log("Respuesta de creación de descuento para categoría:", response);
    return response;
  } catch (error) {
    console.error("Error al crear el descuento para la categoría:", error);
    return error.response.data;
  }
}
