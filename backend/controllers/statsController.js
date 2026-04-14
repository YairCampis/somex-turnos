const pool = require("../config/dbConfig");

const getSummary = async (req, res) => {
  try {
    const [rowUsuarios] = await pool.query("SELECT COUNT(*) as usuarios FROM Empleados");
    const [rowRoles] = await pool.query("SELECT COUNT(*) as roles FROM Roles");
    
    const fechaHoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
    const [rowTurnos] = await pool.query("SELECT COUNT(*) as turnos FROM Turnos WHERE fecha = ?", [fechaHoy]);
    const [rowNotif] = await pool.query("SELECT COUNT(*) as notificaciones FROM Notificaciones WHERE DATE(fecha_creacion) = ?", [fechaHoy]);

    res.json({
      usuarios: rowUsuarios[0]?.usuarios || 0,
      roles: rowRoles[0]?.roles || 0,
      turnos: rowTurnos[0]?.turnos || 0,
      notificaciones: rowNotif[0]?.notificaciones || 0
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
};

module.exports = {
  getSummary
};
