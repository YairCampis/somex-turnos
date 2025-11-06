// backend/controllers/empleadosController.js
const empleadosModel = require("../models/empleadosModel");

exports.getAllEmpleados = async (req, res) => {
  try {
    const empleados = await empleadosModel.getAllEmpleados();
    res.json(empleados);
  } catch (error) {
    console.error("Error al obtener empleados:", error);
    res.status(500).json({ error: "Error al obtener empleados", detalle: error.message});
  }
};

exports.createEmpleado = async (req, res) => {
  try {
    const nuevoEmpleado = await empleadosModel.createEmpleado(req.body);
    res.status(201).json(nuevoEmpleado);
  } catch (error) {
    console.error("Error al crear empleado:", error);
    res.status(500).json({ error: "Error al crear empleado" });
  }
};

exports.updateEmpleado = async (req, res) => {
  try {
    await empleadosModel.updateEmpleado(req.params.id, req.body);
    res.json({ message: "Empleado actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar empleado:", error);
    res.status(500).json({ error: "Error al actualizar empleado" });
  }
};

exports.deleteEmpleado = async (req, res) => {
  try {
    await empleadosModel.deleteEmpleado(req.params.id);
    res.json({ message: "Empleado eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar empleado:", error);
    res.status(500).json({ error: "Error al eliminar empleado" });
  }
};

