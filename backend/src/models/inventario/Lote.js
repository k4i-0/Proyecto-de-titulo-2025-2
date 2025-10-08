const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const lote = sequelize.define(
  "lote",
  {
    idLote: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    Codigo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    FechaIngreso: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    FechaVencimiento: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    // idBodega: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "bodega",
    //     key: "idBodega",
    //   },
    //   onDelete: "CASCADE",
    // },
    // idProducto: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "productos",
    //     key: "idProducto",
    //   },
    //   onDelete: "CASCADE",
    // },
  },
  { tableName: "lote", timestamps: false }
);

module.exports = lote;
