// notificacionRoutes.js
const express = require("express");
const router = express.Router();
const notificacionesController = require("../controllers/notificacionesController");

router.get("/pendientes", notificacionesController.getPendientes);
router.put("/:id/enviado", notificacionesController.marcarEnviada);

module.exports = router;
