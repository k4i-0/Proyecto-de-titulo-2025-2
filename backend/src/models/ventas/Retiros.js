const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const Retiros = sequelize.define(
  "retiros",
  {
    idRetiro: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    fechaHoraRetiro: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    motivo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    denominaciones: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    idCaja: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "caja",
        key: "idCaja",
      },
    },
    idFuncionario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "funcionario",
        key: "idFuncionario",
      },
    },
  },
  {
    tableName: "retiros",
    timestamps: false,
  },
);

module.exports = Retiros;
