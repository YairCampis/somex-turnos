const express = require("express");
const router = express.Router();
const rolesController = require("../controllers/rolesController");

router.get("/", rolesController.getAllRoles);
router.post("/", rolesController.createRol);
router.put("/:id", rolesController.updateRol);
router.delete("/:id", rolesController.deleteRol);

module.exports = router;
