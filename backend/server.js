const fs = require("fs");
const https = require("https");
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const sequelize = require("./src/config/bd");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./src/routes/index.route");
const { createUsers } = require("./src/config/initSetup");
const cookieParser = require("cookie-parser");
const {
  Bodega,
  Inventario,
  Sucursal,
  Lote,
  Proveedor,
  Vendedor,
  Caja,
  Funcionario,
  Roles,
  Bitacora,
  Actividad,
  DatosVenta,
  Descuento,
  Categoria,
  Productos,
  Cliente,
  Despacho,
  CompraProveedor,
  ContratoFuncionario,
  CajaFuncionario,
  DescuentoAsociado,
  VentaCliente,
  BitacoraActividad,
  Estante,
} = require("./src/models");
const { allowedNodeEnvironmentFlags } = require("process");

const app = express();

//Middleware generales
app.use(express.json()); // permite JSON
app.use(express.urlencoded({ extended: true })); // req.body para formularios

app.use(cookieParser());
app.use(helmet());
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));

app.use(morgan("dev"));

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

//base de datos y modelos  --------------------
async function syncDataBase() {
  const isDevelopment = process.env.NODE_ENV === "desarrollo";
  const syncOptions = isDevelopment ? { force: true } : { alter: true };
  try {
    // NIVEL 1: Tablas sin dependencias
    await Categoria.sync(syncOptions);
    console.log("  ✓ Categoria");

    await Sucursal.sync(syncOptions);
    console.log("  ✓ Sucursal");

    await Cliente.sync(syncOptions);
    console.log("  ✓ Cliente");

    await Descuento.sync(syncOptions);
    console.log("  ✓ Descuento");

    await Proveedor.sync(syncOptions);
    console.log("  ✓ Proveedor");

    // NIVEL 2: Roles y Bitacora (sin dependencias entre ellas)
    await Roles.sync(syncOptions);
    console.log("  ✓ Roles");

    await Bitacora.sync(syncOptions);
    console.log("  ✓ Bitacora");

    // NIVEL 3: Tablas que dependen de Roles y Bitacora
    await Actividad.sync(syncOptions);
    console.log("  ✓ Actividad");

    await Funcionario.sync(syncOptions);
    console.log("  ✓ Funcionario");

    // NIVEL 4: Tablas que dependen de nivel anterior
    await Vendedor.sync(syncOptions);
    console.log("  ✓ Vendedor");

    await Bodega.sync(syncOptions);
    console.log("  ✓ Bodega");

    await Estante.sync(syncOptions);
    console.log("  ✓ Estante");

    await Caja.sync(syncOptions);
    console.log("  ✓ Caja");

    await Productos.sync(syncOptions);
    console.log("  ✓ Productos");

    await ContratoFuncionario.sync(syncOptions);
    console.log("  ✓ ContratoFuncionario");

    await CajaFuncionario.sync(syncOptions);
    console.log("  ✓ CajaFuncionario");

    // NIVEL 5: Tablas que dependen de Productos y Bodega
    await Inventario.sync(syncOptions);
    console.log("  ✓ Inventario");

    await Lote.sync(syncOptions);
    console.log("  ✓ Lote");

    await DescuentoAsociado.sync(syncOptions);
    console.log("  ✓ DescuentoAsociado");

    await DatosVenta.sync(syncOptions);
    console.log("  ✓ DatosVenta");

    // NIVEL 6: Tablas intermedias finales
    await CompraProveedor.sync(syncOptions);
    console.log("  ✓ CompraProveedor");

    await Despacho.sync(syncOptions);
    console.log("  ✓ Despacho");

    await VentaCliente.sync(syncOptions);
    console.log("  ✓ VentaCliente");

    await BitacoraActividad.sync(syncOptions);
    console.log("  ✓ BitacoraActividad");

    console.log("✅ Todas las tablas sincronizadas correctamente");
  } catch (error) {
    console.error("❌ Error al sincronizar base de datos:", error);
    throw error;
  }
}

// Inicia el servidor HTTPS
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexión a BD establecida correctamente.");

    await syncDataBase();

    //Crear usuarios iniciales
    await createUsers();

    //app.listen(process.env.PORT, () => {
    //  console.log(`Servidor HTTPS en http://localhost:${process.env.PORT}`);
    // });

    https.createServer(sslOptions, app).listen(process.env.PORT, () => {
      console.log(`Servidor HTTPS en https://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

startServer();
