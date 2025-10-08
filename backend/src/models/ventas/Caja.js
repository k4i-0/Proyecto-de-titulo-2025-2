const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

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
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    montoCajaEfectivo: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    montoCajaDebito: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    montoCajaCredito: {
      type: DataTypes.INTEGER,
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
    tipoMaquinaPOS: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "Mercado Pago",
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
    estadoCaja: {
      type: DataTypes.ENUM("Abierta", "Cerrada"),
      allowNull: false,
      defaultValue: "Abierta",
    },
    montoArqueo: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // idProveedor: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   reference: {
    //     model: "proveedor",
    //     key: "idProveedor",
    //   },
    //   onDelete: "CASCADE",
    //   onUpdate: "CASCADE",
    // },
    // idSucursal: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "sucursal",
    //     key: "idSucursal",
    //   },
    //   onDelete: "CASCADE",
    //   onUpdate: "CASCADE",
    // },
  },
  {
    tableName: "caja",
    timestamps: false,
  }
);

module.exports = caja;
