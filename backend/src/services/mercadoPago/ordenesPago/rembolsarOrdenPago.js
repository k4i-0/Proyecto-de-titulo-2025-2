
/**
 * 
 * @param {String} order_id - ID de la orden a rembolsar
 * @param {String} idempotencyKey - Clave unica para identificar la orden desde frontend UUID v4
 * @returns 
 */

//Rembolso Total del monto de la orden
async function rembolsarOrdenPago(order_id, idempotencyKey) {
    let url = `https://api.mercadopago.com/v1/orders/${order_id}/refund`
    try {
        const consulta = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.ACCESS_TOKEN_MP}`,
                "Content-Type": "application/json",
                "X-Idempotency-Key": idempotencyKey
            },
            //Para rembolso parcial en caso de que se nesecite
            // body: JSON.stringify({
            //     "amount": 100
            // })
        });
        return consulta;
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    rembolsarOrdenPago
}