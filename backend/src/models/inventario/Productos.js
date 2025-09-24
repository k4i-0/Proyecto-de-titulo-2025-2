const { DataTypes } = require("sequelize");
const sequelize = require("../config/bd");

const producto = sequelize.define(
  "productos",
  {
    idProducto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    Codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    Nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    PrecioCompra: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    PrecioVenta: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idCategoria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categorias",
        key: "idCategoria",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "productos",
    timestamps: false,
  }
);

module.exports = producto;
