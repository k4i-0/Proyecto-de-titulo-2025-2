import obtenerCategoria from "../inventario/Categorias.service";
import { notification } from "antd";

export async function buscarCategorias(setState) {
  try {
    const respuesta = await obtenerCategoria();
    //console.log("Respuesta de categorías:", respuesta.data);
    if (respuesta.status === 200) {
      setState(Array.isArray(respuesta.data) ? respuesta.data : []);
      return;
    }
  } catch (error) {
    notification.error({
      message: "Error al obtener las categorías",
      duration: 3.5,
    });
    console.error("Error al obtener las categorías:", error);
  }
}
