const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const realizaVenta = sequelize.define(
  "realizaVenta",
  {
    idRealizaVenta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
    },
    fechaRealizaVenta: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    montoTotalVenta: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    metodoPago: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    tableName: "realizaVenta",
    timestamps: false,
  }
);

module.exports = realizaVenta;
