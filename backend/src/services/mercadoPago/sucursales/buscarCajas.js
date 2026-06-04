/**
 * @param {String} external_id - Numero de la caja en base de datos
 

 */
async function buscarCajas(external_id) {
  const url = `https://api.mercadopago.com/pos?external_id=${external_id}`;
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
      console.error("Error MP buscar cajas:", data);
      return { error: true, status: consulta.status, data };
    }

    return { error: false, status: consulta.status, data };
  } catch (error) {
    console.error("Error al buscar cajas:", error);
    return error;
  }
}

module.exports = { buscarCajas };
