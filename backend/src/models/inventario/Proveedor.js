const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const proveedor = sequelize.define(
  "proveedor",
  {
    idProveedor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    rut: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: true,
    },
    Nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    ubicacion: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    FechaIngreso: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    rubro: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    giro: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: "proveedor",
    timestamps: false,
  }
);

module.exports = proveedor;
