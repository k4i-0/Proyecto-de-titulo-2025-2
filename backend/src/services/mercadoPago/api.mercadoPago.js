const MP_BASE_URL = "https://api.mercadopago.com";
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const USER_ID_MP = process.env.USER_ID_MP;

const MP_URLS = {
  //Sucursales
  crearTienda: `${MP_BASE_URL}/users/${USER_ID_MP}/stores`,
  obtenerTiendas: `${MP_BASE_URL}/users/${USER_ID_MP}/stores/search`,
  obtenerTienda: (storeId) =>
    `${MP_BASE_URL}/users/${USER_ID_MP}/stores/${storeId}`,
  actualizarTienda: (storeId) =>
    `${MP_BASE_URL}/users/${USER_ID_MP}/stores/${storeId}`,
  eliminarTienda: (storeId) =>
    `${MP_BASE_URL}/users/${USER_ID_MP}/stores/${storeId}`,

  // POS
  crearPOS: `${MP_BASE_URL}/pos`,
  obtenerPOS: `${MP_BASE_URL}/pos`,
  obtenerUnPOS: (posId) => `${MP_BASE_URL}/pos/${posId}`,

  // Pagos Point
  crearIntencionPago: (deviceId) =>
    `${MP_BASE_URL}/point/integration-api/devices/${deviceId}/payment-intents`,
  cancelarIntencionPago: (deviceId, paymentIntentId) =>
    `${MP_BASE_URL}/point/integration-api/devices/${deviceId}/payment-intents/${paymentIntentId}`,
  obtenerIntencionPago: (paymentIntentId) =>
    `${MP_BASE_URL}/point/integration-api/payment-intents/${paymentIntentId}`,
};

module.exports = { MP_URLS };
