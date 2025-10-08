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
      type: DataTypes.ENUM("Factura", "Guia de despacho"),
      allowNull: false,
      defaultValue: "Factura",
    },
    tipoDespacho: {
      type: DataTypes.ENUM("Proveedor", "Entre Sucursales"),
      allowNull: false,
      defaultValue: "Proveedor",
    },
    repartidor: {
      type: DataTypes.STRING(100),
      allowNull: false,
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
  { tableName: "despacho", timestamps: false }
);

module.exports = despacho;
