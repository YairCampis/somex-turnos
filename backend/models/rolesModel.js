const pool = require("../config/dbConfig");

// Obtener todos los roles
const getAllRoles = async () => {
  const [rows] = await pool.query("SELECT * FROM Roles");
  return rows;
};

// Crear un rol
const createRol = async (rol) => {
  const { nombreRol } = rol;
  const [result] = await pool.query(
    "INSERT INTO Roles (nombreRol) VALUES (?)",
    [nombreRol]
  );
  return { idRol: result.insertId, nombreRol };
};

// Actualizar un rol
const updateRol = async (id, rol) => {
  const { nombreRol } = rol;
  await pool.query("UPDATE Roles SET nombreRol=? WHERE idRol=?", [
    nombreRol,
    id,
  ]);
};

// Eliminar un rol
const deleteRol = async (id) => {
  await pool.query("DELETE FROM Roles WHERE idRol=?", [id]);
};

module.exports = {
  getAllRoles,
  createRol,
  updateRol,
  deleteRol,
};
