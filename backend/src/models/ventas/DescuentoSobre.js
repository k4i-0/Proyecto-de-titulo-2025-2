const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const descuentosobre = sequelize.define("descuentosobre", {
  idDescuentoSobre: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
  },
  fechaHora: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  porcentaje: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

module.exports = descuentosobre;
