const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const producto = sequelize.define(
  "productos",
  {
    idProducto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    marca: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    precioCompra: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    precioVenta: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    peso: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    fechaVencimiento: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    numeroSerie: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    // idCategoria: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "categorias",
    //     key: "idCategoria",
    //   },
    //   onDelete: "CASCADE",
    // },
  },
  {
    tableName: "productos",
    timestamps: false,
  }
);

module.exports = producto;
