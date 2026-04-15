// backend/utils/auditService.js
// Servicio centralizado de auditoría — llama a este helper desde cualquier controller

const pool = require("../config/dbConfig");

/**
 * Registra una acción en la tabla Auditoria.
 * @param {object} params
 * @param {number} params.usuarioId   - ID del empleado que ejecutó la acción
 * @param {string} params.accion      - Nombre de la acción (ej: "TURNO_CREADO")
 * @param {string} [params.tabla]     - Tabla afectada (ej: "Turnos")
 * @param {number} [params.registroId]- ID del registro afectado
 * @param {string} [params.detalle]   - Descripción legible
 */
async function registrar({ usuarioId, accion, tabla = null, registroId = null, detalle = null }) {
  try {
    const fechaBogota = new Date().toLocaleString("en-US", { timeZone: "America/Bogota" });
    await pool.query(
      `INSERT INTO Auditoria (usuario_id, accion, tabla_afectada, registro_id, fecha, detalle)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [usuarioId, accion, tabla, registroId, new Date(fechaBogota), detalle]
    );
  } catch (err) {
    // No bloquear la operación principal si falla la auditoría
    console.error("[AuditService] Error al registrar auditoría:", err.message);
  }
}

module.exports = { registrar };
