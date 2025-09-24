const { DateTypes } = require("sequelize");
const sequelize = require("../config/bd");

const bodegaSucursal = sequelize.define(
  "bodegaSucursal",
  {
    idBodegaSucursal: {
      type: DateTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    FechaCreacion: {
      type: DateTypes.DATE,
      allowNull: false,
    },
  },
  { tableName: "bodegaSucursal", timestamps: false }
);

module.exports = bodegaSucursal;
