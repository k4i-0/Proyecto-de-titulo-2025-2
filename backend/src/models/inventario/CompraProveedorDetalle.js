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
    subtotal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    idOrdenCompra: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "ordencompra",
        key: "idOrdenCompra",
      },
    },
    idProducto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "productos",
        key: "idProducto",
      },
    },
  },
  { tableName: "compraProveedorDetalle", timestamps: false },
);

module.exports = compraproveedordetalle;
