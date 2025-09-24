const { DataTypes } = require("sequelize");
const sequelize = require("../config/bd");

const lote = sequelize.define(
  {
    idLote: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    Codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    FechaVencimiento: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    FechaIngreso: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    idBodega: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "bodega",
        key: "idBodega",
      },
      onDelete: "CASCADE",
    },
  },
  { tableName: "lote", timestamps: false }
);

module.exports = lote;
