const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const estante = sequelize.define(
  "estante",
  {
    idEstante: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    lugar: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    seccion: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    tableName: "estante",
    timestamps: false,
  }
);

module.exports = estante;
