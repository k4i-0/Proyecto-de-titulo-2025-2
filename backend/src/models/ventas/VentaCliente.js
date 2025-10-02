const { DataTypes } = require("sequelize");
const sequelize = require("../config/bd");

const ventacliente = sequelize.define(
  "ventacliente",
  {
    idVentaCliente: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    fechaVenta: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    horaVenta: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    metodoPago: {
      type: DataTypes.ENUM("Efectivo", "Tarjeta Debito", "Tarjeta Credito"),
      allowNull: false,
      defaultValue: "Efectivo",
    },
    totalVenta: {
      type: DataTypes.INTEGER(6),
      allowNull: false,
    },
    rutCliente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "cliente",
        key: "rutCliente",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    idCaja: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "caja",
        key: "idCaja",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    idFuncionario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "funcionario",
        key: "idFuncionario",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    idProducto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "producto",
        key: "idProducto",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "ventacliente",
    timestamps: false,
  }
);

module.exports = ventacliente;
