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
    //ET12345 , es un codigo con ET  y un numero correlativo de 5 digitos 120 Estantes al año
    codigoEstante: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.ENUM("Maquina", "Estante", "Lugar de Piso", "Otro"),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM(
        "Disponible",   // Con espacio libre para recibir lotes
        "Completo",     // Capacidad alcanzada (set automáticamente al recepcionar)
        "Inhabilitado", // Fuera de uso temporal
        "Mantenimiento",// En reparación
      ),
      allowNull: false,
      defaultValue: "Disponible",
    },
  },
  {
    tableName: "estante",
    timestamps: false,
  },
);

module.exports = estante;
