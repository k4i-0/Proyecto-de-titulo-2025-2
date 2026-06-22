const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const DetallePago = sequelize.define(
  "detallepago",
  {
    idDetallePago: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    metodoPago: {
      type: DataTypes.ENUM(
        "Efectivo",
        "Transferencia",
        "Tarjeta Debito",
        "Tarjeta Credito",
        "Funcionario",
        "Pago Mixto",
      ),
      allowNull: false,
    },
    montoPagado: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idVentaMP: {
      // valor idepotencyKey de MP
      type: DataTypes.STRING,
      allowNull: true,
    },
    idOrdenMP: {
      // orden id que entrega MP al crear la orden
      type: DataTypes.STRING,
      allowNull: true,
    },
    // idVentaCliente: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "ventacliente",
    //     key: "idVentaCliente",
    //   },
    //   onDelete: "CASCADE",
    //   onUpdate: "CASCADE",
    // },
  },
  {
    tableName: "detallepago",
    timestamps: false,
  },
);

module.exports = DetallePago;
