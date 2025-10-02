const { DataTypes } = require("sequelize");
const sequelize = require("../config/bd");

const despachoSucursal = sequelize.define(
  "despachoSucursal",
  {
    idDespachoSucursal: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    fechaDespacho: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    tipoDocumento: {
      type: DataTypes.ENUM("Factura", "Guia de despacho"),
      allowNull: false,
      defaultValue: "Factura",
    },
    repartidor: {
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
  { tableName: "despachoSucursal", timestamps: false }
);

module.exports = despachoSucursal;
