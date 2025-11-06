const express = require("express");
const router = express.Router();
const turnosController = require("../controllers/turnosController");

router.get("/", turnosController.getAllTurnos);
router.post("/", turnosController.createTurno);
router.put("/:id", turnosController.updateTurno);
router.delete("/:id", turnosController.deleteTurno);

module.exports = router;
