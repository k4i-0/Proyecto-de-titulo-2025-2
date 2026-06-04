const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

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
    metodoPago: {
      type: DataTypes.ENUM(
        "Efectivo",
        "Transferencia",
        "Tarjeta Debito",
        "Tarjeta Credito",
        "Funcionario",
        "Pago Mixto",
      ),
      allowNull: false,
      defaultValue: "Efectivo",
    },

    totalVenta: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idVentaMP: {
      // valor idepotencyKey de MP
      type: DataTypes.STRING,
      allowNull: true,
    },
    idOrdenMP: {
      // orden id que entrega MP al crear la orden
      type: DataTypes.STRING,
      allowNull: true,
    },
    estadoVenta: {
      type: DataTypes.ENUM("Pendiente", "Completada", "Cancelada"),
      allowNull: true,
      defaultValue: "Pendiente",
    },
    // rutCliente: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "cliente",
    //     key: "rutCliente",
    //   },
    //   onDelete: "CASCADE",
    //   onUpdate: "CASCADE",
    // },
    // idCaja: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "caja",
    //     key: "idCaja",
    //   },
    //   onDelete: "CASCADE",
    //   onUpdate: "CASCADE",
    // },
    // idFuncionario: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "funcionario",
    //     key: "idFuncionario",
    //   },
    //   onDelete: "CASCADE",
    //   onUpdate: "CASCADE",
    // },
    // idDatosVenta: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "datosventa",
    //     key: "idDatosVenta",
    //   },
    //   onDelete: "CASCADE",
    //   onUpdate: "CASCADE",
    // },
    // idDescuento: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    //   references: {
    //     model: "descuento",
    //     key: "idDescuento",
    //   },
    //   onDelete: "CASCADE",
    //   onUpdate: "CASCADE",
    // },
  },
  {
    tableName: "ventacliente",
    timestamps: false,
  },
);

module.exports = ventacliente;
