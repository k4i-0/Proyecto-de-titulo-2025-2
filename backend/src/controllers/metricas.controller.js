const Ventas = require("../models/ventas/VentaCliente");
const Sucursal = require("../models/inventario/Sucursal");
const Caja = require("../models/ventas/Caja");
const RegistroCaja = require("../models/ventas/RegistroCaja");
const DetalleVenta = require("../models/ventas/DetalleVenta");
const OrdenCompra = require("../models/inventario/OrdenCompra");
const Producto = require("../models/inventario/Productos");
const RealizaVenta = require("../models/ventas/RealizaVenta");
const Inventario = require("../models/inventario/Inventario");
const Bodega = require("../models/inventario/Bodega");
const Funcionario = require("../models/Usuarios/Funcionario");
const Retiros = require("../models/ventas/Retiros");

const { Op, fn, col, literal, Sequelize } = require("sequelize");

exports.obtenerMetricasDashboard = async (req, res) => {
  try {
    //----------ventas del dia-------------
    const ultimoRegistro = await RegistroCaja.findOne({
      where: {
        estadoRegistroCaja: "Abierta",
      },
      order: [["fechaApertura", "DESC"]],
    });

    const fechaAperturaCajaMasAntigua = ultimoRegistro
      ? new Date(ultimoRegistro.fechaApertura)
      : new Date();

    //buscar ventas desde la fecha de apertura mas antigua hasta el final del dia
    const VentasDelDia = await Ventas.findAll({
      where: {
        fechaVenta: {
          [Op.between]: [new Date(fechaAperturaCajaMasAntigua), new Date()],
        },
        estadoVenta: "Completada",
      },
      include: [
        {
          model: DetalleVenta,
          attributes: ["cantidad", "idProducto"],
          include: [{ model: Producto, attributes: ["nombre"] }],
        },
      ],
    });

    let TotalVentasDelDia = 0;
    let idProductoMasVendido = null;
    let nombreProductoMasVendido = "N/A";
    let cantidadProductoMasVendido = 0;
    let cantidadTotalVendida = 0;
    let horaPico = "N/A";
    let cantidadHoraPico = 0;

    if (VentasDelDia && VentasDelDia.length > 0) {
      TotalVentasDelDia = VentasDelDia.reduce(
        (total, venta) => total + venta.totalVenta,
        0,
      );

      const productosVendidos = VentasDelDia.reduce((acumulador, venta) => {
        venta.detalleventa.forEach(({ idProducto, producto, cantidad }) => {
          if (acumulador[idProducto]) {
            acumulador[idProducto].cantidad += Number(cantidad);
          } else {
            acumulador[idProducto] = {
              idProducto,
              nombre: producto.nombre,
              cantidad: Number(cantidad),
            };
          }
        });
        return acumulador;
      }, {});

      const listaProductos = Object.values(productosVendidos);
      const productoGanador = listaProductos.reduce(
        (max, actual) => (actual.cantidad > max.cantidad ? actual : max),
        { nombre: "N/A", cantidad: 0 },
      );

      idProductoMasVendido = productoGanador.idProducto;
      nombreProductoMasVendido = productoGanador.nombre;
      cantidadProductoMasVendido = productoGanador.cantidad;

      cantidadTotalVendida = listaProductos.reduce(
        (sum, prod) => sum + prod.cantidad,
        0,
      );

      const ventasPorHora = VentasDelDia.reduce((acc, venta) => {
        const hora = new Date(venta.fechaVenta).getHours();
        acc[hora] = (acc[hora] || 0) + 1;
        return acc;
      }, {});

      const horasArray = Object.entries(ventasPorHora);
      const resultadoHora = horasArray.reduce(
        (max, act) => (act[1] > max[1] ? act : max),
        [null, 0],
      );

      horaPico = resultadoHora[0] !== null ? `${resultadoHora[0]}:00` : "N/A";
      cantidadHoraPico = resultadoHora[1];
    }

    //------------------SOLICITUDES DE ORDENES DE COMPRA HOY------------------

    //buscar las ordenes de compra creadas hoy
    const ordenesCompraHoy = await OrdenCompra.count({
      where: {
        fechaOrden: {
          [Op.between]: [
            new Date(new Date().setHours(0, 0, 0, 0)),
            new Date(new Date().setHours(23, 59, 59, 999)),
          ],
        },
      },
    });

    return res.status(200).json({
      totalVentasDelDia: TotalVentasDelDia,

      productoMasVendido: {
        idProducto: idProductoMasVendido,
        nombre: nombreProductoMasVendido,
        cantidadVendida: cantidadProductoMasVendido,
      },
      cantidadProductosVendidos: cantidadTotalVendida,
      cantidadOrdenesCompraHoy: ordenesCompraHoy,
      horaPicoClientes: {
        hora: horaPico,
        cantidadVentas: cantidadHoraPico,
      },
    });
  } catch (error) {
    console.error("Error al obtener métricas del dashboard:", error);
    res.status(500).json({ error: "Error al obtener métricas del dashboard" });
  }
};

exports.obtenerMetricasSucursalDashboard = async (req, res) => {
  try {
    const ultimoRegistro = await RegistroCaja.findOne({
      where: { estadoRegistroCaja: "Abierta" },
      order: [["fechaApertura", "DESC"]],
    });

    const fechaInicio = ultimoRegistro
      ? new Date(ultimoRegistro.fechaApertura)
      : new Date();
    const fechaFin = new Date();

    // console.log("Fecha inicio:", fechaInicio);
    // console.log("Fecha fin:", fechaFin);
    const todasSucursales = await Sucursal.findAll({
      attributes: ["idSucursal", "nombre", "estado"],
    });

    const ventasRaw = await Ventas.findAll({
      where: {
        fechaVenta: { [Op.between]: [fechaInicio, fechaFin] },
        estadoVenta: "Completada",
      },
      include: [
        {
          model: RealizaVenta,
          attributes: ["idRealizaVenta"],
          include: [
            {
              model: Caja,
              attributes: ["idCaja"],
              include: [{ model: Sucursal, attributes: ["nombre"] }],
            },
          ],
        },
      ],
    });

    const ventasPorSucursalMap = ventasRaw.reduce((acc, venta) => {
      const nombre = venta.realizaVenta[0]?.caja?.sucursal?.nombre;

      if (nombre) {
        acc[nombre] = (acc[nombre] || 0) + Number(venta.totalVenta);
      }
      return acc;
    }, {});

    const colaboradoresRaw = await RealizaVenta.findAll({
      where: {
        fechaRealizaVenta: { [Op.between]: [fechaInicio, fechaFin] },
      },
      attributes: ["idFuncionario"],
      include: [
        {
          model: Caja,
          attributes: ["idCaja"],
          include: [{ model: Sucursal, attributes: ["nombre"] }],
        },
      ],
    });

    const colabMap = colaboradoresRaw.reduce((acc, registro) => {
      const nombre = registro.caja?.sucursal?.nombre;
      console.log("Venta:", JSON.stringify(registro.idFuncionario));
      if (nombre) {
        if (!acc[nombre]) acc[nombre] = new Set();
        acc[nombre].add(registro.idFuncionario);
      }
      return acc;
    }, {});

    // const ventasPorSucursal = Object.entries(ventasPorSucursalMap).map(
    //   ([nombre, total]) => ({
    //     nombre,
    //     total,
    //   }),
    // );

    // const colaboradoresPorSucursal = Object.entries(colabMap).map(
    //   ([nombre, setIds]) => ({
    //     nombre,
    //     cantidadColaboradores: setIds.size,
    //   }),
    // );

    const sucursalesConMetricas = todasSucursales.map((sucursal) => {
      const nombre = sucursal.nombre;

      // Buscamos en los mapas generados previamente
      const totalVentas = ventasPorSucursalMap[nombre] || 0;
      const totalColab = colabMap[nombre]?.size || 0;

      return {
        key: sucursal.idSucursal,
        idSucursal: sucursal.idSucursal,
        nombre: nombre,
        estado: sucursal.estado || "-",
        ventasHoy: totalVentas,
        colabActivos: totalColab,
      };
    });

    return res.status(200).json(sucursalesConMetricas);
  } catch (error) {
    console.error("Error en dashboard sucursal:", error);
    res.status(500).json({ error: "Error al obtener métricas del dashboard" });
  }
};

exports.obtenerDashboardSucursal = async (req, res) => {
  try {
    const { idSucursal } = req.params;

    // 1. Validar existencia de sucursal
    const sucursal = await Sucursal.findByPk(idSucursal);
    if (!sucursal) {
      return res.status(404).json({ error: "Sucursal no encontrada" });
    }

    // 2. Definir el "Día de trabajo" (Desde la apertura de la primera caja hoy)
    // Buscamos todas las cajas de ESTA sucursal
    const cajasSucursal = await Caja.findAll({
      where: { idSucursal },
      attributes: ["idCaja", "estadoCaja"],
    });
    const idsCajas = cajasSucursal.map((c) => c.idCaja);

    const primerRegistroHoy = await RegistroCaja.findOne({
      where: {
        idCaja: { [Op.in]: idsCajas },
        estadoRegistroCaja: "Abierta",
      },
      order: [["fechaApertura", "ASC"]], // La más antigua abierta
    });

    // Si no hay cajas abiertas, usamos el inicio del día actual
    const fechaInicio = primerRegistroHoy
      ? new Date(primerRegistroHoy.fechaApertura)
      : new Date(new Date().setHours(0, 0, 0, 0));
    const fechaFin = new Date();

    // ==========================================
    // BLOQUE A: Cajas y Personal
    // ==========================================
    const totalCajas = cajasSucursal.length;
    const cajasActivas = cajasSucursal.filter(
      (c) => c.estadoCaja === "Abierta",
    ).length;

    // Funcionarios activos hoy en esta sucursal
    const registrosPersonal = await RealizaVenta.findAll({
      where: { fechaRealizaVenta: { [Op.between]: [fechaInicio, fechaFin] } },
      include: [
        {
          model: Caja,
          attributes: [],
          where: { idSucursal }, // Solo cajas de esta sucursal
        },
      ],
      attributes: ["idFuncionario"],
      raw: true,
    });
    // Usamos Set para contar funcionarios únicos
    const funcionariosActivos = new Set(
      registrosPersonal.map((r) => r.idFuncionario),
    ).size;

    // ==========================================
    // BLOQUE B: Ventas y Rendimiento
    // ==========================================
    const ventasHoy = await Ventas.findAll({
      where: {
        fechaVenta: { [Op.between]: [fechaInicio, fechaFin] },
        estadoVenta: "Completada",
      },
      include: [
        {
          model: RealizaVenta,
          required: true,
          attributes: [],
          include: [
            {
              model: Caja,
              required: true,
              attributes: [],
              where: { idSucursal },
            },
          ],
        },
        {
          model: DetalleVenta,
          attributes: ["cantidad", "idProducto"],
          include: [{ model: Producto, attributes: ["nombre"] }],
        },
      ],
    });
    // Cálculos en memoria (Rápido)
    let totalIngresos = 0;
    const transacciones = ventasHoy.length;
    const ventasPorHora = {};
    const productosVendidos = {};

    ventasHoy.forEach((venta) => {
      totalIngresos += Number(venta.totalVenta);

      // Agrupar por hora
      const hora = new Date(venta.fechaVenta).getHours();
      ventasPorHora[hora] = (ventasPorHora[hora] || 0) + 1;
      // Agrupar productos
      venta.detalleventa?.forEach((detalle) => {
        // Ajusta "DetalleVentas" según el alias de tu modelo
        console.log("DetalleVenta:", JSON.stringify(detalle));
        const idProd = detalle.idProducto;
        const cantidad = Number(detalle.cantidad);
        if (!productosVendidos[idProd]) {
          productosVendidos[idProd] = {
            nombre: detalle.producto?.nombre,
            cantidad: 0,
          };
        }
        productosVendidos[idProd].cantidad += cantidad;
      });
    });

    const ticketPromedio =
      transacciones > 0 ? Math.round(totalIngresos / transacciones) : 0;

    // Calcular Hora Pico
    const horaPicoArray = Object.entries(ventasPorHora).reduce(
      (max, act) => (act[1] > max[1] ? act : max),
      [null, 0],
    );
    const horaPico =
      horaPicoArray[0] !== null
        ? { hora: `${horaPicoArray[0]}:00`, cantidad: horaPicoArray[1] }
        : { hora: "N/A", cantidad: 0 };

    // Calcular Producto Estrella
    const productoEstrella = Object.values(productosVendidos).reduce(
      (max, act) => (act.cantidad > max.cantidad ? act : max),
      { nombre: "N/A", cantidad: 0 },
    );

    // ==========================================
    // BLOQUE C: Inventario
    // ==========================================
    // Asumiendo que tienes un modelo Inventario que relaciona Sucursal y Producto
    // Si tu lógica de stock crítico es diferente, ajusta el where
    const productosStockCritico = await Inventario.count({
      where: {
        stock: { [Op.lte]: Sequelize.col("stockMinimo") }, // Stock menor o igual al mínimo
      },
      include: [{ model: Bodega, where: { idSucursal }, attributes: [] }],
    });

    // ==========================================
    // BLOQUE D: Rotación de Inventario (Últimos 30 días)
    // ==========================================

    // 1. Calcular la fecha de hace 30 días
    const fecha30DiasAtras = new Date();
    fecha30DiasAtras.setDate(fecha30DiasAtras.getDate() - 30);

    // 2. Obtener el total de unidades físicas almacenadas actualmente en la sucursal
    const stockActualTotal =
      (await Inventario.sum("stock", {
        include: [
          {
            model: Bodega,
            where: { idSucursal },
            attributes: [],
          },
        ],
      })) || 0;

    // 3. Obtener todas las ventas del ÚLTIMO MES para esta sucursal
    const ventasUltimoMes = await Ventas.findAll({
      where: {
        fechaVenta: { [Op.gte]: fecha30DiasAtras },
        estadoVenta: "Completada",
      },
      include: [
        {
          model: RealizaVenta,
          required: true,
          attributes: [],
          include: [
            {
              model: Caja,
              required: true,
              attributes: [],
              where: { idSucursal },
            },
          ],
        },
        {
          model: DetalleVenta,
          attributes: ["cantidad"],
        },
      ],
    });

    // 4. Sumar todas las unidades que se han vendido en esos 30 días
    let unidadesVendidasMes = 0;
    ventasUltimoMes.forEach((venta) => {
      venta.detalleventa?.forEach((detalle) => {
        unidadesVendidasMes += Number(detalle.cantidad);
      });
    });

    // 5. Calcular el porcentaje de rotación
    let rotacionInventario = 0;

    if (stockActualTotal > 0) {
      rotacionInventario = Number(
        ((unidadesVendidasMes / stockActualTotal) * 100).toFixed(1),
      );
    } else if (unidadesVendidasMes > 0 && stockActualTotal === 0) {
      rotacionInventario = 100;
    }

    // ==========================================
    // RESPUESTA FINAL (Lista para tu Frontend)
    // ==========================================
    return res.status(200).json({
      ventasHoy: totalIngresos,
      transaccionesHoy: transacciones,
      ticketPromedio: ticketPromedio,
      horaPico: horaPico,
      productosStockCritico: productosStockCritico,
      productoEstrella: productoEstrella,
      cajasActivas: cajasActivas,
      totalCajas: totalCajas,
      funcionariosActivos: funcionariosActivos,
      rotacionInventario: rotacionInventario,
    });
  } catch (error) {
    console.error("Error al obtener dashboard de sucursal:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor al calcular métricas" });
  }
};

exports.obtenerInformesVentas = async (req, res) => {
  try {
    // 1. Recibir parámetros de filtro (Query params)
    const { idSucursal, fechaInicio, fechaFin } = req.query;

    // 2. Configurar el rango de fechas
    // Si no envían fechas, por defecto mostramos los últimos 30 días
    const fechaFinFiltro = fechaFin ? new Date(fechaFin) : new Date();
    const fechaInicioFiltro = fechaInicio
      ? new Date(fechaInicio)
      : new Date(new Date().setDate(new Date().getDate() - 30));

    // 3. Configurar filtros de Sequelize
    const whereVentas = {
      fechaVenta: { [Op.between]: [fechaInicioFiltro, fechaFinFiltro] },
      estadoVenta: "Completada", // Solo contamos ventas reales
    };

    const whereSucursal =
      idSucursal && idSucursal !== "todas"
        ? { idSucursal: Number(idSucursal) }
        : {};

    // 4. Consulta principal: Traer todas las ventas con sus relaciones
    const ventas = await Ventas.findAll({
      where: whereVentas,
      order: [["fechaVenta", "DESC"]], // Las más recientes primero
      include: [
        {
          model: RealizaVenta, // O realizaVenta en minúscula según tu modelo
          required: true,
          include: [
            {
              model: Caja,
              required: true,
              include: [
                {
                  model: Sucursal,
                  where: whereSucursal,
                  attributes: ["nombre"],
                },
              ],
            },
          ],
        },
        {
          model: DetalleVenta, // O detalleventa
          include: [
            {
              model: Producto,
              attributes: ["idProducto", "nombre", "precioCompra"], // Necesitamos precioCompra para el margen
            },
          ],
        },
      ],
    });

    // 5. Variables para procesar los datos en memoria
    let ingresosTotales = 0;
    let costoTotalMercaderia = 0;
    let totalUnidadesVendidas = 0;
    const mapaProductos = {};
    const ventasRecientes = [];

    // 6. Recorrer las ventas para calcular métricas
    ventas.forEach((venta) => {
      // --- A. Métricas Financieras ---
      const totalVenta = Number(venta.totalVenta);
      ingresosTotales += totalVenta;

      // --- B. Lista de Ventas Recientes (Formato para la tabla de Ant Design) ---
      // Navegamos por las relaciones según tu estructura
      const nombreSucursal =
        venta.RealizaVenta?.[0]?.Caja?.Sucursal?.nombre ||
        venta.realizaVenta?.[0]?.caja?.sucursal?.nombre ||
        "Desconocida";

      ventasRecientes.push({
        key: venta.idVentaCliente,
        idVentaCliente: venta.idVentaCliente,
        fechaVenta: venta.fechaVenta,
        sucursal: nombreSucursal,
        metodoPago: venta.metodoPago,
        totalVenta: totalVenta,
        estadoVenta: venta.estadoVenta,
      });

      // --- C. Desglose de Productos y Costos ---
      const detalles = venta.DetalleVentas || venta.detalleventa || [];

      detalles.forEach((detalle) => {
        const cantidad = Number(detalle.cantidad);
        const precioCompra = Number(detalle.producto?.precioCompra || 0); // Si es null, asume 0

        // Sumamos el costo de compra para calcular luego la ganancia neta
        costoTotalMercaderia += precioCompra * cantidad;
        totalUnidadesVendidas += cantidad;

        // Agrupamos productos para el ranking
        const idProd = detalle.idProducto;
        if (!mapaProductos[idProd]) {
          mapaProductos[idProd] = {
            idProducto: idProd,
            nombre: detalle.producto?.nombre || "Producto",
            cantidad: 0,
          };
        }
        mapaProductos[idProd].cantidad += cantidad;
      });
    });

    // 7. Cálculos Finales
    const totalTransacciones = ventas.length;
    const ticketPromedio =
      totalTransacciones > 0
        ? Math.round(ingresosTotales / totalTransacciones)
        : 0;
    const margenGananciaEstimado =
      ingresosTotales - Math.round(costoTotalMercaderia);

    // 8. Transformar el mapa de productos a un array, ordenarlo de mayor a menor y calcular %
    const productosMasVendidos = Object.values(mapaProductos)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5) // Solo top 5 para el gráfico
      .map((prod) => ({
        ...prod,
        porcentaje:
          totalUnidadesVendidas > 0
            ? Number(((prod.cantidad / totalUnidadesVendidas) * 100).toFixed(1))
            : 0,
      }));

    // 9. Armar la respuesta exacta que espera tu Frontend
    return res.status(200).json({
      resumenFinanciero: {
        ingresosTotales,
        totalTransacciones,
        ticketPromedio,
        margenGananciaEstimado,
      },
      productosMasVendidos,
      // Mandamos solo las últimas 50 ventas para no saturar el DOM del navegador
      ventasRecientes: ventasRecientes.slice(0, 50),
    });
  } catch (error) {
    console.error("Error al generar informes de ventas:", error);
    return res.status(500).json({
      message: "Error interno al generar el informe",
      detalle: error.message,
    });
  }
};

exports.obtenerInformeInventario = async (req, res) => {
  try {
    const { idBodega, estadoStock, busqueda } = req.query;

    const whereInventario = {};
    if (idBodega && idBodega !== "todas") {
      whereInventario.idBodega = Number(idBodega);
    }

    const whereProducto = {};
    if (busqueda) {
      whereProducto[Op.or] = [
        { nombre: { [Op.iLike]: `%${busqueda}%` } },
        { codigo: { [Op.iLike]: `%${busqueda}%` } },
      ];
    }

    // 1. Obtener los datos (Sequelize devolverá la estructura que mostraste)
    const inventariosRaw = await Inventario.findAll({
      where: whereInventario,
      include: [
        {
          model: Producto,
          where:
            Object.keys(whereProducto).length > 0 ? whereProducto : undefined,
          attributes: [
            "idProducto",
            "codigo",
            "nombre",
            "precioCompra",
            "marca",
          ],
        },
        {
          model: Bodega,
          attributes: ["idBodega", "nombre"],
        },
      ],
    });

    let valorizacionTotal = 0;
    const productosUnicos = new Set();
    let productosSinStock = 0;
    let productosStockCriticoCount = 0;

    const productosCriticos = [];
    const inventarioFormateado = [];

    // 2. Procesar el JSON exacto
    inventariosRaw.forEach((item) => {
      // Parseo estricto para limpiar strings ("1984.65") y nulos
      const stockActual = Number(item.stock || 0);
      const stockMinimo = Number(item.stockMinimo || 0);

      // Accedemos a "producto" en minúscula y protegemos el null de precioCompra
      const precioCompra = Number(item.producto?.precioCompra || 0);

      // --- KPIs ---
      productosUnicos.add(item.idProducto);

      if (stockActual > 0) {
        valorizacionTotal += stockActual * precioCompra;
      }

      if (stockActual <= 0) {
        productosSinStock++;
      } else if (stockActual <= stockMinimo) {
        productosStockCriticoCount++;
      }

      // --- Alertas para Panel Lateral ---
      if (stockActual <= stockMinimo) {
        productosCriticos.push({
          id: item.idProducto,
          nombre: item.producto?.nombre || "Sin nombre",
          stockActual: stockActual,
          stockMinimo: stockMinimo,
        });
      }

      // --- Array final para la Tabla ---
      inventarioFormateado.push({
        key: item.idInventario,
        codigo: item.producto?.codigo || "S/N",
        producto: item.producto?.nombre || "S/N",
        categoria: item.producto?.marca || "N/A", // Usamos la marca mientras tanto
        bodega: item.bodega?.nombre || "Desconocida", // "bodega" en minúscula
        stockActual: stockActual,
        stockMinimo: stockMinimo,
        precioCompra: precioCompra,
        estado: item.estado || "Bueno",
      });
    });

    // Ordenamos los críticos para mostrar los más urgentes primero (ej: el -6.00 de CODIGO LIMPIO)
    productosCriticos.sort((a, b) => a.stockActual - b.stockActual);

    // 3. Aplicar filtro de estado post-consulta
    let inventarioFinal = inventarioFormateado;
    if (estadoStock === "agotado") {
      inventarioFinal = inventarioFormateado.filter((i) => i.stockActual <= 0);
    } else if (estadoStock === "bajo") {
      inventarioFinal = inventarioFormateado.filter(
        (i) => i.stockActual > 0 && i.stockActual <= i.stockMinimo,
      );
    }

    // 4. Devolver el objeto listo para el Frontend
    return res.status(200).json({
      metricasGlobales: {
        valorizacionTotal: Math.round(valorizacionTotal), // Redondeamos la plata final
        totalProductosActivos: productosUnicos.size,
        productosSinStock,
        productosStockCritico: productosStockCriticoCount,
      },
      productosCriticos: productosCriticos.slice(0, 10),
      inventario: inventarioFinal,
    });
  } catch (error) {
    console.error("Error al obtener informe de inventario:", error);
    return res
      .status(500)
      .json({ error: "Error al generar informe de inventario" });
  }
};

exports.obtenerInformeCaja = async (req, res) => {
  try {
    // 1. Recibir parámetros de filtro
    const { idCaja, fechaInicio, fechaFin } = req.query;

    // 2. Configurar el rango de fechas (Por defecto: últimos 30 días)
    const fechaFinFiltro = fechaFin ? new Date(fechaFin) : new Date();
    const fechaInicioFiltro = fechaInicio
      ? new Date(fechaInicio)
      : new Date(new Date().setDate(new Date().getDate() - 30));

    // Filtros dinámicos
    const whereCaja = {};
    const whereRegistro = {
      fechaApertura: { [Op.between]: [fechaInicioFiltro, fechaFinFiltro] },
    };
    const whereRetiros = {
      fechaHoraRetiro: { [Op.between]: [fechaInicioFiltro, fechaFinFiltro] },
    };

    if (idCaja && idCaja !== "todas") {
      whereCaja.idCaja = Number(idCaja);
      whereRegistro.idCaja = Number(idCaja);
      whereRetiros.idCaja = Number(idCaja);
    }

    // 3. Consultas en Paralelo (Optimizamos el tiempo de respuesta)
    const [cajasActuales, retiros, registrosRaw] = await Promise.all([
      // A. Estado actual de las cajas (Gavetas físicas y POS)
      Caja.findAll({ where: whereCaja }),

      // B. Retiros realizados en el periodo
      Retiros.findAll({ where: whereRetiros }),

      // C. Historial de aperturas/cierres (Cuadraturas)
      RegistroCaja.findAll({
        where: whereRegistro,
        order: [["fechaApertura", "DESC"]],
        include: [
          {
            model: Caja,
            attributes: ["numeroCaja"],
          },
          {
            model: Funcionario,
            attributes: ["nombre"], // El cajero que abrió/cerró el turno
          },
        ],
      }),
    ]);

    // 4. Procesamiento de Métricas Globales (KPIs)
    let efectivoEnCaja = 0;
    let debitoTotal = 0;
    let creditoTotal = 0;
    let totalRetiros = 0;

    cajasActuales.forEach((caja) => {
      efectivoEnCaja += Number(caja.montoCajaEfectivo || 0);
      debitoTotal += Number(caja.montoCajaDebito || 0);
      creditoTotal += Number(caja.montoCajaCredito || 0);
    });

    retiros.forEach((retiro) => {
      totalRetiros += Number(retiro.monto || 0);
    });

    // 5. Formateo del Historial para la Tabla
    const historialCajas = registrosRaw.map((registro) => {
      // Ajusta estos nombres según tu base de datos (ej: montoCierre, montoReal, etc.)
      const montoFinalReal = Number(registro.montoFinalReal || 0);
      const montoFinalEsperado = Number(registro.montoFinalEsperado || 0);

      // Si la caja está abierta, no hay diferencia calculada aún
      const estaAbierta = registro.fechaCierre === null;
      const diferencia = estaAbierta ? 0 : montoFinalReal - montoFinalEsperado;

      return {
        key: registro.idRegistroCaja, // React key
        idRegistroCaja: registro.idRegistroCaja,
        numeroCaja:
          registro.Caja?.numeroCaja || registro.caja?.numeroCaja || "N/A",
        cajero:
          registro.Funcionario?.nombre ||
          registro.funcionario?.nombre ||
          "Desconocido",
        fechaApertura: registro.fechaApertura,
        fechaCierre: registro.fechaCierre,
        montoInicial: Number(registro.montoInicial || 0),
        montoFinalReal: montoFinalReal,
        montoFinalEsperado: montoFinalEsperado,
        diferencia: diferencia,
        // Si no tienes una columna estado, la inferimos por la fecha de cierre
        estadoCaja: estaAbierta ? "Abierta" : "Cerrada",
        seRealizoArqueo: registro.seRealizoArqueo || false,
      };
    });

    // 6. Retornar el JSON estructurado
    return res.status(200).json({
      metricasCaja: {
        efectivoEnCaja,
        debitoTotal,
        creditoTotal,
        totalRetiros,
      },
      historialCajas: historialCajas,
    });
  } catch (error) {
    console.error("Error al obtener informe de cajas:", error);
    return res.status(500).json({
      message: "Error interno al generar el informe",
      detalle: error.message,
    });
  }
};
