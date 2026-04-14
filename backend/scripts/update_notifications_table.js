// update_notifications_table.js --- V2 (Compatible con Clever Cloud MySQL)
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const pool = require("../config/dbConfig");

async function updateTable() {
  try {
    console.log("Iniciando actualización de la tabla 'Notificaciones'...");
    
    // Lista de SQLs para ejecutar individualmente
    const queries = [
      {
        name: "Agregar columna id_turno",
        sql: "ALTER TABLE Notificaciones ADD COLUMN id_turno INT NULL"
      },
      {
        name: "Agregar columna numero_celular",
        sql: "ALTER TABLE Notificaciones ADD COLUMN numero_celular VARCHAR(20) NULL"
      },
      {
        name: "Agregar columna estado",
        sql: "ALTER TABLE Notificaciones ADD COLUMN estado ENUM('pendiente', 'enviado', 'fallido') DEFAULT 'pendiente'"
      },
      {
        name: "Agregar columna fecha_creacion",
        sql: "ALTER TABLE Notificaciones ADD COLUMN fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP"
      },
      {
        name: "Agregar FK a Turnos",
        sql: "ALTER TABLE Notificaciones ADD CONSTRAINT fk_notif_turno FOREIGN KEY (id_turno) REFERENCES Turnos(idTurno) ON DELETE CASCADE"
      }
    ];

    for (const q of queries) {
      try {
        await pool.query(q.sql);
        console.log(`✅ [EXITO] ${q.name}`);
      } catch (err) {
        // Ignorar si la columna o el FK ya existen
        if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_FK_DUP_NAME' || err.code === 'ER_DUP_KEY' || err.message.includes('Duplicate')) {
          console.log(`⚠️ [IGNORADO] ${q.name} (Ya existe)`);
        } else {
          console.error(`❌ [ERROR] ${q.name}:`, err.message);
        }
      }
    }

    console.log("Proceso de actualización finalizado.");
    process.exit(0);
  } catch (error) {
    console.error("Error crítico durante la actualización:", error);
    process.exit(1);
  }
}

updateTable();
