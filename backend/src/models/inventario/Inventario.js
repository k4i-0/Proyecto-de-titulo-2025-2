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
    idProducto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "productos",
        key: "idProducto",
      },
    },
    idBodega: {
      type: DataTypes.INTEGER,
      allowNull: true, // null si aún no se asignó a una bodega
      references: {
        model: "bodega",
        key: "idBodega",
      },
    },
  },
  {
    tableName: "inventario",
    timestamps: false,
  },
);

module.exports = inventario;
