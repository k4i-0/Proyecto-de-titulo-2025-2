const { DataTypes } = require("sequelize");
const sequelize = require("../config/bd");

const productoLote = sequelize.define(
  "productoLote",
  {
    idProductoLote: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    idProducto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "productos",
        key: "idProducto",
      },
      onDelete: "CASCADE",
    },
    idLote: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "lote",
        key: "idLote",
      },
      onDelete: "CASCADE",
    },
  },
  { tableName: "productoLote", timestamps: false }
);

module.exports = productoLote;
