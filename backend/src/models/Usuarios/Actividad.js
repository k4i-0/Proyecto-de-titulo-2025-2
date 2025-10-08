const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const actividad = sequelize.define(
  "actividad",
  {
    idActividad: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    nivelAlerta: {
      type: DataTypes.ENUM("Bajo", "Medio", "Alto"),
      allowNull: false,
      defaultValue: "Bajo",
    },
  },
  {
    tableName: "actividad",
    timestamps: false,
  }
);
module.exports = actividad;
