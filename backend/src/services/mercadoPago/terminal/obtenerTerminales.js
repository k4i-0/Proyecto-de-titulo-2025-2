
/**
 * 
 * @param {string} store_id - ID de la tienda de mercado pago
 * @param {string} pos_id - ID del punto de venta de mercado pago
 * @returns 
 */
async function obtenerTerminales(store_id,pos_id) {
    let url = "https://api.mercadopago.com/terminals/v1/list/list?limit=50&offset=1"
    try {
        if(store_id && pos_id){
            url = `${url}&store_id=${store_id}&pos_id=${pos_id}`;
        }else if(store_id){
            url = `${url}&store_id=${store_id}`;
        }else if(pos_id){
            url = `${url}?pos_id=${pos_id}`;
        }
        const consulta = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.ACCESS_TOKEN_MP}`,
                "Content-Type": "application/json"
            }
        });
        const data = await consulta.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}

/**
 * error 401 : {
 *  -unauthorized: El valor enviado como Access Token es incorrecto. Por favor, verifícalo y vuelve a intentar realizar la petición enviando el valor correcto.
 * }
 * error 500 : {
 *  -internal_server_error: Error interno. Por favor, revisa el mensaje retornado e intenta enviar la solicitud nuevamente.
 * }
 */

module.exports = {
    obtenerTerminales
}