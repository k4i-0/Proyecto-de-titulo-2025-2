const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const inventario = sequelize.define(
  "inventario",
  {
    idInventario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    estado: {
      type: DataTypes.ENUM("Bueno", "Malo", "Revision"),
      allowNull: false,
      defaultValue: "Bueno",
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    //     model: "producto",
    //     key: "idProducto",
    //   },
    //   onDelete: "CASCADE",
    // },
  },
  {
    tableName: "inventario",
    timestamps: false,
  }
);

module.exports = inventario;
