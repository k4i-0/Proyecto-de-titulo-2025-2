// models/BitacoraActividad.js
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const BitacoraActividad = sequelize.define(
  "BitacoraActividad",
  {
    idBitacoraActividad: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idBitacora: {
      type: DataTypes.INTEGER,
      references: {
        model: "bitacora",
        key: "idBitacora",
      },
    },
    idActividad: {
      type: DataTypes.INTEGER,
      references: {
        model: "actividad",
        key: "idActividad",
      },
    },
  },
  {
    tableName: "bitacora_actividades",
    timestamps: false,
  }
);

module.exports = BitacoraActividad;
