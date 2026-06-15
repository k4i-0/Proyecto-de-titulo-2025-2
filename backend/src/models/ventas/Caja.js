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
    //CODIGO INTERNO EJ CAJA 56 PARA IDENTIFICARLA EN EL SISTEMA, NO ES EL ID DE LA BASE DE DATOS
    numeroCaja: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    //codigo asocidado al navegador que identifica la caja numero X, codigo UUID
    computadorID: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      validate: {
        isUUID: 4,
      },
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
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    idMercadoPagoPOS: {
      type: DataTypes.STRING,
      allowNull: true,
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
      type: DataTypes.ENUM(
        "Operativo",
        "Mantencion",
        "Fuera de Servicio",
        "Bloqueada",
      ),
      allowNull: false,
      defaultValue: "Operativo",
    },
    fechaInicioPOS: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    estadoCaja: {
      type: DataTypes.ENUM("Abierta", "Cerrada", "Bloqueada"),
      allowNull: false,
      defaultValue: "Abierta",
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
  },
);

module.exports = caja;
