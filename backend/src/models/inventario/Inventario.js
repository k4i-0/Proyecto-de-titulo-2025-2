const { DataTypes } = require("sequelize");
const sequelize = require("../config/bd");

const inventario = sequelize.define(
  "inventario",
  {
    idInventario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    idBodega: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "bodega",
        key: "idBodega",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "inventario",
    timestamps: false,
  }
);

module.exports = inventario;
