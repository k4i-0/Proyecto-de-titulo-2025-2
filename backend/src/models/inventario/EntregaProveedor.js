const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const entregaProveedor = sequelize.define(
  "entregaproveedor",
  {
    idEntregaProveedor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    codigoEntrega: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    cantidadEntregada: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    estado: {
      type: DataTypes.ENUM(
        "asociado despacho",
        "asignado",
        "rechazado",
        "cancelado"
      ),
      allowNull: false,
      defaultValue: "asociado despacho",
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "entregaproveedor",
    timestamps: false,
  }
);

module.exports = entregaProveedor;
