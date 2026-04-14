// backend/routes/authRoutes.js

const express = require("express");
const router = express.Router();

const { registrar, login } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");


// Registro de empleado
router.post("/register", registrar);

// Login
router.post("/login", login);


// Ruta para validar sesión (la usa guard.js)
router.get("/me", requireAuth, (req, res) => {

  res.json({
    id: req.empleadoId,
    rol: req.rol
  });

});


// Ruta protegida de ejemplo
router.get("/perfil", requireAuth, (req, res) => {

  res.json({
    message: "Accediste a una ruta protegida",
    empleadoId: req.empleadoId,
    rol: req.rol
  });

});

module.exports = router;
