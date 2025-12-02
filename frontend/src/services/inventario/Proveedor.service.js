import axios from "axios";
import URL from "../Constante";

const API_URL = `${URL}/proveedores`;

export async function getAllProveedores() {
  try {
    const response = await axios.get(`${API_URL}/buscar`, {
      withCredentials: true,
    });
    //console.log("Proveedores obtenidos:", response);
    return response;
  } catch (error) {
    console.error("Error al obtener los proveedores:", error);
    if (error.response.data.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function getAllProveedoresVendedor(rutProveedor) {
  try {
    // console.log("ID proveedor recibido:", rutProveedor);
    const response = await axios.get(`${API_URL}/buscar/${rutProveedor}`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error al obtener los proveedores:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function crearProveedor(proveedorData) {
  try {
    const response = await axios.post(`${API_URL}/crear`, proveedorData, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error al crear el proveedor:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function editarProveedor(proveedorData, idProveedor) {
  try {
    const response = await axios.put(
      `${API_URL}/actualizar/${idProveedor}`,
      proveedorData,
      {
        withCredentials: true,
      }
    );
    return response;
  } catch (error) {
    console.error("Error al actualizar el proveedor:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function eliminarProveedor(id) {
  try {
    const response = await axios.delete(`${API_URL}/eliminar/${id}`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error al eliminar el proveedor:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function crearVendedor(vendedorData) {
  try {
    const response = await axios.post(
      `${API_URL}/crear-vendedor`,
      vendedorData,
      {
        withCredentials: true,
      }
    );
    return response;
  } catch (error) {
    console.error("Error al crear el vendedor:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function getAllVendedores() {
  try {
    const response = await axios.get(`${API_URL}/buscar-vendedores`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error al obtener los vendedores:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function eliminarVendedor(id) {
  try {
    const response = await axios.delete(`${API_URL}/eliminar-vendedor/${id}`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error al eliminar el vendedor:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function editarVendedor(vendedorData, idProveedor) {
  try {
    const response = await axios.put(
      `${API_URL}/actualizar-vendedor/${idProveedor}`,
      vendedorData,
      {
        withCredentials: true,
      }
    );
    return response;
  } catch (error) {
    console.error("Error al actualizar el vendedor:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}
