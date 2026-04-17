const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/bd");

const creaOrdenCompra = sequelize.define(
  "creaOrdenCompra",
  {
    idCreaOrdenCompra: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    idOrdenCompra: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "ordencompra",
        key: "idOrdenCompra",
      },
    },
    idProveedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "proveedor",
        key: "idProveedor",
      },
    },
    fechaAutorizacion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    idSucursal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "sucursal",
        key: "idSucursal",
      },
    },
    idFuncionarioSolicita: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "funcionario",
        key: "idFuncionario",
      },
    },
    idFuncionarioAutoriza: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "funcionario",
        key: "idFuncionario",
      },
    },
  },
  {
    tableName: "creaOrdenCompra",
    timestamps: true,
  },
);

module.exports = creaOrdenCompra;
