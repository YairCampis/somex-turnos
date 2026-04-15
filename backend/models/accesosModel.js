// backend/models/accesosModel.js

const pool = require("../config/dbConfig");

/**
 * Crea el registro de ingreso cuando un turno es Atendido.
 */
async function registrarIngreso({ idTurno, idEmpleadoAutorizante = null, observaciones = null }) {
  try {
    // Evitar duplicados: si ya existe un acceso abierto para este turno, no insertar
    const [existing] = await pool.query(
      "SELECT id FROM Accesos WHERE id_turno = ? AND fecha_salida IS NULL",
      [idTurno]
    );
    if (existing.length > 0) return existing[0].id;

    const fechaBogota = new Date().toLocaleString("en-US", { timeZone: "America/Bogota" });
    const [result] = await pool.query(
      `INSERT INTO Accesos (id_turno, fecha_ingreso, id_empleado_autorizante, observaciones)
       VALUES (?, ?, ?, ?)`,
      [idTurno, new Date(fechaBogota), idEmpleadoAutorizante, observaciones]
    );
    return result.insertId;
  } catch (err) {
    console.error("[AccesosModel] Error al registrar ingreso:", err.message);
  }
}

/**
 * Registra la salida (cuando el estado pasa a "Salió" o "Cancelado").
 */
async function registrarSalida({ idTurno }) {
  try {
    const fechaBogota = new Date().toLocaleString("en-US", { timeZone: "America/Bogota" });
    await pool.query(
      `UPDATE Accesos SET fecha_salida = ?
       WHERE id_turno = ? AND fecha_salida IS NULL`,
      [new Date(fechaBogota), idTurno]
    );
  } catch (err) {
    console.error("[AccesosModel] Error al registrar salida:", err.message);
  }
}

/**
 * Obtiene el acceso de un turno.
 */
async function obtenerAcceso(idTurno) {
  const [rows] = await pool.query(
    `SELECT a.*, e.nombreCompleto AS empleado_autorizante
     FROM Accesos a
     LEFT JOIN Empleados e ON a.id_empleado_autorizante = e.idEmpleado
     WHERE a.id_turno = ?`,
    [idTurno]
  );
  return rows[0] || null;
}

/**
 * Vehículos actualmente dentro de planta (fecha_salida IS NULL).
 */
async function vehiculosDentro() {
  const [rows] = await pool.query(
    `SELECT a.id, a.fecha_ingreso, a.observaciones,
            t.numeroTurno, t.placa, t.destinoFinal,
            c.nombreCompleto AS conductor, c.celular,
            e.nombreCompleto AS autorizadoPor
     FROM Accesos a
     JOIN Turnos t ON a.id_turno = t.idTurno
     JOIN Conductores c ON t.idConductor = c.idConductor
     LEFT JOIN Empleados e ON a.id_empleado_autorizante = e.idEmpleado
     WHERE a.fecha_salida IS NULL
     ORDER BY a.fecha_ingreso ASC`
  );
  return rows;
}

module.exports = { registrarIngreso, registrarSalida, obtenerAcceso, vehiculosDentro };
