// backend/models/empleadosModel.js
const db = require("../config/dbConfig");
const { toSentenceCase } = require("../utils/textUtils");

const Empleado = {

  // Obtener todos
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT idEmpleado, nombreCompleto, correo, idRol
      FROM Empleados
    `);
    return rows;
  },

  // Crear
  create: async (empleado) => {
    const { nombreCompleto, correo, contrasena, idRol } = empleado;

    // --- ENCRIPTAR CONTRASEÑA ---
    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(contrasena, salt);

    // --- FECHA COLOMBIA ---
    const fechaRegistro = new Date().toLocaleString("en-CA", {
      timeZone: "America/Bogota",
      hour12: false,
    }).replace(",", "");

    const [result] = await db.query(
      "INSERT INTO Empleados (nombreCompleto, correo, contrasena, idRol, fechaRegistro) VALUES (?, ?, ?, ?, ?)",
      [toSentenceCase(nombreCompleto), correo, hash, idRol || 4, fechaRegistro]
    );

    return result.insertId;
  },

  // Actualizar
  update: async (id, empleado) => {

  let query = "UPDATE Empleados SET ";
  let params = [];

// Solo actualizar lo que venga
  if(empleado.nombreCompleto){
  query += "nombreCompleto=?, ";
  params.push(toSentenceCase(empleado.nombreCompleto));
  }

  if(empleado.correo){
  query += "correo=?, ";
  params.push(empleado.correo);
  }

  if(empleado.idRol){
    query += "idRol=?, ";
    params.push(empleado.idRol);
  }

  if(empleado.contrasena){
    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(empleado.contrasena, salt);
    query += "contrasena=?, ";
    params.push(hash);
  }

  // quitar la última coma
  query = query.slice(0, -2);

  query += " WHERE idEmpleado=?";
  params.push(id);

  await db.query(query, params);

  },

  // Eliminar
  delete: async (id) => {
    await db.query(
      "DELETE FROM Empleados WHERE idEmpleado=?",
      [id]
    );
  },

  // Buscar por correo (login)
  buscarPorCorreo: async (correo) => {
  const [rows] = await db.query(
    "SELECT * FROM Empleados WHERE correo = ?",
    [correo]
  );
  return rows[0];
}

};

module.exports = Empleado;