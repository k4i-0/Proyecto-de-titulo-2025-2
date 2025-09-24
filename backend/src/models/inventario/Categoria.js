const { DataTypes } = require("sequelize");
const sequelize = require("../config/bd");

const categoria = sequelize.define(
  "categorias",
  {
    idCategoria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    Nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    Tipo: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "categorias",
    timestamps: false,
  }
);

module.exports = categoria;
