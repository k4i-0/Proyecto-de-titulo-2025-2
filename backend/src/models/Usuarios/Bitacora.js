const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const bitacora = sequelize.define("bitacora", {
  idBitacora: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
  },
  fechaCreacion: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  // idActividad: {
  //   type: DataTypes.INTEGER,
  //   allowNull: true,
  //   references: {
  //     model: "actividad",
  //     key: "idActividad",
  //   },
  //   onDelete: "CASCADE",
  //   onUpdate: "CASCADE",
  // },
});

module.exports = bitacora;
