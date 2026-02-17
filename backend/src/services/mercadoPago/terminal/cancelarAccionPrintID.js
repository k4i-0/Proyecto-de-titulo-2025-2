
/**
 * 
 * @param {String} action_id - ID de la acción
 * @param {String} idempotency_key - Clave de idempotencia
 * @returns 
 */


//https://www.mercadopago.cl/developers/es/reference/in-person-payments/point/impressions/cancel-action/post

async function cancelarAccionPrintID(action_id, idempotency_key) {
    let url = `https://api.mercadopago.com/terminals/v1/actions/${action_id}/cancel`
    try {
        const consulta = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.ACCESS_TOKEN_MP}`,
                "Content-Type": "application/json", 
                "X-Idempotency-Key": idempotency_key
            }
        });
        return consulta;
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    cancelarAccionPrintID
}