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
      type: DataTypes.ENUM("Indefinido", "Plazo Fijo", "Honorarios"),
      allowNull: false,
      defaultValue: "Plazo Fijo",
    },
    turno: {
      type: DataTypes.ENUM("Mañana", "Tarde", "Noche", "Rotativo"),
      allowNull: false,
      defaultValue: "Mañana",
    },
    fechaTermino: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM("Activo", "Inactivo", "Eliminado"),
      allowNull: false,
      defaultValue: "Activo",
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
