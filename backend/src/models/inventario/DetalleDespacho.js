const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const detalledespacho = sequelize.define(
  "detalledespacho",
  {
    idDetalledespacho: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    //CODD202612345678 , es un codigo con CD seguido del año y un numero correlativo de 8 digitos 40.320 Detalles de despacho al año
    codigoDetalleDespacho: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    cantidad: {
      //Cuanto se esperaba (sacar de Orden de Compra)
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    cantidadRecibida: {
      // Lo que realmente llego
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    cantidadRechazada: {
      // Lo que se rechazo
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    idDespacho: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "despacho",
        key: "idDespacho",
      },
    },
    idProducto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "productos",
        key: "idProducto",
      },
    },
  },
  { tableName: "detalledespacho", timestamps: true },
);

module.exports = detalledespacho;
