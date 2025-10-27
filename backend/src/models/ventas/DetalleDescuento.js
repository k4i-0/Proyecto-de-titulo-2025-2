const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const detalledescuento = sequelize.define(
  "detalledescuento",
  {
    idDetalledescuento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
    },
    fechaHora: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    // idDescuento: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "descuento",
    //     key: "idDescuento",
    //   },
    //   onDelete: "CASCADE",
    //   onUpdate: "CASCADE",
    // },
    // idCategoria: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "categoria",
    //     key: "idCategoria",
    //   },
    //   onDelete: "CASCADE",
    //   onUpdate: "CASCADE",
    // },
    // idProducto: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "producto",
    //     key: "idProducto",
    //   },
    //   onDelete: "CASCADE",
    //   onUpdate: "CASCADE",
    // },
  },
  {
    tableName: "detalledescuento",
    timestamps: false,
  }
);

module.exports = detalledescuento;
