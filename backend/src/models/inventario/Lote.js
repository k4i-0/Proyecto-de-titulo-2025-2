const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const lote = sequelize.define(
  "lote",
  {
    idLote: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    fechaCreacion: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fechaVencimiento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM(
        "creado",
        "disponible",
        "agotado",
        "vencido",
        "rechazado"
      ),
      allowNull: false,
      defaultValue: "creado",
    },
    stockInicial: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    precioUnitario: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
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
    //     model: "productos",
    //     key: "idProducto",
    //   },
    //   onDelete: "CASCADE",
    // },
  },
  { tableName: "lote", timestamps: false }
);

module.exports = lote;
