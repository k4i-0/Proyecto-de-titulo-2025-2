import axios from "axios";
import URL from "../Constante";

const API_URL = `${URL}/compra-proveedor`;

export default async function crearOrdenCompraProveedor(ordenData) {
  try {
    const response = await axios.post(`${API_URL}/crear-orden`, ordenData, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error al crear la orden de compra a proveedor:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function crearOrdenCompraDirecta(datos) {
  try {
    const response = await axios.post(`${API_URL}/crear-oc-directa`, datos, {
      withCredentials: true,
    });
    //console.log("Orden de compra directa creada:", response);
    return response;
  } catch (error) {
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response?.data;
  }
}

export async function obtenerOrdenesCompraDirecta() {
  try {
    const response = await axios.get(`${API_URL}/buscar-oc-directa`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

// Cancelar una orden de compra
export async function cancelarOrdenCompra(idCompraProveedor) {
  try {
    const response = await axios.delete(
      `${API_URL}/eliminar-oc-directa/${idCompraProveedor}`,
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    console.error("Error al cancelar la orden de compra:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function cambiarEstadoOrdenCompra(idCompraProveedor, datos) {
  try {
    const response = await axios.put(
      `${API_URL}/cambiar-estado-oc/${idCompraProveedor}`,
      datos,
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    console.error("Error al cambiar el estado de la orden de compra:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function editarOrdenCompraProveedor(idCompraProveedor, datos) {
  try {
    const response = await axios.put(
      `${API_URL}/editar-oc/${idCompraProveedor}`,
      datos,
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    console.error("Error al editar la orden de compra a proveedor:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function obtenerOrdenesCompraProveedores() {
  try {
    const response = await axios.get(`${API_URL}/buscar-ordenes`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error(
      "Error al obtener las ordenes de compra a proveedores:",
      error
    );
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}
