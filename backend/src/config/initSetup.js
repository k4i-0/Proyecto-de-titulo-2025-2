//funcion crea usuarios admin y user
const bcrypt = require("bcrypt");
const Funcionario = require("../models/usuarios/Funcionario");
const Rol = require("../models/usuarios/Rol");

async function createUsers() {
  try {
    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);
    // Crear roles si no existen
    const [adminRole, createdAdmin] = await Rol.findOrCreate({
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

    const [cajeroRole, createdCajero] = await Rol.findOrCreate({
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

    const [vendedorRole, createdVendedor] = await Rol.findOrCreate({
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

    const admin = Funcionario.findOrCreate({
      where: { rut: "11111111-1" },
      defaults: {
        rut: "11111111-1",
        nombre: "Admin",
        apellido: "User",
        email: "admin@onate.dev",
        password: adminPassword,
        passwordCaja: adminPassword,
        telefono: "+56912345678",
        direccion: "collao 1202, concepion",
        cargo: "prueba",
        estado: "Activo",
        idRol: adminRole.idRol,
      },
    });

    const cajero = Funcionario.findOrCreate({
      where: { rut: "22222222-2" },
      defaults: {
        rut: "22222222-2",
        nombre: "User",
        apellido: "Test",
        email: "cajero@onate.dev",
        password: userPassword,
        passwordCaja: userPassword,
        telefono: "+56987654321",
        direccion: "collao 1202, concepion",
        cargo: "prueba",
        estado: "Activo",
        idRol: cajeroRole.idRol,
      },
    });

    const vendedor = Funcionario.findOrCreate({
      where: { rut: "33333333-3" },
      defaults: {
        rut: "33333333-3",
        nombre: "User",
        apellido: "Test",
        email: "vendedor@onate.dev",
        password: userPassword,
        passwordCaja: userPassword,
        telefono: "+56987654321",
        direccion: "collao 1202, concepion",
        cargo: "prueba",
        estado: "Activo",
        idRol: vendedorRole.idRol,
      },
    });

    await Promise.all([admin, cajero, vendedor]);

    console.log("Usuarios iniciales creados");
  } catch (error) {
    console.error("Error al crear usuarios iniciales:", error);
    return;
  }
}
module.exports = { createUsers };
