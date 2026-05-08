import { notification } from "antd";
import obtenerSucursales from "../inventario/Sucursal.service";

export async function buscarTodasSucursales(setState) {
  try {
    const respuesta = await obtenerSucursales();
    if (respuesta.status === 200) {
      setState(Array.isArray(respuesta.data) ? respuesta.data : []);
      return;
    }
  } catch (error) {
    notification.error({
      message: "Error al obtener las sucursales",
      duration: 3.5,
    });
    console.error("Error al obtener las sucursales:", error);
  }
}
