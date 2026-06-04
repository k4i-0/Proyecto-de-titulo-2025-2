const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const MovimientoCaja = sequelize.define(
  "movimientocaja",
  {
    idMovimientoCaja: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tipoMovimiento: {
      type: DataTypes.ENUM("Ingreso", "Egreso"),
      allowNull: false,
    },
    montoMovimiento: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    metodoPago: {
      type: DataTypes.ENUM(
        "Efectivo",
        "Tarjeta Débito",
        "Tarjeta Crédito",
        "Pago diferido",
      ),
      allowNull: false,
    },
    idVentaCliente: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "ventacliente",
        key: "idVentaCliente",
      },
    },
    idCaja: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "caja",
        key: "idCaja",
      },
    },
  },
  {
    timestamps: false,
    tableName: "movimientocaja",
  },
);

module.exports = MovimientoCaja;
