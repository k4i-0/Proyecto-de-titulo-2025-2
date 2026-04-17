const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const lote = sequelize.define(
  "lote",
  {
    idLote: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    //LT202612345678 , es un codigo con LT seguido del año y un numero correlativo de 8 digitos 40.320 Lotes al año
    codigoLote: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    fechaCreacion: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fechaVencimiento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM(
        "creado",
        "disponible",
        "agotado",
        "vencido",
        "rechazado",
      ),
      allowNull: false,
      defaultValue: "creado",
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    idProducto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "productos",
        key: "idProducto",
      },
    },
    idDetalleDespacho: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: "detalledespacho",
        key: "idDetalledespacho",
      },
    },
    idBodega: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "bodega",
        key: "idBodega",
      },
    },
  },
  { tableName: "lote", timestamps: false },
);

module.exports = lote;
