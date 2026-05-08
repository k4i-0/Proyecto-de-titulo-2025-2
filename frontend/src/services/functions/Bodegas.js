import { notification } from "antd";
import obtenerBodegas, {
  obtenerBodegasPorSucursal,
} from "../inventario/Bodega.service";

export async function buscarTodasBodegas(setState) {
  try {
    const respuesta = await obtenerBodegas();
    if (respuesta.status === 200) {
      setState(Array.isArray(respuesta.data) ? respuesta.data : []);
      return;
    }
  } catch (error) {
    notification.error({
      message: "Error al obtener las bodegas",
      duration: 3.5,
    });
    console.error("Error al obtener las bodegas:", error);
  }
}

export async function buscarBodegasPorSucursal(idSucursal, setState) {
  try {
    const response = await obtenerBodegasPorSucursal(idSucursal);
    if (response.status === 200) {
      setState(Array.isArray(response.data) ? response.data : []);
      return;
    }
    notification.error({
      message: "Error al obtener las bodegas por sucursal",
      duration: 3.5,
    });
    console.error("Error al obtener las bodegas por sucursal:", response);
  } catch (error) {
    notification.error({
      message: "Error al obtener las bodegas por sucursal",
      duration: 3.5,
    });
    console.error("Error al obtener las bodegas por sucursal:", error);
  }
}
