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
    nombre: {
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
    fechaIngreso: {
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
    estado: {
      type: DataTypes.ENUM("Activo", "Inactivo"),
      allowNull: false,
      defaultValue: "activo",
    },
  },

  {
    tableName: "proveedor",
    timestamps: false,
  }
);

module.exports = proveedor;
