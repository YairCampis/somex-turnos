const express = require("express");
const router = express.Router();
const conductoresController = require("../controllers/conductoresController");

//Buscar por documento
router.get("/buscar/:cedula", conductoresController.getConductorByDocumento);


// Rutas CRUD de conductores
router.get("/", conductoresController.getAllConductores);
router.post("/", conductoresController.createConductor);
router.put("/:id", conductoresController.updateConductor);
router.delete("/:id", conductoresController.deleteConductor);

module.exports = router;
