const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const inventario = sequelize.define(
  "inventario",
  {
    idInventario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    fechaCreacion: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    encargado: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    estado: {
      type: DataTypes.ENUM("Activo", "Inactivo", "Eliminado"),
      allowNull: false,
      defaultValue: "Activo",
    },
    // idBodega: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "bodega",
    //     key: "idBodega",
    //   },
    //   onDelete: "CASCADE",
    // },
    // idProducto: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "producto",
    //     key: "idProducto",
    //   },
    //   onDelete: "CASCADE",
    // },
  },
  {
    tableName: "inventario",
    timestamps: false,
  }
);

module.exports = inventario;
