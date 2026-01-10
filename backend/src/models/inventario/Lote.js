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
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
    },
    fechaCreacion: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM(
        "creado",
        "asociado a OC",
        "recibido",
        "aprobado",
        "rechazado"
      ),
      allowNull: false,
      defaultValue: "creado",
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
