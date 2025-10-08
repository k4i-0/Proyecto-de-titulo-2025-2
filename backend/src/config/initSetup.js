//funcion crea usuarios admin y user
const bcrypt = require("bcrypt");
const Funcionario = require("../models/Funcionario");
const Rol = require("../models/Rol");

async function createUsers() {
  try {
    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);
    // Crear roles si no existen
    const [adminRole, createdAdmin] = await Rol.findOrCreate({
      where: { nombre: "Administrador" },
      defaults: { descripcion: "Administrador del sistema" },
    });

    const [cajeroRole, createdCajero] = await Rol.findOrCreate({
      where: { nombre: "Cajero" },
      defaults: { descripcion: "Cajero del sistema" },
    });

    const [vendedorRole, createdVendedor] = await Rol.findOrCreate({
      where: { nombre: "Vendedor" },
      defaults: { descripcion: "Vendedor del sistema" },
    });

    const admin = Funcionario.findOrCreate({
      where: { rut: "11111111-1" },
      defaults: {
        nombre: "Admin",
        apellido: "User",
        email: "admin@onate.dev",
        password: adminPassword,
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
        nombre: "User",
        apellido: "Test",
        email: "cajero@onate.dev",
        password: userPassword,
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
        nombre: "User",
        apellido: "Test",
        email: "vendedor@onate.dev",
        password: userPassword,
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
