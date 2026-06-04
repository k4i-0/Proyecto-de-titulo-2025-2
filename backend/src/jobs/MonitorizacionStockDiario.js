const cron = require("node-cron");
const Sucursal = require("../models/inventario/Sucursal");
const Bodega = require("../models/inventario/Bodega");
const Inventario = require("../models/inventario/Inventario");
const Producto = require("../models/inventario/Productos");
const Funcionario = require("../models/Usuarios/Funcionario");
const Rol = require("../models/Usuarios/Rol");

const { crearBitacora } = require("../services/bitacora.service");
const { enviarCorreo } = require("../services/mail.service");
const { generarPDFStockDiario } = require("../function/generarPDFStockDiario");
const fs = require("fs");
const path = require("path");

const MonitorizacionStockDiario = async () => {
  cron.schedule("42 2 * * *", async () => {
    let stockDiario = [];
    try {
      //buscar sucursales con sus bodegas e inventarios
      const sucursales = await Sucursal.findAll({
        include: {
          model: Bodega,
          include: {
            model: Inventario,
            include: {
              model: Producto,
            },
          },
        },
      });
      //console.log("sucursal", JSON.stringify(sucursales));
      //recorrer sucursales, luego bodegas e inventarios para obtener el stock diario
      for (const sucursal of sucursales) {
        for (const bodega of sucursal.bodegas) {
          for (const inventario of bodega.inventarios) {
            stockDiario.push({
              idSucursal: sucursal.idSucursal,
              nombreSucursal: sucursal.nombre,
              idBodega: bodega.idBodega,
              nombreBodega: bodega.nombre,
              nombreProducto: inventario.producto.nombre,
              stock: inventario.stock,
            });
          }
        }
      }
      const pdfStock = await generarPDFStockDiario(stockDiario);

      const fecha = new Date().toISOString().split("T")[0]; // 2026-05-22
      const rutaPDF = path.join(
        __dirname,
        `../../archive/pdfStockDiario/stock-${fecha}.pdf`,
      );
      fs.mkdirSync(path.dirname(rutaPDF), { recursive: true });
      fs.writeFileSync(rutaPDF, pdfStock);
      //buscar administradores de sucursal para enviar correo
      const administradores = await Funcionario.findAll({
        include: [
          {
            model: Rol,
            where: { nombreRol: "Administrador", estado: "Activo" },
          },
        ],
      });
      //console.log("administradores", JSON.stringify(administradores));
      for (const admin of administradores) {
        //console.log("correos", String(admin.email));
        await enviarCorreo({
          para: String(admin.email),
          asunto: `Reporte de Stock Diario - ${fecha}`,
          html: `<p>Adjunto encontrarás el reporte de stock diario generado el ${fecha}.</p>`,
          attachments: [
            {
              filename: `stock-${fecha}.pdf`,
              content: pdfStock,
              contentType: "application/pdf",
            },
          ],
        });
      }
      await crearBitacora(
        "Funcion CRON MonitorizacionStockDiario",
        "Monitorización diaria del stock realizada correctamente",
        1,
      );
      return;
    } catch (error) {
      console.log("Error Sincronizacion monitorizacion stock");
      await crearBitacora(
        "Funcion CRON MonitorizacionStockDiario",
        "Error en la monitorización diaria del stock",
        1,
      );
      console.error(error);
    }
  });
};

module.exports = MonitorizacionStockDiario;

// Nota de como usar Schedule de cron:
// *  *  *  *  *
// │  │  │  │  └── día de la semana (0-7, 0=domingo)
// │  │  │  └───── mes (1-12)
// │  │  └──────── día del mes (1-31)
// │  └─────────── hora (0-23)
// └────────────── minuto (0-59)

// "0 8 * * *"     → cada día a las 8:00
// "*/5 * * * *"   → cada 5 minutos
// "0 0 * * 1"     → cada lunes a medianoche
// "0 9 1 * *"     → el día 1 de cada mes a las 9:00
