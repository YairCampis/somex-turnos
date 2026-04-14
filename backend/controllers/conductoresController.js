const conductoresModel = require("../models/conductoresModel");

exports.getConductorByDocumento = async (req, res) => {
  try {
    const { cedula } = req.params;
    const conductor = await conductoresModel.getConductorByDocumento(cedula);

    if (!conductor) {
      return res.status(404).json(null);
    }

    res.json(conductor);

  } catch (error) {
    console.error("Error al obtener conductor:", error);
    res.status(500).json({ error: "Error al buscar conductor" });
  }
};


exports.getAllConductores = async (req, res) => {
  try {
    const conductores = await conductoresModel.getAllConductores();
    res.json(conductores);
  } catch (error) {
    console.error("Error al obtener conductores:", error);
    res.status(500).json({ error: "Error al obtener conductores" });
  }
};

exports.createConductor = async (req, res) => {
  try {
    const nuevoConductor = await conductoresModel.createConductor(req.body);
    res.status(201).json(nuevoConductor);
  } catch (error) {
    console.error("Error al crear conductor:", error);
    res.status(500).json({ error: "Error al crear conductor" });
  }
};

exports.updateConductor = async (req, res) => {
  try {
    await conductoresModel.updateConductor(req.params.id, req.body);
    res.json({ message: "Conductor actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar conductor:", error);
    res.status(500).json({ error: "Error al actualizar conductor" });
  }
};

exports.deleteConductor = async (req, res) => {
  try {
    await conductoresModel.deleteConductor(req.params.id);
    res.json({ message: "Conductor eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar conductor:", error);
    res.status(500).json({ error: "Error al eliminar conductor" });
  }
};
