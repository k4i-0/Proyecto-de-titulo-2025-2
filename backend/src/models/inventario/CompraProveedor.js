const { DataTypes } = require("sequelize");
const sequelize = require("../config/bd");

const compraproveedor = sequelize.define(
  "compraProveedor",
  {
    idCompraProveedor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    FechaEntrega: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    Repartidor: {
      type: DataTypes.STRING(100),
      allowNull: false,
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
    idLote: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "lote",
        key: "idLote",
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
  },
  { tableName: "compraProveedor", timestamps: false }
);

module.exports = compraproveedor;
