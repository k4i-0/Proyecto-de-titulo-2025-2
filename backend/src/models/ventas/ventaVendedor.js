const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const ventaVendedor = sequelize.define(
  "ventaVendedor",
  {
    idVentaVendedor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    fechaHoraEmision: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    totalDescuentos: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    estadoVentaVendedor: {
      type: DataTypes.ENUM("Pendiente", "Completada", "Cancelada"),
      allowNull: false,
      defaultValue: "Pendiente",
    },
    idFuncionario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "funcionario",
        key: "idFuncionario",
      },
    },
  },
  {
    tableName: "ventaVendedor",
    timestamps: false,
  },
);

module.exports = ventaVendedor;
