import { obtenerProductosCategoriaYDescuentos } from "../ventas/descuento.service";

import { notification } from "antd";

export async function buscarProductosCategoriaYDescuentos(setState) {
  try {
    const respuesta = await obtenerProductosCategoriaYDescuentos();
    console.log("Respuesta de productos con descuentos:", respuesta.data);
    if (respuesta.status === 200) {
      setState(Array.isArray(respuesta.data) ? respuesta.data : []);
      return;
    }
  } catch (error) {
    notification.error({
      message: "Error al obtener los productos con descuentos",
      duration: 3.5,
    });
    console.error("Error al obtener los productos con descuentos:", error);
  }
}
