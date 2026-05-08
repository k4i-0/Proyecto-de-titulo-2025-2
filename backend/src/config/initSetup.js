// Función para crear usuarios admin y user
const bcrypt = require("bcrypt");
const { encriptar } = require("./AES.js");

const { sequelize } = require("../models/index.js");
const Funcionario = require("../models/Usuarios/Funcionario");
const Rol = require("../models/Usuarios/Rol");
const Categoria = require("../models/inventario/Categoria");
const Sucursal = require("../models/inventario/Sucursal");
const Bodega = require("../models/inventario/Bodega");
const Estante = require("../models/inventario/Estante");
const ContratoFuncionario = require("../models/Usuarios/ContratoFuncionario");
const Proveedor = require("../models/inventario/Proveedor");
const VendedorProveedor = require("../models/inventario/VendedorProveedor");
const Productos = require("../models/inventario/Productos");
const Lote = require("../models/inventario/Lote");
const Despacho = require("../models/inventario/Despacho");
const DetalleDespacho = require("../models/inventario/DetalleDespacho");
const OrdenCompra = require("../models/inventario/OrdenCompra");
const CompraProveedorDetalle = require("../models/inventario/CompraProveedorDetalle");

const { crearBitacora } = require("../services/bitacora.service");

async function poblarBD() {
  const t = await sequelize.transaction();
  try {
    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);
    const clave = "11111111-1";
    const codigoDefault = encriptar(clave);

    console.log(" Iniciando creación de roles...");

    // Crear roles si no existen
    const [sistemaRole, sistemaCreated] = await Rol.findOrCreate({
      where: { nombreRol: "Sistema" },
      defaults: {
        nombreRol: "Sistema",
        privilegios: {
          gestionarTodo: true,
        },
        estado: "Activo",
        descripcion: "Sistema",
      },
    });
    const [adminRole, adminCreated] = await Rol.findOrCreate({
      where: { nombreRol: "Administrador" },
      defaults: {
        nombreRol: "Administrador",
        privilegios: {
          gestionarTodo: true,
        },
        estado: "Activo",
        descripcion: "Administrador del sistema",
      },
    });

    const [cajeroRole, cajeroCreated] = await Rol.findOrCreate({
      where: { nombreRol: "Cajero" },
      defaults: {
        nombreRol: "Cajero",
        privilegios: {
          gestionarCaja: true,
        },
        estado: "Activo",
        descripcion: "Cajero del sistema",
      },
    });

    const [vendedorRole, vendedorCreated] = await Rol.findOrCreate({
      where: { nombreRol: "Vendedor" },
      defaults: {
        nombreRol: "Vendedor",
        privilegios: {
          gestionarVentas: true,
        },
        estado: "Activo",
        descripcion: "Vendedor del sistema",
      },
    });

    console.log(" Roles verificados/creados:");
    console.log(
      `  - Sistema (ID: ${sistemaRole.idRol}) ${
        sistemaCreated ? "[NUEVO]" : "[EXISTENTE]"
      }`,
    );
    console.log(
      `  - Administrador (ID: ${adminRole.idRol}) ${
        adminCreated ? "[NUEVO]" : "[EXISTENTE]"
      }`,
    );
    console.log(
      `  - Cajero (ID: ${cajeroRole.idRol}) ${
        cajeroCreated ? "[NUEVO]" : "[EXISTENTE]"
      }`,
    );
    console.log(
      `  - Vendedor (ID: ${vendedorRole.idRol}) ${
        vendedorCreated ? "[NUEVO]" : "[EXISTENTE]"
      }`,
    );
    console.log(" Iniciando creación de usuarios iniciales...");
    // Crear usuarios (await agregado y campo corregido)
    const [sistemaUser, sistemaUserCreated] = await Funcionario.findOrCreate({
      where: { rut: "00000000-0" },
      defaults: {
        rut: "00000000-0",
        nombre: "Sistema",
        apellido: "1",
        email: "sistema@sistema.dev",
        password: adminPassword,
        passwordCaja: codigoDefault,
        telefono: "+56900000000",
        direccion: "collao 1202, concepcion",
        session: false,
        tipoSession: "Sin Session",
        estado: "Activo",
        idRol: sistemaRole.idRol,
      },
    });
    const [admin, adminUserCreated] = await Funcionario.findOrCreate({
      where: { rut: "11111111-1" },
      defaults: {
        rut: "11111111-1",
        nombre: "Admin",
        apellido: "1",
        email: "admin@sistema.dev",
        password: adminPassword,
        passwordCaja: codigoDefault,
        telefono: "+56912345678",
        direccion: "collao 1202, concepcion",
        session: false,
        tipoSession: "Administracion",
        estado: "Activo",
        idRol: adminRole.idRol,
      },
    });

    const [cajero, cajeroUserCreated] = await Funcionario.findOrCreate({
      where: { rut: "22222222-2" },
      defaults: {
        rut: "22222222-2",
        nombre: "Cajero",
        apellido: "1",
        email: "cajero@sistema.dev",
        password: userPassword,
        passwordCaja: codigoDefault,
        telefono: "+56987654321",
        direccion: "collao 1202, concepcion",
        session: false,
        tipoSession: "Caja",
        estado: "Activo",
        idRol: cajeroRole.idRol,
      },
    });

    const [vendedor, vendedorUserCreated] = await Funcionario.findOrCreate({
      where: { rut: "33333333-3" },
      defaults: {
        rut: "33333333-3",
        nombre: "Vendedor",
        apellido: "1",
        email: "vendedor@sistema.dev",
        password: userPassword,
        passwordCaja: codigoDefault,
        telefono: "+56987654321",
        direccion: "collao 1202, concepcion",
        session: false,
        tipoSession: "Vendedor",
        estado: "Activo",
        idRol: vendedorRole.idRol,
      },
    });

    //cerrar session a todos los usuarios
    // sistemaUser.update({
    //   session: false,
    //   tipoSession: "Sin session",
    // });
    // admin.update({
    //   session: false,
    //   tipoSession: "Sin session",
    // });
    // cajero.update({
    //   session: false,
    //   tipoSession: "Sin session",
    // });
    // vendedor.update({
    //   session: false,
    //   tipoSession: "Sin session",
    // });

    console.log(" Usuarios verificados/creados:");
    console.log(
      `  - Admin (${admin.email}) ${
        adminUserCreated ? "[NUEVO]" : "[EXISTENTE]"
      }`,
    );
    console.log(
      `  - Cajero (${cajero.email}) ${
        cajeroUserCreated ? "[NUEVO]" : "[EXISTENTE]"
      }`,
    );
    console.log(
      `  - Vendedor (${vendedor.email}) ${
        vendedorUserCreated ? "[NUEVO]" : "[EXISTENTE]"
      }`,
    );

    //Crear Bitacora inicial
    const bitacora0 = await crearBitacora(
      "Se Crea base de sistema por sistema",
      "CREADE Bitacora Service",
      sistemaUser.dataValues.idFuncionario,
    );

    const bitacora1 = await crearBitacora(
      "Se Crea Bitacora para Administrador durante la inicialización del sistema",
      "crearBitacora Service",
      sistemaUser.dataValues.idFuncionario,
    );
    const bitacora2 = await crearBitacora(
      "Se Crea Bitacora para Cajero durante la inicialización del sistema",
      "crearBitacora Service",
      sistemaUser.dataValues.idFuncionario,
    );
    const bitacora3 = await crearBitacora(
      "Se Crea Bitacora para Vendedor durante la inicialización del sistema",
      "crearBitacora Service",
      sistemaUser.dataValues.idFuncionario,
    );
    console.log(" Bitacoras iniciales creadas");

    console.log(" Usuarios iniciales verificados/creados exitosamente");

    console.log("Poblando BD Modulo Inventario");
    const categorias = [
      "Abarrotes",
      "Bebidas",
      "Licores",
      "Lácteos",
      "Congelados",
      "Carnes",
      "Embutidos",
      "Frutas y Vegetales",
      "Mascotas",
      "Panadería",
      "Higiene Personal",
      "Limpieza del Hogar",
      "Farmacéuticos",
      "Otros",
    ];

    for (const nombreCategoria of categorias) {
      await Categoria.findOrCreate({
        where: { nombreCategoria },
        defaults: {
          nombreCategoria,
          estado: "Activo",
        },
      });
    }
    console.log(" Categorías iniciales verificadas/creadas exitosamente");

    //Crear Productos
    const productos = [
      {
        codigo: "7804619570045",
        nombre: "Queso Mantecoso",
        marca: "Parcelas De Valdivia",
        peso: 350.0,
        fechaCreacion: new Date(),
        descripcion: "Queso Laminado",
        estado: "Activo",
        idCategoria: 7,
      },
      {
        codigo: "7802900001421",
        nombre: "Leche Protein +",
        marca: "Soprole",
        peso: 1000.0,
        fechaCreacion: new Date(),
        descripcion: "Leche chocolate",
        estado: "Activo",
        idCategoria: 4,
      },
      {
        codigo: "7613033907289",
        nombre: "Cafe Tradicion",
        marca: "Nescafe",
        peso: 150.0,
        fechaCreacion: new Date(),
        descripcion: "Cafe en tarro",
        estado: "Activo",
        idCategoria: 1,
      },
    ];

    for (const producto of productos) {
      await Productos.findOrCreate({
        where: { codigo: producto.codigo },
        defaults: producto,
      });
    }

    //Crear sucursales iniciales si no existen 3 digitos
    console.log(" Creando sucursales y bodegas iniciales...");
    const [sucursal1, sucursal1Created] = await Sucursal.findOrCreate({
      where: { nombre: "Casa Matriz" },
      defaults: {
        idSucursal: 100,
        nombre: "Casa Matriz",
        direccion: "Calle Dos 522, Chiguayante",
        estado: "Abierta",
        idFuncionario: admin.idFuncionario,
      },
    });

    // const funcionarios = await Funcionario.findAll({
    //   where: {
    //     estado: {
    //       [require("sequelize").Op.not]: "Eliminado",
    //     },
    //   },
    // });

    // for (const funcionario of funcionarios) {
    //   await ContratoFuncionario.findOrCreate({
    //     where: {
    //       idFuncionario: funcionario.idFuncionario,
    //       idSucursal: sucursal1.idSucursal,
    //     },
    //     defaults: {
    //       idFuncionario: funcionario.idFuncionario,
    //       idSucursal: sucursal1.idSucursal,
    //       fechaIngreso: new Date(),
    //       tipoContrato: "Plazo Fijo",
    //       turno: "Mañana",
    //       fechaTermino: null,
    //       estado: "Activo",
    //     },
    //   });
    // }

    //Crear bodegas iniciales si no existen
    const [bodega1, bodega1Created] = await Bodega.findOrCreate({
      where: { nombre: "Bodega Central" },
      defaults: {
        nombre: "Bodega Central",
        capacidad: 400,
        capacidadDisponible: 400,
        estado: "En Funcionamiento",
        idSucursal: sucursal1.idSucursal,
      },
    });

    // //Crear estantes iniciales si no existen
    // for (let i = 1; i <= 5; i++) {
    //   await Estante.findOrCreate({
    //     where: { codigoEstante: `ET${1000 + i}` },
    //     defaults: {
    //       capacidad: 80,
    //       capacidadOcupada: 80,
    //       capacidadDisponible: 80,
    //       tipo: "Estante",
    //       estado: "Disponible",
    //       idBodega: bodega1.idBodega,
    //     },
    //   });
    // }

    //Crear Proveedores
    const [proveedor, proveedorCreated] = await Proveedor.findOrCreate({
      where: { rut: "77200300-1" },
      defaults: {
        nombre: "Proveedor 1",
        telefono: "+56912345678",
        email: "proveedor@test.cl",
        fechaIngreso: new Date(),
        rubro: "Abarrotes",
        giro: "960011 - default",
        estado: "Activo",
      },
    });

    //Crear vendedor
    await VendedorProveedor.findOrCreate({
      where: { rut: "12369852-9" },
      defaults: {
        nombre: "Coca Cola Company",
        rut: "12369852-9",
        telefono: "+56912345678",
        email: "pedro@coca.cl",
        idProveedor: proveedor.idProveedor,
      },
    });

    // //Orden de compra
    // const OC = await OrdenCompra.findOrCreate({
    //   where: { nombreOrden: `OC${new Date().getFullYear()}00000000` },
    //   defaults: {
    //     fechaOrden: new Date(),
    //     estado: "creada",
    //     total: 0,
    //     tipo: "compra directa",
    //     observaciones: "Orden de compra inicial para pruebas",
    //     detalleEstado: "Ninguno",
    //     idSucursal: sucursal1.idSucursal,
    //     idFuncionario: vendedor.idFuncionario,
    //     idProveedor: proveedor.idProveedor,
    //   },
    // });

    // //Detalle Orden de compra
    // const detalleOC = [
    //   {
    //     cantidad: 10,
    //     precioUnitario: 2500,
    //     total: 25000,
    //     idProducto: 1,
    //     idOrdenCompra: OC[0].idOrdenCompra,
    //   },
    //   {
    //     cantidad: 20,
    //     precioUnitario: 1200,
    //     total: 24000,
    //     idProducto: 2,
    //     idOrdenCompra: OC[0].idOrdenCompra,
    //   },
    //   {
    //     cantidad: 15,
    //     precioUnitario: 3000,
    //     total: 45000,
    //     idProducto: 3,
    //     idOrdenCompra: OC[0].idOrdenCompra,
    //   },
    // ];
    // await CompraProveedorDetalle.bulkCreate(detalleOC, {
    //   ignoreDuplicates: true,
    // });

    // //Actualizar total orden de compra
    // const totalOC = detalleOC.reduce((sum, item) => sum + item.total, 0);
    // OC[0].estado = "pendiente recibir";
    // OC[0].total = totalOC;
    // await OC[0].save();

    // //Crear Despacho inicial
    // const despacho = await Despacho.findOrCreate({
    //   where: { codigoDespacho: `DE${new Date().getFullYear()}00000000` },
    //   defaults: {
    //     fechaDespacho: new Date(),
    //     tipoDocumento: "Factura",
    //     tipoDespacho: "Proveedor",
    //     numeroDocumento: "F001-000123",
    //     repartidor: "Juan Perez",
    //     estado: "Pendiente Entrega",
    //     observaciones: "Despacho inicial para pruebas",
    //     idProveedor: proveedor.idProveedor,
    //     idSucursal: sucursal1.idSucursal,
    //     idFuncionario: vendedor.idFuncionario,
    //   },
    // });

    // //Crear Detalle Despacho inicial
    // const [detalleDespacho, detalleDespachoCreated] =
    //   await DetalleDespacho.findOrCreate({
    //     where: {
    //       codigoDetalleDespacho: `CODD${new Date().getFullYear()}00000000`,
    //     },
    //     defaults: {
    //       cantidad: 35,
    //       totalCompra: 94000,
    //       idDespacho: despacho[0].idDespacho,
    //     },
    //   });

    // //Crear Lote iniciales

    // const lotes = [
    //   {
    //     codigoLote: `LT${new Date().getFullYear()}00000001`,
    //     fechaCreacion: new Date(),
    //     fechaVencimiento: new Date(
    //       new Date().setFullYear(new Date().getFullYear() + 1),
    //     ),
    //     estado: "disponible",
    //     stockInicial: 10,
    //     idEstante: 1,
    //     idProducto: 1,
    //     idDetalleDespacho: detalleDespacho.idDetalledespacho,
    //   },
    //   {
    //     codigoLote: `LT${new Date().getFullYear()}00000002`,
    //     fechaCreacion: new Date(),
    //     fechaVencimiento: new Date(
    //       new Date().setFullYear(new Date().getFullYear() + 1),
    //     ),
    //     estado: "disponible",
    //     stockInicial: 20,
    //     idEstante: 1,
    //     idProducto: 2,
    //     idDetalleDespacho: detalleDespacho.idDetalledespacho,
    //   },
    //   {
    //     codigoLote: `LT${new Date().getFullYear()}00000003`,
    //     fechaCreacion: new Date(),
    //     fechaVencimiento: new Date(
    //       new Date().setFullYear(new Date().getFullYear() + 1),
    //     ),
    //     estado: "disponible",
    //     stockInicial: 15,
    //     idEstante: 1,
    //     idProducto: 3,
    //     idDetalleDespacho: detalleDespacho.idDetalledespacho,
    //   },
    // ];
    // await Lote.bulkCreate(lotes, { ignoreDuplicates: true });
    // await t.commit();
    console.log(" BD poblada exitosamente");
  } catch (error) {
    await t.rollback();
    console.error(" Error al crear usuarios iniciales:", error);
    return;
  }
}

module.exports = { poblarBD };
