const express = require("express");
const router = express.Router();
const conductoresController = require("../controllers/conductoresController");

// Rutas CRUD de conductores
router.get("/", conductoresController.getAllConductores);
router.post("/", conductoresController.createConductor);
router.put("/:id", conductoresController.updateConductor);
router.delete("/:id", conductoresController.deleteConductor);

module.exports = router;
