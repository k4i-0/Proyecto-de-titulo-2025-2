const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const categoria = sequelize.define(
  "categorias",
  {
    idCategoria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    nombreCategoria: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    // durabilidad: {
    //   type: DataTypes.STRING(100),
    //   allowNull: false,
    // },
    estado: {
      type: DataTypes.ENUM("Activo", "Inactivo", "Suspendido"),
      allowNull: false,
      defaultValue: "Activo",
    },
  },
  {
    tableName: "categorias",
    timestamps: false,
  }
);

module.exports = categoria;
