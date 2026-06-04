const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const descuentosobre = sequelize.define(
  "descuentosobre",
  {
    idDescuentoSobre: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    idProducto: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "productos",
        key: "idProducto",
      },
    },
    idCategoria: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "categorias",
        key: "idCategoria",
      },
    },
    idDescuento: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "descuentos",
        key: "idDescuento",
      },
    },
  },
  {
    tableName: "descuentosobre",
    timestamps: false,
  },
);

module.exports = descuentosobre;
