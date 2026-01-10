const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const detalleventa = sequelize.define(
  "detalleventa",
  {
    idDetalleVenta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
    },
    descripcion: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tipoDeEntrega: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    fechaHoraEmision: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    iva: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    numeroBoleta: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
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
    tableName: "detalleventa",
    timestamps: false,
  }
);

module.exports = detalleventa;
