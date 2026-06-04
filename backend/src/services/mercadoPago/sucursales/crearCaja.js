/**
 * @param {String} nombre - Nombre del POS ej: "Caja 01"
 * @param {Boolean} fixed_amount - Monto fijo true/false
 * @param {Number} store_id - ID de la tienda en MercadoPago
 * @param {String} external_store_id - ID externo de la tienda ej: "SUC001"
 * @param {String} external_id - ID externo del POS ej: "SUC001POS001"
 * @param {Number} category - Categoria del negocio ej: 621102
 */
async function crearPOS(nombre, store_id, external_store_id, external_id) {
  const url = "https://api.mercadopago.com/pos";
  try {
    const consulta = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: nombre,
        store_id,
        external_store_id,
        external_id,
      }),
    });

    const data = await consulta.json();

    if (!consulta.ok) {
      console.error("Error MP crear POS:", data);
      return { error: true, status: consulta.status, data };
    }

    return { error: false, status: consulta.status, data };
  } catch (error) {
    console.error("Error al crear POS:", error);
    throw error;
  }
}

module.exports = { crearPOS };
