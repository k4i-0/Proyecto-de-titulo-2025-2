const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const vendedorProveedor = sequelize.define(
  "vendedor",
  {
    idVendedorProveedor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    rut: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: true,
    },
    telefono: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true,
      },
      unique: true,
    },
    // Proveedor: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "proveedor",
    //     key: "idProveedor",
    //   },
    //   onDelete: "CASCADE",
    // },
  },
  {
    tableName: "vendedor",
    timestamps: false,
  }
);

module.exports = vendedorProveedor;
