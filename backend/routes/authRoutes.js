// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { registrar, login } = require("../controllers/authController");
const verificarToken = require("../middleware/authMiddleware");

router.post("/register", registrar);
router.post("/login", login);

// Ruta protegida de ejemplo
router.get("/perfil", verificarToken, (req, res) => {
  res.json({ message: "Accediste a una ruta protegida", empleadoId: req.empleadoId });
});

module.exports = router;
