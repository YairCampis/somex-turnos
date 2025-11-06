// backend/models/empleadosModel.js
const db = require("../config/dbConfig");

const Empleado = {
  crear: async (empleado) => {
    const query = `
      INSERT INTO Empleados (nombreCompleto, correo, contrasena, idRol) 
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      empleado.nombreCompleto,
      empleado.correo,
      empleado.contrasena,
      empleado.idRol || 4
    ]);
    return result.insertId;
  },

  buscarPorCorreo: async (correo) => {
    const query = "SELECT * FROM Empleados WHERE correo = ?";
    const [rows] = await db.execute(query, [correo]);
    return rows.length > 0 ? rows[0] : null;
  }
};


// Obtener todos los empleados
const getAllEmpleados = async () => {
  const [rows] = await db.query("SELECT * FROM Empleados");
  return rows;
};

// Crear un empleado
const createEmpleado = async (empleado) => {
  const { nombreCompleto, correo, contrasena, idRol } = empleado;
  const [result] = await db.query(
    "INSERT INTO Empleados (nombreCompleto, correo, contrasena, idRol) VALUES (?, ?, ?, ?)",
    [nombreCompleto, correo, contrasena, idRol]
  );
  return { idEmpleado: result.insertId, ...empleado };
};

// Actualizar un empleado
const updateEmpleado = async (id, empleado) => {
  const { nombreCompleto, correo, idRol } = empleado;
  await db.query(
    "UPDATE Empleados SET nombreCompleto=?, correo=?, idRol=? WHERE idEmpleado=?",
    [nombreCompleto, correo, idRol, id]
  );
};

// Eliminar un empleado
const deleteEmpleado = async (id) => {
  await db.query("DELETE FROM Empleados WHERE idEmpleado=?", [id]);
};

module.exports = {
  getAllEmpleados,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado,
};

module.exports = Empleado;
