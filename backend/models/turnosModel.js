// turnosModel.js
const pool = require("../config/dbConfig");
const { toSentenceCase } = require("../utils/textUtils");
const smsService = require("../utils/smsService");
const historialModel = require("./historialModel");
const accesosModel = require("./accesosModel");
const auditService = require("../utils/auditService");

// ================================
// CONTAR TURNOS ABIERTOS
// ================================
const countTurnosAbiertos = async (idConductor) => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) as total FROM Turnos WHERE idConductor = ? AND estado = 'Pendiente'",
    [idConductor],
  );
  return rows[0].total;
};

// ================================
// OBTENER TODOS LOS TURNOS
// ================================
const getAllTurnos = async () => {
  const [rows] = await pool.query(
    `SELECT t.idTurno, LPAD(t.numeroTurno, 2, '0') AS numeroTurno, 
            t.fecha, t.horaAsignacion, t.estado,
            t.puedePasar, t.motivo, t.salaConductores, t.observaciones,
            c.nombreCompleto AS conductor, c.cedula, c.placa, c.celular, c.idConductor,
            t.destinoFinal, t.tipoVisita
     FROM Turnos t
     JOIN Conductores c ON t.idConductor = c.idConductor
     ORDER BY t.fecha DESC, t.numeroTurno ASC`,
  );
  return rows;
};

// ================================
// CREAR TURNO
// ================================
const createTurno = async (turno) => {
  let { idConductor, destinoFinal, tipoVisita, placa, tipoVehiculo } = turno;

  // Forzar placa en mayúsculas
  if (placa) {
    placa = placa.toUpperCase();
    try {
      const [vehiculoExistente] = await pool.query(
        "SELECT idVehiculo FROM Vehiculos WHERE placa = ?",
        [placa]
      );

      if (vehiculoExistente.length === 0) {
        await pool.query(
          "INSERT INTO Vehiculos (placa, tipoVehiculo, idConductor, empresa_id) VALUES (?, ?, ?, NULL)",
          [placa, toSentenceCase(tipoVehiculo), idConductor]
        );
        console.log("Vehículo registrado:", placa);
      }
    } catch (error) {
      console.error("Error al gestionar tabla Vehiculos:", error);
      // No detengo la creación del turno si falla la inserción del vehículo
    }
  }

  // Buscar último turno del día
  const fechaHoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
  const [rows] = await pool.query(
    "SELECT MAX(numeroTurno) AS ultimoTurno FROM Turnos WHERE fecha = ?",
    [fechaHoy]
  );

  const siguienteTurno = rows[0].ultimoTurno ? rows[0].ultimoTurno + 1 : 1;

  // GENERAR FECHA Y HORA DESDE NODE
  const now = new Date();

  //  FORZAR zona horaria Colombia
  const fecha = now.toLocaleDateString("en-CA", {
    timeZone: "America/Bogota",
  });

  const hora = now.toLocaleTimeString("es-CO", {
    hour12: false,
    timeZone: "America/Bogota",
  });

  // Insertar turno
  const [result] = await pool.query(
    `INSERT INTO Turnos 
     (idConductor, numeroTurno, estado, fecha, horaAsignacion, destinoFinal, tipoVisita, placa) 
     VALUES (?, ?, 'Pendiente', ?, ?, ?, ?, ?)`,
    [idConductor, siguienteTurno, fecha, hora, toSentenceCase(destinoFinal), toSentenceCase(tipoVisita), placa],
  );

  const idTurno = result.insertId;
  const numTurnoFormateado = siguienteTurno.toString().padStart(2, "0");

  // --- SIMULAR NOTIFICACIÓN SMS AL CREAR ---
  try {
    const [conductorRows] = await pool.query(
      "SELECT celular, nombreCompleto FROM Conductores WHERE idConductor = ?",
      [idConductor]
    );

    if (conductorRows.length > 0) {
      const { celular, nombreCompleto } = conductorRows[0];
      const mensaje = `Hola ${nombreCompleto}, se ha creado tu turno #${numTurnoFormateado}. Destino: ${toSentenceCase(destinoFinal)}. Por favor atento a la pantalla.`;
      
      await smsService.sendSMS({
        idTurno,
        id_usuario: idConductor,
        celular,
        mensaje
      });
    }
  } catch (err) {
    console.error("DEBUG: Error al encolar notificación SMS en la tabla 'Notificaciones':", {
      error: err.message,
      code: err.code,
      data: { idTurno, idConductor, celular }
    });
  }
  // -----------------------------------------

  // --- Auditoría: turno creado ---
  auditService.registrar({
    usuarioId: null, // Los conductores no son empleados, se registra como acción de sistema/conductor
    accion: "TURNO_CREADO",
    tabla: "Turnos",
    registroId: idTurno,
    detalle: `Turno #${numTurnoFormateado} creado por conductor. Destino: ${toSentenceCase(destinoFinal)}`
  });

  return {
    idTurno,
    idConductor,
    numeroTurno: numTurnoFormateado,
    estado: "Pendiente",
    fecha,
    destinoFinal: toSentenceCase(destinoFinal),
    tipoVisita: toSentenceCase(tipoVisita),
  };
};

// ================================
// ACTUALIZAR TURNO
// ================================
const updateTurno = async (id, turno) => {
  const { estado, puedePasar, motivo, salaConductores, observaciones, destinoFinal, idUsuario } = turno;
  console.log("ACTUALIZANDO TURNO:", { id, estado, puedePasar, motivo, salaConductores, observaciones, destinoFinal });

  // Obtener estado anterior para el historial y notificaciones
  const [[turnoActual]] = await pool.query(
    "SELECT estado, puedePasar FROM Turnos WHERE idTurno = ?",
    [id]
  );
  const estadoAnterior = turnoActual?.estado || null;
  const puedePasarAnterior = turnoActual?.puedePasar || 0;

  await pool.query(
    `UPDATE Turnos 
     SET estado=?, puedePasar=?, motivo=?, salaConductores=?, observaciones=?, destinoFinal=? 
     WHERE idTurno=?`, 
    [estado, puedePasar, toSentenceCase(motivo), salaConductores, toSentenceCase(observaciones), toSentenceCase(destinoFinal), id]
  );

  // --- HISTORIAL DE ESTADOS ---
  if (estadoAnterior !== estado) {
    historialModel.registrarCambio({
      idTurno: id,
      estadoAnterior,
      estadoNuevo: estado,
      usuarioResponsable: idUsuario || null,
      observaciones: observaciones || null
    });

    // --- ACCESOS: ingreso al entrar, salida al irse ---
    if (estado === "Atendido") {
      accesosModel.registrarIngreso({
        idTurno: id,
        idEmpleadoAutorizante: idUsuario || null
      });
    } else if (estado === "Salió" || estado === "Cancelado") {
      accesosModel.registrarSalida({ idTurno: id });
    }

    // --- AUDITORÍA ---
    auditService.registrar({
      usuarioId: idUsuario || null,
      accion: "TURNO_ACTUALIZADO",
      tabla: "Turnos",
      registroId: id,
      detalle: `Estado: ${estadoAnterior} → ${estado}`
    });
  }

  // --- SIMULAR NOTIFICACIÓN SMS AL ACTIVAR "PUEDE PASAR" ---
  // Se activa si antes era 0/No y ahora es 1/Si
  const antesNoPodia = !puedePasarAnterior || puedePasarAnterior == '0' || puedePasarAnterior == 'NO' || puedePasarAnterior == 'No';
  const ahoraSiPuede = puedePasar == '1' || puedePasar == 1 || puedePasar == 'SI' || puedePasar == 'Si' || puedePasar === true;

  console.log("DEBUG NOTIFICACIÓN SMS:", { 
    id, 
    antesNoPodia, 
    ahoraSiPuede, 
    puedePasarAnterior, 
    puedePasarRecibido: puedePasar 
  });

  if (antesNoPodia && ahoraSiPuede) {
    try {
      const [dataRows] = await pool.query(
        `SELECT c.celular, c.nombreCompleto, t.numeroTurno, t.idConductor 
         FROM Turnos t 
         JOIN Conductores c ON t.idConductor = c.idConductor 
         WHERE t.idTurno = ?`,
        [id]
      );

      if (dataRows.length > 0) {
        const { celular, nombreCompleto, numeroTurno, idConductor } = dataRows[0];
        const numTurnoFormateado = numeroTurno.toString().padStart(2, "0");
        const mensaje = `¡ATENCIÓN! ${nombreCompleto}, tu turno #${numTurnoFormateado} ya puede ingresar. Dirígete a portería.`;
        
        await smsService.sendSMS({
          idTurno: id,
          id_usuario: idConductor,
          celular,
          mensaje
        });
      }
    } catch (err) {
      console.error("Error al encolar notificación SMS de llamado:", err);
    }
  }
  // -----------------------------------------------------------------
};

// ================================
// ELIMINAR TURNO
// ================================
const deleteTurno = async (id) => {
  await pool.query("DELETE FROM Turnos WHERE idTurno=?", [id]);
};

// CONSULTAS TURNOS DEL DIA ACTUAL

// Consulta 1: resumen del día
async function obtenerResumenHoy(idConductor) {
  const [rows] = await pool.query(
    `
    SELECT
      COUNT(*) AS total,
      MAX(numeroTurno) AS ultimoTurno,
      MAX(CASE 
          WHEN idConductor = ? THEN numeroTurno
      END) AS miTurno
    FROM Turnos
    WHERE fecha = ?;
    `,
    [idConductor, new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" })],
  );

  return rows[0];
}

// Consulta 2: lista de turnos del día
async function obtenerTurnosHoy() {
  const [rows] = await pool.query(
    `
    SELECT numeroTurno, estado, placa, horaAsignacion
    FROM Turnos
    WHERE fecha = ?
    ORDER BY numeroTurno ASC;
    `,
    [new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" })],
  );

  return rows;
}

//Obtener Turno por ID
const obtenerTurnoPorId = async (idTurno) => {
  const [rows] = await pool.query(
    "SELECT idTurno, numeroTurno, estado FROM Turnos WHERE idTurno = ?",
    [idTurno],
  );
  return rows[0];
};

// OBTENER REPORTE POR RANGO DE FECHAS
const getReport = async (fechaInicio, fechaFin) => {
  let query = `
    SELECT t.idTurno, LPAD(t.numeroTurno, 2, '0') AS numeroTurno, 
           t.fecha, t.horaAsignacion, t.estado,
           t.puedePasar, t.motivo, t.salaConductores, t.observaciones,
           c.nombreCompleto AS conductor, c.cedula, c.placa, c.celular,
           t.destinoFinal, t.tipoVisita
    FROM Turnos t
    JOIN Conductores c ON t.idConductor = c.idConductor
    WHERE 1=1
  `;
  const params = [];

  if (fechaInicio) {
    query += " AND t.fecha >= ?";
    params.push(fechaInicio);
  }
  if (fechaFin) {
    query += " AND t.fecha <= ?";
    params.push(fechaFin);
  }

  query += " ORDER BY t.fecha DESC, t.numeroTurno ASC";

  const [rows] = await pool.query(query, params);
  return rows;
};

// ================================
// EXPORTAR MODELO
// ================================
// ================================
// ANALÍTICA Y REPORTES AVANZADOS
// ================================
const getAnalytics = async () => {
  // 1. Por Hora
  const [porHora] = await pool.query(`
    SELECT HOUR(horaAsignacion) as hora, COUNT(*) as total 
    FROM Turnos 
    GROUP BY HOUR(horaAsignacion) 
    ORDER BY total DESC
  `);

  // 2. Por Día de la Semana
  const [porDiaSemana] = await pool.query(`
    SELECT DAYNAME(fecha) as dia, DAYOFWEEK(fecha) as numDia, COUNT(*) as total 
    FROM Turnos 
    GROUP BY dia, numDia 
    ORDER BY numDia
  `);

  // 3. Top 10 Fechas Pico
  const [topFechas] = await pool.query(`
    SELECT fecha, COUNT(*) as total 
    FROM Turnos 
    GROUP BY fecha 
    ORDER BY total DESC 
    LIMIT 10
  `);

  // 4. Estados (Creados vs Atendidos vs Cancelados)
  const [porEstado] = await pool.query(`
    SELECT estado, COUNT(*) as total 
    FROM Turnos 
    GROUP BY estado
  `);

  // 5. Evolución Mensual (Últimos 12 meses)
  const [evolucionMes] = await pool.query(`
    SELECT DATE_FORMAT(fecha, '%Y-%m') as mes, COUNT(*) as total 
    FROM Turnos 
    GROUP BY mes 
    ORDER BY mes DESC 
    LIMIT 12
  `);

  return {
    porHora,
    porDiaSemana,
    topFechas,
    porEstado,
    evolucionMes
  };
};

module.exports = {
  countTurnosAbiertos,
  getAllTurnos,
  getReport,
  getAnalytics,
  createTurno,
  updateTurno,
  deleteTurno,
  obtenerResumenHoy,
  obtenerTurnosHoy,
  obtenerTurnoPorId,
};
