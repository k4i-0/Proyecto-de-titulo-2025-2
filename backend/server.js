const fs = require("fs");
const https = require("https");
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const sequelize = require("./src/config/bd");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./src/routes/index.route");
const { poblarBD } = require("./src/config/initSetup");
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
  Descuento,
  Categoria,
  Productos,
  Cliente,
  Estante,
  RealizaVenta,
  Despacho,
  CompraProveedor,
  ContratoFuncionario,
  CajaFuncionario,
  VentaCliente,
  BitacoraActividad,
  DescuentoSobre,
  CompraProveedorDetalle,
  Provee,
  LoteProducto,
  DetalleVenta,
  OrdenCompra,
  EntregaProveedor,
  DetalleDespacho,
  CreaOrdenCompra,
} = require("./src/models");
const { allowedNodeEnvironmentFlags } = require("process");

const app = express();

//Middleware generales
app.use(express.json()); // permite JSON
app.use(express.urlencoded({ extended: true })); // req.body para formularios

app.use(cookieParser());
app.use(helmet());
const corsOptions = {
  origin: [
    "https://localhost:5250",
    "http://localhost:5250",
    "http://146.83.194.142:1768",
    "https://146.83.194.142:1768",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
    path.join(__dirname, "..", "backend", "/ssl/localhost.key"),
  ),
  cert: fs.readFileSync(
    path.join(__dirname, "..", "backend", "/ssl/localhost.crt"),
  ),
};

//base de datos y modelos  --------------------
async function syncDataBase() {
  const isDevelopment = process.env.NODE_ENV === "desarrollo";
  const syncOptions = isDevelopment ? { force: true } : { alter: true };
  try {
    await sequelize.sync(syncOptions);

    // // NIVEL 1: Tablas sin dependencias
    // await Categoria.sync(syncOptions);
    // console.log("  ✓ Categoria");

    // await Sucursal.sync(syncOptions);
    // console.log("  ✓ Sucursal");

    // await Cliente.sync(syncOptions);
    // console.log("  ✓ Cliente");

    // await Descuento.sync(syncOptions);
    // console.log("  ✓ Descuento");

    // await Proveedor.sync(syncOptions);
    // console.log("  ✓ Proveedor");

    // // NIVEL 2: Roles y Bitacora (sin dependencias entre ellas)
    // await Roles.sync(syncOptions);
    // console.log("  ✓ Roles");

    // await Bitacora.sync(syncOptions);
    // console.log("  ✓ Bitacora");

    // // NIVEL 3: Tablas que dependen de Roles y Bitacora
    // await Actividad.sync(syncOptions);
    // console.log("  ✓ Actividad");

    // await Funcionario.sync(syncOptions);
    // console.log("  ✓ Funcionario");

    // // NIVEL 4: Tablas que dependen de nivel anterior
    // await Vendedor.sync(syncOptions);
    // console.log("  ✓ Vendedor");

    // await Bodega.sync(syncOptions);
    // console.log("  ✓ Bodega");

    // await Estante.sync(syncOptions);
    // console.log("  ✓ Estante");

    // await Caja.sync(syncOptions);
    // console.log("  ✓ Caja");

    // await Productos.sync(syncOptions);
    // console.log("  ✓ Productos");

    // await ContratoFuncionario.sync(syncOptions);
    // console.log("  ✓ ContratoFuncionario");

    // await CajaFuncionario.sync(syncOptions);
    // console.log("  ✓ CajaFuncionario");

    // // NIVEL 5: Tablas que dependen de Productos y Bodega

    // await Despacho.sync(syncOptions);
    // console.log("  ✓ Despacho");

    // await Inventario.sync(syncOptions);
    // console.log("  ✓ Inventario");

    // await DetalleDespacho.sync(syncOptions);
    // console.log("  ✓ DetalleDespacho");

    // await Lote.sync(syncOptions);
    // console.log("  ✓ Lote");

    // await RealizaVenta.sync(syncOptions);
    // console.log("  ✓ RealizaVenta");

    // await OrdenCompra.sync(syncOptions);
    // console.log("  ✓ OrdenCompra");

    // await EntregaProveedor.sync(syncOptions);
    // console.log("  ✓ EntregaProveedor");

    // await DetalleVenta.sync(syncOptions);
    // console.log("  ✓ DetalleVenta");

    // // NIVEL 6: Tablas intermedias finales
    // await CompraProveedor.sync(syncOptions);
    // console.log("  ✓ CompraProveedor");

    // await VentaCliente.sync(syncOptions);
    // console.log("  ✓ VentaCliente");

    // await BitacoraActividad.sync(syncOptions);
    // console.log("  ✓ BitacoraActividad");

    // await DescuentoSobre.sync(syncOptions);
    // console.log("  ✓ DescuentoSobre");

    // await CompraProveedorDetalle.sync(syncOptions);
    // console.log("  ✓ CompraProveedorDetalle");

    // await Provee.sync(syncOptions);
    // console.log("  ✓ Provee");

    // await CreaOrdenCompra.sync(syncOptions);
    // console.log("  ✓ CreaOrdenCompra");

    // // await LoteProducto.sync(syncOptions);
    // // console.log("  ✓ LoteProducto");

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

    //Poblar Base de datos
    await poblarBD();

    app.listen(process.env.PORT, () => {
      console.log(
        `Servidor escuchando en http://localhost:${process.env.PORT}`,
      );
    });
    // https.createServer(sslOptions, app).listen(process.env.PORT, () => {
    //   console.log(`Servidor HTTPS en https://localhost:${process.env.PORT}`);
    // });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

startServer();
