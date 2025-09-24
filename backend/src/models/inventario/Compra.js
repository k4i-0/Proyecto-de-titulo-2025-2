const { DataTypes } = require("sequelize");
const sequelize = require("../config/bd");

const compraproveedor = sequelize.define(
  "compraproveedor",
  {
    idCompraProveedor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    FechaCompra: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    Cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    Total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    idProductos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "productos",
        key: "idProducto",
      },
      onDelete: "CASCADE",
    },
    idSucursal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "sucursal",
        key: "idSucursal",
      },
      onDelete: "CASCADE",
    },
    idProveedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "proveedor",

        key: "idProveedor",
      },
      onDelete: "CASCADE",
    },
  },
  { tableName: "compraProveedor", timestamps: false }
);

module.exports = compraproveedor;
