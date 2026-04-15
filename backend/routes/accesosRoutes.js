// backend/routes/accesosRoutes.js

const express = require("express");
const router = express.Router();
const { getVehiculosDentro, getAccesoPorTurno } = require("../controllers/accesosController");

router.get("/dentro", getVehiculosDentro);
router.get("/turno/:idTurno", getAccesoPorTurno);

module.exports = router;
