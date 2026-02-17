
/**
 * 
 * @param {String} idempotencyKey - Clave unica para identificar la orden desde frontend UUID v4
 * @param {String} external_reference - Referencia externa de la orden backend para no repetir la orden
 * @param {String} expiration_time - Tiempo de expiracion de la orden debe ser PT10M donde M es minutos y H es horas y S segundos
 * @param {String} monto - Monto de la orden en CLP
 * @param {String} terminal_id - ID de la terminal Mercado Pago
 * @param {String} metodo_impresion - Metodo de impresion; no_ticket (Sin impresion) o seller_ticket (Impresion solo para el vendedor)
 * @param {String} metodo_pago - Metodo de pago; debit_card (Tarjeta de debito) o credit_card (Tarjeta de credito) o voucher_card (Tarjeta de alimentacion) o cash (Efectivo) o QR
 * @param {String} descripcion - Descripcion de la orden debe ser texto plano
 * @param {String} condicion_iva - Condicion de IVA; payment_taxable_iva (IVA incluido) o payment_exempt_iva (IVA exento)
 * @returns 
 */

async function crearOrdenPago(idempotencyKey, external_reference, expiration_time, monto, terminal_id, metodo_impresion, metodo_pago, descripcion, condicion_iva){
    let url = "https://api.mercadopago.com/pos/v1/orders"
    try {
        const consulta = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.ACCESS_TOKEN_MP}`,
                "Content-Type": "application/json",
                "X-Idempotency-Key": idempotencyKey 
            },
            body: JSON.stringify({
                type: "point",
                external_reference:external_reference,
                expiration_time: expiration_time,
               transactions: [
                {
                    payments: [
                    {
                        amount: monto
                    }
                    ]
                }
               ],
               config:[
                {
                    point: {
                            terminal_id: terminal_id,
                            print_on_terminal: metodo_impresion
                    },
                    payment_method: {
                        default_type: metodo_pago,
                    },
                }
            ],
            description: descripcion,
            integration_data:{
                platform_id: process.env.NAME_APP
            },
            taxes: [
                {
                   payer_condition: condicion_iva 
                }
            ]
                
            })
        });
        
        return consulta;
    } catch (error) {
        console.log(error);
    }
}

/**
 * error 400: bad_request: {
 *  - empty_required_header: El header "X-Idempotency-Key" es requerido y no fue enviado. Vuelve a realizar la petición incluyéndolo.
 *  - required_properties : Algumas propiedades requeridas están ausentes. Verifique el mensaje devuelto en los detalles del error para identificar el problema y vuelva a intentarlo enviando la información faltante.
 *  - unsupported_properties: Se envió una propiedad que no es soportada. Chequea el mensaje devuelto en los detalles del error para saber cuál fue el problema y vuelve a intentarlo
 *  - minimum_properties : No se envió el número mínimo de propiedades necesarias para ejecutar la solicitud. Chequea el mensaje devuelto en los detalles del error para saber cuál fue el problema y vuelve a intentarlo.
 *  - property_type: Se envió un tipo de propiedad incorrecto. Por ejemplo, un valor 'integer' para una propiedad 'string'. Chequea el mensaje devuelto en los detalles del error para saber cuál fue el problema y vuelve a intentarlo.
 *  - minimum_items: No se envió el número mínimo de ítems para alguna propiedad. Chequea el mensaje devuelto en los detalles del error para saber cuál fue el problema y vuelve a intentarlo.
 *  - maximum_items : Se envió una cantidad mayor de ítems que la permitida para alguna propiedad. Chequea el mensaje devuelto en los detalles del error para saber cuál fue el problema y vuelve a intentarlo.
 *  - property_value: Se envió un valor inválido para alguna propiedad. Chequea el mensaje devuelto en los detalles del error para saber cuál fue el problema y vuelve a intentarlo.
 *  - json_syntax_error: Se envió un JSON inválido. Chequea el mensaje devuelto en los detalles del error para saber cuál fue el problema y vuelve a intentarlo.
 * } 
 * error 401: unauthorized : {
 * - unauthorized: El valor enviado como Access Token es incorrecto. Por favor, verifícalo y vuelve a intentar realizar la petición enviando el valor correcto.
 * }
 * error 403: forbidden: {
 * - forbidden_checking_terminal_owner: La terminal Point no pertence al usuario que envió la solicitud. Verifica si el valor enviado para "terminal_id" es correcto o si la terminal está vinculado a tu cuenta.
 * }
 * error 409: conflict : {
 * - idempotency_key_already_used : El valor enviado como header de idempotencia ya fue utilizado con una solicitud distinta en un tiempo menor a 24 horas. Por favor, vuelve a intentar realizar la petición enviando un nuevo valor.
 * -  already_queued_order_for_terminal: La terminal ya tiene una order en espera. Es necesario finalizarla o cancelarla para enviar nuevas orders.
 * }
 * error 500: internal_server_error : {
 * - idempotency_validation_failed: Falla en la validación de idempotencia. Intenta enviar la solicitud nuevamente.
 * }
 */

module.exports = {
    crearOrdenPago
}