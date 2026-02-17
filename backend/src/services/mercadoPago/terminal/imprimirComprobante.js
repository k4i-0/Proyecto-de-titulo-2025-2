
/**
 * 
 * @param {String} idempotencyKey - Clave unica para identificar la orden desde frontend UUID v4
 * @param {String} external_reference - ID de la orden
 * @param {String} terminal_id - ID de la terminal
 * @param {String} subtipo - Subtipo de la orden (custom, image, invoice)
 * @param {String} contenido - Contenido de la orden (min 100 caracteres, max 4096 caracteres, imge base64 1m)
 * @returns 
 */
//https://www.mercadopago.cl/developers/es/reference/in-person-payments/point/impressions/create-terminal/post

async function imprimirComprobante(idempotencyKey, external_reference, terminal_id, subtipo, contenido) {
    try {
        let url = `https://api.mercadopago.com/terminals/v1/actions`
        const consulta = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.ACCESS_TOKEN_MP}`,
                "Content-Type": "application/json",
                "X-Idempotency-Key": idempotencyKey
            },
            body: JSON.stringify({
                "type": "print",
                "external_reference": external_reference,
                "config": {
                    "point": {
                        "terminal_id": terminal_id,
                        "subtype": subtipo
                    }
                },
                "content": contenido
            })
        });
        return consulta;
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    imprimirComprobante
}