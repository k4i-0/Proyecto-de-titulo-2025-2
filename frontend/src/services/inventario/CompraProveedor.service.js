import axios from "axios";
import URL from "../Constante";

const API_URL = `${URL}/compras`;

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
    const response = await axios.post(`${API_URL}/ocdirecta`, datos, {
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
    const response = await axios.get(`${API_URL}/ocdirecta`, {
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
      `${API_URL}/ocdirecta/${idCompraProveedor}`,
      { withCredentials: true },
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

export async function cambiarEstadoOrdenCompra(nombreOrden, datos) {
  try {
    const response = await axios.put(
      `${API_URL}/ocdirecta/${nombreOrden}/estado`,
      datos,
      { withCredentials: true },
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

export async function anularOrdenCompraDirecta(nombreOrden, datos) {
  try {
    const response = await axios.put(
      `${API_URL}/ocdirecta/${nombreOrden}/anular`,
      { datos },
      { withCredentials: true },
    );
    return response;
  } catch (error) {
    console.error("Error al anular la orden de compra directa:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function editarOrdenCompraProveedor(nombreOrden, datos) {
  try {
    const response = await axios.put(
      `${API_URL}/ocdirecta/${nombreOrden}/editar`,
      datos,
      { withCredentials: true },
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
    const response = await axios.get(`${API_URL}/orden-compra`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error(
      "Error al obtener las ordenes de compra a proveedores:",
      error,
    );
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function obtenerOrdenCompraProveedorPorNombre(nombreOrden) {
  try {
    const response = await axios.get(
      `${API_URL}/vendedor/orden/${nombreOrden}/ver-orden`,
      {
        withCredentials: true,
      },
    );
    return response;
  } catch (error) {
    console.error(
      "Error al obtener la orden de compra a proveedor por nombre:",
      error,
    );

    return error.response.data;
  }
}

export async function buscarTodasOrdenesParaRecepcion(rutProveedor) {
  try {
    const response = await axios.get(
      `${API_URL}/orden-compra/${rutProveedor}/recepcion`,
      {
        withCredentials: true,
      },
    );
    return response;
  } catch (error) {
    console.error(
      "Error al buscar las ordenes de compra para recepcion:",
      error,
    );
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

// Recepcionar una orden de compra directa
export async function recepcionarOrdenCompraDirecta(nombreOrden, datos) {
  try {
    const response = await axios.put(
      `${API_URL}/ocdirecta/${nombreOrden}/recepcionar`,
      datos,
      { withCredentials: true },
    );
    return response;
  } catch (error) {
    console.error("Error al recepcionar la orden de compra directa:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

//-----------------Funciones para orden de compra a proveedor vendedores-----------------------------

export async function obtenerOrdenesCompraVendedor() {
  try {
    const response = await axios.get(`${API_URL}/vendedor/orden`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.log("Error al obtener las ordenes de compra del vendedor:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function crearOrdenCompraVendedor(ordenData) {
  try {
    const response = await axios.post(`${API_URL}/vendedor/orden`, ordenData, {
      withCredentials: true,
    });
    //console.log("Orden de compra a proveedor creada:", response);
    return response;
  } catch (error) {
    console.error("Error al crear la orden de compra a proveedor:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function buscarOrdenesCompraSucursalVendedor(rutProveedor) {
  try {
    const response = await axios.get(
      `${API_URL}/vendedor/orden/${rutProveedor}/compra-sucursal`,
      {
        withCredentials: true,
      },
    );
    //const ordenesCompra = response.data.ordenesCompra || [];
    return response;
  } catch (error) {
    console.error(
      "Error al buscar las ordenes de compra para recepcion:",
      error,
    );
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function crearOrdenCompraSucursalVendedor(datos) {
  try {
    const response = await axios.post(
      `${API_URL}/vendedor/orden/recepcion/compra-sucursal`,
      datos,
      { withCredentials: true },
    );
    return response;
  } catch (error) {
    console.error("Error al crear la orden de compra a sucursal:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}
//-----------------Funciones para orden de compra a proveedor administradores-----------------------------

export async function obtenerOrdenesCompraAdmin() {
  try {
    const response = await axios.get(`${API_URL}/admin/orden`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error(
      "Error al obtener las ordenes de compra a proveedor para admin:",
      error,
    );
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function anularOrdenCompraAdmin(nombreOrden) {
  try {
    const response = await axios.put(
      `${API_URL}/admin/orden/${nombreOrden}/anular`,
      { withCredentials: true },
    );
    return response;
  } catch (error) {
    console.error("Error al anular la orden de compra a proveedor:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function aprobarOrdenCompraAdmin(nombreOrden) {
  try {
    const response = await axios.put(
      `${API_URL}/admin/orden/${nombreOrden}/aprobar`,
      {},
      { withCredentials: true },
    );
    return response;
  } catch (error) {
    console.error("Error al aprobar la orden de compra a proveedor:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function modificarOrdenCompraAdmin(nombreOrden, datos) {
  try {
    const response = await axios.put(
      `${API_URL}/admin/orden/${nombreOrden}/modificar`,
      datos,
      { withCredentials: true },
    );
    return response;
  } catch (error) {
    console.error("Error al modificar la orden de compra a proveedor:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

export async function eliminarOrdenCompraAdmin(nombreOrden) {
  try {
    const response = await axios.delete(
      `${API_URL}/admin/orden/${nombreOrden}`,
      { withCredentials: true },
    );
    return response;
  } catch (error) {
    console.error("Error al eliminar la orden de compra a proveedor:", error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response.data;
  }
}

//-----------------Funciones compartidas para orden de compra a proveedor vendedores y administradores-----------------------------

export async function verificarStockProductosOrdenCompra(
  idSucursal,
  idProveedor,
) {
  try {
    const response = await axios.get(
      `${API_URL}/funcionalidades/orden-compra/verificar-stock/${idSucursal}/${idProveedor}`,
      { withCredentials: true },
    );
    return response;
  } catch (error) {
    console.error(
      "Error al verificar el stock de los productos para la orden de compra:",
      error,
    );
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response;
  }
}
