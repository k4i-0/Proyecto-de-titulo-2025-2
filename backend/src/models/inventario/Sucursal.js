const { DataTypes } = require("sequelize");
const sequelize = require("../config/bd");

const sucursal = sequelize.define(
  "sucursal",
  {
    idSucursal: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    codigoSucursal: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    ubicacion: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
  },
  {
    tableName: "sucursal",
    timestamps: false,
  }
);

module.exports = sucursal;
