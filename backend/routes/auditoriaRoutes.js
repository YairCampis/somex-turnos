// backend/routes/auditoriaRoutes.js

const express = require("express");
const router = express.Router();
const { getAuditoria, getUsuariosConLog } = require("../controllers/auditoriaController");

router.get("/", getAuditoria);
router.get("/usuarios", getUsuariosConLog);

module.exports = router;
