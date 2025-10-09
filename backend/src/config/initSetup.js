// Función para crear usuarios admin y user
const bcrypt = require("bcrypt");
const Funcionario = require("../models/usuarios/Funcionario");
const Rol = require("../models/usuarios/Rol");

async function createUsers() {
  try {
    console.log("🔄 Iniciando creación de usuarios iniciales...");

    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    // Crear roles si no existen
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

    // Crear usuarios (await agregado y campo corregido)
    const [admin, adminUserCreated] = await Funcionario.findOrCreate({
      where: { rut: "11111111-1" },
      defaults: {
        rut: "11111111-1",
        nombre: "Admin",
        apellido: "User",
        email: "admin@onate.dev",
        password: adminPassword,
        passwordCaja: adminPassword,
        telefono: "+56912345678",
        direccion: "collao 1202, concepcion",
        cargo: "Administrador",
        estado: "Activo",
        idRol: adminRole.idRol, // ✅ CORREGIDO: era "roleidRol"
      },
    });

    const [cajero, cajeroUserCreated] = await Funcionario.findOrCreate({
      where: { rut: "22222222-2" },
      defaults: {
        rut: "22222222-2",
        nombre: "Cajero",
        apellido: "Test",
        email: "cajero@onate.dev",
        password: userPassword,
        passwordCaja: userPassword,
        telefono: "+56987654321",
        direccion: "collao 1202, concepcion",
        cargo: "Cajero",
        estado: "Activo",
        idRol: cajeroRole.idRol, // ✅ CORREGIDO: era "roleidRol"
      },
    });

    const [vendedor, vendedorUserCreated] = await Funcionario.findOrCreate({
      where: { rut: "33333333-3" },
      defaults: {
        rut: "33333333-3",
        nombre: "Vendedor",
        apellido: "Test",
        email: "vendedor@onate.dev",
        password: userPassword,
        passwordCaja: userPassword,
        telefono: "+56987654321",
        direccion: "collao 1202, concepcion",
        cargo: "Vendedor",
        estado: "Activo",
        idRol: vendedorRole.idRol, // ✅ CORREGIDO: era "roleidRol"
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
    throw error; // ✅ MEJOR: lanzar el error para manejarlo arriba
  }
}

module.exports = { createUsers };
