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
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    // stock == sumatoria Lote.StockInicial
    stockMinimo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    // define tope minimo
    stockMaximo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },
    //Maximo permitido
    stockReservado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    // en caso de salida por reserva
    estado: {
      type: DataTypes.ENUM("Bueno", "Malo", "Roto", "Vendido", "Vencido"),
      allowNull: false,
      defaultValue: "Bueno",
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
