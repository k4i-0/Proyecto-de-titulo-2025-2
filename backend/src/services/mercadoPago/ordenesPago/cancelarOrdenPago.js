

/**
 * 
 * @param {String} order_id - ID de la orden a cancelar
 * @param {String} idempotencyKey - Clave unica para identificar la orden desde frontend UUID v4
 * @returns 
 */

async function cancelarOrdenPago(order_id, idempotencyKey) {
    let url = `https://api.mercadopago.com/v1/orders/${order_id}/cancel`
    try {
        const consulta = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.ACCESS_TOKEN_MP}`,
                "Content-Type": "application/json",
                "X-Idempotency-Key": idempotencyKey
            },
            body: JSON.stringify({
                "action": "cancel"
            })
        });
        return consulta;
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    cancelarOrdenPago
}