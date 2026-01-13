const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const detalledespacho = sequelize.define(
  "detalledespacho",
  {
    idDetalledespacho: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalCompra: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  { tableName: "detalledespacho", timestamps: false }
);

module.exports = detalledespacho;
