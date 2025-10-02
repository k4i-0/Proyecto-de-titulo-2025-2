const { DataTypes } = require("sequelize");
const sequelize = require("../config/bd");

const cajaasignada = sequelize.define(
  "cajaasignada",
  {
    idCajaAsignada: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    fechaAsignacion: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    horaAsignacion: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    idFuncionario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "funcionario",
        key: "idFuncionario",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    idCaja: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "caja",
        key: "idCaja",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    idSucursal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "sucursal",
        key: "idSucursal",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "cajaasignada",
    timestamps: false,
  }
);

module.exports = cajaasignada;
