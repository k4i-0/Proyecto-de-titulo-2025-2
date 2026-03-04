const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const despacho = sequelize.define(
  "despacho",
  {
    idDespacho: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    //DP202612345678 , es un codigo con DE seguido del año y un numero correlativo de 8 digitos 40.320 Despachos al año
    codigoDespacho: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    fechaDespacho: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    tipoDocumento: {
      type: DataTypes.ENUM("Factura", "Guia de despacho", "Boleta", "Otro"),
      allowNull: false,
      defaultValue: "Factura",
    },
    tipoDespacho: {
      type: DataTypes.ENUM(
        "proveedor",
        "entre sucursales",
        "compra directa",
        "otro",
      ),
      allowNull: false,
      defaultValue: "proveedor",
    },
    numeroDocumento: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    repartidor: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM(
        "En espera aprobacion",
        "Pendiente Entrega",
        "Recepcionado",
        "Entregado Con Faltantes",
        "En Inventario",
        "Cancelado",
      ),
      allowNull: false,
      defaultValue: "Pendiente Entrega",
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    idOrdenCompra: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "ordencompra",
        key: "idOrdenCompra",
      },
    },
  },
  { tableName: "despacho", timestamps: true },
);

module.exports = despacho;
