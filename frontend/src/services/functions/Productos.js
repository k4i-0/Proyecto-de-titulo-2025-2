import obtenerProductos from "../inventario/Productos.service";
import { notification } from "antd";

export async function buscarTodosProductos(setState) {
  try {
    const respuesta = await obtenerProductos();
    if (respuesta.status === 200) {
      setState(Array.isArray(respuesta.data) ? respuesta.data : []);
      return;
    }
  } catch (error) {
    notification.error({
      message: "Error al obtener los productos",
      duration: 3.5,
    });
    console.error("Error al obtener los productos:", error);
  }
}
