const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const funcionario = sequelize.define(
  "funcionario",
  {
    idFuncionario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    rut: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    passwordCaja: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    // cargo: {
    //   type: DataTypes.ENUM(
    //     "Sistema",
    //     "Administrador",
    //     "Vendedor",
    //     "Cajero",
    //     "Otro"
    //   ),
    //   allowNull: false,
    // },
    estado: {
      type: DataTypes.ENUM("Activo", "Inactivo", "Eliminado"),
      allowNull: false,
      defaultValue: "Activo",
    },
    // idRol: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    //   references: {
    //     model: "rol",
    //     key: "idRol",
    //   },
    //   onDelete: "CASCADE",
    //   onUpdate: "CASCADE",
    // },
    // idBitacora: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    //   references: {
    //     model: "bitacora",
    //     key: "idBitacora",
    //   },
    //   onDelete: "CASCADE",
    //   onUpdate: "CASCADE",
    // },
  },
  {
    tableName: "funcionario",
    timestamps: false,
  }
);

module.exports = funcionario;
