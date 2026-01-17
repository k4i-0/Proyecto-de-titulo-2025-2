const crypto = require("crypto");

const ENV_KEY_HEX = process.env.AES_SECRET_KEY;
if (!ENV_KEY_HEX || ENV_KEY_HEX.length !== 32) {
  throw new Error(
    "ERROR CRÍTICO: La variable AES_SECRET_KEY falta o no es válida (debe ser hex de 32 bytes)."
  );
}

const SECRET_KEY = Buffer.from(ENV_KEY_HEX, "hex");
const ALGORITHM = "aes-128-ecb";
// const IV_LENGTH = 16;

function encriptar(texto) {
  try {
    let cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, null);
    let encrypted = cipher.update(texto, "utf8", "hex");
    encrypted += cipher.final("hex");
    console.log("encrypted part", encrypted);

    return encrypted;
  } catch (error) {
    console.error("Error al encriptar:", error);
    return null;
  }
}

function desencriptar(textoCifrado) {
  try {
    let decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, null);
    let decrypted = decipher.update(textoCifrado, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Error al desencriptar:", error);
    return null;
  }
}

module.exports = { encriptar, desencriptar };
