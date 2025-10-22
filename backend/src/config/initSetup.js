// Función para crear usuarios admin y user
const bcrypt = require("bcrypt");
const Funcionario = require("../models/Usuarios/Funcionario");
const Rol = require("../models/Usuarios/Rol");
const { crearBitacora } = require("../services/bitacora.service");
async function createUsers() {
  try {
    console.log("🔄 Iniciando creación de usuarios iniciales...");

    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

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

    console.log("✅ Roles verificados/creados:");
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

    //Crear Bitacora inicial
    const bitacora0 = await crearBitacora({
      nombre: "Inicialización del sistema",
      descripcion: "Se Crea base de sistema por sistema",
      nivelAlerta: "Bajo",
      funcionOcupo: "crearBitacora Service",
      fechaCreacion: new Date(),
      usuariosCreador: "Sistema",
    });
    const bitacora1 = await crearBitacora({
      nombre: "Inicialización del sistema",
      descripcion:
        "Se Crea Bitacora para Administrador durante la inicialización del sistema",
      nivelAlerta: "Bajo",
      funcionOcupo: "crearBitacora Service",
      fechaCreacion: new Date(),
      usuariosCreador: "Sistema",
    });
    const bitacora2 = await crearBitacora({
      nombre: "Inicialización del sistema",
      descripcion:
        "Se Crea Bitacora para Cajero durante la inicialización del sistema",
      nivelAlerta: "Bajo",
      funcionOcupo: "crearBitacora Service",
      fechaCreacion: new Date(),
      usuariosCreador: "Sistema",
    });
    const bitacora3 = await crearBitacora({
      nombre: "Inicialización del sistema",
      descripcion:
        "Se Crea Bitacora para Vendedor durante la inicialización del sistema",
      nivelAlerta: "Bajo",
      funcionOcupo: "crearBitacora Service",
      fechaCreacion: new Date(),
      usuariosCreador: "Sistema",
    });
    console.log("✅ Bitacoras iniciales creadas");

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
        idBitacora: bitacora0.idBitacora,
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
        idBitacora: bitacora1.dataValues.idBitacora,
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
        idBitacora: bitacora2.dataValues.idBitacora,
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
        idBitacora: bitacora3.dataValues.idBitacora,
      },
    });

    console.log("✅ Usuarios verificados/creados:");
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

    console.log("🎉 Usuarios iniciales verificados/creados exitosamente");
  } catch (error) {
    console.error("❌ Error al crear usuarios iniciales:", error);
    return;
  }
}

module.exports = { createUsers };
