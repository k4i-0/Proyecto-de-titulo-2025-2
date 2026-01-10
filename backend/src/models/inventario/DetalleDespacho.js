const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const detalledespacho = sequelize.define(
  "detalledespacho",
  {
    idDetalledespacho: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    fechaCreacion: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM(
        "creada",
        "enviada",
        "recibida",
        "completada",
        "cancelada"
      ),
      allowNull: false,
      defaultValue: "creada",
    },

    totalCompra: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  { tableName: "detalledespacho", timestamps: false }
);

module.exports = detalledespacho;
