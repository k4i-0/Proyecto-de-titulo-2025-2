// server.js
const fs = require("fs");
const https = require("https");
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const sequelize = require("./src/config/bd");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./src/routes");

const app = express();

//Middleware generales
app.use(express.json()); // permite JSON
app.use(express.urlencoded({ extended: true })); // req.body para formularios

app.use(helmet()); // Headers de seguridad basico hasta ahora
app.use(cors({ origin: "http://localhost:5173" })); // Habilita CORS para todas las rutas (puedes configurarlo más estrictamente si es necesario)
app.use(morgan("dev")); // Registro de solicitudes HTTP

// Rutas indice.route de la API
app.use("/api", routes);

// Archivos Staticos de la aplicacion
app.use("/static", express.static(path.join(__dirname, "public")));

// Certificado SSL y Configuración HTTPS ----------
const sslOptions = {
  key: fs.readFileSync(
    path.join(__dirname, "..", "backend", "/ssl/localhost.key")
  ),
  cert: fs.readFileSync(
    path.join(__dirname, "..", "backend", "/ssl/localhost.crt")
  ),
};

// Inicia el servidor HTTPS
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexión a BD establecida correctamente.");

    // console.log("Sincronizando tablas en orden...");

    // // 1. Crear tablas padre primero (sin foreign keys)
    // await Productos.sync();
    // console.log("Tabla Productos creada");

    // await Vendedor.sync();
    // console.log("Tabla Vendedor creada");

    // await Garantia.sync();
    // console.log("Tabla Garantias creada");

    // // 2. Crear tabla hija al final (con foreign keys)
    // await Comisiones.sync();
    // console.log("Tabla Comisiones creada");

    // //Sincroniza todo
    // await sequelize.sync({ force: false, alter: true });

    // console.log("Todas las tablas sincronizadas correctamente");

    https.createServer(sslOptions, app).listen(process.env.PORT, () => {
      console.log(`Servidor HTTPS en https://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

startServer();
