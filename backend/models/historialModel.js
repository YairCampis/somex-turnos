// backend/models/historialModel.js

const pool = require("../config/dbConfig");

/**
 * Registra un cambio de estado en HistorialTurnos.
 */
async function registrarCambio({ idTurno, estadoAnterior, estadoNuevo, usuarioResponsable = null, observaciones = null }) {
  try {
    const fechaBogota = new Date().toLocaleString("en-US", { timeZone: "America/Bogota" });
    await pool.query(
      `INSERT INTO HistorialTurnos (id_turno, fecha_hora, estado_anterior, estado_nuevo, usuario_responsable, observaciones)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [idTurno, new Date(fechaBogota), estadoAnterior, estadoNuevo, usuarioResponsable, observaciones]
    );
  } catch (err) {
    console.error("[HistorialModel] Error al registrar historial:", err.message);
  }
}

/**
 * Obtiene el historial de un turno específico.
 */
async function obtenerHistorial(idTurno) {
  const [rows] = await pool.query(
    `SELECT h.id, h.fecha_hora, h.estado_anterior, h.estado_nuevo,
            h.observaciones, e.nombreCompleto AS usuario
     FROM HistorialTurnos h
     LEFT JOIN Empleados e ON h.usuario_responsable = e.idEmpleado
     WHERE h.id_turno = ?
     ORDER BY h.fecha_hora ASC`,
    [idTurno]
  );
  return rows;
}

module.exports = { registrarCambio, obtenerHistorial };
