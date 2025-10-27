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
    codigo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    fechaIngreso: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fechaVencimiento: {
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
