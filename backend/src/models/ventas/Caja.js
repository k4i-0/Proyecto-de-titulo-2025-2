const { DataTypes } = require("sequelize");
const sequelize = require("../config/bd");

const caja = sequelize.define(
  "caja",
  {
    idCaja: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    fechaApertura: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fechaCierre: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fondoInicial: {
      type: DataTypes.INTEGER(6),
      allowNull: false,
    },
    totalCajaEfectivo: {
      type: DataTypes.INTEGER(6),
      allowNull: true,
    },
    totalCajaDebito: {
      type: DataTypes.INTEGER(6),
      allowNull: true,
    },
    totalCajaCredito: {
      type: DataTypes.INTEGER(6),
      allowNull: true,
    },
    idPC: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    descripcionPC: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    estadoPC: {
      type: DataTypes.ENUM("Operativo", "Mantencion", "Fuera de Servicio"),
      allowNull: false,
      defaultValue: "Operativo",
    },
    idPOS: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    descripcionPOS: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    estadoPOS: {
      type: DataTypes.ENUM("Operativo", "Mantencion", "Fuera de Servicio"),
      allowNull: false,
      defaultValue: "Operativo",
    },
    fechaInicioPOS: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    idProveedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      reference: {
        model: "proveedor",
        key: "idProveedor",
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
  {
    tableName: "caja",
    timestamps: false,
  }
);

module.exports = caja;
