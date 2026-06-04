const PDFDocument = require("pdfkit");

const generarPDFStockDiario = (stockDiario) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Header
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("Reporte de Stock Diario", { align: "center" });
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Generado: ${new Date().toLocaleString("es-CL")}`, {
        align: "center",
      });
    doc.moveDown();

    // Agrupar por sucursal
    const porSucursal = stockDiario.reduce((acc, item) => {
      if (!acc[item.nombreSucursal]) acc[item.nombreSucursal] = [];
      acc[item.nombreSucursal].push(item);
      return acc;
    }, {});

    for (const [sucursal, items] of Object.entries(porSucursal)) {
      // Título sucursal
      doc.fontSize(13).font("Helvetica-Bold").text(`Sucursal: ${sucursal}`);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Header tabla
      const y = doc.y;
      doc.fontSize(9).font("Helvetica-Bold");
      doc.text("Bodega", 50, y, { width: 150 });
      doc.text("Producto", 200, y, { width: 200 });
      doc.text("Stock", 400, y, { width: 80, align: "right" });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.3);

      // Filas
      doc.font("Helvetica").fontSize(9);
      for (const item of items) {
        const fy = doc.y;
        const colorStock =
          item.stock === 0 ? "red" : item.stock < 10 ? "orange" : "black";

        doc
          .fillColor("black")
          .text(item.nombreBodega || "-", 50, fy, { width: 150 });
        doc.text(item.nombreProducto, 200, fy, { width: 200 });
        doc
          .fillColor(colorStock)
          .text(String(item.stock), 400, fy, { width: 80, align: "right" });
        doc.fillColor("black");
        doc.moveDown(0.5);

        // salto de página si es necesario
        if (doc.y > 700) doc.addPage();
      }

      doc.moveDown();
    }

    // Total al final
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(`Total productos registrados: ${stockDiario.length}`, {
        align: "right",
      });

    doc.end();
  });
};

module.exports = { generarPDFStockDiario };
