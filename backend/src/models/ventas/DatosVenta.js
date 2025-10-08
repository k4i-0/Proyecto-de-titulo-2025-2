const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const datosventa = sequelize.define(
  "datosventa",
  {
    idDatosVenta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
    },
    detalle: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    subTotal: {
      type: DataTypes.INTEGER,
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
    tableName: "datosventa",
    timestamps: false,
  }
);

module.exports = datosventa;
