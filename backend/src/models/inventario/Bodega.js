const { DataTypes } = require("sequelize");
const sequelize = require("../config/bd");

const bodega = sequelize.define(
  "bodega",
  {
    idBodega: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    codigoBodega: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    Nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    Ubicacion: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    Capacidad: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "bodega",
    timestamps: false,
  }
);

module.exports = bodega;
