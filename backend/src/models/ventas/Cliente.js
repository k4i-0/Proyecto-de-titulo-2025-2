const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const cliente = sequelize.define(
  "cliente",
  {
    rutCliente: {
      type: DataTypes.STRING(12),
      primaryKey: true,
      unique: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    apellido: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
  },
  {
    tableName: "cliente",
    timestamps: false,
  }
);

module.exports = cliente;
