const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const bodega = sequelize.define(
  "bodega",
  {
    idBodega: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM(
        "En Funcionamiento",
        "En Mantenimiento",
        "Fuera de Servicio"
      ),
      allowNull: false,
      defaultValue: "En Funcionamiento",
    },
    // idSucursal: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "sucursal",
    //     key: "idSucursal",
    //   },
    //   onDelete: "CASCADE",
    // },
  },
  {
    tableName: "bodega",
    timestamps: false,
  }
);

module.exports = bodega;
