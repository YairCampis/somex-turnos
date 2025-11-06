const turnosModel = require("../models/turnosModel");

exports.getAllTurnos = async (req, res) => {
  try {
    const turnos = await turnosModel.getAllTurnos();
    res.json(turnos);
  } catch (error) {
    console.error("Error al obtener turnos:", error);
    res.status(500).json({ error: "Error al obtener turnos" });
  }
};

exports.createTurno = async (req, res) => {
  try {
    const nuevoTurno = await turnosModel.createTurno(req.body);
    res.status(201).json(nuevoTurno);
  } catch (error) {
    console.error("Error al crear turno:", error);
    res.status(500).json({ error: "Error al crear turno" });
  }
};

exports.updateTurno = async (req, res) => {
  try {
    await turnosModel.updateTurno(req.params.id, req.body);
    res.json({ message: "Turno actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar turno:", error);
    res.status(500).json({ error: "Error al actualizar turno" });
  }
};

exports.deleteTurno = async (req, res) => {
  try {
    await turnosModel.deleteTurno(req.params.id);
    res.json({ message: "Turno eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar turno:", error);
    res.status(500).json({ error: "Error al eliminar turno" });
  }
};
