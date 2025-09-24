const { DataTypes } = require("sequelize");
const sequelize = require("../config/bd");

const proveedor = sequelize.define(
  "proveedor",
  {
    idProveedor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    Nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    Contacto: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    Telefono: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    Email: {
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
  },
  {
    tableName: "proveedor",
    timestamps: false,
  }
);

module.exports = proveedor;
