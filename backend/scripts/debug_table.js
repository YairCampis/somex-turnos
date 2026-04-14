// debug_table.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const pool = require("../config/dbConfig");

async function debug() {
  try {
    const [rows] = await pool.query("DESCRIBE Notificaciones");
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Error debugging table:", error);
    process.exit(1);
  }
}

debug();
