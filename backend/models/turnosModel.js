const pool = require("../config/dbConfig");

// Obtener todos los turnos
const getAllTurnos = async () => {
  const [rows] = await pool.query(
    `SELECT t.idTurno, LPAD(t.numeroTurno, 2, '0') AS numeroTurno, 
            t.fecha, t.horaAsignacion, t.estado,
            c.nombreCompleto AS conductor, c.placa
     FROM Turnos t
     JOIN Conductores c ON t.idConductor = c.idConductor
     ORDER BY t.fecha DESC, t.numeroTurno ASC`
  );
  return rows;
};

// Crear turno con consecutivo que reinicia cada día
const createTurno = async (turno) => {
  const { idConductor } = turno;

  // Buscar el último turno asignado en la fecha de hoy
  const [rows] = await pool.query(
    "SELECT MAX(numeroTurno) AS ultimoTurno FROM Turnos WHERE fecha = CURDATE()"
  );

  // Si no hay turnos en el día, inicia en 1
  let siguienteTurno = rows[0].ultimoTurno ? rows[0].ultimoTurno + 1 : 1;

  // Insertar turno → por defecto con estado Pendiente y fecha de hoy
  const [result] = await pool.query(
    "INSERT INTO Turnos (idConductor, numeroTurno, estado, fecha) VALUES (?, ?, ?, CURDATE())",
    [idConductor, siguienteTurno, "Pendiente"]
  );

  return { 
    idTurno: result.insertId, 
    idConductor, 
    numeroTurno: siguienteTurno.toString().padStart(2, "0"), 
    estado: "Pendiente", 
    fecha: new Date().toISOString().split("T")[0] 
  };
};

// Actualizar turno (ejemplo: cambiar estado de Pendiente → Atendido)
const updateTurno = async (id, turno) => {
  const { estado } = turno;
  await pool.query(
    "UPDATE Turnos SET estado=? WHERE idTurno=?",
    [estado, id]
  );
};

// Eliminar turno
const deleteTurno = async (id) => {
  await pool.query("DELETE FROM Turnos WHERE idTurno=?", [id]);
};

module.exports = {
  getAllTurnos,
  createTurno,
  updateTurno,
  deleteTurno,
};

