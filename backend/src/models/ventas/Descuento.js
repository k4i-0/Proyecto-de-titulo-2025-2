const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const descuento = sequelize.define(
  "descuento",
  {
    idDescuento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    monto: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fechaCreacion: {
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
    porcentaje: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "descuentos",
    timestamps: false,
  }
);

module.exports = descuento;
