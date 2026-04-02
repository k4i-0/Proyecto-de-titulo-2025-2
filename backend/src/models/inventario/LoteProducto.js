const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

// models/LoteProducto.js (tabla intermedia)
const LoteProducto = sequelize.define(
  "loteproducto",
  {
    idLoteProducto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Cantidad de este producto en este lote",
    },
    fechaIngreso: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fechaVencimiento: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("disponible", "vendido", "vencido"),
      defaultValue: "disponible",
    },
  },
  {
    tableName: "loteproducto",
    timestamps: false,
  }
);
module.exports = LoteProducto;
