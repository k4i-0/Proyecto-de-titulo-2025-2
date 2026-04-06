const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const bitacora = sequelize.define(
  "bitacora",
  {
    idBitacora: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    operacion: {
      // Ejemplo: CRUD, LOGIN, LOGOUT, etc.
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    idFuncionario: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "funcionario",
        key: "idFuncionario",
      },
    },
  },
  {
    tableName: "bitacora",
    timestamps: true,
    createdAt: "fechaCreacion",
    updatedAt: false,
  },
);

module.exports = bitacora;
