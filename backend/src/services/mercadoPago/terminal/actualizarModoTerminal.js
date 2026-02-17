

/**
 * 
 * @param {string} terminal_id - ID del terminal
 * @param {string} mode - Modo del terminal
 * @returns 
*/
async function actualizarModoTerminal(terminal_id, mode) {
    let url = "https://api.mercadopago.com/terminals/v1/setup"
    try {
        if(mode != "PDV" && mode != "STANDALONE"){
            return {
                message: "Modo inválido",
                error: "El modo debe ser PDV o STANDALONE"
            }
        }
        const consulta = await fetch(url, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${process.env.ACCESS_TOKEN_MP}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: terminal_id,
                operating_mode: mode
            })
        });
        const data = await consulta.json();
        return data;
    } catch (error) {
        console.log(error);
        return {
            message: "Error al actualizar el modo del terminal",
            error: error.message
        }
    }
}

module.exports = {
    actualizarModoTerminal
}