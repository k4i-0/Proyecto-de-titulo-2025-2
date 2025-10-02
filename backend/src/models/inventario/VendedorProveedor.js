const { DataTypes } = require("sequelize");
const sequelize = require("../config/bd");

const vendedorProveedor = sequelize.define(
  "vendedorProveedor",
  {
    idVendedorProveedor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    Nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    rut: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: true,
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
      unique: true,
    },
    fechaIngreso: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    fechaTermino: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    Proveedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "proveedor",
        key: "idProveedor",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "vendedorProveedor",
    timestamps: false,
  }
);

module.exports = vendedorProveedor;
