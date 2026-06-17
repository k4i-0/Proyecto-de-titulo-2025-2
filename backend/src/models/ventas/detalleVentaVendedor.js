const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const detalleVentaVendedor = sequelize.define(
  "detalleVentaVendedor",
  {
    idDetalleVentaVendedor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    descripcion: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    montoDescuento: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    tipoDeEntrega: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    fechaHoraEmision: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    iva: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    numeroBoleta: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    // idVentaVendedor: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "ventaVendedor",
    //     key: "idVentaVendedor",
    //   },
    //   onDelete: "CASCADE",
    //   onUpdate: "CASCADE",
    // },
    // idProducto: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "producto",
    //     key: "idProducto",
    //   },
    //   onDelete: "CASCADE",
    //   onUpdate: "CASCADE",
    // },
  },
  {
    tableName: "detalleVentaVendedor",
    timestamps: false,
  },
);

module.exports = detalleVentaVendedor;
