/**
 * @param {String} external_id - ID externo de la sucursal ej: "SUC001"
 

 */
async function buscarSucursales(external_id) {
  const url = `https://api.mercadopago.com/users/${process.env.USER_ID_MP}/stores/search?external_id=${external_id}`;
  try {
    const consulta = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const data = await consulta.json();

    if (!consulta.ok) {
      console.error("Error MP crear sucursal:", data);
      return { error: true, status: consulta.status, data };
    }

    return { error: false, status: consulta.status, data };
  } catch (error) {
    console.error("Error al crear sucursal:", error);
    return error;
  }
}

module.exports = { buscarSucursales };
