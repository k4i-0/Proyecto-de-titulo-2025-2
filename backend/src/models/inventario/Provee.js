const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const provee = sequelize.define(
  "provee",
  {
    idProvee: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    registradoPor: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("Activo", "Inactivo", "Desenlazado"),
      allowNull: false,
      defaultValue: "Activo",
    },
    fechaRegistro: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "provee",
    timestamps: false,
  }
);
module.exports = provee;
