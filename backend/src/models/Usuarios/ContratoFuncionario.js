const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const contratoFuncionario = sequelize.define(
  "contratoFuncionario",
  {
    idContratoFuncionario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    fechaIngreso: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    tipoContrato: {
      type: DataTypes.ENUM("Indefinido", "Plazo Fijo", "Por Proyecto"),
      allowNull: false,
      defaultValue: "Plazo Fijo",
    },
    // idFuncionario: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "funcionario",
    //     key: "idFuncionario",
    //   },
    // },
    // idSucursal: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "sucursal",
    //     key: "idSucursal",
    //   },
    // },
  },
  {
    tableName: "contratoFuncionario",
    timestamps: false,
  }
);

module.exports = contratoFuncionario;
