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
      unique: true,
    },
    FechaIngreso: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    FechaTermino: {
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
