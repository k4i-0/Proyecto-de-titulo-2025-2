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
    fechaCompra: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
