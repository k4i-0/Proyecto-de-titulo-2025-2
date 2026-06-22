const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const RegistroCaja = sequelize.define(
  "registrocaja",
  {
    idRegistroCaja: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    montoInicial: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    cantidadMontoInicial: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    fechaApertura: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    estadoRegistroCaja: {
      type: DataTypes.ENUM("Abierta", "Cerrada"),
      allowNull: false,
      defaultValue: "Abierta",
    },
    montoCierreDebito: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    montoCierreCredito: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    montoCierreTeorico: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    montoCierreReal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    cantidadMontoCierreReal: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    seRealizoArqueo: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    idFuncionarioArquea: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "funcionario",
        key: "idFuncionario",
      },
    },
    fechaGeneracionArqueo: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    diferenciaCierre: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    observacionesCierre: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    fechaCierre: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    idCaja: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "caja",
        key: "idCaja",
      },
    },
  },
  {
    timestamps: false,
    tableName: "registrocaja",
  },
);

module.exports = RegistroCaja;
