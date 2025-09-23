// // services/encryption.js
// import CryptoJS from "crypto-js";

// const SECRET_KEY = process.env.REACT_APP_ENCRYPTION_KEY;

// export const encryptData = (data) => {
//   try {
//     return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
//   } catch (error) {
//     console.error("Error al encriptar:", error);
//     return null;
//   }
// };

// export const decryptData = (encryptedData) => {
//   try {
//     const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
//     return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
//   } catch (error) {
//     console.error("Error al desencriptar:", error);
//     return null;
//   }
// };

// // services/storage.js
// export const secureStorage = {
//   setItem: (key, value) => {
//     const encrypted = encryptData(value);
//     if (encrypted) {
//       sessionStorage.setItem(key, encrypted);
//     }
//   },

//   getItem: (key) => {
//     const encrypted = sessionStorage.getItem(key);
//     return encrypted ? decryptData(encrypted) : null;
//   },

//   removeItem: (key) => {
//     sessionStorage.removeItem(key);
//   },
// };
