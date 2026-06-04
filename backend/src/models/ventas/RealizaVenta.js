const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const realizaVenta = sequelize.define(
  "realizaVenta",
  {
    idRealizaVenta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    fechaRealizaVenta: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "realizaVenta",
    timestamps: false,
  },
);

module.exports = realizaVenta;
