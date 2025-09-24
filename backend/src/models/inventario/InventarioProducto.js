const { DataTypes } = require("sequelize");
const sequelize = require("../config/bd");

const inventarioproducto = sequelize.define(
  "inventarioproducto",
  {
    idProductoInventario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    cantidadProducto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  { tableName: "inventarioproducto", timestamps: false }
);

module.exports = inventarioproducto;
