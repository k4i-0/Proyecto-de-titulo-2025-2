// Función para crear usuarios admin y user
const bcrypt = require("bcrypt");
const Funcionario = require("../models/Usuarios/Funcionario");
const Rol = require("../models/Usuarios/Rol");
const Categoria = require("../models/inventario/Categoria");
const Sucursal = require("../models/inventario/Sucursal");
const Bodega = require("../models/inventario/Bodega");
const Estante = require("../models/inventario/Estante");

const { crearBitacora } = require("../services/bitacora.service");

async function createUsers() {
  try {
    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);
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
      }`
    );
    console.log(
      `  - Administrador (ID: ${adminRole.idRol}) ${
        adminCreated ? "[NUEVO]" : "[EXISTENTE]"
      }`
    );
    console.log(
      `  - Cajero (ID: ${cajeroRole.idRol}) ${
        cajeroCreated ? "[NUEVO]" : "[EXISTENTE]"
      }`
    );
    console.log(
      `  - Vendedor (ID: ${vendedorRole.idRol}) ${
        vendedorCreated ? "[NUEVO]" : "[EXISTENTE]"
      }`
    );
    console.log(" Iniciando creación de usuarios iniciales...");
    // Crear usuarios (await agregado y campo corregido)
    const [sistemaUser, sistemaUserCreated] = await Funcionario.findOrCreate({
      where: { rut: "00000000-0" },
      defaults: {
        rut: "00000000-0",
        nombre: "Sistema",
        apellido: "User",
        email: "sistema@sistema.dev",
        password: adminPassword,
        passwordCaja: adminPassword,
        telefono: "+56900000000",
        direccion: "collao 1202, concepcion",
        cargo: "Sistema",
        estado: "Activo",
        idRol: sistemaRole.idRol,
      },
    });
    const [admin, adminUserCreated] = await Funcionario.findOrCreate({
      where: { rut: "11111111-1" },
      defaults: {
        rut: "11111111-1",
        nombre: "Admin",
        apellido: "User",
        email: "admin@sistema.dev",
        password: adminPassword,
        passwordCaja: adminPassword,
        telefono: "+56912345678",
        direccion: "collao 1202, concepcion",
        cargo: "Administrador",
        estado: "Activo",
        idRol: adminRole.idRol,
      },
    });

    const [cajero, cajeroUserCreated] = await Funcionario.findOrCreate({
      where: { rut: "22222222-2" },
      defaults: {
        rut: "22222222-2",
        nombre: "Cajero",
        apellido: "Test",
        email: "cajero@sistema.dev",
        password: userPassword,
        passwordCaja: userPassword,
        telefono: "+56987654321",
        direccion: "collao 1202, concepcion",
        cargo: "Cajero",
        estado: "Activo",
        idRol: cajeroRole.idRol,
      },
    });

    const [vendedor, vendedorUserCreated] = await Funcionario.findOrCreate({
      where: { rut: "33333333-3" },
      defaults: {
        rut: "33333333-3",
        nombre: "Vendedor",
        apellido: "Test",
        email: "vendedor@sistema.dev",
        password: userPassword,
        passwordCaja: userPassword,
        telefono: "+56987654321",
        direccion: "collao 1202, concepcion",
        cargo: "Vendedor",
        estado: "Activo",
        idRol: vendedorRole.idRol,
      },
    });

    console.log(" Usuarios verificados/creados:");
    console.log(
      `  - Admin (${admin.email}) ${
        adminUserCreated ? "[NUEVO]" : "[EXISTENTE]"
      }`
    );
    console.log(
      `  - Cajero (${cajero.email}) ${
        cajeroUserCreated ? "[NUEVO]" : "[EXISTENTE]"
      }`
    );
    console.log(
      `  - Vendedor (${vendedor.email}) ${
        vendedorUserCreated ? "[NUEVO]" : "[EXISTENTE]"
      }`
    );

    //Crear Bitacora inicial
    const bitacora0 = await crearBitacora({
      nombre: "Inicialización del sistema",
      descripcion: "Se Crea base de sistema por sistema",
      nivelAlerta: "Bajo",
      funcionOcupo: "crearBitacora Service",
      fechaCreacion: new Date(),
      idFuncionario: sistemaUser.dataValues.idFuncionario,
    });

    const bitacora1 = await crearBitacora({
      nombre: "Inicialización del sistema",
      descripcion:
        "Se Crea Bitacora para Administrador durante la inicialización del sistema",
      nivelAlerta: "Bajo",
      funcionOcupo: "crearBitacora Service",
      fechaCreacion: new Date(),
      idFuncionario: sistemaUser.dataValues.idFuncionario,
    });
    const bitacora2 = await crearBitacora({
      nombre: "Inicialización del sistema",
      descripcion:
        "Se Crea Bitacora para Cajero durante la inicialización del sistema",
      nivelAlerta: "Bajo",
      funcionOcupo: "crearBitacora Service",
      fechaCreacion: new Date(),
      idFuncionario: sistemaUser.dataValues.idFuncionario,
    });
    const bitacora3 = await crearBitacora({
      nombre: "Inicialización del sistema",
      descripcion:
        "Se Crea Bitacora para Vendedor durante la inicialización del sistema",
      nivelAlerta: "Bajo",
      funcionOcupo: "crearBitacora Service",
      fechaCreacion: new Date(),
      idFuncionario: sistemaUser.dataValues.idFuncionario,
    });
    console.log(" Bitacoras iniciales creadas");

    console.log(" Usuarios iniciales verificados/creados exitosamente");

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

    //Crear sucursales iniciales si no existen 3 digitos
    console.log(" Creando sucursales y bodegas iniciales...");
    const [sucursal1, sucursal1Created] = await Sucursal.findOrCreate({
      where: { idSucursal: 100 },
      defaults: {
        idSucursal: 100,
        nombre: "Casa Matriz",
        direccion: "Calle Dos 522, Chiguayante",
        estado: "Abierta",
        idFuncionario: admin.idFuncionario,
      },
    });
    //Crear bodegas iniciales si no existen
    const [bodega1, bodega1Created] = await Bodega.findOrCreate({
      where: { idBodega: 1000 },
      defaults: {
        idBodega: 1000,
        nombre: "Bodega Central",
        capacidad: 400,
        estado: "En Funcionamiento",
        idSucursal: sucursal1.idSucursal,
      },
    });
    //Crear estantes iniciales si no existen
    for (let i = 1; i <= 5; i++) {
      await Estante.findOrCreate({
        where: { codigo: `EST-${1000 + i}` },
        defaults: {
          codigo: `EST-${1000 + i}`,

          capacidad: 80,
          tipo: "Estante",
          estado: "Habilitado",
          idBodega: bodega1.idBodega,
        },
      });
    }
    //console.log(bodega1);
  } catch (error) {
    console.error(" Error al crear usuarios iniciales:", error);
    return;
  }
}

module.exports = { createUsers };
