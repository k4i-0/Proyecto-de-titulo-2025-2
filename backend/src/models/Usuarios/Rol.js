const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const roles = sequelize.define(
  "roles",
  {
    idRol: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    priviliegios: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM("Activo", "Inactivo"),
      allowNull: false,
      defaultValue: "Activo",
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "rol",
    timestamps: false,
  }
);

module.exports = roles;
