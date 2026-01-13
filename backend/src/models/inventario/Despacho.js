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
        "Proveedor",
        "Entre Sucursales",
        "Compra Directa",
        "Devolucion"
      ),
      allowNull: false,
      defaultValue: "Proveedor",
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
        "Entregado",
        "Entregado Con Faltantes",
        "En Inventario",
        "Cancelado"
      ),
      allowNull: false,
      defaultValue: "Pendiente Entrega",
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // idProveedor: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "proveedor",
    //     key: "idProveedor",
    //   },
    //   onDelete: "CASCADE",
    // },
    // idLote: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "lote",
    //     key: "idLote",
    //   },
    //   onDelete: "CASCADE",
    // },
    // idSucursal: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "sucursal",
    //     key: "idSucursal",
    //   },
    //   onDelete: "CASCADE",
    // },
  },
  { tableName: "despacho", timestamps: true }
);

module.exports = despacho;
