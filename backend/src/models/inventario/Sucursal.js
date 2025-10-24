const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const sucursal = sequelize.define(
  "sucursal",
  {
    idSucursal: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM("Abierta", "Cerrada", "Mantencion", "Eliminada"),
      allowNull: false,
      defaultValue: "Abierta",
    },
  },
  {
    tableName: "sucursal",
    timestamps: false,
  }
);

module.exports = sucursal;
