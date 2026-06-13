import axios from "axios";
import URL from "../Constante";

const API_URL = `${URL}/funcionarios`;

export default async function obtenerTodosFuncionarios() {
  try {
    const response = await axios.get(`${API_URL}/buscar`, {
      withCredentials: true,
    });
    //console.log("funcionarios obtenidos:", response);
    return response;
  } catch (error) {
    //console.error("Error al obtener funcionarios:", error.response.data.error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response?.data;
  }
}

export async function crearFuncionario(datos) {
  try {
    const response = await axios.post(`${API_URL}/crear`, datos, {
      withCredentials: true,
    });
    //console.log("funcionarios creados:", response);
    return response;
  } catch (error) {
    console.error("Error al crear funcionarios:", error.response.data.error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response?.data;
  }
}

export async function editarFuncionario(datos) {
  try {
    const respuesta = await axios.put(`${API_URL}/editar`, datos, {
      withCredentials: true,
    });
    return respuesta;
  } catch (error) {
    console.error("Error al editar funcionario:", error.response.data.error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response?.data;
  }
}

export async function obtenerColaboradoresSucursal(idSucursal) {
  try {
    const response = await axios.get(`${API_URL}/colaboradores/${idSucursal}`, {
      withCredentials: true,
    });
    //console.log("colaboradores obtenidos:", response);
    return response;
  } catch (error) {
    //console.error("Error al obtener colaboradores:", error.response.data.error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response?.data;
  }
}

export async function eliminarFuncionario(idFuncionario) {
  try {
    const response = await axios.delete(
      `${API_URL}/eliminar/${idFuncionario}`,
      { withCredentials: true },
    );
    //console.log("funcionario desvinculado:", response);
    return response;
  } catch (error) {
    //console.error("Error al desvincular funcionario:", error.response.data.error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response?.data;
  }
}

export async function obtenerQuienSoy() {
  try {
    const response = await axios.get(`${API_URL}/quienSoy`, {
      withCredentials: true,
    });
    //console.log("quienSoy obtenido:", response);
    return response;
  } catch (error) {
    //console.error("Error al obtener quienSoy:", error.response.data.error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response?.data;
  }
}

export async function obtenerContratosFuncionarios() {
  try {
    const response = await axios.get(`${API_URL}/contratos`, {
      withCredentials: true,
    });
    //console.log("contratos obtenidos:", response);
    return response;
  } catch (error) {
    //console.error("Error al obtener contratos:", error.response.data.error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response?.data;
  }
}

export async function obtenerFuncionariosSinContrato() {
  try {
    const response = await axios.get(`${API_URL}/busqueda/sin-contrato`, {
      withCredentials: true,
    });
    console.log("funcionarios sin contrato obtenidos:", response);
    return response;
  } catch (error) {
    console.error(
      "Error al obtener funcionarios sin contrato:",
      error.response.data.error,
    );

    return error.response?.data;
  }
}

export async function asignarContratoAFuncionarioSinContrato(datos) {
  try {
    const response = await axios.post(`${API_URL}/asignar-contrato`, datos, {
      withCredentials: true,
    });
    console.log("contrato asignado a funcionario:", response);
    return response;
  } catch (error) {
    console.error(
      "Error al asignar contrato a funcionario:",
      error.response.data.error,
    );

    return error.response?.data;
  }
}

export async function cambiarTurnoFuncionario(datos) {
  try {
    const response = await axios.post(`${API_URL}/cambio-turno`, datos, {
      withCredentials: true,
    });
    console.log("turno cambiado para funcionario:", response);
    return response;
  } catch (error) {
    console.error(
      "Error al cambiar turno de funcionario:",
      error.response.data.error,
    );

    return error.response?.data;
  }
}

export async function cambiarTipoContratoFuncionario(datos) {
  try {
    const response = await axios.post(`${API_URL}/cambio-contrato`, datos, {
      withCredentials: true,
    });
    //console.log("tipo de contrato cambiado para funcionario:", response);
    return response;
  } catch (error) {
    console.error(
      "Error al cambiar tipo de contrato de funcionario:",
      error.response.data.error,
    );

    return error.response?.data;
  }
}

export async function reasignarSucursalFuncionario(datos) {
  try {
    const response = await axios.post(`${API_URL}/reasignar-sucursal`, datos, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error(
      "Error al reasignar la sucursal del funcionario:",
      error.response?.data?.error,
    );
    return error.response?.data;
  }
}

export const obtenerHistorialContratosDelFuncionario = async (
  idFuncionario,
) => {
  try {
    const response = await axios.get(`${API_URL}/historial/${idFuncionario}`, {
      withCredentials: true,
    });
    console.log("Historial de contratos del funcionario obtenido:", response);
    return response;
  } catch (error) {
    console.error(
      "Error al obtener historial de contratos del funcionario:",
      error.response?.data?.error,
    );
    return error.response?.data;
  }
};

export async function actualizarClavesFuncionario(idFuncionario, nuevasClaves) {
  try {
    const response = await axios.post(
      `${API_URL}/cambio/clave/funcionario/${idFuncionario}`,
      nuevasClaves,
      { withCredentials: true },
    );
    console.log("Claves actualizadas para funcionario:", response);
    return response;
  } catch (error) {
    console.error(
      "Error al actualizar claves del funcionario:",
      error.response?.data?.error,
    );

    return error.response?.data;
  }
}

export async function actualizarPrivilegiosFuncionario(
  idFuncionario,
  nuevosPrivilegios,
) {
  try {
    const response = await axios.post(
      `${API_URL}/actualizar/privilegios/${idFuncionario}`,
      { privilegios: nuevosPrivilegios },
      { withCredentials: true },
    );
    console.log("Privilegios actualizados para funcionario:", response);
    return response;
  } catch (error) {
    console.error(
      "Error al actualizar privilegios del funcionario:",
      error.response?.data?.error,
    );

    return error.response?.data;
  }
}

export async function obtenerTodosRoles() {
  try {
    const response = await axios.get(`${API_URL}/obtener/todos/roles`, {
      withCredentials: true,
    });
    console.log("Roles obtenidos:", response);
    return response;
  } catch (error) {
    console.error("Error al obtener roles:", error.response.data.error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response?.data;
  }
}

///crud roles
export async function crearRol(datos) {
  try {
    const response = await axios.post(`${API_URL}/crear/rol`, datos, {
      withCredentials: true,
    });
    console.log("Rol creado:", response);
    return response;
  } catch (error) {
    console.error("Error al crear rol:", error.response.data.error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response?.data;
  }
}

export async function editarRol(idRol, datos) {
  try {
    const response = await axios.put(`${API_URL}/editar/rol/${idRol}`, datos, {
      withCredentials: true,
    });
    console.log("Rol editado:", response);
    return response;
  } catch (error) {
    console.error("Error al editar rol:", error.response.data.error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response?.data;
  }
}

export async function eliminarRol(idRol) {
  try {
    const response = await axios.delete(`${API_URL}/eliminar/rol/${idRol}`, {
      withCredentials: true,
    });
    console.log("Rol eliminado:", response);
    return response;
  } catch (error) {
    console.error("Error al eliminar rol:", error.response.data.error);
    if (error.response?.data?.error == undefined) {
      return { code: 500, error: "Error del servidor" };
    }
    return error.response?.data;
  }
}
