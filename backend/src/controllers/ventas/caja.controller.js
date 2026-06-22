const Caja = require("../../models/ventas/Caja");
const RegistroCaja = require("../../models/ventas/RegistroCaja");
const Sucursal = require("../../models/inventario/Sucursal");
const Venta = require("../../models/ventas/VentaCliente");
const Funcionario = require("../../models/Usuarios/Funcionario");
const RealizaVenta = require("../../models/ventas/RealizaVenta");
const DetallePago = require("../../models/ventas/detallePago");
const Retiros = require("../../models/ventas/Retiros");

const { sequelize } = require("../../models");
const { Op } = require("sequelize");

exports.buscarCajasPorSucursal = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { idSucursal } = req.params;
    if (!idSucursal || isNaN(parseInt(idSucursal))) {
      await transaction.rollback();
      return res.status(400).json({ error: "Falta el ID de la sucursal" });
    }

    // Verificar que la sucursal exista
    const sucursal = await Sucursal.findByPk(idSucursal, { transaction });
    if (!sucursal) {
      await transaction.rollback();
      return res.status(404).json({ error: "Sucursal no encontrada" });
    }

    // Buscar las cajas asociadas a la sucursal
    const cajas = await Caja.findAll({
      where: { idSucursal },
      attributes: [
        "idCaja",
        "numeroCaja",
        "montoCajaEfectivo",
        "montoCajaDebito",
        "montoCajaCredito",
        "estadoCaja",
      ],
      include: [
        {
          model: RegistroCaja,
          where: { estadoRegistroCaja: "Abierta" },
          attributes: ["fechaApertura", "montoInicial", "seRealizoArqueo"],
        },
        {
          model: Retiros,
          attributes: ["idRetiro", "monto", "motivo"],
        },
      ],
      transaction,
    });
    if (!cajas || cajas.length === 0) {
      return res
        .status(404)
        .json({ error: "No se encontraron cajas para esta sucursal" });
    }
    await transaction.commit();
    return res.status(200).json(cajas);
  } catch (error) {
    console.error("Error al buscar cajas por sucursal:", error);
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    return res.status(500).json({ error: "Error del servidor" });
  }
};

exports.buscarDatosCuadraturaCaja = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { deviceID } = req.params;
    if (!deviceID) {
      await transaction.rollback();
      return res.status(400).json({ error: "Falta el ID del dispositivo" });
    }

    // Verificar que la caja exista
    const caja = await Caja.findOne({
      where: { computadorID: deviceID },
      transaction,
    });
    if (!caja) {
      await transaction.rollback();
      return res.status(404).json({ error: "Caja no encontrada" });
    }

    // Buscar los registros asociados a la caja
    const ultimoRegistro = await RegistroCaja.findOne({
      where: {
        idCaja: caja.idCaja,
        estadoRegistroCaja: "Abierta",
      },
      include: [
        {
          model: Funcionario,
          attributes: ["nombre", "apellido"],
        },
      ],
      order: [["fechaApertura", "DESC"]],
    });
    if (!ultimoRegistro || ultimoRegistro.length === 0) {
      return res
        .status(404)
        .json({ error: "No se encontraron registros para esta caja" });
    }
    if (ultimoRegistro.seRealizoArqueo === false) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "No se ha realizado el arqueo de caja" });
    }

    const finDeHoy = new Date();
    const ventasCaja = await Venta.findAll({
      where: {
        fechaVenta: {
          [Op.gte]: ultimoRegistro.fechaApertura,
          [Op.lte]: finDeHoy,
        },
        estadoVenta: "Completada",
      },
      include: [
        {
          model: RealizaVenta,
          where: { idCaja: caja.idCaja },
          attributes: [],
        },
        {
          model: DetallePago,
          attributes: ["metodoPago", "montoPagado"],
        },
      ],
      transaction,
    });
    //console.log("Funcionarios:", ultimoRegistro);

    let totalEfectivo = 0;
    let totalDebito = 0;
    let totalCredito = 0;
    let totalGeneral = 0;
    let cantidadVentas = 0;

    ventasCaja.forEach((venta) => {
      cantidadVentas++;
      const pagos =
        venta.DetallePagos || venta.detallepagos || venta.DetallePago || [];

      pagos.forEach((detalle) => {
        const montoPagado = Number(detalle.montoPagado || 0);

        totalGeneral += montoPagado;

        const metodo = (detalle.metodoPago || "").toLowerCase();

        if (metodo.includes("efectivo")) {
          totalEfectivo += montoPagado;
        } else if (metodo.includes("debito") || metodo.includes("débito")) {
          totalDebito += montoPagado;
        } else if (metodo.includes("credito") || metodo.includes("crédito")) {
          totalCredito += montoPagado;
        }
      });
    });
    const datosCuadratura = {
      numeroCaja: caja.numeroCaja,
      totalEfectivo,
      totalDebito,
      totalCredito,
      totalGeneral,
      cantidadVentas,
      montoInicial: Number(ultimoRegistro.montoInicial || 0),
      montoCierre: Number(ultimoRegistro.montoCierreReal || 0),

      nombreFuncionario:
        `${ultimoRegistro.funcionario?.nombre || ""} ${ultimoRegistro.funcionario?.apellido || ""}`.trim(),
      fechaGeneracionArqueo: ultimoRegistro.fechaGeneracionArqueo,
      diferencia: Number(ultimoRegistro.diferenciaCierre || 0),
      estadoRegistroCaja: ultimoRegistro.estadoRegistroCaja,
      estadoCaja: caja.estadoCaja,
    };
    await transaction.commit();
    return res.status(200).json(datosCuadratura);
  } catch (error) {
    console.error("Error al buscar datos de cuadratura de caja:", error);
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    return res.status(500).json({ error: "Error del servidor" });
  }
};

exports.bloquearFuncionamientoCaja = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { deviceID } = req.params;
    if (!deviceID) {
      return res.status(400).json({ error: "Falta el ID del dispositivo" });
    }

    const caja = await Caja.findOne({
      where: { computadorID: deviceID },
      transaction: t,
    });

    if (!caja) {
      await t.rollback();
      return res.status(404).json({ error: "Caja no encontrada" });
    }

    await caja.update(
      { estadoCaja: "Bloqueada", estadoPOS: "Bloqueada" },
      { transaction: t },
    );
    await t.commit();
    return res
      .status(200)
      .json({ message: "Funcionamiento de caja bloqueado exitosamente" });
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }
    console.error("Error al bloquear funcionamiento de caja:", error);
    return res
      .status(500)
      .json({ error: "Error al bloquear funcionamiento de caja" });
  }
};

exports.desbloquearFuncionamientoCaja = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { deviceID } = req.params;
    if (!deviceID) {
      return res.status(400).json({ error: "Falta el ID del dispositivo" });
    }

    const caja = await Caja.findOne({
      where: { computadorID: deviceID },
      transaction: t,
    });

    if (!caja) {
      await t.rollback();
      return res.status(404).json({ error: "Caja no encontrada" });
    }
    if (caja.estadoCaja === "Cerrada") {
      await t.rollback();
      return res.status(400).json({
        error: "No se puede desbloquear una caja cerrada Aperturela nuevamente",
      });
    }
    if (caja.estadoFuncionamiento === "Abierta") {
      await t.rollback();
      return res.status(400).json({ error: "La caja ya está operativa" });
    }

    await caja.update(
      { estadoCaja: "Abierta", estadoPOS: "Operativo" },
      { transaction: t },
    );
    await t.commit();
    return res
      .status(200)
      .json({ message: "Funcionamiento de caja desbloqueado exitosamente" });
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }
    console.error("Error al desbloquear funcionamiento de caja:", error);
    return res
      .status(500)
      .json({ message: "Error al desbloquear funcionamiento de caja" });
  }
};

exports.cuadrarCaja = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { deviceID } = req.params;
    const { observaciones } = req.body;
    console.log("Datos recibidos para cuadrar caja:", req.body);
    if (!deviceID || !observaciones) {
      return res
        .status(400)
        .json({ error: "Falta el ID del dispositivo o las observaciones" });
    }

    const caja = await Caja.findOne({
      where: { computadorID: deviceID },
      transaction: t,
    });
    if (!caja) {
      await t.rollback();
      return res.status(404).json({ error: "Caja no encontrada" });
    }
    if (caja.estadoCaja === "Cerrada") {
      await t.rollback();
      return res.status(400).json({ error: "La caja ya está cerrada" });
    }

    const ultimoRegistro = await RegistroCaja.findOne({
      where: {
        idCaja: caja.idCaja,
        estadoRegistroCaja: "Abierta",
      },
      order: [["fechaApertura", "DESC"]],
      transaction: t,
    });
    if (!ultimoRegistro) {
      await t.rollback();
      return res
        .status(404)
        .json({ error: "No se encontró un registro abierto para esta caja" });
    }

    if (!ultimoRegistro) {
      await t.rollback();
      return res
        .status(404)
        .json({ error: "No se encontró un registro abierto para esta caja" });
    }

    await ultimoRegistro.update(
      {
        fechaCierre: new Date(),
        estadoRegistroCaja: "Cerrada",
        montoCierreDebito: caja.montoCajaDebito || 0,
        montoCierreCredito: caja.montoCajaCredito || 0,
        observacionesCierre: observaciones || null,
      },
      { transaction: t },
    );

    await caja.update(
      {
        estadoCaja: "Cerrada",
        estadoPOS: "Bloqueada",
        montoCajaDebito: 0,
        montoCajaCredito: 0,
      },
      { transaction: t },
    );
    await t.commit();
    return res.status(200).json({ message: "Caja cerrada exitosamente" });
  } catch (error) {
    console.error("Error al cerrar caja:", error);
    if (t && !t.finished) {
      await t.rollback();
    }
    return res.status(500).json({ error: "Error al cerrar caja" });
  }
};
