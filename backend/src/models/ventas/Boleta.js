const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const boleta = sequelize.define(
  "boleta",
  {
    idBoleta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
    },
    fechaHoraEmision: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    iva: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    codigoSII: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "boleta",
    timestamps: false,
  }
);

module.exports = boleta;
