const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");
const compraproveedor = require("./CompraProveedor");

const compraproveedordetalle = sequelize.define(
  "compraproveedordetalle",
  {
    idCompraProveedorDetalle: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    precioUnitario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  { tableName: "compraProveedorDetalle", timestamps: false }
);

module.exports = compraproveedordetalle;
