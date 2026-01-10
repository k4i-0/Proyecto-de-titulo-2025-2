const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const ordenCompra = sequelize.define(
  "ordencompra",
  {
    idOrdenCompra: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    nombreOrden: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fechaOrden: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    estado: {
      type: DataTypes.ENUM(
        "creada",
        "pendiente de aprobacion",
        "aprobada",
        "rechazada",
        "recibida",
        "cancelada",
        "fallo detalle"
      ),
      allowNull: false,
      defaultValue: "creada",
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    detalleEstado: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "ordencompra",
    timestamps: false,
  }
);

module.exports = ordenCompra;
