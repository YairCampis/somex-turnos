// backend/controllers/accesosController.js

const accesosModel = require("../models/accesosModel");

const getVehiculosDentro = async (req, res) => {
  try {
    const data = await accesosModel.vehiculosDentro();
    res.json(data);
  } catch (error) {
    console.error("Error al obtener vehículos dentro:", error);
    res.status(500).json({ error: "Error al obtener vehículos dentro de planta" });
  }
};

const getAccesoPorTurno = async (req, res) => {
  try {
    const data = await accesosModel.obtenerAcceso(req.params.idTurno);
    res.json(data || {});
  } catch (error) {
    res.status(500).json({ error: "Error al obtener acceso" });
  }
};

module.exports = { getVehiculosDentro, getAccesoPorTurno };
