
/**
 * 
 * @param {String} order_id - ID de la orden
 * @param {String} status - Estado de la orden 
 * @returns 
 */

//https://www.mercadopago.cl/developers/es/reference/payments/orders/update-status/post

async function simularEstadoOP(order_id, status) {
    let url = `https://api.mercadopago.com/v1/orders/${order_id}/events`
    try {
        const consulta = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.ACCESS_TOKEN_MP}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "status": status
            })
        });
        return consulta;
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    simularEstadoOP
}