// setup_notifications.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const pool = require("../config/dbConfig");


async function setup() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS NotificacionesSMS (
        id INT AUTO_INCREMENT PRIMARY KEY,
        idTurno INT NOT NULL,
        numero_celular VARCHAR(20) NOT NULL,
        mensaje TEXT NOT NULL,
        estado ENUM('pendiente', 'enviado', 'fallido') DEFAULT 'pendiente',
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (idTurno) REFERENCES Turnos(idTurno) ON DELETE CASCADE
      );
    `;
    await pool.query(createTableQuery);
    console.log("Tabla NotificacionesSMS creada o ya existente.");
    process.exit(0);
  } catch (error) {
    console.error("Error al crear la tabla:", error);
    process.exit(1);
  }
}

setup();
