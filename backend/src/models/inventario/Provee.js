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
    idProducto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "productos",
        key: "idProducto",
      },
    },
    idProveedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "proveedor",
        key: "idProveedor",
      },
    },
  },
  {
    tableName: "provee",
    timestamps: false,
  },
);
module.exports = provee;
