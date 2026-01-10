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
    fechaEntrega: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    estado: {
      type: DataTypes.ENUM("pendiente", "en camino", "entregado", "cancelado"),
      allowNull: false,
      defaultValue: "pendiente",
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
