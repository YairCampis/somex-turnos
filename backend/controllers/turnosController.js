//turnosController.js

const turnosModel = require("../models/turnosModel");
const historialModel = require("../models/historialModel");

const getAllTurnos = async (req, res) => {
  try {
    const turnos = await turnosModel.getAllTurnos();
    res.json(turnos);
  } catch (error) {
    console.error("Error al obtener turnos:", error);
    res.status(500).json({ error: "Error al obtener turnos" });
  }
};

const createTurno = async (req, res) => {
  try {
    const { idConductor } = req.body;

    // Validar que no tenga turno abierto
    const abierto = await turnosModel.countTurnosAbiertos(idConductor);

    if (abierto > 0) {
      return res.status(409).json({
        ok: false,
        msg: "El conductor ya tiene un turno abierto",
      });
    }

    const nuevoTurno = await turnosModel.createTurno(req.body);

    res.status(201).json(nuevoTurno);
  } catch (error) {
    console.error(" !ERROR COMPLETO AL CREAR TURNO:", error);
    res.status(500).json({ error: error.message, detalle: error });
  }
};

const updateTurno = async (req, res) => {
  try {
    await turnosModel.updateTurno(req.params.id, req.body);
    res.json({ message: "Turno actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar turno:", error);
    res.status(500).json({ error: error.message || "Error al actualizar turno" });
  }
};

const deleteTurno = async (req, res) => {
  try {
    await turnosModel.deleteTurno(req.params.id);
    res.json({ message: "Turno eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar turno:", error);
    res.status(500).json({ error: "Error al eliminar turno" });
  }
};

// OBTENER LOS TURNOS DEL DIA DE HOY

const turnosHoy = async (req, res) => {
  try {
    const { idConductor } = req.params;

    const resumen = await turnosModel.obtenerResumenHoy(idConductor);
    const turnos = await turnosModel.obtenerTurnosHoy();

    res.json({
      total: resumen.total,
      ultimoTurno: resumen.ultimoTurno,
      miTurno: resumen.miTurno,
      turnos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo turnos del día" });
  }
};

//Obtener turno por el ID
const getTurnoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const turno = await turnosModel.obtenerTurnoPorId(id);

    if (!turno) {
      return res.status(404).json({ mensaje: "Turno no encontrado" });
    }

    res.json(turno);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
};

const getReport = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const reportList = await turnosModel.getReport(fechaInicio, fechaFin);
    res.json(reportList);
  } catch (error) {
    console.error("Error al obtener reporte:", error);
    res.status(500).json({ error: "Error al obtener reporte" });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const data = await turnosModel.getAnalytics();
    res.json(data);
  } catch (error) {
    console.error("Error al obtener analítica:", error);
    res.status(500).json({ error: "Error al obtener analítica" });
  }
};

const getHistorialTurno = async (req, res) => {
  try {
    const { id } = req.params;
    const historial = await historialModel.obtenerHistorial(id);
    res.json(historial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error obteniendo historial" });
  }
};

module.exports = {
  getAllTurnos,
  createTurno,
  updateTurno,
  deleteTurno,
  turnosHoy,
  getTurnoPorId,
  getReport,
  getAnalytics,
  getHistorialTurno,
};
