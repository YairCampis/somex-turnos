const pool = require("../config/dbConfig");

// Obtener un conductor por numero de cedula
const getConductorByDocumento = async (cedula) => {
  const [rows] = await pool.query(
    "SELECT * FROM Conductores WHERE cedula = ?",
    [cedula]
  );
  return rows.length > 0 ? rows[0] : null;
};


// Obtener todos los conductores
const getAllConductores = async () => {
  const [rows] = await pool.query("SELECT * FROM Conductores");
  return rows;
};

// Crear un conductor
const createConductor = async (conductor) => {
  const { cedula, nombreCompleto, celular, placa, tipoVehiculo, destinoFinal, tipoVisita } = conductor;
  const [result] = await pool.query(
    "INSERT INTO Conductores (cedula, nombreCompleto, celular, placa, tipoVehiculo, destinoFinal, tipoVisita) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [cedula, nombreCompleto, celular, placa, tipoVehiculo, destinoFinal, tipoVisita]
  );
  return { idConductor: result.insertId, ...conductor };
};

// Actualizar un conductor
const updateConductor = async (id, conductor) => {
  const { cedula, nombreCompleto, celular, placa, tipoVehiculo, destinoFinal, tipoVisita } = conductor;
  await pool.query(
    "UPDATE Conductores SET cedula=?, nombreCompleto=?, celular=?, placa=?, tipoVehiculo=?, destinoFinal=?, tipoVisita=? WHERE idConductor=?",
    [cedula, nombreCompleto, celular, placa, tipoVehiculo, destinoFinal, tipoVisita, id]
  );
};

// Eliminar un conductor
const deleteConductor = async (id) => {
  await pool.query("DELETE FROM Conductores WHERE idConductor=?", [id]);
};

module.exports = {
  getAllConductores,
  createConductor,
  updateConductor,
  deleteConductor,
  getConductorByDocumento,
};
