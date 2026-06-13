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
      allowNull: true,
      defaultValue: "Plazo Fijo",
    },
    turno: {
      type: DataTypes.ENUM("Mañana", "Tarde", "Noche", "Rotativo"),
      allowNull: true,
      defaultValue: "Mañana",
    },
    fechaTermino: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM("Activo", "Inactivo"),
      allowNull: false,
      defaultValue: "Activo",
    },

    motivoCambioContrato: {
      type: DataTypes.TEXT,
      allowNull: true,
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
  },
);

module.exports = contratoFuncionario;
