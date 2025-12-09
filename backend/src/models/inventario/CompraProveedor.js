const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const compraproveedor = sequelize.define(
  "compraproveedor",
  {
    idCompraProveedor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    nombreOrden: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fechaCompra: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    estado: {
      type: DataTypes.ENUM("pendiente", "aprobada", "recibida", "cancelada"),
      allowNull: false,
      defaultValue: "pendiente",
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
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
    // idProveedor: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "proveedor",

    //     key: "idProveedor",
    //   },
    //   onDelete: "CASCADE",
    // },
    // idFuncionario: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "funcionario",
    //     key: "idFuncionario",
    //   },
    //   onDelete: "CASCADE",
    // },
  },
  { tableName: "compraProveedor", timestamps: false }
);

module.exports = compraproveedor;
