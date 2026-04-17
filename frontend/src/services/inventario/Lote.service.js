import axios from "axios";
import URL from "../Constante";

const API_URL = `${URL}/lotes`;

//administrador
export async function obtenerLotesAsociadosInventario(idProducto, idBodega) {
  try {
    const response = await axios.post(
      `${API_URL}/inventario`,
      { idProducto, idBodega },
      {
        withCredentials: true,
      },
    );
    //console.log("Lotes obtenidos:", response);
    return response;
  } catch (error) {
    console.error("Error al obtener lotes asociados al inventario:", error);
    return error.response.data;
  }
}
