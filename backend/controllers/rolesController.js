const rolesModel = require("../models/rolesModel");

// Obtener todos los roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await rolesModel.getAllRoles();
    res.json(roles);
  } catch (error) {
    console.error("Error al obtener roles:", error);
    res.status(500).json({ error: "Error al obtener roles" });
  }
};

// Crear un rol
exports.createRol = async (req, res) => {
  try {
    const nuevoRol = await rolesModel.createRol(req.body);
    res.status(201).json(nuevoRol);
  } catch (error) {
    console.error("Error al crear rol:", error);
    res.status(500).json({ error: "Error al crear rol" });
  }
};

// Actualizar un rol
exports.updateRol = async (req, res) => {
  try {
    await rolesModel.updateRol(req.params.id, req.body);
    res.json({ message: "Rol actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar rol:", error);
    res.status(500).json({ error: "Error al actualizar rol" });
  }
};

// Eliminar un rol
exports.deleteRol = async (req, res) => {
  try {
    await rolesModel.deleteRol(req.params.id);
    res.json({ message: "Rol eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar rol:", error);
    res.status(500).json({ error: "Error al eliminar rol" });
  }
};
