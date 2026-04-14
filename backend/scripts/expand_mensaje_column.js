// expand_mensaje_column.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const pool = require("../config/dbConfig");

async function expand() {
  try {
    await pool.query("ALTER TABLE Notificaciones MODIFY COLUMN mensaje TEXT");
    console.log("Columna 'mensaje' expandida a TEXT.");
    
    // También verificar si 'tipo' es suficientemente largo
    await pool.query("ALTER TABLE Notificaciones MODIFY COLUMN tipo VARCHAR(50)");
    console.log("Columna 'tipo' expandida.");
    
    process.exit(0);
  } catch (error) {
    console.error("Error expanding column:", error);
    process.exit(1);
  }
}

expand();
