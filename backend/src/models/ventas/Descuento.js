const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const descuento = sequelize.define(
  "descuento",
  {
    idDescuento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    montoDescuento: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    fechaInicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fechaFin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    porcentajeDescuento: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    estadoDescuento: {
      type: DataTypes.ENUM("Activo", "Inactivo", "Expirado"),
      allowNull: false,
      defaultValue: "Activo",
    },
    esDescuentoUnico: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "descuentos",
    timestamps: false,
  },
);

module.exports = descuento;
