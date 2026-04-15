// backend/controllers/auditoriaController.js

const pool = require("../config/dbConfig");

/**
 * GET /api/auditoria
 * Soporta filtros: ?usuarioId=&accion=&desde=&hasta=&limite=
 */
const getAuditoria = async (req, res) => {
  try {
    const { usuarioId, accion, desde, hasta, limite = 200 } = req.query;

    let query = `
      SELECT a.id, a.accion, a.tabla_afectada, a.registro_id,
             a.fecha, a.detalle,
             e.nombreCompleto AS usuario, e.correo,
             t.numeroTurno, t.placa
      FROM Auditoria a
      LEFT JOIN Empleados e ON a.usuario_id = e.idEmpleado
      LEFT JOIN Turnos t ON (a.tabla_afectada = 'Turnos' AND a.registro_id = t.idTurno)
      WHERE 1=1
    `;
    const params = [];

    if (usuarioId) { query += " AND a.usuario_id = ?"; params.push(usuarioId); }
    if (accion)    { query += " AND a.accion LIKE ?";  params.push(`%${accion}%`); }
    if (desde)     { query += " AND a.fecha >= ?";     params.push(desde); }
    if (hasta)     { query += " AND a.fecha <= ?";     params.push(hasta + " 23:59:59"); }

    query += " ORDER BY a.fecha DESC LIMIT ?";
    params.push(parseInt(limite));

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener auditoría:", error);
    res.status(500).json({ error: "Error al obtener auditoría" });
  }
};

/**
 * GET /api/auditoria/usuarios
 * Lista de empleados que han generado logs (para filtro en UI).
 */
const getUsuariosConLog = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT e.idEmpleado, e.nombreCompleto
       FROM Auditoria a
       JOIN Empleados e ON a.usuario_id = e.idEmpleado
       ORDER BY e.nombreCompleto`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

module.exports = { getAuditoria, getUsuariosConLog };
