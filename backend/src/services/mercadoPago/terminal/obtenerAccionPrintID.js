

/**
 * 
 * @param {String} action_id - ID de la accion obtenida en imprimir
 * @returns 
 */

//http://mercadopago.cl/developers/es/reference/in-person-payments/point/impressions/get-action/get

async function obtenerAccionPrintID(action_id) {
    let url = `https://api.mercadopago.com/terminals/v1/actions/${action_id}`
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
    obtenerAccionPrintID
}