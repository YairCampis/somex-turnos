// notificacionesController.js
const pool = require("../models/../config/dbConfig");

const getPendientes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Notificaciones WHERE estado = 'pendiente' AND tipo = 'SMS' ORDER BY fecha_creacion DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener notificaciones pendientes:", error);
    res.status(500).json({ error: "Error al obtener notificaciones" });
  }
};

const marcarEnviada = async (req, res) => {
  try {
    const { id } = req.params;
    const fecha = new Date().toLocaleString("en-CA", {
      timeZone: "America/Bogota",
      hour12: false,
    }).replace(",", "");

    await pool.query(
      "UPDATE Notificaciones SET estado = 'enviado', fecha_envio = ? WHERE id = ?",
      [fecha, id]
    );
    res.json({ message: "Notificación marcada como enviada" });
  } catch (error) {
    console.error("Error al marcar notificación como enviada:", error);
    res.status(500).json({ error: "Error al actualizar notificación" });
  }
};

module.exports = {
  getPendientes,
  marcarEnviada,
};
