const Producto = require("../../models/inventario/Productos");
const Caja = require("../../models/ventas/Caja");
const Sucursal = require("../../models/inventario/Sucursal");
const Bodega = require("../../models/inventario/Bodega");
const RegistroCaja = require("../../models/ventas/RegistroCaja");
const CajaAsignada = require("../../models/ventas/CajaAsignada");
const Funcionario = require("../../models/Usuarios/Funcionario");
const Venta = require("../../models/ventas/VentaCliente");
const DetalleVenta = require("../../models/ventas/DetalleVenta");
const RealizaVenta = require("../../models/ventas/RealizaVenta");
const Inventario = require("../../models/inventario//Inventario");
const DescuentoSobre = require("../../models/ventas/DescuentoSobre");
const Descuento = require("../../models/ventas/Descuento");
const Categoria = require("../../models/inventario/Categoria");
const DetallePago = require("../../models/ventas/detallePago");
const ContratoFuncionario = require("../../models/Usuarios/ContratoFuncionario");
const VentaVendedor = require("../../models/ventas/ventaVendedor");
const DetalleVentaVendedor = require("../../models/ventas/detalleVentaVendedor");
const Retiros = require("../../models/ventas/Retiros");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const { sequelize } = require("../../models/index");
const { Op } = require("sequelize");

const axios = require("axios");

const {
  crearSucursal,
} = require("../../services/mercadoPago/sucursales/crearSucursal");
const { crearPOS } = require("../../services/mercadoPago/sucursales/crearCaja");
const {
  obtenerTerminales,
} = require("../../services/mercadoPago/terminal/obtenerTerminales");
const {
  buscarSucursales,
} = require("../../services/mercadoPago/sucursales/buscarSucursales");
const {
  buscarCajas,
} = require("../../services/mercadoPago/sucursales/buscarCajas");

const {
  actualizarModoTerminal,
} = require("../../services/mercadoPago/terminal/actualizarModoTerminal");

const {
  crearOrdenPago,
} = require("../../services/mercadoPago/ordenesPago/crearOrdenPago");

const { type } = require("os");

const generarTicketMercadoPago = (venta, nombreSucursal = "Casa Matriz") => {
  // 🚀 Función de formato corregida para soportar signos negativos contables (-$60)
  const formatearDinero = (monto) => {
    const numero = Number(monto || 0);
    if (numero < 0) {
      return `-$${Math.abs(numero).toLocaleString("es-CL")}`;
    }
    return `$${numero.toLocaleString("es-CL")}`;
  };

  // Formato de fecha y hora
  const fechaStr = new Date(venta.fechaVenta).toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Extraemos cajero y caja desde 'realizaVenta'
  const atiende = venta.realizaVenta?.[0]?.funcionario?.nombre || "Cajero";
  const cajaNum = venta.realizaVenta?.[0]?.caja?.numeroCaja || "1";

  let ticket = "{br}----------------------------------------{br}";
  ticket += "{center}{w} COMPROBANTE DE VENTA {/w}{br}{br}";
  ticket += `{s} Tienda: ${nombreSucursal}{/s}{br}`;
  ticket += `{s} Nro Venta: ${venta.idVentaCliente}{/s}{br}`;
  ticket += `{s} Fecha: ${fechaStr}{/s}{br}`;
  ticket += `{s} Atiende: ${atiende} (Caja ${cajaNum}){/s}{br}`;
  ticket += "----------------------------------------{br}";

  ticket += "{s}ARTICULO               CANT     SUBTOTAL{/s}{br}";
  ticket += "{s}----------------------------------------{/s}{br}";

  const detalles = venta.detalleventa || [];

  detalles.forEach((detalle) => {
    let nombre = "";

    // 🚀 VALIDACIÓN: Si tiene producto es venta normal, si es null es un descuento
    if (detalle.producto) {
      nombre = detalle.producto.nombre;
    } else {
      // Limpiamos el texto largo "Descuento en producto Categoria Abarrotes" a algo legible de POS
      const tipoEntrega = detalle.tipoDeEntrega || "";
      if (tipoEntrega.includes("Categoria")) {
        nombre = `Dcto. ${tipoEntrega.split("Categoria ")[1]}`; // Resultado: "Dcto. Abarrotes"
      } else {
        nombre = "Descuento Aplicado";
      }
    }

    // Ajuste estricto a 22 caracteres para mantener la cuadrícula del ticket
    if (nombre.length > 22) nombre = nombre.substring(0, 21) + ".";
    const nombreFormateado = nombre.padEnd(22, " ");

    // Formateamos cantidad (ej: "1.00" -> "1")
    const cantFormateada = String(Number(detalle.cantidad)).padStart(4, " ");

    // Procesa subtotales positivos y negativos dinámicamente
    const subtotalFormateado = formatearDinero(detalle.subtotal).padStart(
      12,
      " ",
    );

    ticket += `{s}${nombreFormateado} ${cantFormateada} ${subtotalFormateado}{/s}{br}`;
  });

  ticket += "----------------------------------------{br}";
  ticket += `{center}{w} TOTAL: ${formatearDinero(venta.totalVenta)} {/w}{br}`;
  ticket += "----------------------------------------{br}";

  ticket += "{s}DETALLE DE PAGO:{/s}{br}";

  // Extraemos el arreglo de 'detallepagos'
  const pagos = venta.detallepagos || [];

  pagos.forEach((pago) => {
    const metodo = pago.metodoPago.padEnd(26, " ");
    const monto = formatearDinero(pago.montoPagado).padStart(13, " ");
    ticket += `{s}- ${metodo}${monto}{/s}{br}`;
  });

  ticket += "----------------------------------------{br}";
  ticket += "{center}{s}¡Gracias por su preferencia!{/s}{br}{br}";

  return ticket;
};

/**
 * Genera el string con formato Mercado Pago Point para un Retiro de Caja
 * @param {Object} retiro - Objeto Retiro consultado desde Sequelize
 * @param {String} nombreSucursal - Nombre de la sucursal o local
 */
const generarTicketRetiroMercadoPago = (
  retiro,
  nombreSucursal = "Casa Matriz",
) => {
  // Función auxiliar para formato de moneda chilena
  const formatearDinero = (monto) =>
    `$${Number(monto).toLocaleString("es-CL")}`;

  // Formato de fecha
  const fechaStr = new Date(retiro.fechaHoraRetiro).toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Datos del funcionario que realiza el retiro
  const atiende = retiro.funcionario?.nombre || "Cajero";
  const rutCajero = retiro.funcionario?.rut || "";
  const cajaNum = retiro.caja?.numeroCaja || "1";

  // Encabezado del ticket
  let ticket = "{br}----------------------------------------{br}";
  ticket += "{center}{w} COMPROBANTE DE RETIRO {/w}{br}{br}";
  ticket += `{s} Tienda: ${nombreSucursal}{/s}{br}`;
  ticket += `{s} Nro Retiro: ${retiro.idRetiro}{/s}{br}`;
  ticket += `{s} Fecha: ${fechaStr}{/s}{br}`;
  ticket += `{s} Cajero: ${atiende} (Caja ${cajaNum}){/s}{br}`;
  ticket += `{s} Motivo: ${retiro.motivo || "No especificado"}{/s}{br}`;
  ticket += "----------------------------------------{br}";

  // Desglose de billetes/monedas
  if (retiro.denominaciones) {
    try {
      // Convertimos el string a objeto JSON
      const denom = JSON.parse(retiro.denominaciones);

      // Mapeamos las llaves de tu JSON al valor real en pesos chilenos
      const valoresMoneda = {
        d20000: 20000,
        d10000: 10000,
        d5000: 5000,
        d2000: 2000,
        d1000: 1000,
        d500: 500,
        d100: 100,
        d50: 50,
        d10: 10,
        d1: 1,
      };

      ticket += "{s}DENOMINACION           CANT   SUBTOTAL{/s}{br}";
      ticket += "{s}----------------------------------------{/s}{br}";

      let mostroDesglose = false;

      // Iteramos sobre las denominaciones
      for (const [llave, cantidad] of Object.entries(denom)) {
        // Solo imprimimos si hay al menos 1 billete/moneda de este tipo
        if (cantidad > 0 && valoresMoneda[llave]) {
          mostroDesglose = true;
          const valorReal = valoresMoneda[llave];
          const subtotalDenominacion = valorReal * cantidad;

          // Alineación de columnas: 20 chars | 5 chars | 11 chars
          const nombreDenom = formatearDinero(valorReal).padEnd(20, " ");
          const cantFormateada = String(cantidad).padStart(5, " ");
          const subFormateado = formatearDinero(subtotalDenominacion).padStart(
            11,
            " ",
          );

          ticket += `{s}${nombreDenom} ${cantFormateada} ${subFormateado}{/s}{br}`;
        }
      }

      if (mostroDesglose) {
        ticket += "----------------------------------------{br}";
      }
    } catch (error) {
      console.error("Error al leer denominaciones del retiro:", error);
    }
  }

  // Total
  ticket += `{center}{w} TOTAL RETIRADO: ${formatearDinero(retiro.monto)} {/w}{br}`;
  ticket += "----------------------------------------{br}{br}{br}";

  // Espacio para la firma de respaldo (Muy importante en retiros de efectivo)
  ticket += "{center}{s}________________________________{/s}{br}";
  ticket += `{center}{s}Firma ${atiende}{/s}{br}`;
  ticket += `{center}{s}RUT: ${rutCajero}{/s}{br}{br}`;

  return ticket;
};

const generarTicketArqueoCaja = (arqueo, datosSucursal = {}) => {
  const nombreSucursal = datosSucursal.nombre || "Casa Matriz";
  const idSucursal = datosSucursal.id || "N/A";

  const formatearDinero = (monto) => {
    const numero = Number(monto || 0);
    if (numero < 0) {
      return `-$${Math.abs(numero).toLocaleString("es-CL")}`;
    }
    return `$${numero.toLocaleString("es-CL")}`;
  };

  const formatearFecha = (fechaRaw) => {
    if (!fechaRaw) return "N/A";
    return new Date(fechaRaw).toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const cajaNum = arqueo.caja?.numeroCaja || "N/A";
  const fechaArqueo =
    arqueo.fechaGeneracionArqueo || arqueo.fechaCierre || new Date();

  let ticket = "{br}----------------------------------------{br}";
  ticket += "{center}{w} DETALLE DE ARQUEO {/w}{br}";
  ticket += "{center}{w} DE CAJA {/w}{br}{br}";

  // --- DATOS BÁSICOS ---
  ticket += `{center}{s}${nombreSucursal.toUpperCase()}{/s}{br}`;
  ticket += `{center}{s}ID Sucursal: ${idSucursal}{/s}{br}`;
  ticket += "----------------------------------------{br}";
  ticket += `{s} Nro Registro: ${arqueo.idRegistroCaja}{/s}{br}`;
  ticket += `{s} Caja Asignada: N° ${cajaNum}{/s}{br}`;
  ticket += `{s} Fecha: ${formatearFecha(fechaArqueo)}{/s}{br}`;
  ticket += "----------------------------------------{br}";

  // --- DESGLOSE DE DENOMINACIONES ---
  ticket += "{s}DENOMINACIÓN          CANT         TOTAL{/s}{br}";
  ticket += "{s}----------------------------------------{/s}{br}";

  const mapaDenominaciones = [
    { key: "d20000", valor: 20000, label: "$20.000" },
    { key: "d10000", valor: 10000, label: "$10.000" },
    { key: "d5000", valor: 5000, label: "$5.000" },
    { key: "d2000", valor: 2000, label: "$2.000" },
    { key: "d1000", valor: 1000, label: "$1.000" },
    { key: "d500", valor: 500, label: "$500" },
    { key: "d100", nan: 100, label: "$100" },
    { key: "d50", valor: 50, label: "$50" },
    { key: "d10", valor: 10, label: "$10" },
    { key: "d1", valor: 1, label: "$1" },
  ];

  const desgloseCierre = arqueo.cantidadMontoCierreReal || {};
  let tieneEfectivo = false;

  mapaDenominaciones.forEach((deno) => {
    const cantidad = Number(desgloseCierre[deno.key] || 0);

    if (cantidad > 0) {
      tieneEfectivo = true;
      const totalPorDenominacion = cantidad * deno.valor;

      const colDenominacion = deno.label.padEnd(18, " ");
      const colCantidad = `x${cantidad}`.padStart(6, " ");
      const colTotal = formatearDinero(totalPorDenominacion).padStart(16, " ");

      ticket += `{s}${colDenominacion}${colCantidad}${colTotal}{/s}{br}`;
    }
  });

  if (!tieneEfectivo) {
    ticket += "{center}{s}Sin efectivo registrado{/s}{br}";
  }

  ticket += "----------------------------------------{br}";

  // --- TOTAL DEL ARQUEO (MONTO REAL) ---
  ticket += `{center}{w} TOTAL EFECTIVO FÍSICO {/w}{br}`;
  ticket += `{center}{w} ${formatearDinero(arqueo.montoCierreReal)} {/w}{br}`;
  ticket += "----------------------------------------{br}{br}{br}";

  // --- 🚀 SECCIÓN DE FIRMAS ---
  ticket += "{s}    ________________    ________________{/s}{br}";
  ticket += "{s}      Firma Cajero      Firma Supervisor{/s}{br}{br}";

  ticket += "----------------------------------------{br}";
  ticket += "{center}{s}Auditoría de Sistemas POS{/s}{br}{br}";

  return ticket;
};

exports.buscarProductoVenta = async (req, res) => {
  try {
    const { codigo } = req.query;
    //console.log("Código recibido para búsqueda de venta:", codigo);

    const producto = await Producto.findOne({
      where: { codigo },
      include: [{ model: Categoria }],
    });
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    //console.log("Producto encontrado:", producto.toJSON());

    const inventario = await Inventario.findOne({
      where: { idProducto: producto.idProducto },
      attributes: ["stock", "stockMinimo"],
    });
    if (!inventario) {
      return res
        .status(404)
        .json({ message: "Inventario del producto no encontrado" });
    }
    if (inventario.stock <= 0) {
      return res.status(400).json({ message: "Producto sin stock disponible" });
    }
    const condicionesBusqueda = [{ idProducto: producto.idProducto }];
    if (producto.idCategoria) {
      condicionesBusqueda.push({ idCategoria: producto.idCategoria });
    }

    const descuentosSobre = await DescuentoSobre.findAll({
      where: {
        [Op.or]: condicionesBusqueda,
      },
      include: [
        {
          model: Descuento,
          where: { estadoDescuento: "Activo" },
          required: true,
        },
      ],
    });
    //console.log("Descuentos encontrados para el producto:", descuentosSobre);

    let montoTotalDescuento = 0;
    const listaDescuentos = [];

    descuentosSobre.forEach((item) => {
      const objDescuento = item.descuento;
      if (!objDescuento) return;

      const valorPorcentaje = Number(objDescuento.porcentajeDescuento || 0);
      const valorMonto = Number(objDescuento.montoDescuento || 0);

      let montoEfectivo = 0;
      let detalleTipo = "";

      if (valorPorcentaje > 0) {
        montoEfectivo = producto.precioVenta * (valorPorcentaje / 100);
        detalleTipo = `${valorPorcentaje}%`;
      } else if (valorMonto > 0) {
        montoEfectivo = valorMonto;
        detalleTipo = `$${valorMonto} fijo`;
      }

      // Si el descuento es válido y mayor a 0, lo sumamos y lo guardamos en el arreglo
      if (montoEfectivo > 0) {
        montoTotalDescuento += montoEfectivo;

        listaDescuentos.push({
          idDescuento: objDescuento.idDescuento,

          //nombreCategoria: item.idCategoria ? item.categoria.nombre : null,
          origen: item.idCategoria
            ? `Categoria ${producto.categoria.nombreCategoria}`
            : "Producto",
          detalle: detalleTipo,
          montoDescontado: Math.round(montoEfectivo),
        });
      }
    });

    //console.log("Descuentos aplicados:", listaDescuentos);
    //console.log("Monto total calculado:", montoTotalDescuento);

    // 6. Preparamos el objeto final incluyendo el nuevo arreglo
    const productoEnviar = {
      id: producto.idProducto,
      codigo: producto.codigo,
      nombre: producto.nombre,
      precioVenta: producto.precioVenta,
      montoDescuento: Math.round(montoTotalDescuento),
      descuentosAplicados: listaDescuentos,
    };

    return res.status(200).json(productoEnviar);
  } catch (error) {
    console.error("Error al buscar producto para venta:", error);
    return res
      .status(500)
      .json({ message: "Error al buscar producto para venta" });
  }
};

exports.estadoCaja = async (req, res) => {
  try {
    const { deviceID } = req.params;
    //console.log("ID de computador recibido para consulta de caja:", deviceID);
    const caja = await Caja.findOne({ where: { computadorID: deviceID } });
    if (!caja) {
      return res.status(404).json({ message: "Caja no encontrada" });
    }
    const cajaEnviar = {
      estado: caja.estado,
      numeroCaja: caja.numeroCaja,
      tipoMaquinaPOS: caja.tipoMaquinaPOS,
      estadoPOS: caja.estadoPOS,
    };
    return res.status(200).json(cajaEnviar);
  } catch (error) {
    console.error("Error al consultar estado de caja:", error);
    return res
      .status(500)
      .json({ message: "Error al consultar estado de caja" });
  }
};

exports.aperturaCaja = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { deviceID } = req.params;
    const { numeroCaja, sucursal, montoInicial, cantidadMontoInicial } =
      req.body;
    const { token } = req.cookies;
    //console.log("Datos params:", req.params);
    //console.log("Datos recibidos para apertura de caja:", req.body);
    if (!token) {
      await t.rollback();
      return res.status(401).json({ message: "No autorizado" });
    }
    if (
      !deviceID ||
      !numeroCaja ||
      !sucursal ||
      !montoInicial ||
      !cantidadMontoInicial
    ) {
      await t.rollback();
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }
    //decodificar token para obtener rut funcionario
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    //console.log("Payload decodificado:", decodedPayload);
    if (!decodedPayload) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });
      return res.status(401).json({ message: "No autorizado" });
    }
    const funcionarioSolicitante = await Funcionario.findOne(
      {
        where: { rut: decodedPayload.rut },
      },
      { transaction: t },
    );
    if (!funcionarioSolicitante) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });
      return res.status(401).json({ message: "No autorizado" });
    }

    const busquedaCaja = await Caja.findOne(
      { where: { computadorID: deviceID } },
      { transaction: t },
    );
    if (!busquedaCaja) {
      await t.rollback();
      return res
        .status(404)
        .json({ message: "Caja no encontrada para apertura" });
    }

    const inicioDeAyer = new Date();
    inicioDeAyer.setDate(inicioDeAyer.getDate() - 1);
    inicioDeAyer.setHours(0, 0, 0, 0);

    const finDeAyer = new Date();
    finDeAyer.setDate(finDeAyer.getDate() - 1);
    finDeAyer.setHours(23, 59, 59, 999);

    const registroCajaAbierta = await RegistroCaja.findOne({
      where: {
        idCaja: busquedaCaja.idCaja,
        estadoRegistroCaja: "Abierta",
        fechaApertura: {
          [Op.gte]: inicioDeAyer,
          [Op.lte]: finDeAyer,
        },
      },
      transaction: t,
    });
    console.log(
      "Registro de caja abierta encontrado para hoy:",
      registroCajaAbierta,
    );
    if (registroCajaAbierta) {
      await t.rollback();
      return res.status(400).json({
        message: "Existe un registro de caja abierta solicite cierre",
      });
    }
    const nuevoRegistroCaja = await RegistroCaja.create(
      {
        montoInicial,
        cantidadMontoInicial,
        fechaApertura: new Date(),
        idCaja: busquedaCaja.idCaja,
        estadoRegistroCaja: "Abierta",
        seRealizoArqueo: false,
      },
      { transaction: t },
    );

    await busquedaCaja.update({ estadoCaja: "Abierta" }, { transaction: t });

    const datosEnviar = {
      idRegistroCaja: nuevoRegistroCaja.idRegistroCaja,
      montoInicial: nuevoRegistroCaja.montoInicial,
      idCaja: nuevoRegistroCaja.idCaja,
      idSucursal: busquedaCaja.idSucursal,
      idFuncionario: funcionarioSolicitante.idFuncionario,
    };

    await t.commit();
    return res
      .status(200)
      .json({ message: "Caja abierta exitosamente", datos: datosEnviar });
  } catch (error) {
    await t.rollback();
    console.error("Error al abrir caja:", error);
    return res.status(500).json({ message: "Error al abrir caja" });
  }
};

exports.registroCajaSucursal = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      numeroCaja,
      idPC,
      descripcionPC,
      idSucursal,
      idPOS,
      tipoMaquinaPOS,
      descripcionPOS,
    } = req.body;

    if (
      !numeroCaja ||
      !idPC ||
      !descripcionPC ||
      !idSucursal ||
      !idPOS ||
      !tipoMaquinaPOS ||
      !descripcionPOS
    ) {
      await t.rollback();
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const sucursal = await Sucursal.findByPk(idSucursal, { transaction: t });
    if (!sucursal) {
      await t.rollback();
      return res
        .status(404)
        .json({ error: "La sucursal indicada no existe en la base de datos." });
    }

    const cajaExistente = await Caja.findOne({
      where: {
        [Op.or]: [{ numeroCaja: numeroCaja }, { idPC: idPC }, { idPOS: idPOS }],
      },
      transaction: t,
    });

    if (cajaExistente) {
      const esReconexionSegura =
        cajaExistente.numeroCaja === numeroCaja &&
        cajaExistente.idPC === idPC &&
        cajaExistente.idPOS === idPOS;
      if (esReconexionSegura) {
        await t.commit();
        return res.status(200).json({
          message: "Conexión a caja existente exitosa",
          deviceID: cajaExistente.computadorID,
          nuevaCajaId: cajaExistente.idCaja,
          idSucursal: sucursal.idSucursal, // Asegúrate de tener esta variable definida
          nombreSucursal: cajaExistente.nombre,
        });
        return res.status(200).json({
          message: "Caja registrada exitosamente para sucursal y Mercado Pago",
          deviceID: nuevaCaja.computadorID,
          nuevaCajaId: nuevaCaja.idCaja,
          idSucursal: sucursal.idSucursal,
          nombreSucursal: sucursal.nombre,
        });
      }

      await t.rollback();

      let detalleError = "Conflicto de asignación.";

      if (cajaExistente.numeroCaja === numeroCaja) {
        detalleError = `El número de Caja ${numeroCaja} ya existe en el sistema.`;
      } else if (cajaExistente.idPOS === idPOS) {
        detalleError = `El terminal POS (${idPOS}) ya está siendo utilizado por la Caja ${cajaExistente.numeroCaja}.`;
      } else if (cajaExistente.idPC === idPC) {
        detalleError = `Este computador ya está registrado como la Caja ${cajaExistente.numeroCaja}.`;
      }

      return res.status(400).json({
        message: "Error al registrar la caja",
        detalle: detalleError,
      });
    }

    // 3. CREAR CAJA EN BD
    const nuevaCaja = await Caja.create(
      {
        numeroCaja,
        computadorID: randomUUID(), // Asegúrate de tener importado randomUUID
        montoCajaEfectivo: 0,
        montoCajaDebito: 0,
        montoCajaCredito: 0,
        idPC,
        descripcionPC,
        estadoPC: "Operativo",
        idPOS,
        tipoMaquinaPOS,
        descripcionPOS,
        estadoPOS: "Operativo",
        fechaInicioPOS: new Date(),
        estadoCaja: "Cerrada",
        montoArqueo: 0,
        idSucursal: idSucursal,
      },
      { transaction: t },
    );

    const userID_MP = process.env.USER_ID_MERCADO_PAGO;
    const codigoSucursal = String(sucursal.idSucursal);
    const configMP = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      },
      validateStatus: () => true, // Para manejar manualmente los errores de status
    };

    console.log("Buscando sucursal en Mercado Pago...");

    // A. Buscar Sucursal en MP

    console.log(
      `Buscando sucursal en MP con external_id: ${typeof codigoSucursal}`,
    );
    console.log("userID_MP:", typeof userID_MP);
    const busquedaSucursalMP = await axios.get(
      `https://api.mercadopago.com/users/${userID_MP}/stores/search?external_id=${codigoSucursal}`,
      configMP,
    );
    console.log(
      "Respuesta de búsqueda de sucursal en MP:",
      busquedaSucursalMP.data,
    );
    let idMercadoPagoSucursal;

    if (busquedaSucursalMP.status == 404) {
      console.log("Sucursal no existe en MP. Creándola...");
      const nuevaSucursalMP = await axios.post(
        `https://api.mercadopago.com/users/${userID_MP}/stores`,
        {
          name: sucursal.nombre,
          external_id: String(sucursal.idSucursal),
          location: {
            street_number: "S/N",
            street_name: String(sucursal.direccion || "Direccion por defecto"),
            city_name: "Chiguayante",
            state_name: "Biobío",
            latitude: -36.895,
            longitude: -73.08,
            reference: "",
          },
        },
        configMP,
      );
      console.log("Respuesta de creación de sucursal en MP:", nuevaSucursalMP);
      if (nuevaSucursalMP.data.status >= 400) {
        console.log("entre");
        await t.rollback();
        return res.status(nuevaSucursalMP.status).json({
          error:
            nuevaSucursalMP.data?.status ||
            "Error al crear sucursal en Mercado Pago",
          detalle: nuevaSucursalMP.data?.message,
        });
      }
      idMercadoPagoSucursal = nuevaSucursalMP.data?.results?.[0]?.id;
      if (!idMercadoPagoSucursal) {
        await t.rollback();
        return res.status(500).json({
          error: "No se recibió un ID de Mercado Pago al crear la sucursal.",
          detalle: nuevaSucursalMP.data,
        });
      }
      // Actualizar Sucursal en BD
      await sucursal.update(
        { idMercadoPago: idMercadoPagoSucursal },
        { transaction: t },
      );
    } else {
      console.log("Sucursal encontrada en MP.");
      //actualizarla en la bd por si no tenia el idMercadoPago guardado
      await sucursal.update(
        { idMercadoPago: busquedaSucursalMP.data?.results?.[0]?.id },
        { transaction: t },
      );

      idMercadoPagoSucursal = busquedaSucursalMP.data?.results?.[0]?.id;
      console.log("IdmercadoPagoSucursal encontrado:", idMercadoPagoSucursal);
      if (!idMercadoPagoSucursal) {
        await t.rollback();
        return res.status(500).json({
          error:
            "No se recibió un ID de Mercado Pago al encontrar la sucursal.",
          detalle: busquedaSucursalMP.data,
        });
      }

      // Por si acaso la BD no tenía el ID guardado pero MP sí
      if (!sucursal.idMercadoPago) {
        await sucursal.update(
          { idMercadoPago: idMercadoPagoSucursal },
          { transaction: t },
        );
      }
    }

    // B. Buscar/Crear Caja (POS) en MP
    console.log("Buscando Caja en Mercado Pago...");

    // MP pide que el external_store_id coincida con el external_id de la sucursal, que es tu idSucursal
    const busquedaCajaMP = await axios.get(
      `https://api.mercadopago.com/pos?external_id=${numeroCaja}&external_store_id=${codigoSucursal}`,
      configMP,
    );
    console.log("Respuesta de búsqueda de caja en MP:", busquedaCajaMP.data);
    if (busquedaCajaMP.status >= 400) {
      console.error("Error buscando caja en MP:", busquedaCajaMP.data);
      await t.rollback();
      return res.status(busquedaCajaMP.status).json({
        error:
          busquedaCajaMP.data?.message ||
          "Error al buscar caja en Mercado Pago",
      });
    }

    if (busquedaCajaMP.data.results.length === 0) {
      console.log("Caja no existe en MP. Creándola...");
      const nuevaCajaMP = await axios.post(
        `https://api.mercadopago.com/pos`,
        {
          name: "Caja " + numeroCaja,
          external_id: String(numeroCaja),
          external_store_id: String(idSucursal), // Mismo external_id que le diste a la sucursal
        },
        configMP,
      );
      console.log("Datos de caja creada en MP:", nuevaCajaMP.data);

      if (nuevaCajaMP.status === 409 || !nuevaCajaMP.data?.id) {
        await t.rollback();
        return res.status(500).json({
          error:
            "Ya Existe una caja con el mismo número en esta sucursal en Mercado Pago." ||
            nuevaCajaMP.data?.message,
        });
      }
      await nuevaCaja.update(
        { idMercadoPagoPOS: Number(nuevaCajaMP.data.id) },
        { transaction: t },
      );
    } else {
      console.log("Caja ya existe en Mercado Pago.");
      // Actualizamos la DB por si faltaba el ID
      await nuevaCaja.update(
        { idMercadoPagoPOS: Number(busquedaCajaMP.data.results[0].id) },
        { transaction: t },
      );
    }

    await t.commit();
    return res.status(200).json({
      message: "Caja registrada exitosamente para sucursal y Mercado Pago",
      deviceID: nuevaCaja.computadorID,
      nuevaCajaId: nuevaCaja.idCaja,
      idSucursal: sucursal.idSucursal,
      nombreSucursal: sucursal.nombre,
    });
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }

    console.error("Falla en el registro de caja:");

    if (error.response) {
      console.error(`Status Code MP: [${error.response.status}]`);
      console.error(
        "Detalle del rechazo MP:",
        JSON.stringify(error.response.data, null, 2),
      );
      return res.status(error.response.status).json({
        error: "Error de integración con Mercado Pago",
        detalle: error.response.data.errors,
      });
    } else if (error.request) {
      console.error("Timeout: Mercado Pago no respondió.");
    } else {
      //console.error("Error crítico:", error.message);
    }

    return res
      .status(500)
      .json({ error: "Error interno al registrar caja para sucursal" });
  }
};

exports.consultarDatosCaja = async (req, res) => {
  try {
    const { deviceID } = req.params;
    if (!deviceID) {
      return res.status(400).json({ message: "Falta el ID del dispositivo" });
    }

    const caja = await Caja.findOne({
      where: { computadorID: deviceID },
      include: [
        {
          model: Sucursal,
          attributes: ["nombre"],
        },
      ],
    });

    if (!caja) {
      return res.status(404).json({ message: "Caja no encontrada" });
    }

    // Buscamos LA ÚLTIMA tupla registrada para esta caja, sin importar qué día fue
    const ultimoRegistro = await RegistroCaja.findOne({
      where: {
        idCaja: caja.idCaja,
      },
      order: [["fechaApertura", "DESC"]], // Ordenamos de más nuevo a más viejo
    });

    // Extraemos los datos que necesitas de esa última tupla (si es que existe alguna)
    const estadoRegistroCajaActual = ultimoRegistro
      ? ultimoRegistro.estadoRegistroCaja
      : "Sin Apertura";
    const fechaUltimoRegistro = ultimoRegistro
      ? ultimoRegistro.fechaApertura
      : null;

    const datosCaja = {
      numeroCaja: caja.numeroCaja,
      estadoCaja: caja.estadoCaja,
      idPOS: caja.idPOS,
      tipoMaquinaPOS: caja.tipoMaquinaPOS,
      estadoPOS: caja.estadoPOS,
      nombreSucursal: caja.sucursal?.nombre || "-",
      idSucursal: caja.idSucursal,

      estadoRegistroCaja: estadoRegistroCajaActual,
      fechaUltimoRegistro: fechaUltimoRegistro,

      ultimoRegistroCaja: ultimoRegistro || null,
    };

    return res.status(200).json(datosCaja);
  } catch (error) {
    console.error("Error al consultar datos de caja:", error);
    return res
      .status(500)
      .json({ message: "Error interno al consultar datos de caja" });
  }
};

exports.consultarDatosMP = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { deviceID } = req.params;
    if (!deviceID) {
      await t.rollback();
      return res.status(400).json({ message: "Falta el ID del dispositivo" });
    }
    const caja = await Caja.findOne({
      where: { computadorID: deviceID },
      transaction: t,
    });
    //console.group("Caja encontrada", caja);
    if (!caja) {
      await t.rollback();
      return res.status(404).json({ message: "Caja no encontrada" });
    }
    if (!caja.idMercadoPagoPOS) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Esta caja no tiene un ID de Mercado Pago asociado" });
    }
    const sucursalCaja = await Sucursal.findOne({
      where: { idSucursal: caja.idSucursal },
      transaction: t,
    });
    if (!sucursalCaja) {
      await t.rollback();
      return res
        .status(404)
        .json({ error: "Sucursal de la caja no encontrada" });
    }
    //console.log("Sucursal encontrada para la caja:", sucursalCaja);
    //obtener lista de terminales de la caja con idMercadoPagoPOS y idMercadoPago (sucursal)
    const configMP = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      },
      validateStatus: () => true, // Para manejar manualmente los errores de status
    };
    const resTerminalesAsociadosCaja = await axios.get(
      `https://api.mercadopago.com/terminals/v1/list?limit=50&pos_id=${Number(caja.idMercadoPagoPOS)}&store_id=${String(sucursalCaja.idMercadoPago)}`,
      configMP,
    );

    //console.log("terminales", resTerminalesAsociadosCaja.data.data);
    const listaTerminales = resTerminalesAsociadosCaja.data.data.terminals;
    const terminal = listaTerminales.find(
      (t) => t.pos_id === Number(caja.idMercadoPagoPOS),
    );

    if (!terminal) {
      await t.rollback();
      return res.status(400).json({
        error: "Terminal de Mercado Pago  no fue encontrada en esta sucursal.",
      });
    }
    //verificar si esta activa
    const verificarTerminalActiva = await axios.get(
      `https://api.mercadopago.com/pos/${terminal.pos_id}`,
      configMP,
    );
    //console.log(
    //  "Verificación de estado de terminal MP:",
    // verificarTerminalActiva.data,
    // );
    // si no esta activa return res.status(400).json({ message: "Terminal de Mercado Pago no está activa" })
    if (verificarTerminalActiva.data.status !== "active") {
      await t.rollback();
      return res
        .status(400)
        .json({ error: "Terminal de Mercado Pago no está activa" });
    }

    //Verificar que este en modo PDV si no esta cambiar
    console.log(
      "Estado operativo actual de la terminal:",
      terminal.operating_mode,
    );
    if (terminal.operating_mode !== "PDV") {
      const response = await axios.patch(
        "https://api.mercadopago.com/terminals/v1/setup",
        {
          terminals: [
            {
              id: String(terminal.id),
              operating_mode: "PDV",
            },
          ],
        },
        configMP,
      );

      if (response.data.status >= 400) {
        await t.rollback();
        return res.status(response.data.status).json({
          error:
            response.data?.message ||
            "Error al actualizar el modo de la terminal en Mercado Pago",
          detalle: response.data,
        });
      }

      terminal.operating_mode = "PDV";
    }

    //retornar idPOS y su estado
    //console.log("estado terminal:", verificarTerminalActiva.data);
    await t.commit();
    return res.status(200).json({
      message: "Terminal verificada correctamente",
      estadoTerminal: verificarTerminalActiva.data.status,
      estadoOperacion: terminal.operating_mode,
    });
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    if (error.response) {
      console.error(`Status MP: [${error.response.status}]`);
      console.error("Detalle:", JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error(
        "Timeout: Mercado Pago no respondió la solicitud de verificación.",
      );
    } else {
      console.error("Error crítico de sintaxis:", error.message);
    }

    return res.status(500).json({
      message: "Error interno al consultar el estado de la terminal física.",
    });
  }
};

exports.cierreCaja = async (req, res) => {
  try {
    const { deviceID } = req.params;
    const { montoArqueo, cantidadMontoFinal, observacionesCierre } = req.body;
    if (
      !deviceID ||
      !montoArqueo ||
      !cantidadMontoFinal ||
      !observacionesCierre
    ) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const caja = await Caja.findOne({ where: { computadorID: deviceID } });
    if (!caja) {
      return res
        .status(404)
        .json({ message: "Caja no encontrada para cierre" });
    }

    const registroCaja = await RegistroCaja.findOne({
      where: {
        idCaja: caja.idCaja,
        estadoRegistroCaja: "Abierta",
        fechaApertura: new Date(new Date().setHours(0, 0, 0, 0)), // Solo registros de hoy
      },
    });
    if (registroCaja.fechaCierre != null) {
      await caja.update({ estadoCaja: "Cerrada" });
      return res.status(400).json({
        message:
          "No se puede cerrar la caja porque ya tiene un registro cerrado hoy",
      });
    }
    if (!registroCaja) {
      return res.status(404).json({
        message: "Registro de caja abierta no encontrado para cierre",
      });
    }

    await registroCaja.update({
      montoCierreReal: montoArqueo,
      cantidadMontoCierreReal: cantidadMontoFinal,
      estadoRegistroCaja: "Cerrada",
      fechaCierre: new Date(),
      observacionesCierre: observacionesCierre,
    });

    await caja.update({ estadoCaja: "Cerrada" });

    return res.status(200).json({ message: "Caja cerrada exitosamente" });
  } catch (error) {
    console.error("Error al cerrar caja:", error);
    return res.status(500).json({ message: "Error al cerrar caja" });
  }
};

exports.solicitarPagoTarjeta = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { token } = req.cookies;
    const { deviceID } = req.params;

    const {
      totalVenta, // 15000
      montoTarjeta, // 15000 (en caso de pago mixto)
      metodoPago, // "Efectivo", "Debito", "Credito", "Mixto"
      idVentaCliente,
    } = req.body;

    const montoACobrar = montoTarjeta
      ? String(montoTarjeta)
      : String(totalVenta);

    if (!deviceID || !totalVenta || !metodoPago) {
      await t.rollback();
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    //console.log("Datos recibidos:", req.body);

    let decodedPayload;
    try {
      decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      await t.rollback();
      res.clearCookie("token");
      return res.status(401).json({ message: "No autorizado" });
    }

    const funcionarioSolicitante = await Funcionario.findOne({
      where: { rut: decodedPayload.rut },
      transaction: t,
    });

    const caja = await Caja.findOne({
      where: { computadorID: deviceID },
      transaction: t,
    });

    if (!funcionarioSolicitante || !caja) {
      await t.rollback();
      return res
        .status(401)
        .json({ message: "Credenciales de funcionario o caja inválidas" });
    }

    // =========================================================
    // 🚀 INTEGRACIÓN MERCADO PAGO POINT (TERMINALES)
    // =========================================================
    console.log(
      "Iniciando proceso de integración con Mercado Pago para terminales...",
    );
    // 1. Verificamos que el pago sea con tarjeta (solo un pago: débito o crédito)
    const metodoLower = (metodoPago || "").toLowerCase();
    const esTarjeta =
      metodoLower.includes("debito") ||
      metodoLower.includes("credito") ||
      metodoLower.includes("tarjeta");
    if (!esTarjeta) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Este endpoint sólo acepta pagos con tarjeta." });
    }

    const tipoTarjetaMP = metodoLower.includes("debito")
      ? "debit_card"
      : "credit_card";

    // // Solo un pago: cobramos el totalVenta en la terminal
    // const montoACobrar = String(totalVenta);
    // const tipoTarjetaMP = metodoLower.includes("debito")
    //   ? "debit_card"
    //   : "credit_card";

    // (montoACobrar y tipoTarjetaMP ya definidos arriba)

    //agregar verificacion de status y modo pvd de la terminal antes de crear orden de pago
    //obtener lista de terminales de la caja con idMercadoPagoPOS y idMercadoPago (sucursal)
    const configMP = {
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      },
      validateStatus: () => true, // Para manejar manualmente los errores de status
    };
    const resTerminalesAsociadosCaja = await axios.get(
      `https://api.mercadopago.com/terminals/v1/list?limit=50&pos_id=${Number(caja.idMercadoPagoPOS)}`,
      configMP,
    );

    const listaTerminales = resTerminalesAsociadosCaja.data.data.terminals;

    const terminal = listaTerminales.find(
      (t) => t.pos_id === Number(caja.idMercadoPagoPOS),
    );
    //console.log("Terminal encontrada para la caja:", terminal);
    if (!terminal) {
      await t.rollback();
      return res.status(400).json({
        message: "Terminal de Mercado Pago no fue encontrada para esta caja.",
      });
    }

    // 5. Crear la orden de pago en la terminal usando el helper crearOrdenPago
    const idempotencyKey = randomUUID();
    const external_reference = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // console.log("Detalles de pago para MP:", {
    //   idempotencyKey,
    //   external_reference,
    //   monto: String(montoACobrar),
    //   terminal: terminal.id,
    //   metodo_impresion: "seller_ticket",
    //   metodo_pago: tipoTarjetaMP,
    //   descripcion: `Venta sucursal ${caja.numeroCaja}`,
    //   condicion_iva: "payment_exempt_iva",
    // });
    //crear venta en BD con estado Pendiente para finalizarla en registroventaMP

    const venta = await Venta.create(
      {
        fechaVenta: new Date(),
        totalVenta: totalVenta,
        metodoPago: "Pendiente",
        estadoVenta: "Pendiente",
        idDescuento: null,
        idCliente: null,
      },
      { transaction: t },
    );

    const detallePago = await DetallePago.create(
      {
        idVentaCliente: venta.idVentaCliente,
        metodoPago: metodoPago,
        montoPagado: Number(montoACobrar),
        idVentaMP: idempotencyKey,
        idOrdenMP: null,
      },
      { transaction: t },
    );

    //console.log("Venta parcial MP", venta);
    let ordenVentaSolicitada;
    try {
      const body = {
        type: "point",
        external_reference: external_reference,
        expiration_time: "PT10M",
        transactions: {
          payments: [
            {
              amount: String(montoACobrar),
            },
          ],
        },
        config: {
          point: {
            terminal_id: terminal.id,
            print_on_terminal: "seller_ticket",
          },
          payment_method: {
            default_type: String(tipoTarjetaMP),
          },
        },
        description: `Venta sucursal ${caja.numeroCaja}`,

        taxes: [
          {
            payer_condition: "payment_exempt_iva",
          },
        ],
      };
      //console.log("MPTOKEN:", process.env.MERCADO_PAGO_ACCESS_TOKEN);
      // validateStatus devuelve true para que axios no lance por status >= 300
      const consulta = await axios.post(
        "https://api.mercadopago.com/v1/orders",
        body,
        {
          headers: {
            Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
            "X-Idempotency-Key": idempotencyKey,
          },
          validateStatus: () => true,
        },
      );
      console.log("Respuesta de creación de orden en MP1:", {
        status: consulta.status,
        data: consulta.data.errors,
      });
      if (consulta.status != 201) {
        console.error(
          "Error al crear orden en MP:",
          consulta.data.errors[0]?.message,
        );

        await t.rollback();
        return res.status(500).json({
          message:
            consulta.data?.errors[0]?.message ||
            "Error al crear la orden en Mercado Pago.",
        });
      }

      // obtener datos de la orden
      const ordenData = consulta.data || consulta;
      ordenVentaSolicitada = ordenData;

      await detallePago.update(
        { idOrdenMP: ordenVentaSolicitada.id },
        { transaction: t },
      );
    } catch (err) {
      console.error("Error creando orden en MP:", err.data);
      await t.rollback();
      if (err.response && err.response.status === 409) {
        console.error(" Error 409: La terminal está ocupada con otro cobro.");
        return res.status(409).json({
          message:
            "La máquina ya tiene un cobro en pantalla. Por favor, cancélelo físicamente en la terminal antes de enviar uno nuevo.",
        });
      }

      console.error(
        " Error creando orden en MP:",
        err.response?.data || err.message,
      );

      return res.status(500).json({
        message: "Error al crear la orden en Mercado Pago.",
        detalle: err.response?.data?.errors || err.message,
      });
    }

    await t.commit();
    return res.status(200).json({
      message: "Venta registrada exitosamente",
      idOrdenMP: ordenVentaSolicitada.id,
      idVentaCliente: venta.idVentaCliente,
    });
  } catch (error) {
    //console.error("Error al registrar venta:", error);

    if (!t.finished) {
      await t.rollback();
    }
    if (error.response) {
      console.error(`Status Code MP: [${error.response.status}]`);
      console.error(
        "Detalle del rechazo MP:",
        JSON.stringify(error.response.data.errors[0].message, null, 2),
      );
      return res.status(error.response.status).json({
        error: "Error de integración con Mercado Pago",
        detalle: error.response.data.errors[0].message,
      });
    } else if (error.request) {
      console.error("Timeout: Mercado Pago no respondió.");
    } else {
      console.error("Error crítico:", error.message);
    }

    return res
      .status(500)
      .json({ message: "Error al registrar venta", error: error.message });
  }
};

// exports.registroVenta = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const { token } = req.cookies;
//     const { deviceID } = req.params;

//     const {
//       idVentaCliente,
//       idPOS,
//       tipoPago,
//       idSucursal,
//       productosVendidos,
//       totalVenta,
//       metodoPago,
//       detallePagos,
//     } = req.body;

//     console.log("Datos recibidos para registro de venta:", req.body);

//     // 1. Corrección de validación: idVentaCliente solo es obligatorio si no es Efectivo puro
//     if (!deviceID || !idSucursal || !productosVendidos || !totalVenta) {
//       await t.rollback();
//       return res.status(400).json({ message: "Faltan datos obligatorios" });
//     }

//     if (metodoPago !== "Efectivo" && !idVentaCliente) {
//       await t.rollback();
//       return res
//         .status(400)
//         .json({ message: "Falta el ID de la transacción de tarjeta" });
//     }

//     // 2. Autenticación
//     let decodedPayload;
//     try {
//       decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (e) {
//       await t.rollback();
//       res.clearCookie("token");
//       return res.status(401).json({ message: "No autorizado" });
//     }

//     const funcionarioSolicitante = await Funcionario.findOne({
//       where: { rut: decodedPayload.rut },
//       transaction: t,
//     });

//     const caja = await Caja.findOne({
//       where: { computadorID: deviceID },
//       transaction: t,
//     });

//     if (!funcionarioSolicitante || !caja) {
//       await t.rollback();
//       return res
//         .status(401)
//         .json({ message: "Credenciales de funcionario o caja inválidas" });
//     }

//     // 3. Creación o Búsqueda de la Venta
//     let venta;
//     if (metodoPago === "Efectivo") {
//       venta = await Venta.create(
//         {
//           fechaVenta: new Date(),
//           totalVenta: totalVenta,
//           metodoPago: metodoPago,
//           idVentaMP: null,
//           estadoVenta: "Pendiente", // Se actualiza a Completada al final
//           idDescuento: null,
//           idCliente: null,
//         },
//         { transaction: t },
//       );
//     } else {
//       venta = await Venta.findByPk(idVentaCliente, { transaction: t });
//       if (!venta) {
//         throw new Error("La venta asociada al pago con tarjeta no existe");
//       }
//     }

//     await RealizaVenta.create(
//       {
//         fechaRealizaVenta: new Date(),
//         idFuncionario: funcionarioSolicitante.idFuncionario,
//         idVentaCliente: venta.idVentaCliente,
//         idCaja: caja.idCaja,
//       },
//       { transaction: t },
//     );

//     // 4. Validación de Sucursal y Bodega
//     const sucursal = await Sucursal.findOne({
//       where: { idSucursal: idSucursal },
//       include: [{ model: Bodega }],
//       transaction: t,
//     });

//     if (!sucursal || !sucursal.bodegas || sucursal.bodegas.length === 0) {
//       throw new Error("La sucursal no tiene una bodega asignada");
//     }

//     const idBodegaSucursal = sucursal.bodegas[0].idBodega;

//     // 5. Detalles de Venta e Inventario
//     for (const producto of productosVendidos) {
//       const subtotalVenta = Number(producto.subtotal);
//       const neto = Math.round(subtotalVenta / 1.19);
//       const iva = subtotalVenta - neto;

//       const detalleVenta = await DetalleVenta.create(
//         {
//           descripcion: `Venta de ${producto.nombre}`,
//           cantidad: producto.cantidad,
//           precio: producto.precio,
//           tipoDeEntrega: "Entrega Inmediata",
//           fechaHoraEmision: new Date(),
//           subtotal: subtotalVenta,
//           iva: iva,
//           idVentaCliente: venta.idVentaCliente,
//           idProducto: producto.idProducto,
//         },
//         { transaction: t },
//       );
//       if (!detalleVenta) {
//         throw new Error(
//           `Error al crear detalle de venta para el producto ${producto.nombre}`,
//         );
//       }
//       const inventarioProducto = await Inventario.findOne({
//         where: { idProducto: producto.idProducto, idBodega: idBodegaSucursal },
//         transaction: t,
//       });

//       // Corrección: Si no hay inventario, abortamos para evitar inconsistencias
//       if (!inventarioProducto) {
//         throw new Error(
//           `El producto ${producto.nombre} no tiene registro en la bodega seleccionada`,
//         );
//       }

//       const stockActual = Number(inventarioProducto.stock);
//       const cantidadComprada = Number(producto.cantidad);
//       const nuevoStock = stockActual - cantidadComprada;
//       const stockRedondeado = Number(nuevoStock.toFixed(2));

//       await inventarioProducto.update(
//         { stock: stockRedondeado },
//         { transaction: t },
//       );
//     }

//     // 6. Actualización de Arqueo de Caja
//     let montoEfectivo = 0;
//     let montoDebito = 0;
//     let montoCredito = 0;

//     if (detallePagos && detallePagos.length > 0) {
//       for (const p of detallePagos) {
//         const metodoLower = p.metodo.toLowerCase();
//         if (metodoLower.includes("efectivo"))
//           montoEfectivo += Number(p.montoPagado || 0);
//         else if (metodoLower.includes("debito"))
//           montoDebito += Number(p.montoPagado || 0);
//         else if (metodoLower.includes("credito"))
//           montoCredito += Number(p.montoPagado || 0);
//       }
//     } else {
//       const metodoLower = metodoPago.toLowerCase();
//       if (metodoLower.includes("efectivo")) montoEfectivo = Number(totalVenta);
//       else if (metodoLower.includes("debito")) montoDebito = Number(totalVenta);
//       else if (metodoLower.includes("credito"))
//         montoCredito = Number(totalVenta);
//     }

//     // Corrección: Forzamos el parseo a Number para evitar concatenación accidental en BD
//     await caja.update(
//       {
//         montoCajaEfectivo: Number(caja.montoCajaEfectivo || 0) + montoEfectivo,
//         montoCajaDebito: Number(caja.montoCajaDebito || 0) + montoDebito,
//         montoCajaCredito: Number(caja.montoCajaCredito || 0) + montoCredito,
//       },
//       { transaction: t },
//     );

//     // 7. Finalizar
//     await venta.update({ estadoVenta: "Completada" }, { transaction: t });
//     await t.commit();

//     return res.status(200).json({
//       message: "Venta registrada exitosamente",
//       idVenta: venta.idVentaCliente,
//     });
//   } catch (error) {
//     if (!t.finished) {
//       await t.rollback();
//     }

//     // Captura de errores de Mercado Pago o errores personalizados nuestros (throw new Error)
//     console.error("Error al registrar venta:", error.message || error);

//     if (error.response?.data?.errors) {
//       return res.status(error.response.status).json({
//         error: "Error de integración con Mercado Pago",
//         detalle: error.response.data.errors[0].message,
//       });
//     }

//     // Enviamos el mensaje de error personalizado al frontend si existe
//     return res.status(500).json({
//       message: error.message || "Error interno al registrar la venta",
//     });
//   }
// };

exports.registroVenta = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { token } = req.cookies;
    const { deviceID } = req.params;

    const {
      idVentaCliente,
      idPOS,
      tipoPago,
      idSucursal,
      productosVendidos,
      totalVenta,
      metodoPago,
      detallePagos,
      idVentaVendedor,
    } = req.body;
    console.log("Datos recibidos para registro de venta:", req.body);
    if (!deviceID || !idSucursal || !productosVendidos || !totalVenta) {
      await t.rollback();
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    if (metodoPago !== "Efectivo" && !idVentaCliente) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Falta el ID de la transacción de tarjeta" });
    }

    let decodedPayload;
    try {
      decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      await t.rollback();
      return res.status(401).json({ message: "No autorizado" });
    }

    const funcionarioSolicitante = await Funcionario.findOne({
      where: { rut: decodedPayload.rut },
      transaction: t,
    });
    const caja = await Caja.findOne({
      where: { computadorID: deviceID },
      transaction: t,
    });

    if (caja.estadoCaja === "Cerrada" || caja.estadoCaja === "Bloqueada") {
      await t.rollback();
      return res.status(400).json({
        message: `No se pueden registrar ventas en una caja ${caja.estadoCaja}`,
      });
    }

    if (!funcionarioSolicitante || !caja) {
      await t.rollback();
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const esPagoMixto = detallePagos && detallePagos.length > 1;
    const metodoVentaFinal = esPagoMixto ? "Pago Mixto" : metodoPago;

    // 1. Manejo de la Venta "Cascarón"
    let venta;
    if (!idVentaCliente) {
      venta = await Venta.create(
        {
          fechaVenta: new Date(),
          totalVenta: totalVenta,
          metodoPago: metodoVentaFinal,
          estadoVenta: "Pendiente",
        },
        { transaction: t },
      );
    } else {
      venta = await Venta.findByPk(idVentaCliente, { transaction: t });
      if (!venta) throw new Error("La venta asociada no existe");

      await venta.update({ metodoPago: metodoVentaFinal }, { transaction: t });
    }

    await RealizaVenta.create(
      {
        fechaRealizaVenta: new Date(),
        idFuncionario: funcionarioSolicitante.idFuncionario,
        idVentaCliente: venta.idVentaCliente,
        idCaja: caja.idCaja,
      },
      { transaction: t },
    );

    // 2. Inventario y Productos
    const sucursal = await Sucursal.findOne({
      where: { idSucursal: idSucursal },
      include: [{ model: Bodega }],
      transaction: t,
    });
    if (!sucursal || !sucursal.bodegas.length)
      throw new Error("Sucursal sin bodega asignada");

    const idBodegaSucursal = sucursal.bodegas[0].idBodega;

    for (const producto of productosVendidos) {
      const subtotalVenta = Number(producto.subtotal);
      const neto = Math.round(subtotalVenta / 1.19);

      const nuevoDetalle = await DetalleVenta.create(
        {
          descripcion: `Venta de ${producto.nombre}`,
          cantidad: producto.cantidad,
          precio: producto.precio,
          tipoDeEntrega: "Entrega Inmediata",
          fechaHoraEmision: new Date(),
          subtotal: producto.precio * producto.cantidad,
          iva: subtotalVenta - neto,
          idVentaCliente: venta.idVentaCliente,
          idProducto: producto.idProducto,
        },
        { transaction: t },
      );

      if (
        producto.descuentosAplicados &&
        producto.descuentosAplicados.length > 0
      ) {
        console.log("Entre");
        for (const descuento of producto.descuentosAplicados) {
          await DetalleVenta.create(
            {
              descripcion: `Descuento: {descuento.detalle}`,
              cantidad: 1,
              precio: 0,
              montoDescuento: descuento.montoDescontado,
              tipoDeEntrega: `Descuento en producto ${descuento.origen}`,
              fechaHoraEmision: new Date(),
              subtotal: -descuento.montoDescontado,
              iva: 0,
              idDescuento: descuento.idDescuento,

              idVentaCliente: venta.idVentaCliente,
            },
            { transaction: t },
          );
        }
      }

      const inventario = await Inventario.findOne({
        where: { idProducto: producto.idProducto, idBodega: idBodegaSucursal },
        transaction: t,
      });
      if (!inventario)
        throw new Error(`Producto ${producto.nombre} sin Existencias`);

      if (inventario.stock < producto.cantidad) {
        throw new Error(
          `Stock insuficiente para el producto ${producto.nombre}. Stock actual: ${inventario.stock}, cantidad solicitada: ${producto.cantidad}`,
        );
      }

      await inventario.update(
        { stock: Number((inventario.stock - producto.cantidad).toFixed(2)) },
        { transaction: t },
      );
    }

    // 3. Manejo de Pagos y Arqueo (Evitar duplicados)
    let montoEfectivo = 0,
      montoDebito = 0,
      montoCredito = 0;

    const buscarDetallePagoExistente = await DetallePago.findOne({
      where: { idVentaCliente: venta.idVentaCliente, metodoPago: metodoPago },
      transaction: t,
    });

    if (!buscarDetallePagoExistente) {
      if (detallePagos && detallePagos.length > 0) {
        for (const p of detallePagos) {
          // Verificamos si este método ya se guardó en solicitarPagoTarjeta
          const pagoExistente = await DetallePago.findOne({
            where: {
              idVentaCliente: venta.idVentaCliente,
              metodoPago: p.metodo,
            },
            transaction: t,
          });

          if (!pagoExistente) {
            // Solo creamos el registro si no existe (ej. el Efectivo)
            await DetallePago.create(
              {
                metodoPago: p.metodo,
                montoPagado: Number(p.montoPagado || 0),
                idVentaCliente: venta.idVentaCliente,
              },
              { transaction: t },
            );
          }

          const metodoLower = p.metodo.toLowerCase();
          if (metodoLower.includes("efectivo"))
            montoEfectivo += Number(p.montoPagado || 0);
          else if (metodoLower.includes("debito"))
            montoDebito += Number(p.montoPagado || 0);
          else if (metodoLower.includes("credito"))
            montoCredito += Number(p.montoPagado || 0);
        }
      } else {
        await DetallePago.create(
          {
            metodoPago: metodoPago,
            montoPagado: Number(totalVenta),
            idVentaCliente: venta.idVentaCliente,
          },
          { transaction: t },
        );

        const metodoLower = metodoPago.toLowerCase();
        if (metodoLower.includes("efectivo"))
          montoEfectivo = Number(totalVenta);
        else if (metodoLower.includes("debito"))
          montoDebito = Number(totalVenta);
        else if (metodoLower.includes("credito"))
          montoCredito = Number(totalVenta);
      }
    }

    await caja.update(
      {
        montoCajaEfectivo: Number(caja.montoCajaEfectivo || 0) + montoEfectivo,
        montoCajaDebito: Number(caja.montoCajaDebito || 0) + montoDebito,
        montoCajaCredito: Number(caja.montoCajaCredito || 0) + montoCredito,
      },
      { transaction: t },
    );

    //si es venta vendedor actualizar su venta cascaron a completada
    if (idVentaVendedor) {
      console.log("Actualizando venta vendedor con ID:", idVentaVendedor);
      const ventaVendedor = await VentaVendedor.findByPk(idVentaVendedor, {
        transaction: t,
      });
      if (ventaVendedor) {
        await ventaVendedor.update(
          { estadoVentaVendedor: "Completada" },
          { transaction: t },
        );
      } else {
        await t.rollback();
        return res
          .status(404)
          .json({ message: "Venta del vendedor no encontrada" });
      }
    }

    // 4. Finalizar
    await venta.update({ estadoVenta: "Completada" }, { transaction: t });
    await t.commit();

    return res.status(200).json({
      message: "Venta registrada exitosamente",
      idVenta: venta.idVentaCliente,
    });
  } catch (error) {
    if (!t.finished) await t.rollback();
    return res
      .status(500)
      .json({ message: error.message || "Error al registrar la venta" });
  }
};

exports.consultaVentaTarjeta = async (req, res) => {
  try {
    const { idOrdenMP } = req.params;
    if (!idOrdenMP) {
      return res
        .status(400)
        .json({ message: "Falta el ID de la orden de Mercado Pago" });
    }

    const configMP = {
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      validateStatus: () => true, // Para manejar manualmente los errores de status
    };

    const estadoOrdenResponse = await axios.get(
      `https://api.mercadopago.com/v1/orders/${idOrdenMP}`,
      configMP,
    );
    // console.log(
    //   "Respuesta de consulta de orden en MP:",
    //   estadoOrdenResponse.data,
    // );
    if (estadoOrdenResponse.status !== 200) {
      console.error(
        "Error al consultar orden en MP:",
        estadoOrdenResponse.data,
      );
      return res.status(404).json({
        message: "Error al consultar la orden en Mercado Pago",
        detalle: estadoOrdenResponse.data,
      });
    }

    const estadoOrden = estadoOrdenResponse.data.status;
    console.log(`Estado actual de la orden ${idOrdenMP} en MP:`, estadoOrden);

    return res.status(200).json({ idOrdenMP, estado: estadoOrden });
  } catch (error) {
    console.error("Error al consultar venta con tarjeta:", error);
    return res.status(500).json({
      message: "Error al consultar venta con tarjeta",
      error: error.message,
    });
  }
};

exports.cancelarVentaTarjeta = async (req, res) => {
  try {
    const { idOrdenMP } = req.params;
    if (!idOrdenMP) {
      return res
        .status(400)
        .json({ message: "Falta el ID de la orden de Mercado Pago" });
    }

    const configMP = {
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      validateStatus: () => true,
    };

    const bucarOrdenResponse = await axios.get(
      `https://api.mercadopago.com/v1/orders/${idOrdenMP}`,
      configMP,
    );

    if (bucarOrdenResponse.status !== 200) {
      console.error("Error al buscar orden en MP:", bucarOrdenResponse.data);
      return res.status(404).json({
        message: "Error al buscar la orden en Mercado Pago",
        detalle: bucarOrdenResponse.data,
      });
    }
    if (bucarOrdenResponse.data.status !== "created") {
      return res.status(400).json({
        message:
          "Solo se pueden cancelar órdenes que estén en estado 'created'. El estado actual es: " +
          bucarOrdenResponse.data.status,
      });
    }

    const cancelResponse = await axios.post(
      `https://api.mercadopago.com/v1/orders/${idOrdenMP}/cancel`,
      {},
      configMP,
    );

    if (cancelResponse.status !== 200) {
      console.error("Error al cancelar orden en MP:", cancelResponse.data);
      return res.status(404).json({
        message: "Error al cancelar la orden en Mercado Pago",
        detalle: cancelResponse.data,
      });
    }

    const venta = await Venta.findOne({ where: { idVentaMP: idOrdenMP } });
    if (venta) {
      await venta.update({ estadoVenta: "Cancelada" });
    }

    return res.status(200).json({
      message: "Orden cancelada exitosamente en Mercado Pago",
      idOrdenMP,
    });
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    if (error.response) {
      console.error(`Status Code MP: [${error.response.status}]`);
      console.error(
        "Detalle del rechazo MP:",
        JSON.stringify(error.response.data.errors[0].message, null, 2),
      );
      return res.status(error.response.status).json({
        error: "Error de integración con Mercado Pago",
        detalle: error.response.data.errors[0].message,
      });
    } else if (error.request) {
      console.error("Timeout: Mercado Pago no respondió.");
    } else {
      console.error("Error crítico:", error.message);
    }

    return res
      .status(500)
      .json({ message: "Error al registrar venta", error: error.message });
  }
};

exports.generarArqueoCaja = async (req, res) => {
  try {
    const { deviceID } = req.params;
    if (!deviceID) {
      return res.status(400).json({ message: "Falta el ID del dispositivo" });
    }

    const caja = await Caja.findOne({
      where: { computadorID: deviceID },
      include: [
        {
          model: Sucursal,
          attributes: ["nombre"],
        },
      ],
    });

    if (!caja) {
      return res.status(404).json({ message: "Caja no encontrada" });
    }

    // const inicioDeHoy = new Date();
    // inicioDeHoy.setHours(0, 0, 0, 0);
    // const finDeHoy = new Date();
    // finDeHoy.setHours(23, 59, 59, 999);

    // const registrosCaja = await RegistroCaja.findAll({
    //   where: {
    //     idCaja: caja.idCaja,
    //     fechaApertura: {
    //       [Op.gte]: inicioDeHoy,
    //       [Op.lte]: finDeHoy,
    //     },
    //   },
    // });
    const registrosCaja = await RegistroCaja.findOne({
      where: {
        idCaja: caja.idCaja,
        estadoRegistroCaja: "Abierta",
      },
      order: [["fechaApertura", "DESC"]],
    });

    if (!registrosCaja) {
      return res
        .status(404)
        .json({ error: "No hay un registro de caja abierto." });
    }

    //buscamos la ventas de la caja en el periodo del registro abierto
    const finDeHoy = new Date();
    const ventasCaja = await Venta.findAll({
      where: {
        fechaVenta: {
          [Op.gte]: registrosCaja.fechaApertura,
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
    });

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

    const arqueo = {
      numeroCaja: caja.numeroCaja,
      nombreSucursal: caja.sucursal?.nombre || "-",

      fechaApertura: registrosCaja.fechaApertura,
      fechaCierre: registrosCaja.fechaCierre,
      montoCierreReal: registrosCaja.montoCierreReal,
      cantidadMontoCierreReal: registrosCaja.cantidadMontoCierreReal,
      estadoRegistroCaja: registrosCaja.estadoRegistroCaja,
      observacionesCierre: registrosCaja.observacionesCierre,

      // Enviamos el resumen detallado al frontend
      resumenVentas: {
        totalEfectivo: totalEfectivo,
        totalDebito: totalDebito,
        totalCredito: totalCredito,
        cantidadVentas: cantidadVentas,
        //totalGeneral: totalGeneral,
      },
    };
    //console.log("Arqueo generado:", arqueo);
    return res.status(200).json(arqueo);
  } catch (error) {
    console.error("Error al generar arqueo de caja:", error);
    return res.status(500).json({ message: "Error al generar arqueo de caja" });
  }
};

exports.guardarArqueoCaja = async (req, res) => {
  try {
    const { token } = req.cookies;
    const { deviceID } = req.params;
    const { montoCierreReal, cantidadMontoCierreReal } = req.body;
    console.log("Datos recibidos para guardar arqueo:", req.body);
    if (
      !deviceID ||
      montoCierreReal === undefined ||
      cantidadMontoCierreReal === undefined
    ) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }
    if (!token) {
      return res.status(401).json({ message: "No autorizado" });
    }
    let decodedPayload;
    try {
      decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const funcionarioSolicitante = await Funcionario.findOne({
      where: { rut: decodedPayload.rut },
    });

    if (!funcionarioSolicitante) {
      return res
        .status(401)
        .json({ message: "Credenciales de funcionario inválidas" });
    }

    const caja = await Caja.findOne({
      where: { computadorID: deviceID },
    });

    if (!caja) {
      return res.status(404).json({ message: "Caja no encontrada" });
    }
    const registroAbierto = await RegistroCaja.findOne({
      where: {
        idCaja: caja.idCaja,
        estadoRegistroCaja: "Abierta",
      },
      order: [["fechaApertura", "DESC"]],
    });

    if (!registroAbierto) {
      return res
        .status(404)
        .json({ error: "No hay un registro de caja abierto para guardar." });
    }

    const finDeHoy = new Date();
    const ventasCaja = await Venta.findAll({
      where: {
        fechaVenta: {
          [Op.gte]: registroAbierto.fechaApertura,
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
    });

    let montoTeoricoEfectivo = 0;
    let montoTeoricoDebito = 0;

    ventasCaja.forEach((venta) => {
      //console.log("ventas caja para arqueo:", venta);
      const pagos =
        venta.DetallePagos || venta.detallepagos || venta.DetallePago || [];

      pagos.forEach((detalle) => {
        if (detalle.metodoPago === "Efectivo") {
          const montoPagado = Number(detalle.montoPagado || 0);
          montoTeoricoEfectivo += montoPagado;
        }
        if (
          detalle.metodoPago === "Debito" ||
          detalle.metodoPago === "Débito"
        ) {
          const montoPagado = Number(detalle.montoPagado || 0);
          montoTeoricoDebito += montoPagado;
        }
      });
    });
    console.log("valores", {
      montoCierreReal,
      montoTeoricoEfectivo,
      registroAbiertoMontoApertura: registroAbierto.montoInicial,
    });
    const diferencia =
      Number(montoTeoricoEfectivo) +
      Number(registroAbierto.montoInicial) -
      Number(montoCierreReal);

    const montoCierreTeorico =
      Number(montoTeoricoEfectivo) + Number(registroAbierto.montoInicial);
    await registroAbierto.update({
      montoCierreReal: montoCierreReal,
      montoCierreTeorico: montoCierreTeorico,
      cantidadMontoCierreReal: cantidadMontoCierreReal,
      diferenciaCierre: diferencia,
      fechaGeneracionArqueo: new Date(),
      idFuncionarioArquea: funcionarioSolicitante.idFuncionario,
      seRealizoArqueo: true,
    });

    return res.status(200).json({
      message: "Arqueo de caja guardado exitosamente",
      idRegistroCaja: registroAbierto.idRegistroCaja,
    });
  } catch (error) {
    console.error("Error al guardar arqueo de caja:", error);
    return res.status(500).json({ message: "Error al guardar arqueo de caja" });
  }
};

exports.bloquearFuncionamientoCaja = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { deviceID } = req.params;
    if (!deviceID) {
      return res.status(400).json({ message: "Falta el ID del dispositivo" });
    }

    const caja = await Caja.findOne({
      where: { computadorID: deviceID },
      transaction: t,
    });

    if (!caja) {
      await t.rollback();
      return res.status(404).json({ message: "Caja no encontrada" });
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
      .json({ message: "Error al bloquear funcionamiento de caja" });
  }
};

exports.desbloquearFuncionamientoCaja = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { deviceID } = req.params;
    if (!deviceID) {
      return res.status(400).json({ message: "Falta el ID del dispositivo" });
    }

    const caja = await Caja.findOne({
      where: { computadorID: deviceID },
      transaction: t,
    });

    if (!caja) {
      await t.rollback();
      return res.status(404).json({ message: "Caja no encontrada" });
    }
    if (caja.estadoCaja === "Cerrada" || caja.estadoCaja === "Bloqueada") {
      await t.rollback();
      return res.status(400).json({
        message: "No se puede desbloquear una caja cerrada o bloqueada",
      });
    }
    if (caja.estadoFuncionamiento === "Abierta") {
      await t.rollback();
      return res.status(400).json({ message: "La caja ya está operativa" });
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

exports.verVentasDelDia = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { deviceID } = req.params;
    if (!deviceID) {
      await t.rollback();
      return res.status(400).json({ message: "Falta el ID del dispositivo" });
    }

    const caja = await Caja.findOne({
      where: { computadorID: deviceID },
      transaction: t,
    });
    if (!caja) {
      await t.rollback();
      return res.status(404).json({ message: "Caja no encontrada" });
    }

    const ultimoRegistro = await RegistroCaja.findOne({
      where: {
        idCaja: caja.idCaja,
      },
      order: [["fechaApertura", "DESC"]],
    });

    if (!ultimoRegistro) {
      await t.commit();
      return res
        .status(404)
        .json({ message: "No hay registros de caja para esta caja" });
    }

    // const inicioDeHoy = ultimoRegistro.fechaApertura;
    // inicioDeHoy.setHours(0, 0, 0, 0);
    // const finDeHoy = new Date();
    // finDeHoy.setHours(23, 59, 59, 999);

    const inicioDeHoy = new Date(ultimoRegistro.fechaApertura);

    const finDeHoy = ultimoRegistro.fechaCierre
      ? new Date(ultimoRegistro.fechaCierre)
      : new Date();

    const ventasCaja = await Venta.findAll({
      where: {
        fechaVenta: {
          [Op.gte]: inicioDeHoy,
          [Op.lte]: finDeHoy,
        },
      },
      include: [
        {
          model: RealizaVenta,
          where: { idCaja: caja.idCaja },
          include: [
            {
              model: Funcionario,
              attributes: ["nombre", "rut"],
            },
          ],
        },
        {
          model: DetalleVenta,
          include: [
            {
              model: Producto,
            },
          ],
        },
        {
          model: DetallePago,
        },
      ],
      order: [["fechaVenta", "DESC"]],
      transaction: t,
    });
    if (ventasCaja.length === 0) {
      await t.commit();
      return res
        .status(200)
        .json({ message: "No hay ventas registradas para hoy en esta caja" });
    }
    await t.commit();
    return res.status(200).json(ventasCaja);
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    console.error("Error al consultar ventas del día:", error);
    return res
      .status(500)
      .json({ message: "Error al consultar ventas del día" });
  }
};

exports.consultaCierreCajaPendiente = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { deviceID } = req.params;
    if (!deviceID || deviceID === "undefined") {
      await t.rollback();
      return res.status(400).json({ message: "Falta el ID del dispositivo" });
    }

    const caja = await Caja.findOne({
      where: { computadorID: deviceID },
      transaction: t,
    });
    if (!caja) {
      await t.rollback();
      return res.status(404).json({ message: "Caja no encontrada" });
    }

    const inicioDeHoy = new Date();
    inicioDeHoy.setHours(0, 0, 0, 0);

    const registroAnteriorPendiente = await RegistroCaja.findOne({
      where: {
        idCaja: caja.idCaja,
        estadoRegistroCaja: "Abierta",
        fechaApertura: {
          [Op.lt]: inicioDeHoy,
        },
      },
      transaction: t,
    });

    if (registroAnteriorPendiente) {
      const inicioTurno = registroAnteriorPendiente.fechaApertura;
      const finTurno = new Date(inicioTurno);
      finTurno.setHours(23, 59, 59, 999);
      const ventasTurno = await Venta.findAll({
        attributes: [
          "metodoPago",

          [
            sequelize.fn("sum", sequelize.col("ventacliente.totalVenta")),
            "totalPorMetodo",
          ],
        ],
        where: {
          estadoVenta: "Completada",
          fechaVenta: {
            [Op.gte]: inicioTurno,
            [Op.lte]: finTurno,
          },
        },
        include: [
          {
            model: RealizaVenta,
            where: { idCaja: caja.idCaja },
            attributes: [],
          },
        ],

        group: ["ventacliente.metodoPago"],
        raw: true,
        transaction: t,
      });

      let ventasEfectivo = 0;
      let ventasDebito = 0;
      let ventasCredito = 0;
      let ventasTransferencia = 0;
      let totalVentasDia = 0;
      console.log("Ventas del turno para arqueo:", ventasTurno);
      ventasTurno.forEach((venta) => {
        const metodo = venta.metodoPago;
        // Sequelize a veces devuelve las sumas como texto, usamos parseInt para evitar bugs de concatenación
        const total = parseInt(venta.totalPorMetodo) || 0;

        if (metodo === "Efectivo") ventasEfectivo += total;
        if (metodo === "Tarjeta Debito") ventasDebito += total;
        if (metodo === "Tarjeta Credito") ventasCredito += total;
        if (metodo === "Transferencia") ventasTransferencia += total;

        totalVentasDia += total;
      });
      console.log("Totales por método de pago:", {
        ventasEfectivo,
        ventasDebito,
        ventasCredito,
        ventasTransferencia,
        totalVentasDia,
      });

      console.log(
        "efectivo esperado:",
        (Number(registroAnteriorPendiente.montoInicial) || 0) +
          Number(ventasEfectivo),
      );
      await t.commit();
      return res.status(200).json({
        message: "Existe un cierre pendiente del día anterior",
        registroPendiente: {
          idRegistroCaja: registroAnteriorPendiente.idRegistroCaja,
          fechaApertura: registroAnteriorPendiente.fechaApertura,
          estadoRegistroCaja: registroAnteriorPendiente.estadoRegistroCaja,
          montoApertura: registroAnteriorPendiente.montoInicial,
          ventasEfectivo: ventasEfectivo,
          ventasDebito: ventasDebito,
          ventasCredito: ventasCredito,
          ventasTransferencia: ventasTransferencia,
          totalVentasDia: totalVentasDia,
          efectivoEsperado:
            (Number(registroAnteriorPendiente.montoInicial) || 0) +
            Number(ventasEfectivo),
        },
      });
    } else {
      await t.commit();
      return res.status(200).json({ message: "No hay cierres pendientes" });
    }
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    console.error("Error al consultar cierres pendientes:", error);
    return res
      .status(500)
      .json({ message: "Error al consultar cierres pendientes" });
  }
};

exports.cierreCajaPendienteAdmin = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { deviceID } = req.params;
    const {
      idRegistroCaja,
      cantidadMontoFinal,
      observacionesCierre,
      totalCierre,
    } = req.body;
    if (
      !deviceID ||
      !idRegistroCaja ||
      !cantidadMontoFinal ||
      !observacionesCierre ||
      !totalCierre
    ) {
      await t.rollback();
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }
    //console.log("Datos recibidos para cierre pendiente por admin:", req.body);
    const caja = await Caja.findOne({
      where: { computadorID: deviceID },
      transaction: t,
    });
    if (!caja) {
      await t.rollback();
      return res.status(404).json({ message: "Caja no encontrada" });
    }

    const registroCaja = await RegistroCaja.findOne({
      where: { idRegistroCaja: idRegistroCaja, idCaja: caja.idCaja },
      transaction: t,
    });
    if (!registroCaja) {
      await t.rollback();
      return res
        .status(404)
        .json({ message: "Registro de caja no encontrado" });
    }
    if (registroCaja.estadoRegistroCaja === "Cerrada") {
      await t.rollback();
      return res.status(400).json({
        message: "Este registro de caja ya está cerrado",
      });
    }
    //calcular cierre teorico sumando montoInicial + venta en efectivo del turno para comparar con montoCierreReal ingresado por admin
    const inicioTurno = registroCaja.fechaApertura;
    const finTurno = new Date(inicioTurno);
    finTurno.setHours(23, 59, 59, 999);
    const ventasTurno = await Venta.findAll({
      attributes: [
        "metodoPago",
        [
          sequelize.fn("sum", sequelize.col("ventacliente.totalVenta")),
          "totalPorMetodo",
        ],
      ],
      where: {
        estadoVenta: "Completada",
        fechaVenta: {
          [Op.gte]: inicioTurno,
          [Op.lte]: finTurno,
        },
      },
      include: [
        {
          model: RealizaVenta,
          where: { idCaja: caja.idCaja },
          attributes: [],
        },
      ],
      group: ["ventacliente.metodoPago"],
      raw: true,
      transaction: t,
    });

    let ventasEfectivo = 0;
    ventasTurno.forEach((venta) => {
      const metodo = venta.metodoPago;
      const total = parseInt(venta.totalPorMetodo) || 0;
      if (metodo === "Efectivo") ventasEfectivo += total;
    });
    const cierreTeorico =
      (Number(registroCaja.montoInicial) || 0) + Number(ventasEfectivo);
    console.log("Cierre teórico calculado:", cierreTeorico);
    console.log("Cierre real ingresado por admin:", totalCierre);
    const diferencia = totalCierre - cierreTeorico;
    console.log("Diferencia entre cierre real y teórico:", diferencia);
    await registroCaja.update(
      {
        montoCierreReal: totalCierre,
        montoCierreTeorico: cierreTeorico,
        diferenciaCierre: diferencia,
        cantidadMontoCierreReal: cantidadMontoFinal,
        estadoRegistroCaja: "Cerrada",
        fechaCierre: new Date(),
        observacionesCierre: observacionesCierre,
      },
      { transaction: t },
    );

    await t.commit();
    return res
      .status(200)
      .json({ message: "Cierre pendiente por admin registrado exitosamente" });
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    console.error("Error al realizar cierre pendiente por admin:", error);
    return res
      .status(500)
      .json({ message: "Error al realizar cierre pendiente por admin" });
  }
};

exports.ventaPendientePago = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { token } = req.cookies;

    const { productosVendidos, totalVenta, totalDescuentos } = req.body;
    console.log("Datos recibidos para venta pendiente de pago:", req.body);
    if (
      !productosVendidos ||
      !totalVenta ||
      productosVendidos.length === 0 ||
      totalDescuentos === undefined
    ) {
      return res.status(400).json({ message: "Falta los datos" });
    }

    let decodedPayload;
    try {
      decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const funcionarioSolicitante = await Funcionario.findOne({
      where: { rut: decodedPayload.rut },
      transaction: t,
    });
    if (!funcionarioSolicitante) {
      await t.rollback();
      return res
        .status(401)
        .json({ message: "Credenciales de funcionario inválidas" });
    }

    // //Datos venta
    // const ventaPendiente = await Venta.create(
    //   {
    //     fechaVenta: new Date(),
    //     metodoPago: "Pendiente",
    //     totalVenta: totalVenta,
    //     estadoVenta: "Pendiente",
    //   },
    //   { transaction: t },
    // );

    // if (!ventaPendiente) {
    //   await t.rollback();
    //   return res
    //     .status(500)
    //     .json({ message: "Error al crear venta pendiente" });
    // }
    // //registro de quien vendio
    // await RealizaVenta.create(
    //   {
    //     fechaRealizaVenta: new Date(),
    //     idFuncionario: funcionarioSolicitante.idFuncionario,
    //     idVentaCliente: ventaPendiente.idVentaCliente,
    //   },
    //   { transaction: t },
    // );

    //ventaVendedor

    const nuevaVentaVendedor = await VentaVendedor.create(
      {
        estadoVentaVendedor: "Pendiente",
        idFuncionario: funcionarioSolicitante.idFuncionario,
        fechaHoraEmision: new Date(),
        total: totalVenta,
        totalDescuentos: totalDescuentos,
      },
      { transaction: t },
    );

    //detalle de productos vendidos
    for (const producto of productosVendidos) {
      await DetalleVentaVendedor.create(
        {
          descripcion: `Venta de ${producto.nombre} (Pendiente)`,
          cantidad: producto.cantidad,
          precio: producto.precio,
          tipoDeEntrega: "Entrega Inmediata",
          fechaHoraEmision: new Date(),
          subtotal: producto.precio * producto.cantidad,
          iva: producto.subtotal - Math.round(producto.subtotal / 1.19),
          estadoVentaVendedor: "Pendiente",
          idProducto: producto.idProducto,
          idVentaVendedor: nuevaVentaVendedor.idVentaVendedor,
        },
        { transaction: t },
      );
      if (
        producto.descuentosAplicados &&
        producto.descuentosAplicados.length > 0
      ) {
        for (const descuento of producto.descuentosAplicados) {
          await DetalleVentaVendedor.create(
            {
              descripcion: `Descuento: ${descuento.origen} (${descuento.detalle})`,
              cantidad: 1,
              precio: 0,
              montoDescuento: descuento.montoDescontado,
              tipoDeEntrega: "Descuento en producto vendido pendiente",
              fechaHoraEmision: new Date(),
              subtotal: -descuento.montoDescontado,
              iva: 0,
              estadoVentaVendedor: "Pendiente",
              idProducto: producto.idProducto,
              idVentaVendedor: nuevaVentaVendedor.idVentaVendedor,
            },
            { transaction: t },
          );
        }
      }
    }

    await t.commit();
    return res.status(200).json({
      message: "Venta pendiente de pago creada exitosamente",
      idVenta: nuevaVentaVendedor.idVentaVendedor,
    });
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    console.error("Error al consultar venta pendiente de pago:", error);
    return res
      .status(500)
      .json({ message: "Error al consultar venta pendiente de pago" });
  }
};

exports.consultarVentaPendiente = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

    const funcionarioSolicitante = await Funcionario.findOne({
      where: { rut: decodedPayload.rut },
    });
    if (!funcionarioSolicitante) {
      return res
        .status(401)
        .json({ message: "Credenciales de funcionario inválidas" });
    }

    const ventasPendientes = await VentaVendedor.findAll({
      //where: { estadoVentaVendedor: "Pendiente" },
      include: [
        {
          model: DetalleVentaVendedor,
          include: [{ model: Producto }],
        },
      ],
    });

    if (ventasPendientes.length === 0) {
      return res
        .status(204)
        .json({ message: "No hay ventas pendientes de pago" });
    }

    return res.status(200).json(ventasPendientes);
  } catch (error) {
    console.error("Error al obtener ventas pendientes:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener ventas pendientes" });
  }
};

exports.consultarVentasPendientesCaja = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { idVentaPendiente } = req.params;
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }
    if (!idVentaPendiente) {
      return res.status(400).json({ message: "Falta el ID de la venta" });
    }

    let decodedPayload;
    try {
      decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const sucursalFuncionario = await ContratoFuncionario.findOne({
      include: [
        {
          model: Sucursal,
        },
        {
          model: Funcionario,
          where: { rut: decodedPayload.rut },
          attributes: ["nombre", "rut"],
        },
      ],
    });

    if (!sucursalFuncionario) {
      await t.rollback();
      return res
        .status(401)
        .json({ message: "Credenciales de funcionario inválidas" });
    }
    const ventaDetallePendiente = await DetalleVentaVendedor.findAll({
      where: { idVentaVendedor: idVentaPendiente },
      include: [
        {
          model: VentaVendedor,
          where: { estadoVentaVendedor: "Pendiente" },
        },
        {
          model: Producto,
          attributes: ["idProducto", "codigo", "nombre", "precioVenta"],
        },
      ],
      transaction: t,
    });

    if (ventaDetallePendiente.length === 0) {
      await t.commit();
      return res.status(404).json({
        message: "Venta Finalizada, no encontrada, verifique con vendedor",
      });
    }

    const detallesPlanos = ventaDetallePendiente.map((d) =>
      d.get({ plain: true }),
    );

    const filasProductos = detallesPlanos.filter(
      (d) => !d.descripcion.includes("Descuento:"),
    );
    const filasDescuentos = detallesPlanos.filter((d) =>
      d.descripcion.includes("Descuento:"),
    );

    const detalleVenta = filasProductos.map((filaProd) => {
      const descuentosDelProducto = filasDescuentos.filter(
        (desc) => desc.idProducto === filaProd.idProducto,
      );

      const totalDescuento = descuentosDelProducto.reduce(
        (suma, desc) =>
          suma + Number(desc.montoDescuento || Math.abs(desc.subtotal)),
        0,
      );

      const descuentosAplicados = descuentosDelProducto.map((desc) => ({
        idDescuento: desc.idDetalleVentaVendedor,
        origen: desc.descripcion.replace("Descuento: ", ""),
        detalle: "",
        montoDescontado: Number(desc.montoDescuento || Math.abs(desc.subtotal)),
      }));

      return {
        key: `prod-${filaProd.idProducto}`,

        idDetalleVenta: filaProd.idDetalleVentaVendedor,
        idProducto: filaProd.producto.idProducto,
        codigo: filaProd.producto.codigo,
        nombre: filaProd.producto.nombre,
        precio: Number(filaProd.precio),
        cantidad: Number(filaProd.cantidad),
        descuento: totalDescuento,
        descuentosAplicados: descuentosAplicados,
        subtotal: Number(filaProd.precio) * Number(filaProd.cantidad),
      };
    });

    await t.commit();
    return res.status(200).json(detalleVenta);
  } catch (error) {
    console.error("Error al obtener ventas pendientes de caja:", error);
    if (t && !t.finished) {
      await t.rollback();
    }
    return res
      .status(500)
      .json({ message: "Error al obtener ventas pendientes de caja" });
  }
};

exports.generarRetiroCaja = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { token } = req.cookies;
    const { deviceID } = req.params;
    const { monto, motivo, denominaciones } = req.body;
    // console.log("Datos recibidos para retiro de caja:", req.body);
    if (!deviceID || !monto || !motivo || !denominaciones) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }
    if (monto <= 0) {
      return res
        .status(400)
        .json({ message: "El monto del retiro debe ser mayor a cero" });
    }
    if (!token) {
      return res.status(401).json({ message: "No autorizado" });
    }

    let decodedPayload;
    try {
      decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const funcionarioSolicitante = await Funcionario.findOne({
      where: { rut: decodedPayload.rut },
      transaction: t,
    });

    if (!funcionarioSolicitante) {
      await t.rollback();
      return res
        .status(401)
        .json({ message: "Credenciales de funcionario inválidas" });
    }
    if (funcionarioSolicitante.tipoSession !== "Caja") {
      await t.rollback();

      return res.status(403).json({
        message:
          "Funcionario sin sesion de caja no puede realizar retiros de caja",
      });
    }
    if (funcionarioSolicitante.estado !== "Activo") {
      await t.rollback();

      return res.status(403).json({
        message: "El funcionario no está activo para realizar retiros de caja",
      });
    }
    if (funcionarioSolicitante.estaEliminado === true) {
      await t.rollback();

      return res.status(403).json({
        message:
          "El funcionario no está habilitado para realizar retiros de caja",
      });
    }

    const caja = await Caja.findOne({
      where: { computadorID: deviceID },
      transaction: t,
    });

    if (!caja) {
      await t.rollback();

      return res.status(404).json({ message: "Caja no encontrada" });
    }
    if (caja.estadoCaja === "Cerrada" || caja.estadoCaja === "Bloqueada") {
      await t.rollback();

      return res.status(400).json({
        message: "No se puede realizar retiro en una caja cerrada o bloqueada",
      });
    }

    if (caja.montoCajaEfectivo < monto) {
      await t.rollback();

      return res.status(400).json({
        message:
          "No hay suficiente efectivo en la caja para realizar el retiro",
      });
    }

    if (caja.montoCajaEfectivo - monto < 0) {
      await t.rollback();

      return res
        .status(400)
        .json({ message: "El retiro dejaría la caja con monto negativo" });
    }

    //generar RetiroCaja en la base de datos
    const nuevoRetiroCaja = await Retiros.create({
      fechaHoraRetiro: new Date(),
      monto: monto,
      motivo: motivo,
      denominaciones: JSON.stringify(denominaciones),
      idCaja: caja.idCaja,
      idFuncionario: funcionarioSolicitante.idFuncionario,
    });
    if (!nuevoRetiroCaja) {
      await t.rollback();

      return res
        .status(500)
        .json({ message: "Error al generar retiro de caja" });
    }

    //actualizar montoCajaEfectivo de la caja
    await caja.update(
      { montoCajaEfectivo: caja.montoCajaEfectivo - monto },
      { transaction: t },
    );

    await t.commit();
    return res.status(200).json({
      message: "Retiro de caja generado exitosamente",
      nuevoRetiroCaja,
    });
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }

    console.error("Error al generar retiro de caja:", error);
    return res.status(500).json({ message: "Error al generar retiro de caja" });
  }
};

exports.imprimirComprobanteVenta = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { idVenta, deviceID } = req.params;
    if (!idVenta || !deviceID) {
      return res
        .status(400)
        .json({ message: "Falta el ID de la venta o el ID del dispositivo" });
    }

    const caja = await Caja.findOne({
      where: { computadorID: deviceID },
      transaction: t,
    });
    //console.group("Caja encontrada", caja);
    if (!caja) {
      await t.rollback();
      return res.status(404).json({ message: "Caja no encontrada" });
    }
    if (!caja.idMercadoPagoPOS) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Esta caja no tiene un ID de Mercado Pago asociado" });
    }
    const sucursalCaja = await Sucursal.findOne({
      where: { idSucursal: caja.idSucursal },
      transaction: t,
    });
    if (!sucursalCaja) {
      await t.rollback();
      return res
        .status(404)
        .json({ error: "Sucursal de la caja no encontrada" });
    }

    let configMP = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      },
      validateStatus: () => true, // Para manejar manualmente los errores de status
    };
    const resTerminalesAsociadosCaja = await axios.get(
      `https://api.mercadopago.com/terminals/v1/list?limit=50&pos_id=${Number(caja.idMercadoPagoPOS)}&store_id=${String(sucursalCaja.idMercadoPago)}`,
      configMP,
    );

    //console.log("terminales", resTerminalesAsociadosCaja.data.data);
    const listaTerminales = resTerminalesAsociadosCaja.data.data.terminals;
    const terminal = listaTerminales.find(
      (t) => t.pos_id === Number(caja.idMercadoPagoPOS),
    );

    if (!terminal) {
      await t.rollback();
      return res.status(400).json({
        error: "Terminal de Mercado Pago  no fue encontrada en esta sucursal.",
      });
    }

    const venta = await Venta.findOne({
      where: { idVentaCliente: idVenta },
      include: [
        {
          model: DetalleVenta,
          include: [{ model: Producto }],
        },
        {
          model: DetallePago,
        },
        {
          model: RealizaVenta,
          include: [
            {
              model: Funcionario,
              attributes: ["nombre", "rut"],
            },
            {
              model: Caja,
              attributes: ["numeroCaja"],
            },
          ],
        },
      ],
    });
    console.log("Venta encontrada para impresión:", JSON.stringify(venta));
    //return res.status(200).json({ message: "Venta encontrada para impresión" });
    const idempotencyKey = randomUUID();
    configMP = {
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotencyKey,
      },
      validateStatus: () => true,
    };

    const textoImprimir = generarTicketMercadoPago(venta, sucursalCaja.nombre);

    const bodyMP = {
      type: "print",
      external_reference: `venta-${idVenta}`,
      config: {
        point: {
          terminal_id: terminal.id,
          subtype: "custom",
        },
      },
      content: textoImprimir,
    };

    const consulta = await axios.post(
      "https://api.mercadopago.com/terminals/v1/actions",
      bodyMP,
      configMP,
    );

    if (consulta.status === 200 || consulta.status === 201) {
      await t.commit();
      return res.status(200).json({
        message: "Comprobante de venta enviado a impresión exitosamente",
      });
    } else {
      console.error(
        "Error al enviar a imprimir en Mercado Pago:",
        consulta.data,
      );
      await t.rollback();
      return res
        .status(500)
        .json({ message: "Error al enviar a imprimir en Mercado Pago" });
    }
  } catch (error) {
    console.error("Error al imprimir comprobante de venta:", error);
    if (t && !t.finished) {
      await t.rollback();
    }
    return res
      .status(500)
      .json({ message: "Error al imprimir comprobante de venta" });
  }
};

exports.imprimirRetiroCaja = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { deviceID, idRetiro } = req.params;
    if (!deviceID || !idRetiro) {
      return res
        .status(400)
        .json({ message: "Falta el ID del dispositivo o el ID del retiro" });
    }
    const caja = await Caja.findOne({
      where: { computadorID: deviceID },
      transaction: t,
    });
    //console.group("Caja encontrada", caja);
    if (!caja) {
      await t.rollback();
      return res.status(404).json({ message: "Caja no encontrada" });
    }
    if (!caja.idMercadoPagoPOS) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Esta caja no tiene un ID de Mercado Pago asociado" });
    }
    const sucursalCaja = await Sucursal.findOne({
      where: { idSucursal: caja.idSucursal },
      transaction: t,
    });
    if (!sucursalCaja) {
      await t.rollback();
      return res
        .status(404)
        .json({ error: "Sucursal de la caja no encontrada" });
    }
    let configMP = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      },
      validateStatus: () => true, // Para manejar manualmente los errores de status
    };
    const resTerminalesAsociadosCaja = await axios.get(
      `https://api.mercadopago.com/terminals/v1/list?limit=50&pos_id=${Number(caja.idMercadoPagoPOS)}&store_id=${String(sucursalCaja.idMercadoPago)}`,
      configMP,
    );

    //console.log("terminales", resTerminalesAsociadosCaja.data.data);
    const listaTerminales = resTerminalesAsociadosCaja.data.data.terminals;
    const terminal = listaTerminales.find(
      (t) => t.pos_id === Number(caja.idMercadoPagoPOS),
    );

    if (!terminal) {
      await t.rollback();
      return res.status(400).json({
        error: "Terminal de Mercado Pago  no fue encontrada en esta sucursal.",
      });
    }

    const RetiroCaja = await Retiros.findOne({
      where: { idRetiro: idRetiro },
      include: [
        {
          model: Funcionario,
          attributes: ["nombre", "rut"],
        },
        {
          model: Caja,
          attributes: ["numeroCaja"],
        },
      ],
    });

    if (!RetiroCaja) {
      await t.rollback();
      return res.status(404).json({ message: "Retiro de caja no encontrado" });
    }

    const idempotencyKey = randomUUID();
    configMP = {
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotencyKey,
      },
      validateStatus: () => true,
    };

    const textoImprimir = generarTicketRetiroMercadoPago(
      RetiroCaja,
      sucursalCaja.nombre,
    );

    const bodyMP = {
      type: "print",
      external_reference: `retiro-${idRetiro}`,
      config: {
        point: {
          terminal_id: terminal.id,
          subtype: "custom",
        },
      },
      content: textoImprimir,
    };

    const consulta = await axios.post(
      "https://api.mercadopago.com/terminals/v1/actions",
      bodyMP,
      configMP,
    );
    if (consulta.status === 200 || consulta.status === 201) {
      await t.commit();
      return res.status(200).json({
        message: "Comprobante de retiro enviado a impresión exitosamente",
      });
    } else {
      console.error(
        "Error al enviar a imprimir en Mercado Pago:",
        consulta.data,
      );
      await t.rollback();
      return res
        .status(500)
        .json({ message: "Error al enviar a imprimir en Mercado Pago" });
    }
  } catch (error) {
    console.error("Error al imprimir comprobante de retiro de caja:", error);
    return res
      .status(500)
      .json({ message: "Error al imprimir comprobante de retiro de caja" });
  }
};

exports.imprimirArqueoCaja = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { deviceID, idArqueo } = req.params;
    if (!deviceID || !idArqueo) {
      return res
        .status(400)
        .json({ message: "Falta el ID del dispositivo o el ID del arqueo" });
    }
    const caja = await Caja.findOne({
      where: { computadorID: deviceID },
      transaction: t,
    });
    //console.group("Caja encontrada", caja);
    if (!caja) {
      await t.rollback();
      return res.status(404).json({ message: "Caja no encontrada" });
    }
    if (!caja.idMercadoPagoPOS) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Esta caja no tiene un ID de Mercado Pago asociado" });
    }
    const sucursalCaja = await Sucursal.findOne({
      where: { idSucursal: caja.idSucursal },
      transaction: t,
    });
    if (!sucursalCaja) {
      await t.rollback();
      return res
        .status(404)
        .json({ error: "Sucursal de la caja no encontrada" });
    }
    let configMP = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      },
      validateStatus: () => true, // Para manejar manualmente los errores de status
    };
    const resTerminalesAsociadosCaja = await axios.get(
      `https://api.mercadopago.com/terminals/v1/list?limit=50&pos_id=${Number(caja.idMercadoPagoPOS)}&store_id=${String(sucursalCaja.idMercadoPago)}`,
      configMP,
    );

    //console.log("terminales", resTerminalesAsociadosCaja.data.data);
    const listaTerminales = resTerminalesAsociadosCaja.data.data.terminals;
    const terminal = listaTerminales.find(
      (t) => t.pos_id === Number(caja.idMercadoPagoPOS),
    );

    if (!terminal) {
      await t.rollback();
      return res.status(400).json({
        error: "Terminal de Mercado Pago  no fue encontrada en esta sucursal.",
      });
    }

    const arqueoCaja = await RegistroCaja.findOne({
      where: { idRegistroCaja: idArqueo },

      include: [
        {
          model: Caja,
        },
      ],
    });

    if (!arqueoCaja) {
      await t.rollback();
      return res.status(404).json({ message: "Arqueo de caja no encontrado" });
    }
    const idempotencyKey = randomUUID();
    configMP = {
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotencyKey,
      },
      validateStatus: () => true,
    };

    const textoImprimir = generarTicketArqueoCaja(arqueoCaja);

    const bodyMP = {
      type: "print",
      external_reference: `arqueo-${idArqueo}`,
      config: {
        point: {
          terminal_id: terminal.id,
          subtype: "custom",
        },
      },
      content: textoImprimir,
    };

    const consulta = await axios.post(
      "https://api.mercadopago.com/terminals/v1/actions",
      bodyMP,
      configMP,
    );
    if (consulta.status === 200 || consulta.status === 201) {
      await t.commit();
      return res.status(200).json({
        message: "Comprobante de arqueo enviado a impresión exitosamente",
      });
    } else {
      console.error(
        "Error al enviar a imprimir en Mercado Pago:",
        consulta.data,
      );
      await t.rollback();
      return res
        .status(500)
        .json({ message: "Error al enviar a imprimir en Mercado Pago" });
    }
  } catch (error) {
    console.error("Error al imprimir comprobante de arqueo de caja:", error);
    return res
      .status(500)
      .json({ message: "Error al imprimir comprobante de arqueo de caja" });
  }
};

exports.consultarStockProductos = async (req, res) => {
  try {
    const { codigoProducto } = req.params;
    if (!codigoProducto) {
      return res.status(400).json({ message: "Falta el código del producto" });
    }

    const stockProducto = await Inventario.findOne({
      attributes: ["stock", "estado"],
      include: [
        {
          model: Producto,
          where: { codigo: codigoProducto },
          attributes: ["nombre", "precioVenta"],
        },
      ],
    });

    if (!stockProducto) {
      return res
        .status(404)
        .json({ message: "Producto no encontrado en inventario" });
    }

    return res.status(200).json({
      stock: stockProducto.stock,
      estado: stockProducto.estado,
      nombre: stockProducto.producto.nombre,
      precioVenta: stockProducto.producto.precioVenta,
    });
  } catch (error) {
    console.error("Error al consultar stock de productos:", error);
    return res
      .status(500)
      .json({ message: "Error al consultar stock de productos" });
  }
};

exports.consultarSiSePuedeVenderProducto = async (req, res) => {
  try {
    const { codigoProducto, cantidad } = req.params;
    const stockProducto = await Inventario.findOne({
      attributes: ["stock", "estado"],
      include: [
        {
          model: Producto,
          where: { codigo: codigoProducto },
          attributes: ["nombre", "precioVenta"],
        },
      ],
    });
    if (!stockProducto) {
      return res
        .status(404)
        .json({ message: "Producto no encontrado en inventario" });
    }

    if (
      Number(stockProducto.stock) < Number(cantidad) ||
      Number(stockProducto.stock) - Number(cantidad) < 0
    ) {
      return res
        .status(400)
        .json({ message: "No hay suficiente stock para la venta" });
    }

    return res.status(200).json({
      message: "Producto disponible para la venta",
      stock: stockProducto.stock,
      estado: stockProducto.estado,
      nombre: stockProducto.producto.nombre,
      precioVenta: stockProducto.producto.precioVenta,
    });
  } catch (error) {
    console.error("Error al consultar si se puede vender el producto:", error);
    return res
      .status(500)
      .json({ message: "Error al consultar si se puede vender el producto" });
  }
};
