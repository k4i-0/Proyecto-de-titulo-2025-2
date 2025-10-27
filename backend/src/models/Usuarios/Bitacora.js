const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const bitacora = sequelize.define(
  "bitacora",
  {
    idBitacora: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    fechaCreacion: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    funcionOcupo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    nivelAlerta: {
      type: DataTypes.ENUM("Bajo", "Medio", "Alto"),
      allowNull: false,
      defaultValue: "Bajo",
    },
  },
  {
    tableName: "bitacora",
    timestamps: false,
  }
);

module.exports = bitacora;
