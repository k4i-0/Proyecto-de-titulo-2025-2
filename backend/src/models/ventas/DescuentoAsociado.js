const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const descuentoAsociado = sequelize.define(
  "descuentoasociado",
  {
    idDescuentoAsociado: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
    },
    fechaHoraCreacion: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    vigencia: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    // idDescuento: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "descuento",
    //     key: "idDescuento",
    //   },
    //   onDelete: "CASCADE",
    //   onUpdate: "CASCADE",
    // },
    // idCategoria: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "categoria",
    //     key: "idCategoria",
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
    tableName: "descuentos_asociados",
    timestamps: false,
  }
);

module.exports = descuentoAsociado;
