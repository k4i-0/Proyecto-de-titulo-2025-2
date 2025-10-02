//funcion crea usuarios admin y user
const bcrypt = require("bcrypt");
const Funcionario = require("../models/Funcionario");
const Rol = require("../models/Rol");

async function createUsers() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);
  // Crear roles si no existen
  const [adminRole, createdAdmin] = await Rol.findOrCreate({
    where: { nombre: "Admin" },
    defaults: { descripcion: "Administrador del sistema" },
  });

  const [userRole, createdUser] = await Rol.findOrCreate({
    where: { nombre: "User" },
    defaults: { descripcion: "Usuario del sistema" },
  });

  const admin = Funcionario.create({
    rut: "11111111-1",
    nombre: "Admin",
    apellido: "User",
    email: "admin@onate.dev",
    password: adminPassword,
    telefono: "+56912345678",
    direccion: "collao 1202, concepion",
    cargo: "prueba",
    estado: "Activo",
    idRol: 1,
  });

  const user = Funcionario.create({
    rut: "22222222-2",
    nombre: "User",
    apellido: "Test",
    email: "user@onate.dev",
    password: userPassword,
    telefono: "+56987654321",
    direccion: "collao 1202, concepion",
    cargo: "prueba",
    estado: "Activo",
    idRol: 2,
  });

  await admin.save();
  await user.save();
}
module.exports = { createUsers };
