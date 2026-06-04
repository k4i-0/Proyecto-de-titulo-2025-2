const MonitorizacionStockDiario = require("./MonitorizacionStockDiario");

const iniciarJobs = () => {
  console.log("Iniciando Trabajos..");
  MonitorizacionStockDiario();
  console.log("Trabajos Finalizados..");
};

module.exports = iniciarJobs;
