
/**
 * 
 * @param {String} order_id - ID de la orden a obtener
 * @returns 
 */

async function obtenerOrdenPagoID(order_id) {
    let url = `https://api.mercadopago.com/v1/orders/${order_id}`
    try {
        const consulta = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.ACCESS_TOKEN_MP}`,
                "Content-Type": "application/json"
            }
        });
        return consulta;
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    obtenerOrdenPagoID
}