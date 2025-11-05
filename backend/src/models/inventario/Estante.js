const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const estante = sequelize.define(
  "estante",
  {
    idEstante: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    tipo: {
      type: DataTypes.ENUM("Maquina", "Estante", "Lugar de Piso", "Otro"),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM(
        "Habilitado",
        "Inhabilitado",
        "Mantenimiento",
        "Reservado"
      ),
      allowNull: false,
    },
  },
  {
    tableName: "estante",
    timestamps: false,
  }
);

module.exports = estante;
