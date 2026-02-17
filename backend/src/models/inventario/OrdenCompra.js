const { DataTypes } = require("sequelize");
const sequelize = require("../../config/bd");

const ordenCompra = sequelize.define(
  "ordencompra",
  {
    idOrdenCompra: {
      //Codigo interno de la orden de compra
      type: DataTypes.BIGINT,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    nombreOrden: {
      //Nombre descriptivo de la orden de compra OC-AÑO-NUMERO8DIGITOS
      type: DataTypes.STRING,
      allowNull: false,
    },
    fechaOrden: {
      type: DataTypes.DATE, // Cuando se creo la orden de compra
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    estado: {
      type: DataTypes.ENUM(
        //Posibles estados de la orden de compra
        "creada",
        "pendiente recibir",
        "despachada",
        "recepcionada",
        "pendiente de aprobacion",
        "aprobada",
        "rechazada",
        "aceptada con modificaciones",
        "pendiente de pago",
        "pagada",
        "cancelada",
        "recibida con faltante",
      ),
      allowNull: false,
      defaultValue: "creada",
    },
    tipo:{
      type: DataTypes.ENUM(
        //Posibles tipos de la orden de compra
        "compra directa",
        "compra sucursal",
      ),
      allowNull: false,
      defaultValue: "compra directa",
    },
    total: {
      type: DataTypes.INTEGER, //Total de la orden de compra
      allowNull: false,
      defaultValue: 0,
    },
    observaciones: {
      //Observaciones generales de la orden de compra
      type: DataTypes.TEXT,
      allowNull: true,
    },
    detalleEstado: {
      //Detalle adicional sobre el estado de la orden de compra (razon de rechazo, detalles de recepcion, etc) Uso del sistema
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "ordencompra",
    timestamps: false,
  },
);

module.exports = ordenCompra;
