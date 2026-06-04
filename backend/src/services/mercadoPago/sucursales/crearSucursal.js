/**
 * @param {String} nombre - Nombre de la sucursal
 * @param {String} external_id - ID externo de la sucursal ej: "SUC001"
 * @param {Object} ubicacion - Datos de ubicación
 * @param {String} ubicacion.street_number - Número de calle
 * @param {String} ubicacion.street_name - Nombre de calle
 * @param {String} ubicacion.city_name - Ciudad
 * @param {String} ubicacion.state_name - Región
 * @param {Number} ubicacion.latitude - Latitud
 * @param {Number} ubicacion.longitude - Longitud
 * @param {String} ubicacion.reference - Referencia

 */
async function crearSucursal(nombre, external_id, ubicacion) {
  const url = `https://api.mercadopago.com/users/${process.env.USER_ID_MP}/stores`;
  try {
    const consulta = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: nombre,
        external_id,
        location: {
          street_number: ubicacion.street_number,
          street_name: ubicacion.street_name,
          city_name: ubicacion.city_name,
          state_name: ubicacion.state_name,
          latitude: ubicacion.latitude,
          longitude: ubicacion.longitude,
          reference: ubicacion.reference,
        },
      }),
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

module.exports = { crearSucursal };
