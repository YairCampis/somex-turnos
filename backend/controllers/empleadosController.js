// backend/controllers/empleadosController.js
const Empleado = require("../models/empleadosModel");

// GET
exports.getAllEmpleados = async (req, res) => {
  try {
    const empleados = await Empleado.getAll();
    res.json(empleados);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener empleados",
      detalle: error.message
    });
  }
};

// POST
exports.createEmpleado = async (req, res) => {
  try {
    const id = await Empleado.create(req.body);
    res.status(201).json({
      message: "Empleado creado",
      id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear empleado" });
  }
};

// PUT
exports.updateEmpleado = async (req, res) => {
  try {
    await Empleado.update(req.params.id, req.body);
    res.json({ message: "Empleado actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar empleado" });
  }
};

// DELETE
exports.deleteEmpleado = async (req, res) => {
  try {
    await Empleado.delete(req.params.id);
    res.json({ message: "Empleado eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar empleado" });
  }
};

