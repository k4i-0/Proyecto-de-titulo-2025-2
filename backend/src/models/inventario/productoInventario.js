const { DataTypes } = require("sequelize");
const sequelize = require("../config/bd");

const productoInventario = sequelize.define(
  "productoInventario",
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
    idInventario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "inventario",
        key: "idInventario",
      },
      onDelete: "CASCADE",
    },
    idProducto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "producto",
        key: "idProducto",
      },
      onDelete: "CASCADE",
    },
  },
  { tableName: "productoInventario", timestamps: false }
);

module.exports = productoInventario;
